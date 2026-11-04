'use client'

import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'

type Message = { role: 'user' | 'assistant'; text: string }

const SUGGESTIONS = [
  'Best card for ₹40,000 a month online?',
  'Cashback or travel points for me?',
  'Lounge access with a low annual fee',
]

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (messages.length) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading])

  async function send(text: string) {
    const message = text.trim()
    if (!message || loading) return

    const history = messages
    setMessages([...history, { role: 'user', text: message }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error()
      setMessages((prev) => [...prev, { role: 'assistant', text: data.reply ?? 'No answer.' }])
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Something went wrong. Try again.' }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-10rem)] max-w-2xl flex-col">
      <div role="log" aria-live="polite" className="flex-1 space-y-5 pb-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-start gap-2 pt-[10vh]">
            <h1 className="mb-4 text-[28px] font-semibold tracking-tight">Ask anything about cards</h1>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="rounded-full bg-white px-4 py-2 text-sm transition-[background-color,transform] duration-150 hover:bg-white/60 active:scale-[0.97]"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={cn('flex', m.role === 'user' && 'justify-end')}>
            {m.role === 'user' ? (
              <p className="max-w-[85%] rounded-3xl bg-gold px-4 py-2 text-[15px] text-pine">{m.text}</p>
            ) : (
              <div className="markdown max-w-none text-[15px]">
                <ReactMarkdown>{m.text}</ReactMarkdown>
              </div>
            )}
          </div>
        ))}

        {loading && <div className="h-4 w-16 shimmer" aria-label="Thinking" />}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
        className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] flex items-end gap-2 rounded-3xl bg-white p-2 shadow-lg md:bottom-6"
      >
        <textarea
          ref={inputRef}
          name="message"
          aria-label="Message"
          rows={1}
          value={input}
          placeholder="Message"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              send(input)
            }
          }}
          className="max-h-40 min-h-9 flex-1 resize-none bg-transparent px-2 py-1.5 text-base outline-none placeholder:text-muted-foreground sm:text-sm"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="h-9 shrink-0 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition-[opacity,transform] duration-150 active:scale-[0.97] disabled:opacity-30"
        >
          Send
        </button>
      </form>
    </div>
  )
}
