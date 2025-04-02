'use client'

import { Tldraw } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import { useCallback, useEffect } from 'react';
import { Editor } from '@tldraw/editor';

export default function Whiteboard() {
  // Add touch event handling configuration
  useEffect(() => {
    // This prevents the browser's default touch behavior
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
    // Load any saved state from localStorage
    const savedState = localStorage.getItem('whiteboard-state')
    if (savedState) {
      try {
        editor.store.put(JSON.parse(savedState))
      } catch (e) {
        console.error('Failed to load saved state:', e)
      }
    }

    // Save state on changes
    editor.store.listen(() => {
      const snapshot = editor.store.serialize()
      localStorage.setItem('whiteboard-state', JSON.stringify(snapshot))
    })
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
      <Tldraw 
        onMount={handleMount}
        hideUi={false}
      />
    </div>
  )
}