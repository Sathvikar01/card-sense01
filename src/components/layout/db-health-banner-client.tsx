'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
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
    <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-700" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-900">Database setup incomplete</p>
          <p className="mt-1 text-sm text-amber-800">
            Missing tables: <span className="font-medium">{missingTables.join(', ')}</span>.
            Run migrations (`001_initial_schema.sql`, `002_rls_policies.sql`, `003_triggers.sql`)
            in Supabase SQL editor.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-amber-700 hover:bg-amber-100"
          onClick={() => {
            setDismissed(true)
            try {
              window.localStorage.setItem(storageKey, '1')
            } catch {}
          }}
          aria-label="Dismiss database warning"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
