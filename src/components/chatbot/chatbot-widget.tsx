'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { MessageCircle, X, Send, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ReactMarkdown from 'react-markdown'

const INITIAL_MESSAGE = { role: 'assistant' as const, text: 'Hi! I\'m your CardSense AI assistant. Ask me anything about credit cards, rewards, or your finances.' }

export function ChatbotWidget() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    INITIAL_MESSAGE,
  ])
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open])

  useEffect(() => {
    if (pathname === '/chat') {
      setOpen(true)
    }
  }, [pathname])

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      toggleRef.current?.focus()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open])

  const handleClearChat = () => {
    setMessages([INITIAL_MESSAGE])
    setInput('')
  }

  async function handleSend() {
    const trimmed = input.trim()
    if (!trimmed || loading) return

    setMessages((prev) => [...prev, { role: 'user', text: trimmed }])
    setInput('')
    setLoading(true)

    try {
      // Send conversation history (exclude the initial greeting)
      const historyForApi = messages
        .slice(1)
        .map((m) => ({ role: m.role, text: m.text }))

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history: historyForApi }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error('Chat request failed')
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: data.reply ?? 'Sorry, I couldn\'t process that.' },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Something went wrong. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Chat window */}
      {open && (
        <div
          role="dialog"
          aria-label="CardSense Assistant"
          className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-3 right-3 z-50 flex max-h-[70dvh] flex-col overflow-hidden overscroll-contain rounded-2xl border bg-background shadow-xl sm:left-auto sm:right-4 sm:w-96"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#b8860b] to-[#d4a017] text-white">
            <span className="font-semibold text-sm">CardSense Assistant</span>
            <div className="flex items-center gap-1">
              {messages.length > 1 && (
                <button
                  onClick={handleClearChat}
                  aria-label="Clear chat"
                  className="p-1 rounded-md hover:bg-white/20 transition-colors"
                  title="Clear chat"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
              <button onClick={() => setOpen(false)} aria-label="Close chat" className="p-1 rounded-md hover:bg-white/20 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div role="log" aria-live="polite" aria-relevant="additions" className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-2 max-h-72 text-sm">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`rounded-xl px-3 py-2 max-w-[85%] ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-[#b8860b] to-[#d4a017] text-white'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1 [&>h1]:text-base [&>h2]:text-sm [&>h3]:text-sm [&>h1]:font-semibold [&>h2]:font-semibold [&>h3]:font-semibold [&>pre]:bg-muted/30 [&>pre]:rounded-lg [&>pre]:p-2 [&>pre]:text-xs [&>code]:text-xs [&>code]:bg-muted/30 [&>code]:px-1 [&>code]:rounded [&>ul]:pl-4 [&>ol]:pl-4 [&_li]:my-0.5 [&>blockquote]:border-l-2 [&>blockquote]:border-primary/40 [&>blockquote]:pl-3 [&>blockquote]:italic [&>blockquote]:text-muted-foreground [&>hr]:my-2 [&>table]:text-xs">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-xl px-3 py-2 text-muted-foreground animate-pulse">
                  Thinking…
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t px-3 py-2">
            <input
              ref={inputRef}
              name="chat-message"
              aria-label="Message CardSense Assistant"
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-[#d4a017]"
              placeholder="Ask about cards or rewards…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={loading}
            />
            <Button aria-label="Send message" size="icon" variant="ghost" onClick={handleSend} disabled={loading || !input.trim()} className="text-[#b8860b] hover:text-[#d4a017] hover:bg-[#fdf3d7]/50">
              <Send aria-hidden="true" className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* FAB toggle */}
      <button
        ref={toggleRef}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close CardSense Assistant' : 'Open CardSense Assistant'}
        aria-expanded={open}
        className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-[#d4a017]/30 bg-background text-[#b8860b] shadow-lg transition-[background-color,color,transform] hover:-translate-y-0.5 hover:bg-[#fdf3d7] hover:text-[#a07808] focus-visible:ring-2 focus-visible:ring-[#d4a017] md:bottom-6 md:right-6"
      >
        {open ? <X aria-hidden="true" className="h-5 w-5" /> : <MessageCircle aria-hidden="true" className="h-5 w-5" />}
      </button>
    </>
  )
}
