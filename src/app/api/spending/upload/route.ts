import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseCsvBankStatement } from '@/lib/parsers/csv-parser'
import { PDFParse } from 'pdf-parse'
import { ensurePdfParseWorkerConfigured } from '@/lib/pdf/worker'

function categorizeTransaction(description: string): string {
  const desc = description.toLowerCase()
  if (/swiggy|zomato|restaurant|food|cafe|dining|dominos|pizza|mcdonald|kfc|starbucks|burger/.test(desc)) return 'dining'
  if (/amazon|flipkart|myntra|ajio|shopping|meesho|nykaa|tata\s*cliq/.test(desc)) return 'shopping'
  if (/uber|ola|travel|irctc|makemytrip|flight|hotel|goibibo|yatra|cleartrip|airport/.test(desc)) return 'travel'
  if (/bigbasket|grocery|supermarket|dmart|reliance|more|blinkit|zepto|jiomart/.test(desc)) return 'groceries'
  if (/netflix|movie|entertainment|hotstar|prime|spotify|disney/.test(desc)) return 'entertainment'
  if (/petrol|fuel|hp\b|iocl|bpcl|indian\s*oil|bharat\s*petro|shell/.test(desc)) return 'fuel'
  if (/electricity|water|gas|broadband|recharge|jio|airtel|bill|tata\s*power/.test(desc)) return 'utilities'
  if (/hospital|medical|pharmacy|doctor|apollo|healthcare/.test(desc)) return 'healthcare'
  if (/school|college|university|tuition|course|education/.test(desc)) return 'education'
  return 'other'
}

function parsePdfDate(raw: string): string | null {
  let m = raw.match(/(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})/)
  if (m) {
    const [, day, month, year] = m
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
  m = raw.match(/(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2})/)
  if (m) {
    const [, day, month, yy] = m
    const year = Number(yy) > 50 ? `19${yy}` : `20${yy}`
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
  return null
}

async function parsePdfStatement(buffer: Buffer) {
  ensurePdfParseWorkerConfigured()
  const parser = new PDFParse({ data: buffer })
  let rawText = ''
  try {
    const pdfData = await parser.getText()
    rawText = pdfData.text
  } finally {
    await parser.destroy()
  }

  const lines = rawText.split('\n').filter((line: string) => line.trim())
  const transactions: Array<{
    date: string
    description: string
    amount: number
    type: 'debit' | 'credit'
    category: string
  }> = []

  for (const line of lines) {
    const dateMatch = line.match(/(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})/)
    const amountMatch = line.match(/₹?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/)

    if (dateMatch && amountMatch) {
      const amount = parseFloat(amountMatch[1].replace(/,/g, ''))
      if (amount <= 0) continue

      const description = line.replace(dateMatch[0], '').replace(amountMatch[0], '').trim()

      const isCredit =
        line.toLowerCase().includes('credit') ||
        line.toLowerCase().includes('deposit') ||
        description.toLowerCase().includes('salary') ||
        description.toLowerCase().includes('refund')

      const type = isCredit ? 'credit' as const : 'debit' as const
      const isoDate = parsePdfDate(dateMatch[0])

      transactions.push({
        date: isoDate || dateMatch[0],
        description,
        amount,
        type,
        category: categorizeTransaction(description),
      })
    }
  }

  return transactions
}

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

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const fileName = file.name.toLowerCase()
    const isCsv = file.type === 'text/csv' || fileName.endsWith('.csv')
    const isPdf = file.type === 'application/pdf' || fileName.endsWith('.pdf')

    if (!isCsv && !isPdf) {
      return NextResponse.json(
        { error: 'Only CSV and PDF files are supported' },
        { status: 400 }
      )
    }

    let parsedTransactions: Array<{
      date: string
      description: string
      amount: number
      type: 'debit' | 'credit'
      category: string
    }> = []

    if (isCsv) {
      const text = await file.text()
      const result = parseCsvBankStatement(text)

      if (result.errors.length > 0 && result.transactions.length === 0) {
        return NextResponse.json(
          { error: `Could not parse CSV: ${result.errors.join(', ')}` },
          { status: 400 }
        )
      }

      parsedTransactions = result.transactions
    } else {
      const buffer = Buffer.from(await file.arrayBuffer())
      parsedTransactions = await parsePdfStatement(buffer)
    }

    if (parsedTransactions.length === 0) {
      return NextResponse.json(
        { error: 'No transactions could be extracted from the file' },
        { status: 400 }
      )
    }

    // Insert transactions into spending_transactions
    const rows = parsedTransactions.map((txn) => ({
      user_id: user.id,
      amount: txn.amount,
      category: txn.category,
      merchant_name: txn.description.substring(0, 255) || null,
      transaction_date: txn.date,
      description: txn.description.substring(0, 500) || null,
      source: 'bank_statement',
    }))

    const { data, error } = await supabase
      .from('spending_transactions')
      .insert(rows)
      .select('id')

    if (error) {
      console.error('Failed to insert transactions:', error)
      return NextResponse.json(
        { error: 'Failed to save transactions to database' },
        { status: 500 }
      )
    }

    // Calculate summary
    const debitTxns = parsedTransactions.filter((t) => t.type === 'debit')
    const totalSpending = debitTxns.reduce((sum, t) => sum + t.amount, 0)
    const categoryBreakdown: Record<string, number> = {}
    debitTxns.forEach((t) => {
      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount
    })

    return NextResponse.json({
      success: true,
      inserted: data?.length || 0,
      summary: {
        total: totalSpending,
        byCategory: categoryBreakdown,
        count: parsedTransactions.length,
        debits: debitTxns.length,
        credits: parsedTransactions.length - debitTxns.length,
      },
    })
  } catch (error) {
    console.error('Statement upload error:', error)
    return NextResponse.json(
      { error: 'Failed to process the uploaded file' },
      { status: 500 }
    )
  }
}
