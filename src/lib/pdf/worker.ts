import { existsSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { PDFParse } from 'pdf-parse'

let configured = false

const resolveWorkerCandidates = () => {
  const root = process.cwd()
  return [
    path.join(root, 'node_modules', 'pdf-parse', 'dist', 'pdf-parse', 'esm', 'pdf.worker.mjs'),
    path.join(root, 'node_modules', 'pdf-parse', 'dist', 'pdf-parse', 'cjs', 'pdf.worker.mjs'),
    path.join(root, 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.mjs'),
  ]
}

export const ensurePdfParseWorkerConfigured = () => {
  if (configured) return

  for (const workerPath of resolveWorkerCandidates()) {
    if (!existsSync(workerPath)) continue
    PDFParse.setWorker(pathToFileURL(workerPath).href)
    configured = true
    return
  }

  configured = true
}
