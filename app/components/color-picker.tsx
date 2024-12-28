import { Button } from "@/components/ui/button"
import { Tool } from "../hooks/use-drawing"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
  color: string
  setColor: (color: string) => void
  size: number
  setSize: (size: number) => void
  tool: Tool
}

export function ColorPicker({ color, setColor, size, setSize, tool }: ColorPickerProps) {
  const colors = [
    '#000000', '#4B5563', '#9333EA', '#4F46E5',
    '#2563EB', '#0EA5E9', '#F59E0B', '#DC2626',
  ]

  const sizes = [
    { id: 'S', value: 2 },
    { id: 'M', value: 4 },
    { id: 'L', value: 6 },
    { id: 'XL', value: 8 },
  ]

  const fontSizes = [
    { id: 'Small', value: 3 },
    { id: 'Medium', value: 5 },
    { id: 'Large', value: 7 },
    { id: 'X-Large', value: 9 },
  ]

  const showFontSizes = tool === 'text'
  const showBrushSizes = tool === 'pen' || tool === 'eraser'

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 p-2 bg-white rounded-lg shadow-lg border">
      <div className={cn("space-y-2", { "hidden": tool === 'eraser' })}>
        {colors.map((c) => (
          <Button
            key={c}
            className="w-8 h-8 rounded-full p-0"
            style={{ backgroundColor: c }}
            variant={color === c ? "default" : "ghost"}
            onClick={() => setColor(c)}
          />
        ))}
        <div className="h-px bg-gray-200" />
      </div>

      {showBrushSizes && (
        <div className="space-y-2">
          {sizes.map((s) => (
            <Button
              key={s.id}
              variant={size === s.value ? "default" : "ghost"}
              className="w-8 h-8"
              onClick={() => setSize(s.value)}
            >
              {s.id}
            </Button>
          ))}
        </div>
      )}

      {showFontSizes && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700 mb-1">Font Size</div>
          {fontSizes.map((fs) => (
            <Button
              key={fs.id}
              variant={size === fs.value ? "default" : "ghost"}
              className="w-full"
              onClick={() => setSize(fs.value)}
            >
              {fs.id}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}

