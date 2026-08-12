import * as React from 'react'

/**
 * Radix uses Floating UI for portal placement and can rewrite the transform
 * after the initial render. CardSense intentionally keeps menus below their
 * trigger, so this small guard reapplies that rule after every layout change.
 */
export function useBelowOnlyPlacement(contentRef: React.RefObject<HTMLElement | null>) {
  React.useLayoutEffect(() => {
    const content = contentRef.current
    if (!content) return

    const wrapper = content.closest<HTMLElement>('[data-radix-popper-content-wrapper]')
    if (!wrapper) return

    const findTrigger = () => {
      const contentId = content.getAttribute('id')
      const labelledBy = content.getAttribute('aria-labelledby')?.split(/\s+/)[0]
      if (labelledBy) {
        const labelledTrigger = document.getElementById(labelledBy)
        if (labelledTrigger) return labelledTrigger
      }
      if (contentId) {
        return document.querySelector<HTMLElement>(`[aria-controls="${CSS.escape(contentId)}"]`)
      }
      return null
    }

    const placeBelow = () => {
      const trigger = findTrigger()
      if (!trigger || !content.isConnected) return

      const triggerRect = trigger.getBoundingClientRect()
      const contentRect = content.getBoundingClientRect()
      const align = content.getAttribute('data-align') || 'start'
      const viewportPadding = 8

      let left = triggerRect.left
      if (align === 'end') left = triggerRect.right - contentRect.width
      if (align === 'center') left = triggerRect.left + (triggerRect.width - contentRect.width) / 2

      left = Math.max(viewportPadding, Math.min(left, window.innerWidth - contentRect.width - viewportPadding))

      wrapper.style.transform = `translate3d(${Math.round(left)}px, ${Math.round(triggerRect.bottom + 4)}px, 0)`
      wrapper.style.top = '0px'
      wrapper.style.left = '0px'
      content.dataset.side = 'bottom'
    }

    const frame = window.requestAnimationFrame(placeBelow)
    const resizeObserver = new ResizeObserver(placeBelow)
    const mutationObserver = new MutationObserver(placeBelow)
    resizeObserver.observe(content)
    resizeObserver.observe(document.documentElement)
    mutationObserver.observe(wrapper, { attributes: true, attributeFilter: ['style'] })
    mutationObserver.observe(content, { attributes: true, attributeFilter: ['data-side'] })
    window.addEventListener('resize', placeBelow)
    document.addEventListener('scroll', placeBelow, true)

    return () => {
      window.cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      mutationObserver.disconnect()
      window.removeEventListener('resize', placeBelow)
      document.removeEventListener('scroll', placeBelow, true)
    }
  }, [contentRef])
}
