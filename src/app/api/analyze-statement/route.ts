import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getGeminiClient,
  GEMINI_MODEL_FLASH,
  GEMINI_MODEL_FLASH_FALLBACK,
} from '@/lib/gemini/client'
import { PDFParse } from 'pdf-parse'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('statement') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.type.includes('pdf')) {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 })
    }

    // Extract text from PDF (pdf-parse v2 API)
    const buffer = Buffer.from(await file.arrayBuffer())
    const parser = new PDFParse({ data: buffer })
    let rawText = ''
    try {
      const pdfData = await parser.getText()
      rawText = pdfData.text
    } finally {
      await parser.destroy()
    }

    const genAI = getGeminiClient()

    const prompt = `
Analyze this bank statement text and extract financial information. Return a JSON object with the following structure:

{
  "summary": {
    "totalCredits": number,
    "totalDebits": number,
    "netBalance": number,
    "transactionCount": number,
    "period": {
      "start": "YYYY-MM-DD",
      "end": "YYYY-MM-DD"
    }
  },
  "categories": {
    "groceries": number,
    "dining": number,
    "entertainment": number,
    "shopping": number,
    "travel": number,
    "utilities": number,
    "healthcare": number,
    "education": number,
    "investments": number,
    "transfers": number,
    "other": number
  },
  "monthlySpending": {
    "average": number,
    "highest": number,
    "lowest": number
  },
  "insights": {
    "spendingPattern": "string description",
    "riskLevel": "low|medium|high",
    "recommendations": ["string array of suggestions"]
  }
}

Bank statement text:
${rawText.substring(0, 10000)}
`

    let analysisText = ''
    const models = [GEMINI_MODEL_FLASH, GEMINI_MODEL_FLASH_FALLBACK]
    let lastModelError: string | null = null
    for (const model of models) {
      try {
        const response = await genAI.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        })
        analysisText = response.text ?? ''
        if (analysisText.trim()) {
          break
        }
      } catch (error) {
        lastModelError = error instanceof Error ? error.message : 'Unknown AI error'
      }
    }

    if (!analysisText.trim()) {
      throw new Error(lastModelError || 'No valid AI response for statement analysis')
    }

    let analysis
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }
      analysis = JSON.parse(jsonMatch[0])
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      return NextResponse.json({ error: 'Failed to analyze statement' }, { status: 500 })
    }

    // Store the analysis in database
    const documentPayloads: Array<Record<string, unknown>> = [
      {
        user_id: user.id,
        document_type: 'bank_statement',
        file_name: file.name,
        file_path: `uploads/${user.id}/${Date.now()}-${file.name}`,
        file_size_bytes: file.size,
        mime_type: file.type,
        parsing_status: 'completed',
        parsed_data: analysis,
        parsed_at: new Date().toISOString(),
      },
      {
        user_id: user.id,
        document_type: 'bank_statement',
        file_name: file.name,
        analysis_result: analysis,
      },
    ]

    let analysisRecordId: string | null = null
    for (const payload of documentPayloads) {
      const { data, error } = await supabase
        .from('uploaded_documents')
        .insert(payload)
        .select('id')
        .single()
      if (!error && data?.id) {
        analysisRecordId = data.id
        break
      }
    }

    return NextResponse.json({
      success: true,
      analysis,
      documentId: analysisRecordId,
    })
  } catch (error) {
    console.error('Statement analysis error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
