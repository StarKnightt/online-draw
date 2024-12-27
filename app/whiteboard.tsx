'use client'

import { useEffect, useRef, useState } from 'react'
import { useDrawing } from './hooks/use-drawing'
import { useViewport } from './hooks/use-viewport'
import { Toolbar } from './components/toolbar'
import { ColorPicker } from './components/color-picker'
import { Grid } from './components/grid'
import { Cursor } from './components/cursor'

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
    erase,
  } = useDrawing()

  const {
    viewport,
    handleWheel,
    startDragging,
    drag,
    stopDragging,
  } = useViewport()

  const containerRef = useRef<HTMLDivElement>(null)

  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const [isCursorVisible, setIsCursorVisible] = useState(false)

  const handleMouseMove = (e: React.MouseEvent) => {
    setCursorPosition({ x: e.clientX, y: e.clientY })
    if (!isCursorVisible) setIsCursorVisible(true)
  }

  const handleMouseLeave = () => {
    setIsCursorVisible(false)
  }

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
      onMouseMove={(e) => {
        handleMouseMove(e)
        drag(e)
      }}
      onMouseUp={stopDragging}
      onMouseLeave={(e) => {
        handleMouseLeave()
        stopDragging()
      }}
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
        onMouseDown={tool === 'eraser' ? undefined : startDrawing}
        onMouseMove={(e) => tool === 'eraser' ? erase(e) : draw(e)}
        onMouseUp={tool === 'eraser' ? undefined : stopDrawing}
        onMouseLeave={tool === 'eraser' ? undefined : stopDrawing}
        className="absolute inset-0 w-full h-full"
        style={canvasStyle}
      />
      <Cursor
        x={cursorPosition.x}
        y={cursorPosition.y}
        size={size}
        color={color}
        tool={tool}
        visible={isCursorVisible}
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

