import { Button } from "@/components/ui/button"
import { Tool } from "../hooks/use-drawing"
import { cn } from "@/lib/utils"
import { Tooltip } from "@/components/ui/tooltip"

interface ColorPickerProps {
  color: string
  setColor: (color: string) => void
  size: number
  setSize: (size: number) => void
  tool: Tool
}

export function ColorPicker({ color, setColor, size, setSize, tool }: ColorPickerProps) {
  const colors = [
    { value: '#000000', label: 'Black' },
    { value: '#4B5563', label: 'Gray' },
    { value: '#9333EA', label: 'Purple' },
    { value: '#4F46E5', label: 'Indigo' },
    { value: '#2563EB', label: 'Blue' },
    { value: '#0EA5E9', label: 'Light Blue' },
    { value: '#F59E0B', label: 'Orange' },
    { value: '#DC2626', label: 'Red' },
  ]

  const sizes = [
    { id: 'S', value: 2, label: 'Small' },
    { id: 'M', value: 4, label: 'Medium' },
    { id: 'L', value: 6, label: 'Large' },
    { id: 'XL', value: 8, label: 'Extra Large' },
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
    <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 p-3 bg-white rounded-xl shadow-lg border">
      <div className={cn("space-y-2", { "hidden": tool === 'eraser' })}>
        <div className="text-sm font-medium text-gray-700 mb-2">Colors</div>
        <div className="grid grid-cols-2 gap-2">
          {colors.map((c) => (
            <Tooltip key={c.value} content={c.label}>
              <Button
                className={cn(
                  "w-8 h-8 rounded-full p-0 border-2",
                  color === c.value ? "border-gray-400" : "border-transparent"
                )}
                style={{ backgroundColor: c.value }}
                variant="ghost"
                onClick={() => setColor(c.value)}
              />
            </Tooltip>
          ))}
        </div>
      </div>

      {(tool === 'pen' || tool === 'eraser') && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Size</div>
          <div className="flex flex-col gap-1">
            {sizes.map((s) => (
              <Button
                key={s.id}
                variant={size === s.value ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  size === s.value && "bg-gray-200 hover:bg-gray-200"
                )}
                onClick={() => setSize(s.value)}
              >
                {s.label}
              </Button>
            ))}
          </div>
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

