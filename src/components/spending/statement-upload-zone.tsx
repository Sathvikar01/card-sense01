'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface StatementUploadZoneProps {
  onUploadComplete: () => void
}

export function StatementUploadZone({ onUploadComplete }: StatementUploadZoneProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [result, setResult] = useState<{
    inserted: number
    summary: { total: number; count: number; debits: number; credits: number }
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    async (file: File) => {
      const name = file.name.toLowerCase()
      const isCsv = file.type === 'text/csv' || name.endsWith('.csv')
      const isPdf = file.type === 'application/pdf' || name.endsWith('.pdf')

      if (!isCsv && !isPdf) {
        toast.error('Only CSV and PDF files are supported')
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be under 10 MB')
        return
      }

      setUploading(true)
      setResult(null)

      try {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/spending/upload', {
          method: 'POST',
          body: formData,
        })

        const data = await res.json()

        if (!res.ok) {
          toast.error(data.error || 'Upload failed')
          return
        }

        setResult({ inserted: data.inserted, summary: data.summary })
        toast.success(`Imported ${data.inserted} transactions`)
        onUploadComplete()
      } catch {
        toast.error('Failed to upload file')
      } finally {
        setUploading(false)
      }
    },
    [onUploadComplete]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 transition-all ${
          dragOver
            ? 'border-[#d4a017] bg-[#fdf3d7]/40'
            : 'border-border/60 hover:border-[#d4a017]/50 hover:bg-[#fdf3d7]/20'
        }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-[#d4a017] border-t-transparent animate-spin" />
            <p className="text-sm font-medium text-foreground">Processing your statement...</p>
          </div>
        ) : (
          <>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#fdf3d7]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
                  stroke="#b8860b"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-foreground">
              Drop your bank statement here
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              CSV or PDF files up to 10 MB
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 gap-2 border-[#d4a017]/30 text-[#b8860b] hover:bg-[#fdf3d7]/50"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Browse Files
            </Button>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.pdf,text/csv,application/pdf"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {result && (
        <div className="rounded-xl border border-[#d4a017]/25 bg-[#fdf3d7]/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" fill="#fdf3d7" />
              <path
                d="M5 8L7 10L11 6"
                stroke="#b8860b"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-sm font-semibold text-foreground">
              {result.inserted} transactions imported
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">
                ₹{result.summary.total.toLocaleString('en-IN')}
              </p>
              <p>Total spending</p>
            </div>
            <div>
              <p className="font-medium text-foreground">{result.summary.debits}</p>
              <p>Debits</p>
            </div>
            <div>
              <p className="font-medium text-foreground">{result.summary.credits}</p>
              <p>Credits</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
