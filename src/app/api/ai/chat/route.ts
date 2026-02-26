import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getGeminiClient } from '@/lib/gemini/client'
import { insertAuditLog } from '@/lib/audit/server'
import {
  CHAT_RELEVANCE_REFUSAL_MESSAGE,
  classifyIndianFinanceRelevance,
} from '@/lib/ai/relevance-filter'

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

const ENABLE_WEB_SEARCH = /^(1|true|yes|on)$/i.test(process.env.ENABLE_WEB_SEARCH || '')

interface ChatRequestBody {
  message: string
  history?: Array<{ role: 'user' | 'assistant'; text: string }>
  sessionId?: string
}

export async function POST(request: NextRequest) {
  const startedAt = Date.now()
  let sessionId: string | undefined
  let messageLength = 0
  let historyCount = 0

  const logChatOutcome = async (params: {
    outcome: 'invalid_input' | 'rejected_irrelevant' | 'success' | 'ai_error' | 'server_error'
    relevanceReason?: string
    usedWebSearch?: boolean
    errorMessage?: string
  }) => {
    try {
      await insertAuditLog({
        action: 'chatbot_request',
        sessionId,
        metadata: {
          outcome: params.outcome,
          relevance_reason: params.relevanceReason || null,
          web_search_enabled: ENABLE_WEB_SEARCH,
          used_web_search: params.usedWebSearch ?? false,
          message_length: messageLength,
          history_count: historyCount,
          latency_ms: Date.now() - startedAt,
          error_message: params.errorMessage || null,
        },
      })
    } catch {
      // Non-blocking audit logging.
    }
  }

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
    const { message, history, sessionId: incomingSessionId } = body as ChatRequestBody
    sessionId = incomingSessionId

    if (!message || typeof message !== 'string' || !message.trim()) {
      await logChatOutcome({ outcome: 'invalid_input' })
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    messageLength = message.trim().length
    historyCount = Array.isArray(history) ? history.length : 0

    const relevance = classifyIndianFinanceRelevance(message)
    if (!relevance.isRelevant) {
      await logChatOutcome({
        outcome: 'rejected_irrelevant',
        relevanceReason: relevance.reason,
      })
      return NextResponse.json({
        reply: CHAT_RELEVANCE_REFUSAL_MESSAGE,
      })
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

    const model = 'gemini-2.5-flash'
    const baseConfig = {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
      maxOutputTokens: 1024,
    }

    let reply: string | null = null
    let usedWebSearch = false

    try {
      const response = await gemini.models.generateContent({
        model,
        contents,
        config: ENABLE_WEB_SEARCH
          ? {
              ...baseConfig,
              tools: [{ googleSearch: {} }],
            }
          : baseConfig,
      })

      reply = response.text ?? null
      usedWebSearch = ENABLE_WEB_SEARCH
    } catch {
      if (!ENABLE_WEB_SEARCH) {
        await logChatOutcome({
          outcome: 'ai_error',
          relevanceReason: relevance.reason,
          errorMessage: 'ai_generation_failed_no_tool',
        })
        return NextResponse.json(
          { reply: "I'm having trouble connecting right now. Please try again in a moment." },
          { status: 200 }
        )
      }

      // If web-search mode is enabled and fails, retry safely without tools.
      try {
        const response = await gemini.models.generateContent({
          model,
          contents,
          config: baseConfig,
        })

        reply = response.text ?? null
        usedWebSearch = false
      } catch (innerError) {
        const errorMessage = innerError instanceof Error ? innerError.message : 'AI generation failed'
        await logChatOutcome({
          outcome: 'ai_error',
          relevanceReason: relevance.reason,
          usedWebSearch: false,
          errorMessage,
        })
        console.error('Chat AI error:', innerError)
        return NextResponse.json(
          { reply: "I'm having trouble connecting right now. Please try again in a moment." },
          { status: 200 }
        )
      }
    }

    await logChatOutcome({
      outcome: 'success',
      relevanceReason: relevance.reason,
      usedWebSearch,
    })

    return NextResponse.json({
      reply: reply || "I'm sorry, I couldn't generate a response. Please try again.",
      web_search_enabled: ENABLE_WEB_SEARCH,
      used_web_search: usedWebSearch,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    await logChatOutcome({
      outcome: 'server_error',
      errorMessage,
    })
    console.error('Chat API error:', error)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
