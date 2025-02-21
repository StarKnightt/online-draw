'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
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
    setTextBoxes,
    viewport,
    setViewport,
    updateViewport,
  } = useDrawing()

  const {
    startDragging,
    drag,
    stopDragging,
  } = useViewport()

  const containerRef = useRef<HTMLDivElement>(null)
  const textInputRef = useRef<HTMLTextAreaElement>(null)

  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const [isCursorVisible, setIsCursorVisible] = useState(false)
  const [bounds, setBounds] = useState({ width: 0, height: 0 })
  const [selectedTextBox, setSelectedTextBox] = useState<string | null>(null)

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
    const target = e.target as HTMLElement;
    if (!target.closest('.text-box') && !target.closest('.text-input-container')) {
      setSelectedTextBox(null);
      if (textInput) {
        commitText();
      }
    }
  };

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

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === 'text') {
      e.stopPropagation();
      handleTextInput(e);
      return;
    }
    
    const canvasRect = e.currentTarget.getBoundingClientRect();
    const scaleX = e.currentTarget.width / canvasRect.width;
    const scaleY = e.currentTarget.height / canvasRect.height;
    
    // Convert click coordinates to canvas space
    const canvasX = (e.clientX - canvasRect.left - viewport.x) / viewport.zoom;
    const canvasY = (e.clientY - canvasRect.top - viewport.y) / viewport.zoom;

    // First check if we clicked on a text box
    const clickedTextBox = textBoxes.find(box => {
      return (
        canvasX >= box.x &&
        canvasX <= box.x + box.width &&
        canvasY >= box.y &&
        canvasY <= box.y + box.height
      );
    });

    if (clickedTextBox) {
      if (tool === 'eraser') {
        setTextBoxes(prev => prev.filter(box => box.id !== clickedTextBox.id));
        return;
      } else if (tool === 'select') {
        // Handle selection
        setSelectedTextBox(clickedTextBox.id);
        return;
      }
      return;
    }

    // If no text box was clicked, handle normal drawing/erasing/text
    if (tool === 'eraser') {
      setIsDragging(true);
      handleEraser(e);
    } else if (tool === 'select') {
      setSelectedTextBox(null);
    } else {
      startDrawing(e);
    }
  };

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    
    const delta = e.deltaY;
    const zoom = viewport.zoom * Math.pow(0.95, delta / 100);
    
    // Limit zoom level
    const newZoom = Math.min(Math.max(0.1, zoom), 5);
    
    // Get mouse position relative to canvas
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate new position to zoom towards mouse
    const newX = viewport.x + (mouseX - mouseX * (newZoom / viewport.zoom));
    const newY = viewport.y + (mouseY - mouseY * (newZoom / viewport.zoom));
    
    // Use updateViewport instead of setViewport to ensure redraw
    updateViewport({
      x: newX,
      y: newY,
      zoom: newZoom,
    });
  }, [viewport, canvasRef, updateViewport]);

  const handlePan = useCallback((e: React.MouseEvent) => {
    if (e.buttons !== 4 && e.buttons !== 1) return;
    
    updateViewport({
      ...viewport,
      x: viewport.x + e.movementX,
      y: viewport.y + e.movementY,
    });
  }, [viewport, updateViewport]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-gray-100 overflow-hidden"
      onWheel={handleWheel}
      onMouseMove={(e) => {
        handleMouseMove(e);
        if (e.buttons === 4 || (e.buttons === 1 && tool === 'select')) {
          handlePan(e);
        }
      }}
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
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={(e) => {
          if (tool === 'eraser' && isDragging) {
            handleEraser(e);
          } else {
            draw(e);
          }
        }}
        onMouseUp={() => {
          setIsDragging(false);
          stopDrawing();
          stopTextBoxAction();
        }}
        onMouseLeave={() => {
          setIsDragging(false);
          stopDrawing();
          handleMouseLeave();
        }}
      />
      {textBoxes.map((textBox) => (
        <div
          key={textBox.id}
          className={`absolute text-box ${selectedTextBox === textBox.id ? 'ring-2 ring-blue-500' : ''}`}
          style={{
            left: `${textBox.x + viewport.x}px`,
            top: `${textBox.y + viewport.y}px`,
            width: `${textBox.width}px`,
            height: `${textBox.height}px`,
            transform: `scale(${viewport.zoom})`,
            transformOrigin: '0 0',
            pointerEvents: tool === 'eraser' ? 'none' : 'auto',
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (tool === 'select') {
              setSelectedTextBox(textBox.id);
            }
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            setTextInput({
              ...textBox,
              isEditing: true,
            });
            setTextBoxes(prev => prev.filter(box => box.id !== textBox.id));
          }}
        >
          <div 
            className="absolute inset-0 p-2 font-inter"
            style={{
              fontSize: `${textBox.fontSize}px`,
              color: textBox.color,
              cursor: tool === 'select' ? 'move' : 'default',
              userSelect: 'none',
              backgroundColor: selectedTextBox === textBox.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
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
            left: `${textInput.x * viewport.zoom + viewport.x}px`,
            top: `${textInput.y * viewport.zoom + viewport.y}px`,
            width: `${textInput.width}px`,
            height: `${textInput.height}px`,
            transform: `scale(${viewport.zoom})`,
            transformOrigin: '0 0',
            zIndex: 1000,  // Ensure it's above other elements
          }}
        >
          <div
            className="absolute inset-0 border-2 border-blue-500 rounded-lg bg-white shadow-lg"
            onMouseDown={(e) => {
              e.stopPropagation();  // Prevent canvas events
              startTextBoxDrag(e, bounds);
            }}
          >
            <textarea
              ref={textInputRef}
              className="w-full h-full p-2 bg-transparent border-none outline-none resize-none font-inter rounded-lg"
              style={{
                fontSize: `${textInput.fontSize}px`,
                color: textInput.color,
                fontFamily: 'Inter, sans-serif',
                lineHeight: '1.2',
              }}
              value={textInput.text}
              onChange={(e) => {
                const newHeight = Math.max(40, e.target.scrollHeight);
                setTextInput({
                  ...textInput,
                  text: e.target.value,
                  height: newHeight,
                });
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  commitText();
                } else if (e.key === 'Escape') {
                  setTextInput(null);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              placeholder="Type something..."
              autoFocus
            />
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
        setTool={changeTool}
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