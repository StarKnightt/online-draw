import { Button } from "@/components/ui/button"

interface ColorPickerProps {
  color: string
  setColor: (color: string) => void
  size: number
  setSize: (size: number) => void
}

export function ColorPicker({ color, setColor, size, setSize }: ColorPickerProps) {
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

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 p-2 bg-white rounded-lg shadow-lg border">
      {colors.map((c) => (
        <Button
          key={c}
          className="w-8 h-8 rounded-full p-0"
          style={{ backgroundColor: c }}
          variant={color === c ? "default" : "ghost"}
          onClick={() => setColor(c)}
        />
      ))}
      <div className="h-px bg-gray-200 my-2" />
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
  )
}

