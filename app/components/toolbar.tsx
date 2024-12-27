import { Button } from "@/components/ui/button"
import { MousePointer2, Pencil, Square, Circle, Type, Eraser, Undo2, Redo2 } from 'lucide-react'
import type { Tool } from "../hooks/use-drawing"

interface ToolbarProps {
  tool: Tool
  setTool: (tool: Tool) => void
  clear: () => void
  undo: () => void
  redo: () => void
}

export function Toolbar({ tool, setTool, clear, undo, redo }: ToolbarProps) {
  const tools = [
    { id: 'select' as Tool, icon: MousePointer2 },
    { id: 'pen' as Tool, icon: Pencil },
    { id: 'rectangle' as Tool, icon: Square },
    { id: 'ellipse' as Tool, icon: Circle },
    { id: 'text' as Tool, icon: Type },
    { id: 'eraser' as Tool, icon: Eraser },
  ]

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-white rounded-lg shadow-lg border">
      {tools.map((t) => {
        const Icon = t.icon
        return (
          <Button
            key={t.id}
            variant={tool === t.id ? "default" : "ghost"}
            size="icon"
            onClick={() => setTool(t.id)}
          >
            <Icon className="h-4 w-4" />
          </Button>
        )
      })}
      <Button variant="ghost" size="icon" onClick={undo}>
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={redo}>
        <Redo2 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={clear}>
        Clear
      </Button>
    </div>
  )
}

