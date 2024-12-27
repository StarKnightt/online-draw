'use client'

import { useCallback, useRef, useState } from 'react'

interface Point {
  x: number
  y: number
  pressure?: number
}

export type Tool = 'select' | 'pen' | 'rectangle' | 'ellipse' | 'text' | 'eraser'

export interface DrawingElement {
  type: Tool
  points: Point[]
  color: string
  size: number
}

export function useDrawing() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tempCanvasRef = useRef<HTMLCanvasElement>(null)
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)
  const tempContextRef = useRef<CanvasRenderingContext2D | null>(null)
  const isDrawing = useRef(false)
  const [elements, setElements] = useState<DrawingElement[]>([])
  const [tool, setTool] = useState<Tool>('pen')
  const [color, setColor] = useState('#000000')
  const [size, setSize] = useState(4) // Update 1: Initial size set to 4
  const [history, setHistory] = useState<DrawingElement[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const currentPoints = useRef<Point[]>([])

  const initializeCanvas = useCallback((canvas: HTMLCanvasElement, tempCanvas: HTMLCanvasElement) => {
    const context = canvas.getContext('2d', { willReadFrequently: true })
    const tempContext = tempCanvas.getContext('2d', { willReadFrequently: true })
    
    if (context && tempContext) {
      // Enable smooth lines
      context.lineCap = 'round'
      context.lineJoin = 'round'
      context.strokeStyle = color
      context.lineWidth = size
      contextRef.current = context

      tempContext.lineCap = 'round'
      tempContext.lineJoin = 'round'
      tempContext.strokeStyle = color
      tempContext.lineWidth = size
      tempContextRef.current = tempContext
    }
  }, [color, size])

  const getSmoothPoints = (points: Point[]): Point[] => {
    if (points.length < 3) return points

    const smoothPoints: Point[] = []
    smoothPoints.push(points[0])

    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2
      const yc = (points[i].y + points[i + 1].y) / 2
      smoothPoints.push({ x: xc, y: yc })
    }

    smoothPoints.push(points[points.length - 1])
    return smoothPoints
  }

  const drawSmoothLine = useCallback((context: CanvasRenderingContext2D, points: Point[]) => {
    if (points.length < 2) return

    context.beginPath()
    context.moveTo(points[0].x, points[0].y)

    if (points.length === 2) {
      context.lineTo(points[1].x, points[1].y)
    } else {
      const smoothPoints = getSmoothPoints(points)
      
      for (let i = 0; i < smoothPoints.length - 1; i++) {
        const xMid = (smoothPoints[i].x + smoothPoints[i + 1].x) / 2
        const yMid = (smoothPoints[i].y + smoothPoints[i + 1].y) / 2
        context.quadraticCurveTo(smoothPoints[i].x, smoothPoints[i].y, xMid, yMid)
      }
    }
    
    context.stroke()
    context.closePath()
  }, [])

  const startDrawing = useCallback(({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    if (!tempContextRef.current) return

    const { offsetX, offsetY } = nativeEvent
    isDrawing.current = true
    currentPoints.current = [{ x: offsetX, y: offsetY }]
    
    // Set styles for the current stroke
    tempContextRef.current.strokeStyle = color
    tempContextRef.current.lineWidth = size
  }, [color, size])

  const draw = useCallback(({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => { // Update 2: Updated draw function
    if (!isDrawing.current || !tempContextRef.current || !tempCanvasRef.current) return

    const { offsetX, offsetY } = nativeEvent
    currentPoints.current.push({ x: offsetX, y: offsetY })

    // Clear the temporary canvas
    tempContextRef.current.clearRect(0, 0, tempCanvasRef.current.width, tempCanvasRef.current.height)
    
    // Set composite operation based on tool
    tempContextRef.current.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over'
    
    // Draw the current stroke on the temporary canvas
    drawSmoothLine(tempContextRef.current, currentPoints.current)
    
    // Reset composite operation
    tempContextRef.current.globalCompositeOperation = 'source-over'
  }, [drawSmoothLine, tool])

  const erase = useCallback(({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    if (!contextRef.current || !canvasRef.current) return

    const { offsetX, offsetY } = nativeEvent
    const eraseRadius = size * 2

    contextRef.current.globalCompositeOperation = 'destination-out'
    contextRef.current.beginPath()
    contextRef.current.arc(offsetX, offsetY, eraseRadius, 0, Math.PI * 2)
    contextRef.current.fill()
    contextRef.current.globalCompositeOperation = 'source-over'

    // Update elements state to reflect erased areas
    setElements(prevElements => 
      prevElements.map(el => ({
        ...el,
        points: el.points.filter(p => 
          Math.hypot(p.x - offsetX, p.y - offsetY) > eraseRadius
        )
      })).filter(el => el.points.length > 1)
    )
  }, [size])


  const stopDrawing = useCallback(() => { // Update 3: Updated stopDrawing function
    if (!isDrawing.current || !contextRef.current || !tempContextRef.current) return

    isDrawing.current = false

    // Add the completed stroke to the main canvas
    if (currentPoints.current.length > 0) {
      if (tool === 'eraser') {
        contextRef.current.globalCompositeOperation = 'destination-out'
      }
      
      drawSmoothLine(contextRef.current, currentPoints.current)
      contextRef.current.globalCompositeOperation = 'source-over'
      
      // Add the new element to the history
      const newElement = {
        type: tool,
        points: currentPoints.current,
        color,
        size,
      }
      
      setElements(prev => [...prev, newElement])
      setHistory(prev => [...prev.slice(0, historyIndex + 1), [...elements, newElement]])
      setHistoryIndex(prev => prev + 1)
    }

    // Clear the temporary canvas
    if (tempCanvasRef.current) {
      tempContextRef.current.clearRect(0, 0, tempCanvasRef.current.width, tempCanvasRef.current.height)
    }
    
    currentPoints.current = []
  }, [color, drawSmoothLine, elements, historyIndex, size, tool])

  const clear = useCallback(() => {
    if (!contextRef.current || !canvasRef.current) return
    
    contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    setElements([])
    setHistory(prev => [...prev, []])
    setHistoryIndex(prev => prev + 1)
  }, [])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1)
      setElements(history[historyIndex - 1])
      redrawCanvas()
    }
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1)
      setElements(history[historyIndex + 1])
      redrawCanvas()
    }
  }, [history, historyIndex])

  const redrawCanvas = useCallback(() => {
    if (!contextRef.current || !canvasRef.current) return

    contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    
    elements.forEach(element => {
      if (!contextRef.current) return
      
      contextRef.current.strokeStyle = element.color
      contextRef.current.lineWidth = element.size
      drawSmoothLine(contextRef.current, element.points)
    })
  }, [drawSmoothLine, elements])

  return {
    canvasRef,
    tempCanvasRef,
    initializeCanvas,
    startDrawing,
    draw,
    erase,
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
  }
}

