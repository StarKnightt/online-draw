'use client'

import { Tldraw } from '@tldraw/tldraw'
import '@tldraw/tldraw/tldraw.css'
import { useCallback, useEffect, useState } from 'react'
import { Editor } from '@tldraw/editor'
import { cn } from '@/lib/utils'

export default function Whiteboard() {
  const [isDark, setIsDark] = useState(false)

  // Handle theme changes
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDark(prefersDark)

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => setIsDark(e.matches)
    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Touch event handling
  useEffect(() => {
    const handleTouch = (e: TouchEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest('.tl-canvas')) {
        e.preventDefault()
      }
    }

    document.addEventListener('touchstart', handleTouch, { passive: false })
    document.addEventListener('touchmove', handleTouch, { passive: false })
    document.addEventListener('touchend', handleTouch, { passive: false })

    return () => {
      document.removeEventListener('touchstart', handleTouch)
      document.removeEventListener('touchmove', handleTouch)
      document.removeEventListener('touchend', handleTouch)
    }
  }, [])

  const handleMount = useCallback((editor: Editor) => {
    const savedState = localStorage.getItem('whiteboard-state')
    if (savedState) {
      try {
        editor.store.put(JSON.parse(savedState))
      } catch (e) {
        console.error('Failed to load saved state:', e)
      }
    }

    editor.store.listen(() => {
      const snapshot = editor.store.serialize()
      localStorage.setItem('whiteboard-state', JSON.stringify(snapshot))
    })
  }, [])

  return (
    <div className={cn(
      "fixed inset-0 overflow-hidden",
      isDark ? 'dark' : '',
      "bg-background text-foreground"
    )}>
      <Tldraw
        onMount={handleMount}
        className={isDark ? 'tldraw-dark' : ''}
      />
    </div>
  )
}