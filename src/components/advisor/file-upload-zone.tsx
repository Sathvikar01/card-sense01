'use client'

import { useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Upload, FileText, X, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadZoneProps {
  file: File | null
  onFileSelect: (file: File | null) => void
  uploading: boolean
  progress: number
}

export function FileUploadZone({ file, onFileSelect, uploading, progress }: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === 'application/pdf') {
      onFileSelect(droppedFile)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      onFileSelect(selectedFile)
    }
  }

  const handleRemove = () => {
    onFileSelect(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-purple-600" />
          Upload Bank Statement
        </CardTitle>
        <CardDescription>
          Upload your bank statement PDF to get spending-based recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!file ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
              isDragging
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            )}
          >
            <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700">
              Drag and drop your PDF here, or click to browse
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PDF files only, max 10MB
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {progress === 100 && (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
                {!uploading && (
                  <Button variant="ghost" size="sm" onClick={handleRemove}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            {uploading && <Progress value={progress} className="h-2" />}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
