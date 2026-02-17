import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { PDFParse } from 'pdf-parse'
import { ensurePdfParseWorkerConfigured } from '@/lib/pdf/worker'

const DEFAULT_GUIDE_PATH = 'C:/Users/arsat/Downloads/India Credit Cards Guide.pdf'
const GUIDE_MAX_CHARS = 80000
const CACHE_TTL_MS = 10 * 60 * 1000

type CachedGuide = {
  loadedAt: number
  sourcePath: string
  text: string
  cardNames: string[]
}

let cachedGuide: CachedGuide | null = null

const normalizeText = (raw: string) => {
  return raw
    .replace(/\u0000/g, '')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

const extractCardNames = (text: string) => {
  const names = new Set<string>()
  const pattern = /([A-Z][A-Za-z0-9&+().#\-/\s]{3,80}?Credit Card(?: [A-Za-z0-9&+().#\-/\s]{0,40})?)/g

  for (const match of text.matchAll(pattern)) {
    const candidate = match[1].replace(/\s+/g, ' ').trim()
    if (
      candidate.length < 8 ||
      candidate.length > 90 ||
      candidate.includes('Guide') ||
      candidate.includes('Comparison') ||
      candidate.includes('Recommendation') ||
      candidate.includes('Table')
    ) {
      continue
    }
    names.add(candidate)
  }

  return Array.from(names)
}

const loadGuideFromPath = async (path: string) => {
  ensurePdfParseWorkerConfigured()
  const data = await readFile(path)
  const parser = new PDFParse({ data })
  try {
    const result = await parser.getText()
    const normalizedText = normalizeText(result.text).slice(0, GUIDE_MAX_CHARS)
    return {
      text: normalizedText,
      cardNames: extractCardNames(normalizedText),
    }
  } finally {
    await parser.destroy()
  }
}

export const getCreditCardGuidePath = () => {
  return process.env.CREDIT_CARD_GUIDE_PDF_PATH || DEFAULT_GUIDE_PATH
}

export async function getCreditCardGuideContext() {
  const sourcePath = getCreditCardGuidePath()
  const now = Date.now()

  if (
    cachedGuide &&
    cachedGuide.sourcePath === sourcePath &&
    now - cachedGuide.loadedAt < CACHE_TTL_MS
  ) {
    return cachedGuide
  }

  if (!existsSync(sourcePath)) {
    cachedGuide = {
      loadedAt: now,
      sourcePath,
      text: '',
      cardNames: [],
    }
    return cachedGuide
  }

  const guide = await loadGuideFromPath(sourcePath)
  cachedGuide = {
    loadedAt: now,
    sourcePath,
    text: guide.text,
    cardNames: guide.cardNames,
  }

  return cachedGuide
}

export const createFallbackGuideSnippet = () => {
  return [
    'If the guide text is unavailable, recommend cards using the supplied card catalog only.',
    'Prioritize transparent fee structure, reward alignment, and realistic eligibility.',
  ].join('\n')
}
