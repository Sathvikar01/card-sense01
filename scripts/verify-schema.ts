import { readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import * as ts from 'typescript'

type TableColumns = Map<string, Set<string>>

const CANONICAL_SCHEMA_PATH = path.resolve(
  process.cwd(),
  'supabase/schema/canonical_schema.sql'
)
const TYPES_PATH = path.resolve(process.cwd(), 'src/types/database.ts')

const COLUMN_STOP_WORDS = new Set([
  'constraint',
  'primary',
  'unique',
  'foreign',
  'check',
  'exclude',
])

function parseCanonicalColumns(sql: string): TableColumns {
  const tables: TableColumns = new Map()
  const createTableRegex =
    /create table if not exists\s+public\.([a-z_][a-z0-9_]*)\s*\(([\s\S]*?)\);\s*/gi

  let match: RegExpExecArray | null
  while ((match = createTableRegex.exec(sql)) !== null) {
    const tableName = match[1].toLowerCase()
    const block = match[2]
    const columns = parseColumnsFromCreateBlock(block)
    tables.set(tableName, columns)
  }

  const alterAddRegex =
    /alter table(?: if exists)?\s+public\.([a-z_][a-z0-9_]*)\s+add column(?: if not exists)?\s+([a-z_][a-z0-9_]*)\b/gi
  while ((match = alterAddRegex.exec(sql)) !== null) {
    const tableName = match[1].toLowerCase()
    const columnName = match[2].toLowerCase()
    if (!tables.has(tableName)) {
      tables.set(tableName, new Set())
    }
    tables.get(tableName)?.add(columnName)
  }

  return tables
}

function parseColumnsFromCreateBlock(block: string): Set<string> {
  const columns = new Set<string>()
  const lines = block.split('\n')

  for (const rawLine of lines) {
    const noComment = rawLine.replace(/--.*$/, '').trim()
    if (!noComment) continue

    const normalized = noComment.replace(/,$/, '').trim()
    if (!normalized) continue

    const firstToken = normalized.split(/\s+/)[0]?.replace(/"/g, '').toLowerCase()
    if (!firstToken) continue
    if (COLUMN_STOP_WORDS.has(firstToken)) continue

    const columnMatch = normalized.match(/^"?([a-z_][a-z0-9_]*)"?\s+/i)
    if (!columnMatch) continue

    columns.add(columnMatch[1].toLowerCase())
  }

  return columns
}

function getPropertyName(name: ts.PropertyName | ts.BindingName | undefined): string | null {
  if (!name) return null
  if (ts.isIdentifier(name)) return name.text
  if (ts.isStringLiteral(name)) return name.text
  if (ts.isNumericLiteral(name)) return name.text
  return null
}

function getTypeLiteralProperty(
  node: ts.TypeLiteralNode,
  propertyName: string
): ts.TypeLiteralNode | null {
  for (const member of node.members) {
    if (!ts.isPropertySignature(member)) continue
    const currentName = getPropertyName(member.name)
    if (currentName !== propertyName) continue
    if (member.type && ts.isTypeLiteralNode(member.type)) {
      return member.type
    }
  }
  return null
}

function parseTypeColumns(typeSource: string): TableColumns {
  const sourceFile = ts.createSourceFile(
    TYPES_PATH,
    typeSource,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  )

  const databaseInterface = sourceFile.statements.find(
    (statement): statement is ts.InterfaceDeclaration =>
      ts.isInterfaceDeclaration(statement) && statement.name.text === 'Database'
  )

  if (!databaseInterface) {
    throw new Error('Could not find `interface Database` in src/types/database.ts')
  }

  const publicMember = databaseInterface.members.find(
    (member): member is ts.PropertySignature =>
      ts.isPropertySignature(member) && getPropertyName(member.name) === 'public'
  )

  if (!publicMember?.type || !ts.isTypeLiteralNode(publicMember.type)) {
    throw new Error('Could not find `Database.public` type literal')
  }

  const tablesType = getTypeLiteralProperty(publicMember.type, 'Tables')
  if (!tablesType) {
    throw new Error('Could not find `Database.public.Tables` type literal')
  }

  const tables: TableColumns = new Map()

  for (const member of tablesType.members) {
    if (!ts.isPropertySignature(member)) continue
    const tableName = getPropertyName(member.name)
    if (!tableName) continue
    if (!member.type || !ts.isTypeLiteralNode(member.type)) continue

    const rowType = getTypeLiteralProperty(member.type, 'Row')
    if (!rowType) continue

    const columns = new Set<string>()
    for (const rowMember of rowType.members) {
      if (!ts.isPropertySignature(rowMember)) continue
      const columnName = getPropertyName(rowMember.name)
      if (columnName) {
        columns.add(columnName.toLowerCase())
      }
    }

    tables.set(tableName.toLowerCase(), columns)
  }

  return tables
}

function printSorted(values: Iterable<string>): string[] {
  return Array.from(values).sort((a, b) => a.localeCompare(b))
}

function main() {
  const canonicalSql = readFileSync(CANONICAL_SCHEMA_PATH, 'utf8')
  const databaseTypes = readFileSync(TYPES_PATH, 'utf8')

  const schemaColumns = parseCanonicalColumns(canonicalSql)
  const typeColumns = parseTypeColumns(databaseTypes)

  const errors: string[] = []

  for (const [tableName, expectedColumns] of typeColumns.entries()) {
    const actualColumns = schemaColumns.get(tableName)
    if (!actualColumns) {
      errors.push(`Missing table in canonical schema: public.${tableName}`)
      continue
    }

    const missingColumns = printSorted(
      [...expectedColumns].filter((column) => !actualColumns.has(column))
    )
    if (missingColumns.length > 0) {
      errors.push(
        `Missing columns in public.${tableName}: ${missingColumns.join(', ')}`
      )
    }

    const extraColumns = printSorted(
      [...actualColumns].filter((column) => !expectedColumns.has(column))
    )
    if (extraColumns.length > 0) {
      errors.push(
        `Unexpected columns in public.${tableName} (present in schema, missing in types): ${extraColumns.join(', ')}`
      )
    }
  }

  for (const tableName of schemaColumns.keys()) {
    if (!typeColumns.has(tableName)) {
      errors.push(`Unexpected table in canonical schema: public.${tableName}`)
    }
  }

  if (errors.length > 0) {
    console.error('Schema verification failed:')
    for (const error of errors) {
      console.error(`- ${error}`)
    }
    process.exit(1)
  }

  console.log('Schema verification passed.')
  console.log(
    `Checked ${typeColumns.size} tables against ${path.relative(process.cwd(), CANONICAL_SCHEMA_PATH)}.`
  )
}

main()
