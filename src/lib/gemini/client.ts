import { GoogleGenAI } from '@google/genai'

let geminiClient: GoogleGenAI | null = null

export function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set')
    }
    geminiClient = new GoogleGenAI({ apiKey })
  }
  return geminiClient
}

// Model constants
export const GEMINI_MODEL_FLASH = process.env.GEMINI_MODEL_FLASH || 'gemini-3.0-flash'
export const GEMINI_MODEL_FLASH_FALLBACK = process.env.GEMINI_MODEL_FLASH_FALLBACK || 'gemini-2.0-flash'
export const GEMINI_MODEL_PRO = process.env.GEMINI_MODEL_PRO || 'gemini-2.5-pro'
