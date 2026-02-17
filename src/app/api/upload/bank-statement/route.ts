import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PDFParse } from 'pdf-parse'
import { ensurePdfParseWorkerConfigured } from '@/lib/pdf/worker'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.type.includes('pdf')) {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 })
    }

    // Extract text from PDF (pdf-parse v2 API)
    ensurePdfParseWorkerConfigured()
    const buffer = Buffer.from(await file.arrayBuffer())
    const parser = new PDFParse({ data: buffer })
    let rawText = ''
    try {
      const pdfData = await parser.getText()
      rawText = pdfData.text
    } finally {
      await parser.destroy()
    }

    const lines = rawText.split('\n').filter((line: string) => line.trim())

    const transactions: Array<{ date: string; description: string; amount: number; type: 'credit' | 'debit' }> = []
    const categoryBreakdown: Record<string, number> = {}
    let totalSpending = 0

    for (const line of lines) {
      const dateMatch = line.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/)
      const amountMatch = line.match(/₹?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/)

      if (dateMatch && amountMatch) {
        const amount = parseFloat(amountMatch[1].replace(/,/g, ''))
        const description = line.replace(dateMatch[0], '').replace(amountMatch[0], '').trim()

        const isCredit = line.toLowerCase().includes('credit') ||
          line.toLowerCase().includes('deposit') ||
          description.toLowerCase().includes('salary') ||
          description.toLowerCase().includes('refund')

        transactions.push({ date: dateMatch[0], description, amount, type: isCredit ? 'credit' : 'debit' })

        if (!isCredit) {
          totalSpending += amount

          const desc = description.toLowerCase()
          if (desc.includes('swiggy') || desc.includes('zomato') || desc.includes('restaurant') || desc.includes('food')) {
            categoryBreakdown.dining = (categoryBreakdown.dining || 0) + amount
          } else if (desc.includes('amazon') || desc.includes('flipkart') || desc.includes('shopping')) {
            categoryBreakdown.shopping = (categoryBreakdown.shopping || 0) + amount
          } else if (desc.includes('uber') || desc.includes('ola') || desc.includes('travel')) {
            categoryBreakdown.travel = (categoryBreakdown.travel || 0) + amount
          } else if (desc.includes('bigbasket') || desc.includes('grocery') || desc.includes('supermarket')) {
            categoryBreakdown.groceries = (categoryBreakdown.groceries || 0) + amount
          } else if (desc.includes('netflix') || desc.includes('movie') || desc.includes('entertainment')) {
            categoryBreakdown.entertainment = (categoryBreakdown.entertainment || 0) + amount
          } else {
            categoryBreakdown.other = (categoryBreakdown.other || 0) + amount
          }
        }
      }
    }

    const merchantSpending: Record<string, number> = {}
    transactions
      .filter(t => t.type === 'debit')
      .forEach(t => {
        const merchant = t.description.split(' ')[0]
        merchantSpending[merchant] = (merchantSpending[merchant] || 0) + t.amount
      })

    const topMerchants = Object.entries(merchantSpending)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, amount]) => ({ name, amount }))

    const analysis = {
      totalSpending,
      categoryBreakdown,
      topMerchants,
      transactionCount: transactions.length,
      period: {
        start: transactions.length > 0 ? transactions[0].date : null,
        end: transactions.length > 0 ? transactions[transactions.length - 1].date : null,
      },
    }

    return NextResponse.json({ success: true, analysis })
  } catch (error) {
    console.error('Bank statement analysis error:', error)
    return NextResponse.json({ error: 'Failed to analyze statement' }, { status: 500 })
  }
}
