'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

interface Section {
  heading: string
  body: string
}

export function EducationFAQ({ sections }: { sections: Section[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  if (sections.length === 0) return null

  return (
    <div className="education-article-sections">
      {sections.map((section, i) => {
        const isOpen = openIndex === i

        return (
          <div id={`section-${i + 1}`} key={section.heading} className="border-t border-border last:border-b">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-5 py-5 text-left transition-colors hover:text-[#8d6500] sm:py-6"
            >
              <span className="flex items-start gap-4 text-base font-semibold text-foreground sm:text-lg">
                <span className="pt-0.5 font-mono text-[0.65rem] font-normal tracking-[0.14em] text-[#b8860b]">{String(i + 1).padStart(2, '0')}</span>
                {section.heading}
              </span>
              <ChevronDown className={`h-4 w-4 shrink-0 text-[#b8860b] transition-transform ${isOpen ? 'rotate-180' : ''}`} strokeWidth={1.8} />
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
                  <div className="pb-6 pl-10 pr-2 sm:pl-12 sm:pr-8">
                    <div className="prose prose-sm max-w-none text-muted-foreground [&_a]:text-[#8d6500] [&_a]:underline [&_a]:underline-offset-2 [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground [&_li]:leading-relaxed [&_p]:leading-7 [&_strong]:text-foreground [&_table]:text-sm [&_td]:border-b [&_td]:border-border/60 [&_td]:px-2 [&_td]:py-2 [&_th]:border-b [&_th]:border-border [&_th]:px-2 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:text-foreground">
                      <ReactMarkdown>{section.body}</ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
