'use client'

import { useEffect, useRef } from 'react'

type TurnstileRenderOptions = {
  sitekey: string
  action?: string
  theme?: 'auto' | 'light' | 'dark'
  callback?: (token: string) => void
  'expired-callback'?: () => void
  'error-callback'?: () => void
}

type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

let turnstileScriptPromise: Promise<void> | null = null

function waitForTurnstile() {
  return new Promise<void>((resolve, reject) => {
    const startedAt = Date.now()

    const poll = () => {
      if (window.turnstile) {
        resolve()
        return
      }

      if (Date.now() - startedAt > 10_000) {
        reject(new Error('Turnstile script load timeout'))
        return
      }

      window.setTimeout(poll, 50)
    }

    poll()
  })
}

function loadTurnstileScript() {
  if (typeof window === 'undefined') {
    return Promise.resolve()
  }

  if (window.turnstile) {
    return Promise.resolve()
  }

  if (turnstileScriptPromise) {
    return turnstileScriptPromise
  }

  turnstileScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-turnstile-script="1"]')
    if (existing) {
      void waitForTurnstile().then(resolve).catch(reject)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.defer = true
    script.dataset.turnstileScript = '1'
    script.onload = () => {
      void waitForTurnstile().then(resolve).catch(reject)
    }
    script.onerror = () => reject(new Error('Failed to load Turnstile script'))
    document.head.appendChild(script)
  })

  return turnstileScriptPromise
}

interface TurnstileWidgetProps {
  siteKey: string
  action: string
  onToken: (token: string) => void
  onError?: () => void
  className?: string
}

export function TurnstileWidget({ siteKey, action, onToken, onError, className }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | null>(null)
  const onTokenRef = useRef(onToken)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    onTokenRef.current = onToken
  }, [onToken])

  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  useEffect(() => {
    if (!siteKey || !containerRef.current) {
      return
    }

    let mounted = true

    void loadTurnstileScript()
      .then(() => {
        if (!mounted || !containerRef.current || !window.turnstile) {
          return
        }

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          action,
          theme: 'light',
          callback: (token) => onTokenRef.current(token),
          'expired-callback': () => onTokenRef.current(''),
          'error-callback': () => {
            onTokenRef.current('')
            onErrorRef.current?.()
          },
        })
      })
      .catch(() => {
        if (mounted) {
          onErrorRef.current?.()
        }
      })

    return () => {
      mounted = false
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [action, siteKey])

  return <div ref={containerRef} className={className} />
}
