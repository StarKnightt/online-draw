'use client'

import { useCallback, useRef, useState } from 'react'

interface Point {
  x: number
  y: number
  pressure?: number
}

interface TextBox {
  id: string;
  x: number;
  y: number;
  text: string;
  width: number;
  height: number;
  fontSize: number;
  color: string;
  isDragging: boolean;
  isResizing: boolean;
  isEditing: boolean;
  resizeDirection: 'nw' | 'ne' | 'sw' | 'se' | null;
  initialX: number;
  initialY: number;
  initialWidth: number;
  initialHeight: number;
}

export type Tool = 'select' | 'pen' | 'rectangle' | 'ellipse' | 'text' | 'eraser'

export interface DrawingElement {
  type: Tool
  points: Point[]
  color: string
  size: number
  text?: string
  width?: number
  height?: number
}

const isPointInRect = (x: number, y: number, rect: { x: number; y: number; width: number; height: number }) => {
  return x >= rect.x && 
         x <= rect.x + rect.width && 
         y >= rect.y && 
         y <= rect.y + rect.height
}

const isPointNearPath = (x: number, y: number, points: Point[], threshold = 5) => {
  return points.some(point => 
    Math.hypot(point.x - x, point.y - y) <= threshold
  )
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
  const [size, setSize] = useState(6)
  const [history, setHistory] = useState<DrawingElement[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const currentPoints = useRef<Point[]>([])
  const [textInput, setTextInput] = useState<TextBox | null>(null)
  const lastErasePoint = useRef<Point | null>(null)
  const [selectedElement, setSelectedElement] = useState<DrawingElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([])
  const [selectedTextBox, setSelectedTextBox] = useState<string | null>(null)
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 })

  const getSmoothPoints = (points: Point[]): Point[] => {
    if (points.length < 3) return points;

    const smoothPoints: Point[] = [];
    smoothPoints.push(points[0]);

    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      smoothPoints.push({ x: xc, y: yc });
    }

    smoothPoints.push(points[points.length - 1]);
    return smoothPoints;
  };

  const drawSmoothLine = useCallback((context: CanvasRenderingContext2D, points: Point[]) => {
    if (points.length < 2) return;

    context.beginPath();
    context.moveTo(points[0].x, points[0].y);

    if (points.length === 2) {
      context.lineTo(points[1].x, points[1].y);
    } else {
      const smoothPoints = getSmoothPoints(points);
      
      for (let i = 0; i < smoothPoints.length - 1; i++) {
        const xMid = (smoothPoints[i].x + smoothPoints[i + 1].x) / 2;
        const yMid = (smoothPoints[i].y + smoothPoints[i + 1].y) / 2;
        context.quadraticCurveTo(smoothPoints[i].x, smoothPoints[i].y, xMid, yMid);
      }
    }
    
    context.stroke();
    context.closePath();
  }, []);

  const drawShape = useCallback((context: CanvasRenderingContext2D, startPoint: Point, endPoint: Point, shapeType: 'rectangle' | 'ellipse') => {
    const width = endPoint.x - startPoint.x;
    const height = endPoint.y - startPoint.y;

    context.beginPath();
    if (shapeType === 'rectangle') {
      context.rect(startPoint.x, startPoint.y, width, height);
    } else if (shapeType === 'ellipse') {
      const centerX = startPoint.x + width / 2;
      const centerY = startPoint.y + height / 2;
      const radiusX = Math.abs(width / 2);
      const radiusY = Math.abs(height / 2);
      context.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    }
    context.stroke();
    context.closePath();
  }, []);

  const redrawCanvas = useCallback(() => {
    if (!contextRef.current || !canvasRef.current) return;

    // Clear the canvas before redrawing
    const canvas = canvasRef.current;
    contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
    
    // Save current transform
    contextRef.current.save();
    
    // Apply viewport transform
    contextRef.current.setTransform(
      1, 0,
      0, 1,
      viewport.x, viewport.y
    );
    
    elements.forEach(element => {
      if (!contextRef.current) return;
      
      contextRef.current.strokeStyle = element.color;
      contextRef.current.lineWidth = element.size;

      if (element.type === 'text' && element.text) {
        contextRef.current.font = `${element.size * 4}px Inter, sans-serif`;
        contextRef.current.fillStyle = element.color;
        contextRef.current.fillText(element.text, element.points[0].x, element.points[0].y + element.size * 4);
      } else if (element.type === 'pen') {
        drawSmoothLine(contextRef.current, element.points);
      } else if (element.type === 'rectangle' || element.type === 'ellipse') {
        drawShape(contextRef.current, element.points[0], element.points[element.points.length - 1], element.type);
      }
    });
    
    // Restore original transform
    contextRef.current.restore();
  }, [drawSmoothLine, drawShape, elements, viewport]);

  const updateViewport = useCallback((newViewport: { x: number; y: number; zoom: number }) => {
    setViewport(newViewport);
    redrawCanvas();
  }, [redrawCanvas]);

  const initializeCanvas = useCallback((canvas: HTMLCanvasElement, tempCanvas: HTMLCanvasElement) => {
    const context = canvas.getContext('2d', { willReadFrequently: true })
    const tempContext = tempCanvas.getContext('2d', { willReadFrequently: true })
    
    if (context && tempContext) {
      context.lineCap = 'round'
      context.lineJoin = 'round'
      context.strokeStyle = color
      context.lineWidth = size
      
      // Don't apply transformation here - it causes performance issues
      // Let's handle this in our rendering logic instead
      
      contextRef.current = context

      tempContext.lineCap = 'round'
      tempContext.lineJoin = 'round'
      tempContext.strokeStyle = color
      tempContext.lineWidth = size
      
      tempContextRef.current = tempContext

      // Call redrawCanvas to ensure everything is rendered correctly
      redrawCanvas();
    }
  }, [color, size, viewport, redrawCanvas])

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!tempContextRef.current) return;

    const coords = getCanvasCoordinates(e);
    isDrawing.current = true;
    currentPoints.current = [coords];
    
    if (tool === 'text') {
      setTextInput({
        id: Date.now().toString(),
        x: coords.x,
        y: coords.y,
        text: '',
        width: 200,
        height: 100,
        fontSize: 16,
        color: '#000000',
        isDragging: false,
        isResizing: false,
        resizeDirection: null,
        initialX: coords.x,
        initialY: coords.y,
        initialWidth: 200,
        initialHeight: 100,
        isEditing: false,
      });
    } else {
      tempContextRef.current.strokeStyle = color;
      tempContextRef.current.lineWidth = size;
    }
    setIsDragging(true);
  }, [color, size, tool])

  const startTextBoxDrag = useCallback((e: React.MouseEvent, bounds: { width: number; height: number }) => {
    if (textInput) {
      setTextInput({
        ...textInput,
        isDragging: true,
        initialX: e.clientX - textInput.x,
        initialY: e.clientY - textInput.y,
      })
    }
  }, [textInput])

  const startTextBoxResize = useCallback((e: React.MouseEvent, direction: 'nw' | 'ne' | 'sw' | 'se') => {
    if (textInput) {
      e.stopPropagation()
      setTextInput({
        ...textInput,
        isResizing: true,
        resizeDirection: direction,
        initialWidth: textInput.width,
        initialHeight: textInput.height,
        initialX: e.clientX,
        initialY: e.clientY,
      })
    }
  }, [textInput])

  const moveTextBox = useCallback((e: React.MouseEvent, bounds: { width: number; height: number }) => {
    if (!textInput) return

    if (textInput.isDragging) {
      const newX = Math.max(0, Math.min(e.clientX - textInput.initialX, bounds.width - textInput.width))
      const newY = Math.max(0, Math.min(e.clientY - textInput.initialY, bounds.height - textInput.height))

      setTextInput({
        ...textInput,
        x: newX,
        y: newY,
      })
    } else if (textInput.isResizing && textInput.resizeDirection) {
      const dx = e.clientX - textInput.initialX
      const dy = e.clientY - textInput.initialY
      
      let newWidth = textInput.initialWidth
      let newHeight = textInput.initialHeight
      let newX = textInput.x
      let newY = textInput.y

      switch (textInput.resizeDirection) {
        case 'se':
          newWidth = Math.max(100, textInput.initialWidth + dx)
          newHeight = Math.max(50, textInput.initialHeight + dy)
          break
        case 'sw':
          newWidth = Math.max(100, textInput.initialWidth - dx)
          newHeight = Math.max(50, textInput.initialHeight + dy)
          newX = Math.min(textInput.x + dx, textInput.x + textInput.width - 100)
          break
        case 'ne':
          newWidth = Math.max(100, textInput.initialWidth + dx)
          newHeight = Math.max(50, textInput.initialHeight - dy)
          newY = Math.min(textInput.y + dy, textInput.y + textInput.height - 50)
          break
        case 'nw':
          newWidth = Math.max(100, textInput.initialWidth - dx)
          newHeight = Math.max(50, textInput.initialHeight - dy)
          newX = Math.min(textInput.x + dx, textInput.x + textInput.width - 100)
          newY = Math.min(textInput.y + dy, textInput.y + textInput.height - 50)
          break
      }

      // Ensure the text box stays within bounds
      newX = Math.max(0, Math.min(newX, bounds.width - newWidth))
      newY = Math.max(0, Math.min(newY, bounds.height - newHeight))

      setTextInput({
        ...textInput,
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      })
    }
  }, [textInput])

  const stopTextBoxAction = useCallback(() => {
    if (textInput) {
      setTextInput({
        ...textInput,
        isDragging: false,
        isResizing: false,
        resizeDirection: null,
      })
    }
  }, [textInput])

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !tempContextRef.current || !tempCanvasRef.current || tool === 'text') return;

    const coords = getCanvasCoordinates(e);
    currentPoints.current.push(coords);

    tempContextRef.current.clearRect(0, 0, tempCanvasRef.current.width, tempCanvasRef.current.height)
    
    if (tool === 'pen') {
      drawSmoothLine(tempContextRef.current, currentPoints.current)
    } else if (tool === 'rectangle' || tool === 'ellipse') {
      drawShape(tempContextRef.current, currentPoints.current[0], { x: coords.x, y: coords.y }, tool)
    }
  }, [drawSmoothLine, drawShape, tool])

  const erase = useCallback(({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    if (!contextRef.current || !canvasRef.current) return

    const { offsetX, offsetY } = nativeEvent
    const eraseRadius = size * 4 // Increased eraser size

    // Draw eraser preview
    if (tempContextRef.current && tempCanvasRef.current) {
      tempContextRef.current.clearRect(0, 0, tempCanvasRef.current.width, tempCanvasRef.current.height)
      tempContextRef.current.beginPath()
      tempContextRef.current.arc(offsetX, offsetY, eraseRadius, 0, Math.PI * 2)
      tempContextRef.current.strokeStyle = 'rgba(0,0,0,0.2)'
      tempContextRef.current.stroke()
    }

    // Perform erasing
    contextRef.current.globalCompositeOperation = 'destination-out'
    contextRef.current.beginPath()

    if (lastErasePoint.current) {
      // Create a continuous erasing effect
      contextRef.current.moveTo(lastErasePoint.current.x, lastErasePoint.current.y)
      contextRef.current.lineTo(offsetX, offsetY)
      contextRef.current.lineWidth = eraseRadius * 2
      contextRef.current.stroke()
    }

    contextRef.current.arc(offsetX, offsetY, eraseRadius, 0, Math.PI * 2)
    contextRef.current.fill()
    contextRef.current.globalCompositeOperation = 'source-over'

    lastErasePoint.current = { x: offsetX, y: offsetY }

    // Update elements array to remove erased elements
    setElements(prevElements => 
      prevElements.map(el => ({
        ...el,
        points: el.points.filter(p => 
          Math.hypot(p.x - offsetX, p.y - offsetY) > eraseRadius
        )
      })).filter(el => el.points.length > 1)
    )
  }, [size])

  const stopErasing = useCallback(() => {
    lastErasePoint.current = null
    if (tempContextRef.current && tempCanvasRef.current) {
      tempContextRef.current.clearRect(0, 0, tempCanvasRef.current.width, tempCanvasRef.current.height)
    }
  }, [])

  const stopDrawing = useCallback(() => {
    if (!isDrawing.current || !contextRef.current || !tempContextRef.current) return

    isDrawing.current = false

    if (currentPoints.current.length > 0) {
      if (tool === 'pen') {
        drawSmoothLine(contextRef.current, currentPoints.current)
      } else if (tool === 'rectangle' || tool === 'ellipse') {
        drawShape(contextRef.current, currentPoints.current[0], currentPoints.current[currentPoints.current.length - 1], tool)
      }
      
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

    if (tempCanvasRef.current) {
      tempContextRef.current.clearRect(0, 0, tempCanvasRef.current.width, tempCanvasRef.current.height)
    }
    
    currentPoints.current = []
    setIsDragging(false)
  }, [color, drawSmoothLine, drawShape, elements, historyIndex, size, tool])

  const addText = useCallback((text: string) => {
    if (!textInput || !contextRef.current || !text.trim()) return

    contextRef.current.font = `${size * 4}px Inter, sans-serif`
    contextRef.current.fillStyle = color
    contextRef.current.textBaseline = 'top'
    contextRef.current.fillText(text, textInput.x, textInput.y)

    const newElement: DrawingElement = {
      type: 'text',
      points: [{ x: textInput.x, y: textInput.y }],
      color,
      size,
      text,
      width: textInput.width,
      height: textInput.height,
    }

    setElements(prev => [...prev, newElement])
    setHistory(prev => [...prev.slice(0, historyIndex + 1), [...elements, newElement]])
    setHistoryIndex(prev => prev + 1)
    setTextInput(null)
  }, [textInput, color, size, elements, historyIndex])

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
  }, [history, historyIndex, redrawCanvas])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1)
      setElements(history[historyIndex + 1])
      redrawCanvas()
    }
  }, [history, historyIndex, redrawCanvas])

  const setToolSafely = useCallback((newTool: Tool) => {
    setTool(newTool);
    // Don't redraw when changing tools
  }, []);

  const setColorSafely = useCallback((newColor: string) => {
    // Store current canvas state
    const currentState = contextRef.current?.getImageData(0, 0, canvasRef.current?.width || 0, canvasRef.current?.height || 0);
    
    setColor(newColor);
    if (contextRef.current) {
      contextRef.current.strokeStyle = newColor;
    }
    if (tempContextRef.current) {
      tempContextRef.current.strokeStyle = newColor;
    }
    
    // Restore canvas state
    if (currentState && contextRef.current && canvasRef.current) {
      contextRef.current.putImageData(currentState, 0, 0);
    }
  }, []);

  const setSizeSafely = useCallback((newSize: number) => {
    // Store current canvas state
    const currentState = contextRef.current?.getImageData(0, 0, canvasRef.current?.width || 0, canvasRef.current?.height || 0);
    
    setSize(newSize);
    if (contextRef.current) {
      contextRef.current.lineWidth = newSize;
    }
    if (tempContextRef.current) {
      tempContextRef.current.lineWidth = newSize;
    }
    
    // Restore canvas state
    if (currentState && contextRef.current && canvasRef.current) {
      contextRef.current.putImageData(currentState, 0, 0);
    }
  }, []);

  const commitText = useCallback(() => {
    if (!textInput?.text.trim()) {
      setTextInput(null);
      return;
    }

    // Add to textBoxes
    setTextBoxes(prev => [...prev, {
      ...textInput,
      isEditing: false,
    }]);

    // Add to drawing history
    const newElement: DrawingElement = {
      type: 'text',
      points: [{ x: textInput.x, y: textInput.y }],
      color: textInput.color,
      size: textInput.fontSize / 4,
      text: textInput.text,
      width: textInput.width,
      height: textInput.height,
    };

    setElements(prev => [...prev, newElement]);
    setHistory(prev => [...prev.slice(0, historyIndex + 1), [...elements, newElement]]);
    setHistoryIndex(prev => prev + 1);

    setTextInput(null);
  }, [textInput, elements, historyIndex]);

  const changeTool = useCallback((newTool: Tool) => {
    // Commit any pending text
    if (textInput?.text.trim()) {
      commitText();
    }
    
    // Clear selection when changing tools
    if (selectedTextBox) {
      setSelectedTextBox(null);
    }
    
    // Reset dragging state
    setIsDragging(false);
    
    setToolSafely(newTool);
  }, [textInput, selectedTextBox, commitText, setToolSafely]);

  const handleEraser = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== 'eraser') return;
    
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - viewport.x) / viewport.zoom;
    const y = (e.clientY - rect.top - viewport.y) / viewport.zoom;
    const eraseRadius = size * 2;

    // Erase drawings
    setElements(prevElements => {
      const newElements = prevElements.filter(el => {
        if (el.type === 'text') {
          const textBounds = {
            x: el.points[0].x - 5,
            y: el.points[0].y - 5,
            width: (el.width || 0) + 10,
            height: (el.height || 0) + 10
          };
          return !isPointInRect(x, y, textBounds);
        }
        return !isPointNearPath(x, y, el.points, eraseRadius);
      });

      // Save to history if elements were removed
      if (newElements.length < prevElements.length) {
        setHistory(prev => [...prev.slice(0, historyIndex + 1), newElements]);
        setHistoryIndex(prev => prev + 1);
      }

      return newElements;
    });

    // Clear the actual canvas
    if (contextRef.current && canvasRef.current) {
      const ctx = contextRef.current;
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, eraseRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }, [tool, size, viewport.x, viewport.y, viewport.zoom, historyIndex]);

  const handleTextInput = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== 'text') return;
    
    // Get correct canvas-space coordinates
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    
    // Corrected coordinate calculation
    const x = (e.clientX - rect.left - viewport.x) / viewport.zoom;
    const y = (e.clientY - rect.top - viewport.y) / viewport.zoom;
    
    const newTextBox: TextBox = {
      id: Date.now().toString(),
      x,
      y,
      text: '',
      width: 200,
      height: 40,
      fontSize: size * 4,
      color: color,
      isDragging: false,
      isResizing: false,
      isEditing: true,
      resizeDirection: null,
      initialX: x,
      initialY: y,
      initialWidth: 200,
      initialHeight: 40,
    };
    
    setTextInput(newTextBox);
  }, [tool, size, color, viewport]);

  const handleTextBoxClick = useCallback((e: React.MouseEvent, textBox: TextBox) => {
    e.stopPropagation();
    setSelectedTextBox(textBox.id);
  }, []);

  const handleTextBoxDoubleClick = useCallback((e: React.MouseEvent, textBox: TextBox) => {
    e.stopPropagation();
    setTextInput(textBox);
    setTextBoxes(prev => prev.filter(box => box.id !== textBox.id));
  }, []);

  const moveSelectedTextBox = useCallback((e: React.MouseEvent) => {
    if (!selectedTextBox || tool !== 'select') return;
    
    const textBox = textBoxes.find(box => box.id === selectedTextBox);
    if (!textBox?.isDragging) return;

    const dx = (e.clientX - textBox.initialX) / viewport.zoom;
    const dy = (e.clientY - textBox.initialY) / viewport.zoom;

    setTextBoxes(prev => prev.map(box => 
      box.id === selectedTextBox
        ? {
            ...box,
            x: box.x + dx,
            y: box.y + dy,
            initialX: e.clientX,
            initialY: e.clientY,
          }
        : box
    ));
  }, [selectedTextBox, textBoxes, tool, viewport.zoom]);

  return {
    canvasRef,
    tempCanvasRef,
    initializeCanvas,
    startDrawing,
    draw,
    erase,
    stopErasing,
    stopDrawing,
    clear,
    undo,
    redo,
    tool,
    setTool: setToolSafely,
    color,
    setColor: setColorSafely,
    size,
    setSize: setSizeSafely,
    textInput,
    setTextInput,
    addText,
    startTextBoxDrag,
    startTextBoxResize,
    moveTextBox,
    stopTextBoxAction,
    changeTool,
    handleEraser,
    handleTextInput,
    commitText,
    isDragging,
    setIsDragging,
    selectedTextBox,
    setSelectedTextBox,
    handleTextBoxClick,
    handleTextBoxDoubleClick,
    textBoxes,
    setTextBoxes,
    moveSelectedTextBox,
    updateViewport,
    viewport,
    setViewport,
  }
}
