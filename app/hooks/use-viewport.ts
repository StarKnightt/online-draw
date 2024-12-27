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
    if (e.ctrlKey) {
      // Handle zooming
      e.preventDefault()
      const delta = e.deltaY
      const zoomSensitivity = 0.001
      setViewport(prev => {
        const newZoom = Math.min(Math.max(prev.zoom - delta * zoomSensitivity, 0.1), 5)
        return {
          ...prev,
          zoom: newZoom,
        }
      })
    } else {
      // Handle panning
      setViewport(prev => ({
        ...prev,
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }))
    }
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
      }))
    }
  }, [isDragging, lastPosition])

  const stopDragging = useCallback(() => {
    setIsDragging(false)
  }, [])

  return {
    viewport,
    handleWheel,
    startDragging,
    drag,
    stopDragging,
  }
}

