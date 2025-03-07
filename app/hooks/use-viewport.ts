'use client'

import { useCallback, useState } from 'react'

interface Viewport {
  x: number
  y: number
  zoom: number
}

export function useViewport() {
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 })
  const [isDragging, setIsDragging] = useState(false)
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 })

  const handleWheel = useCallback((e: React.WheelEvent) => {
    // Temporarily disable zooming for now
    if (e.ctrlKey) {
      // Prevent default zoom behavior
      e.preventDefault()
      return
    }
    
    // Only handle panning
    setViewport(prev => ({
      ...prev,
      x: prev.x - e.deltaX,
      y: prev.y - e.deltaY,
    }))
  }, [])

  const startDragging = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || e.button === 2) { // Middle or right mouse button
      e.preventDefault()
      setIsDragging(true)
      setLastPosition({ x: e.clientX, y: e.clientY })
    }
  }, [])

  const drag = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - lastPosition.x
      const dy = e.clientY - lastPosition.y
      setLastPosition({ x: e.clientX, y: e.clientY })
      setViewport(prev => ({
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy,
        // Keep zoom fixed at 1 for now
        zoom: 1
      }))
    }
  }, [isDragging, lastPosition])

  const stopDragging = useCallback(() => {
    setIsDragging(false)
  }, [])

  return {
    viewport,
    setViewport,
    handleWheel,
    startDragging,
    drag,
    stopDragging,
  }
}

