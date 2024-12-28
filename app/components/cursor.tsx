import { Square, Circle } from 'lucide-react'

interface CursorProps {
  x: number
  y: number
  size: number
  color: string
  tool: string
  visible: boolean
}

export function Cursor({ x, y, size, color, tool, visible }: CursorProps) {
  if (!visible) return null

  const cursorSize = size * 2

  return (
    <div
      className="pointer-events-none fixed top-0 left-0 z-50"
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      {tool === 'eraser' ? (
        <div
          className="rounded-sm border-2 border-black"
          style={{
            width: `${cursorSize * 2}px`,
            height: `${cursorSize * 2}px`,
            marginLeft: `-${cursorSize}px`,
            marginTop: `-${cursorSize}px`,
          }}
        />
      ) : tool === 'text' ? (
        <div className="text-black text-2xl">|</div>
      ) : tool === 'rectangle' ? (
        <Square className="text-black" size={cursorSize} />
      ) : tool === 'ellipse' ? (
        <Circle className="text-black" size={cursorSize} />
      ) : (
        <div
          className="rounded-full"
          style={{
            width: `${cursorSize}px`,
            height: `${cursorSize}px`,
            marginLeft: `-${cursorSize / 2}px`,
            marginTop: `-${cursorSize / 2}px`,
            backgroundColor: color,
            opacity: 0.5,
          }}
        />
      )}
    </div>
  )
}

