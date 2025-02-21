'use client'

import { useEffect, useRef, useState } from 'react'
import { useDrawing } from './hooks/use-drawing'
import { useViewport } from './hooks/use-viewport'
import { Toolbar } from './components/toolbar'
import { ColorPicker } from './components/color-picker'
import { Grid } from './components/grid'
import { Cursor } from './components/cursor'
import { TextInput } from './components/text-input'

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
    changeTool,
    color,
    setColor,
    size,
    setSize,
    erase,
    stopErasing,
    textInput,
    setTextInput,
    addText,
    startTextBoxDrag,
    startTextBoxResize,
    moveTextBox,
    stopTextBoxAction,
    handleEraser,
    handleTextInput,
    commitText,
    isDragging,
    setIsDragging,
    textBoxes,
  } = useDrawing()

  const {
    viewport,
    handleWheel,
    startDragging,
    drag,
    stopDragging,
  } = useViewport()

  const containerRef = useRef<HTMLDivElement>(null)
  const textInputRef = useRef<HTMLTextAreaElement>(null)

  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const [isCursorVisible, setIsCursorVisible] = useState(false)
  const [bounds, setBounds] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect()
      setBounds({ width, height })
    }
  }, [])

  const handleMouseMove = (e: React.MouseEvent) => {
    setCursorPosition({ x: e.clientX, y: e.clientY })
    if (!isCursorVisible) setIsCursorVisible(true)
    moveTextBox(e, bounds)
  }

  const handleMouseLeave = () => {
    setIsCursorVisible(false)
    stopTextBoxAction()
    stopErasing()
  }

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    const tempCanvas = tempCanvasRef.current

    if (container && canvas && tempCanvas) {
      const { width, height } = container.getBoundingClientRect()

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
  }, [canvasRef, tempCanvasRef, initializeCanvas])

  useEffect(() => {
    if (textInput && textInputRef.current) {
      textInputRef.current.focus()
    }
  }, [textInput])

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  const handleTextInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      commitText()
    }
  }

  const handleClickOutside = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (textInput && !target.closest('.text-input-container')) {
      commitText()
    }
  }

  const canvasStyle = {
    transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
    transformOrigin: '0 0',
  }

  type DrawElement = {
    type: 'pen' | 'rectangle' | 'ellipse' | 'text';
    points: { x: number; y: number }[];
    color: string;
    size: number;
    text?: string;
  };

  function someFunction(param: DrawElement) {
    // function implementation
  }

  const updateTextInput = (text: string) => {
    if (textInput) {
      const newHeight = Math.max(40, text.split('\n').length * 24); // Adjust height based on line count
      setTextInput({
        ...textInput,
        text,
        height: newHeight,
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-gray-100 overflow-hidden"
      onWheel={handleWheel}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onContextMenu={handleContextMenu}
      onClick={handleClickOutside}
    >
      <Grid viewport={viewport} />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={canvasStyle}
      />
      <canvas
        ref={tempCanvasRef}
        className="absolute inset-0 w-full h-full"
        style={canvasStyle}
        onMouseDown={(e) => {
          if (tool === 'eraser') {
            setIsDragging(true)
            handleEraser(e)
          } else if (tool === 'text') {
            handleTextInput(e)
          } else {
            startDrawing(e)
          }
        }}
        onMouseMove={(e) => {
          if (tool === 'eraser' && isDragging) {
            handleEraser(e)
          } else {
            draw(e)
          }
        }}
        onMouseUp={() => {
          setIsDragging(false)
          stopDrawing()
          stopTextBoxAction()
        }}
        onMouseLeave={() => {
          setIsDragging(false)
          stopDrawing()
          handleMouseLeave()
        }}
      />
      {textBoxes.map((textBox) => (
        <div
          key={textBox.id}
          className="absolute text-box"
          style={{
            left: `${textBox.x + viewport.x}px`,
            top: `${textBox.y + viewport.y}px`,
            width: `${textBox.width}px`,
            height: `${textBox.height}px`,
            transform: `scale(${viewport.zoom})`,
            transformOrigin: '0 0',
          }}
        >
          <div className="absolute inset-0 p-2 font-inter"
            style={{
              fontSize: `${textBox.fontSize}px`,
              color: textBox.color,
              cursor: 'move',
            }}
          >
            {textBox.text}
          </div>
        </div>
      ))}
      {textInput && (
        <div
          className="absolute text-input-container"
          style={{
            left: `${textInput.x + viewport.x}px`,
            top: `${textInput.y + viewport.y}px`,
            width: `${textInput.width}px`,
            height: `${textInput.height}px`,
            transform: `scale(${viewport.zoom})`,
            transformOrigin: '0 0',
          }}
        >
          <div
            className="absolute inset-0 border-2 border-blue-500 rounded-lg bg-white shadow-lg"
            onMouseDown={(e) => startTextBoxDrag(e, bounds)}
          >
            <textarea
              ref={textInputRef}
              className="w-full h-full p-2 bg-transparent border-none outline-none resize-none font-inter rounded-lg"
              style={{
                fontSize: `${textInput.fontSize}px`,
                color: textInput.color,
                fontFamily: 'Inter, sans-serif',
                lineHeight: '1.2',
                overflow: 'hidden',
              }}
              value={textInput.text}
              onChange={(e) => updateTextInput(e.target.value)}
              onKeyDown={handleTextInputKeyDown}
              placeholder="Type something..."
              autoFocus
            />
            {['nw', 'ne', 'sw', 'se'].map((direction) => (
              <div
                key={direction}
                className="absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-pointer hover:bg-blue-100"
                style={{
                  top: direction.includes('n') ? '-1.5px' : 'auto',
                  bottom: direction.includes('s') ? '-1.5px' : 'auto',
                  left: direction.includes('w') ? '-1.5px' : 'auto',
                  right: direction.includes('e') ? '-1.5px' : 'auto',
                  cursor: `${direction}-resize`,
                }}
                onMouseDown={(e) => startTextBoxResize(e, direction as any)}
              />
            ))}
          </div>
        </div>
      )}
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
        setTool={changeTool} // Use the new changeTool function
        clear={clear}
        undo={undo}
        redo={redo}
      />
      <ColorPicker
        color={color}
        setColor={setColor}
        size={size}
        setSize={setSize}
        tool={tool}
      />
      <TextInput
        textInput={textInput}
        viewport={viewport}
        size={size}
        color={color}
        onCommit={commitText}
        onUpdate={updateTextInput}
      />
    </div>
  )
}