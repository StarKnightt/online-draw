import React, { useRef, useEffect } from 'react'

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

interface TextInputProps {
  textInput: TextBox | null;
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  size: number;
  color: string;
  onCommit: () => void;
  onUpdate: (text: string) => void;
}

export function TextInput({ textInput, viewport, size, color, onCommit, onUpdate }: TextInputProps) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textInput && textAreaRef.current) {
      textAreaRef.current.focus();
      // Place cursor at the end of text
      const length = textAreaRef.current.value.length;
      textAreaRef.current.setSelectionRange(length, length);
    }
  }, [textInput]);

  if (!textInput) return null;

  return (
    <div
      className="absolute pointer-events-auto z-50 text-input-container"
      style={{
        left: `${textInput.x + viewport.x}px`,
        top: `${textInput.y + viewport.y}px`,
        width: `${textInput.width}px`,
        height: `${textInput.height}px`,
        transformOrigin: '0 0',
      }}
    >
      <div className="absolute inset-0 border-2 border-blue-500 rounded bg-white">
        <textarea
          ref={textAreaRef}
          className="w-full h-full p-2 bg-transparent border-none outline-none resize-none"
          style={{
            fontSize: `${textInput.fontSize}px`,
            color: textInput.color || color,
            lineHeight: '1.2',
            fontFamily: 'Inter, sans-serif',
          }}
          value={textInput.text || ''}
          onChange={(e) => onUpdate(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onCommit();
            } else if (e.key === 'Escape') {
              // Cancel text input
              onUpdate('');
              onCommit();
            }
          }}
          onBlur={() => onCommit()}
          placeholder="Type something..."
          autoFocus
        />
      </div>
    </div>
  );
}