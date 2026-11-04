'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'

interface DbHealthBannerClientProps {
  missingTables: string[]
}

export function DbHealthBannerClient({ missingTables }: DbHealthBannerClientProps) {
  const issueSignature = useMemo(() => missingTables.slice().sort().join(','), [missingTables])
  const storageKey = `cardsense:db-health:dismissed:${issueSignature}`
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }
    try {
      return window.localStorage.getItem(storageKey) === '1'
    } catch {
      return false
    }
  })

  if (dismissed) {
    return null
  }

  return (
    <div className="mb-6 rounded-2xl bg-gold px-4 py-3 text-pine">
      <div className="flex items-start gap-3">
                <div className="flex-1">
          <p className="text-sm font-medium">Database setup incomplete</p>
          <p className="mt-1 text-sm">
            Missing tables: <span className="font-medium">{missingTables.join(', ')}</span>.
            Run migrations (`001_initial_schema.sql`, `002_rls_policies.sql`, `003_triggers.sql`)
            in Supabase SQL editor.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setDismissed(true)
            try {
              window.localStorage.setItem(storageKey, '1')
            } catch {}
          }}
        >
          Dismiss
        </Button>
      </div>
    </div>
  )
}
