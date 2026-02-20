import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getGeminiClient } from '@/lib/gemini/client'

const SYSTEM_INSTRUCTION = `You are CardSense AI, a friendly and knowledgeable assistant specializing in Indian credit cards, personal finance, and banking. You help users with:
- Credit card comparisons, benefits, and eligibility
- Understanding rewards, cashback, and loyalty programs
- Credit score improvement tips
- Indian banking products and financial literacy
- Fee waivers, annual charges, and hidden costs
- Travel benefits, lounge access, and forex charges

Guidelines:
- Always focus on the Indian market (INR, Indian banks, Indian regulations)
- Be concise but informative
- When comparing cards, mention key differentiators
- If you're unsure about specific current offers or rates, say so
- Never provide financial advice that could be construed as professional investment advice
- Use simple language accessible to beginners`

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { message, history } = body as {
      message: string
      history?: Array<{ role: 'user' | 'assistant'; text: string }>
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const gemini = getGeminiClient()

    // Build contents array from conversation history
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = []

    if (history && Array.isArray(history)) {
      for (const msg of history) {
        if (!msg.text?.trim()) continue
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        })
      }
    }

    // Add the current user message
    contents.push({
      role: 'user',
      parts: [{ text: message.trim() }],
    })

    // Try with Google Search enabled first
    let reply: string | null = null

    try {
      const response = await gemini.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
          maxOutputTokens: 1024,
          tools: [{ googleSearch: {} }],
        },
      })

      reply = response.text ?? null
    } catch {
      // Fallback: retry without Google Search tool
      try {
        const response = await gemini.models.generateContent({
          model: 'gemini-2.5-flash',
          contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        })

        reply = response.text ?? null
      } catch (innerError) {
        const errorMessage = innerError instanceof Error ? innerError.message : 'AI generation failed'
        console.error('Chat AI error:', innerError)
        return NextResponse.json(
          { reply: `I'm having trouble connecting right now. Please try again in a moment. (${errorMessage})` },
          { status: 200 }
        )
      }
    }

    return NextResponse.json({
      reply: reply || "I'm sorry, I couldn't generate a response. Please try again.",
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    console.error('Chat API error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
