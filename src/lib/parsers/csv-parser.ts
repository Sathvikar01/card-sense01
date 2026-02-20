export interface ParsedTransaction {
  date: string
  description: string
  amount: number
  type: 'debit' | 'credit'
  category: string
}

export interface CsvParseResult {
  transactions: ParsedTransaction[]
  totalSpending: number
  categoryBreakdown: Record<string, number>
  transactionCount: number
  errors: string[]
}

/* ---- Delimiter detection ---- */

function detectDelimiter(lines: string[]): string {
  const candidates = [',', '\t', ';', '|']
  const sample = lines.slice(0, Math.min(10, lines.length))

  let best = ','
  let bestScore = -1

  for (const delim of candidates) {
    const counts = sample.map((l) => l.split(delim).length)
    const allSame = counts.every((c) => c === counts[0])
    const avg = counts.reduce((a, b) => a + b, 0) / counts.length
    const score = allSame ? avg * 2 : avg
    if (score > bestScore && avg >= 3) {
      bestScore = score
      best = delim
    }
  }

  return best
}

/* ---- Header detection ---- */

const HEADER_KEYWORDS =
  /\b(date|txn\s*date|transaction\s*date|value\s*date|posting\s*date|narration|description|particulars|details|remark|amount|debit|credit|withdrawal|deposit|dr|cr)\b/i

function detectHeaderRow(lines: string[], delimiter: string): number {
  for (let i = 0; i < Math.min(15, lines.length); i++) {
    const cols = lines[i].split(delimiter)
    const matches = cols.filter((c) => HEADER_KEYWORDS.test(c.trim())).length
    if (matches >= 2) return i
  }
  return 0
}

/* ---- Column mapping ---- */

interface ColumnMap {
  date: number
  description: number
  amount: number
  debit: number
  credit: number
}

function mapColumns(headerCols: string[]): ColumnMap {
  const map: ColumnMap = { date: -1, description: -1, amount: -1, debit: -1, credit: -1 }

  headerCols.forEach((col, idx) => {
    const c = col.trim().toLowerCase()

    if (map.date === -1 && /\b(date|txn\s*date|transaction\s*date|value\s*date|posting)\b/.test(c)) {
      map.date = idx
    }

    if (
      map.description === -1 &&
      /\b(narration|description|particulars|details|remark|transaction\s*details)\b/.test(c)
    ) {
      map.description = idx
    }

    if (map.debit === -1 && /\b(debit|withdrawal|dr)\b/.test(c) && !/date/.test(c)) {
      map.debit = idx
    }

    if (map.credit === -1 && /\b(credit|deposit|cr)\b/.test(c) && !/date/.test(c)) {
      map.credit = idx
    }

    if (map.amount === -1 && /\b(amount|txn\s*amount|transaction\s*amount)\b/.test(c)) {
      map.amount = idx
    }
  })

  return map
}

/* ---- Date parsing (Indian formats) ---- */

const MONTHS: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
}

function parseDate(raw: string): string | null {
  const s = raw.trim().replace(/["']/g, '')

  // DD/MM/YYYY or DD-MM-YYYY
  let m = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/)
  if (m) {
    const [, day, month, year] = m
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  // YYYY-MM-DD
  m = s.match(/^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})$/)
  if (m) {
    const [, year, month, day] = m
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  // DD-Mon-YYYY or DD Mon YYYY
  m = s.match(/^(\d{1,2})[\s\-.]?([A-Za-z]{3})[\s\-.]?(\d{4})$/)
  if (m) {
    const [, day, mon, year] = m
    const mm = MONTHS[mon.toLowerCase()]
    if (mm) return `${year}-${mm}-${day.padStart(2, '0')}`
  }

  // DD-Mon-YY
  m = s.match(/^(\d{1,2})[\s\-.]?([A-Za-z]{3})[\s\-.]?(\d{2})$/)
  if (m) {
    const [, day, mon, yy] = m
    const mm = MONTHS[mon.toLowerCase()]
    const year = Number(yy) > 50 ? `19${yy}` : `20${yy}`
    if (mm) return `${year}-${mm}-${day.padStart(2, '0')}`
  }

  return null
}

/* ---- Amount parsing ---- */

function parseAmount(raw: string): number | null {
  const cleaned = raw
    .trim()
    .replace(/["']/g, '')
    .replace(/[₹$,\s]/g, '')
    .replace(/\(([0-9.]+)\)/, '-$1') // (1234) → -1234

  if (!cleaned || cleaned === '-' || cleaned === '') return null

  const num = Number(cleaned)
  return Number.isFinite(num) ? num : null
}

/* ---- Categorization ---- */

function categorizeTransaction(description: string): string {
  const desc = description.toLowerCase()
  if (/swiggy|zomato|restaurant|food|cafe|dining|dominos|pizza|mcdonald|kfc|starbucks|burger/.test(desc)) return 'dining'
  if (/amazon|flipkart|myntra|ajio|shopping|meesho|nykaa|tata\s*cliq/.test(desc)) return 'shopping'
  if (/uber|ola|travel|irctc|makemytrip|flight|hotel|goibibo|yatra|cleartrip|airport/.test(desc)) return 'travel'
  if (/bigbasket|grocery|supermarket|dmart|reliance|more|blinkit|zepto|jiomart|grofers/.test(desc)) return 'groceries'
  if (/netflix|movie|entertainment|hotstar|prime|spotify|disney|zee|sony\s*liv|jio\s*cinema/.test(desc)) return 'entertainment'
  if (/petrol|fuel|hp\b|iocl|bpcl|indian\s*oil|bharat\s*petro|shell/.test(desc)) return 'fuel'
  if (/electricity|water|gas|broadband|recharge|jio|airtel|vi\b|postpaid|prepaid|bill|tata\s*power/.test(desc)) return 'utilities'
  if (/hospital|medical|pharmacy|doctor|diagnostic|apollo|medplus|healthcare/.test(desc)) return 'healthcare'
  if (/school|college|university|tuition|course|udemy|education|exam/.test(desc)) return 'education'
  return 'other'
}

/* ---- Deduplication ---- */

function deduplicateKey(txn: ParsedTransaction): string {
  return `${txn.date}|${txn.amount}|${txn.description.toLowerCase().substring(0, 40)}`
}

/* ---- Main parser ---- */

export function parseCsvBankStatement(csvText: string): CsvParseResult {
  const errors: string[] = []
  const rawLines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0)

  if (rawLines.length < 2) {
    return { transactions: [], totalSpending: 0, categoryBreakdown: {}, transactionCount: 0, errors: ['File has too few rows'] }
  }

  const delimiter = detectDelimiter(rawLines)
  const headerIdx = detectHeaderRow(rawLines, delimiter)
  const headerCols = rawLines[headerIdx].split(delimiter)
  const colMap = mapColumns(headerCols)

  if (colMap.date === -1) {
    errors.push('Could not detect a date column')
    return { transactions: [], totalSpending: 0, categoryBreakdown: {}, transactionCount: 0, errors }
  }

  if (colMap.description === -1) {
    // Fallback: use the column after date or the second non-date text column
    for (let i = 0; i < headerCols.length; i++) {
      if (i !== colMap.date && i !== colMap.debit && i !== colMap.credit && i !== colMap.amount) {
        colMap.description = i
        break
      }
    }
  }

  const hasDebitCredit = colMap.debit !== -1 || colMap.credit !== -1
  const hasAmount = colMap.amount !== -1

  if (!hasDebitCredit && !hasAmount) {
    errors.push('Could not detect amount, debit, or credit columns')
    return { transactions: [], totalSpending: 0, categoryBreakdown: {}, transactionCount: 0, errors }
  }

  const transactions: ParsedTransaction[] = []
  const seen = new Set<string>()

  for (let i = headerIdx + 1; i < rawLines.length; i++) {
    const cols = rawLines[i].split(delimiter)
    if (cols.length < 3) continue

    const dateRaw = cols[colMap.date] ?? ''
    const date = parseDate(dateRaw)
    if (!date) continue // skip non-data rows

    const description = colMap.description !== -1
      ? (cols[colMap.description] ?? '').trim().replace(/^["']|["']$/g, '')
      : ''

    let amount = 0
    let type: 'debit' | 'credit' = 'debit'

    if (hasDebitCredit) {
      const debitVal = colMap.debit !== -1 ? parseAmount(cols[colMap.debit] ?? '') : null
      const creditVal = colMap.credit !== -1 ? parseAmount(cols[colMap.credit] ?? '') : null

      if (debitVal && debitVal > 0) {
        amount = debitVal
        type = 'debit'
      } else if (creditVal && creditVal > 0) {
        amount = creditVal
        type = 'credit'
      } else if (hasAmount) {
        const amtVal = parseAmount(cols[colMap.amount] ?? '')
        if (amtVal !== null) {
          amount = Math.abs(amtVal)
          type = amtVal < 0 ? 'debit' : 'credit'
        }
      }
    } else if (hasAmount) {
      const amtVal = parseAmount(cols[colMap.amount] ?? '')
      if (amtVal !== null) {
        amount = Math.abs(amtVal)
        type = amtVal < 0 ? 'debit' : 'credit'
      }
    }

    if (amount <= 0) continue

    const category = categorizeTransaction(description)

    const txn: ParsedTransaction = { date, description, amount, type, category }

    const key = deduplicateKey(txn)
    if (seen.has(key)) continue
    seen.add(key)

    transactions.push(txn)
  }

  // Only count debits as spending
  const debitTxns = transactions.filter((t) => t.type === 'debit')
  const totalSpending = debitTxns.reduce((sum, t) => sum + t.amount, 0)

  const categoryBreakdown: Record<string, number> = {}
  debitTxns.forEach((t) => {
    categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount
  })

  return {
    transactions,
    totalSpending,
    categoryBreakdown,
    transactionCount: transactions.length,
    errors,
  }
}
