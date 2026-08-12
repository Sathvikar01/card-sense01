const MB = 1024 * 1024

export const MAX_STATEMENT_UPLOAD_BYTES = 10 * MB

export type StatementFileKind = 'csv' | 'pdf'

type UploadValidationResult =
  | { ok: true; kind: StatementFileKind }
  | { ok: false; error: string }

const CSV_MIME_TYPES = new Set([
  'text/csv',
  'application/csv',
  'application/vnd.ms-excel',
  'text/plain',
])

export function validateStatementUpload(file: File): UploadValidationResult {
  if (!file.name || file.size === 0) {
    return { ok: false, error: 'Choose a non-empty CSV or PDF file.' }
  }

  if (file.size > MAX_STATEMENT_UPLOAD_BYTES) {
    return { ok: false, error: 'File size must be 10 MB or less.' }
  }

  const name = file.name.toLowerCase()
  const mime = file.type.toLowerCase()

  if (name.endsWith('.pdf') && mime === 'application/pdf') {
    return { ok: true, kind: 'pdf' }
  }

  if (name.endsWith('.csv') && CSV_MIME_TYPES.has(mime)) {
    return { ok: true, kind: 'csv' }
  }

  return { ok: false, error: 'The file extension and file type must both be CSV or PDF.' }
}

export function hasValidFileSignature(buffer: Buffer, kind: StatementFileKind) {
  if (kind === 'pdf') {
    return buffer.subarray(0, 5).toString('ascii') === '%PDF-'
  }

  // CSV files are text; reject binary content and embedded null bytes.
  return !buffer.subarray(0, Math.min(buffer.length, 4096)).includes(0)
}

export function sanitizeUploadFileName(fileName: string) {
  const normalized = fileName.normalize('NFKC').replace(/[^a-zA-Z0-9._-]+/g, '-')
  return normalized.replace(/^-+|-+$/g, '').slice(0, 120) || 'statement'
}
