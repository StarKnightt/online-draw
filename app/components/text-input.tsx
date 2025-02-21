interface TextInputProps {
  textInput: {
    x: number;
    y: number;
    text: string;
    width: number;
    height: number;
    isEditing: boolean;
  } | null;
  viewport: { x: number; y: number; zoom: number };
  size: number;
  color: string;
  onUpdate: (text: string) => void;
  onCommit: () => void;
}

export function TextInput({ textInput, viewport, size, color, onUpdate, onCommit }: TextInputProps) {
  if (!textInput) return null

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onCommit()
    }
  }

  return (
    <div
      className="absolute"
      style={{
        left: (textInput.x * viewport.zoom + viewport.x) + 'px',
        top: (textInput.y * viewport.zoom + viewport.y) + 'px',
        transform: `scale(${viewport.zoom})`,
        transformOrigin: '0 0',
      }}
    >
      <textarea
        autoFocus
        className="min-w-[100px] resize-none overflow-hidden border-none bg-transparent p-0 outline-none"
        style={{
          fontSize: `${size * 4}px`,
          lineHeight: '1.2',
          color: color,
          width: Math.max(100, textInput.width + 20) + 'px',
          height: Math.max(textInput.height, size * 4) + 'px',
        }}
        value={textInput.text}
        onChange={(e) => onUpdate(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={onCommit}
      />
    </div>
  )
} 