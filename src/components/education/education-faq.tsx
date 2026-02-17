'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { motion, AnimatePresence } from 'framer-motion'

interface Section {
  heading: string
  body: string
}

export function EducationFAQ({ sections }: { sections: Section[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i)
  }

  if (sections.length === 0) return null

  return (
    <div className="space-y-3">
      {sections.map((section, i) => (
        <div
          key={i}
          className="rounded-xl border border-border/60 bg-card overflow-hidden transition-shadow hover:shadow-md"
        >
          <button
            onClick={() => toggle(i)}
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/30"
          >
            <span className="font-semibold text-[15px] text-foreground">{section.heading}</span>
            <span className="shrink-0">
              <ChevronSVG open={openIndex === i} />
            </span>
          </button>

          <AnimatePresence initial={false}>
            {openIndex === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 pt-1">
                  <div className="prose prose-sm prose-gray max-w-none [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:leading-relaxed [&_li]:leading-relaxed [&_table]:text-sm [&_th]:bg-muted/50 [&_th]:px-3 [&_th]:py-2 [&_td]:px-3 [&_td]:py-2 [&_tr]:border-b [&_tr]:border-border/40">
                    <ReactMarkdown>{section.body}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}

function ChevronSVG({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    >
      <path
        d="M5 7l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-muted-foreground"
      />
    </svg>
  )
}
