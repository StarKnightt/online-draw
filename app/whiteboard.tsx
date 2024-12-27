'use client'

import { useEffect, useRef } from 'react'
import { useDrawing } from './hooks/use-drawing'
import { useViewport } from './hooks/use-viewport'
import { Toolbar } from './components/toolbar'
import { ColorPicker } from './components/color-picker'
import { Grid } from './components/grid'

export default function Whiteboard() {
  const {
    canvasRef,
    tempCanvasRef,
    initializeCanvas,
    startDrawing,
    draw,
    stopDrawing,
    clear,
    undo,
    redo,
    tool,
    setTool,
    color,
    setColor,
    size,
    setSize,
  } = useDrawing()

  const {
    viewport,
    handleWheel,
    startDragging,
    drag,
    stopDragging,
  } = useViewport()

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    const tempCanvas = tempCanvasRef.current
    
    if (container && canvas && tempCanvas) {
      const { width, height } = container.getBoundingClientRect()
      
      // Set both canvases to the same size
      canvas.width = width
      canvas.height = height
      tempCanvas.width = width
      tempCanvas.height = height
      
      initializeCanvas(canvas, tempCanvas)
    }

    const handleResize = () => {
      if (container && canvas && tempCanvas) {
        const { width, height } = container.getBoundingClientRect()
        canvas.width = width
        canvas.height = height
        tempCanvas.width = width
        tempCanvas.height = height
        initializeCanvas(canvas, tempCanvas)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [initializeCanvas])

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  const canvasStyle = {
    transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
    transformOrigin: '0 0',
  }

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-white overflow-hidden"
      onWheel={handleWheel}
      onMouseDown={startDragging}
      onMouseMove={drag}
      onMouseUp={stopDragging}
      onMouseLeave={stopDragging}
      onContextMenu={handleContextMenu}
    >
      <Grid viewport={viewport} />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={canvasStyle}
      />
      <canvas
        ref={tempCanvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="absolute inset-0 w-full h-full"
        style={canvasStyle}
      />
      <Toolbar 
        tool={tool} 
        setTool={setTool} 
        clear={clear}
        undo={undo}
        redo={redo}
      />
      <ColorPicker
        color={color}
        setColor={setColor}
        size={size}
        setSize={setSize}
      />
    </div>
  )
}

