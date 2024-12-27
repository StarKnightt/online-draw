interface GridProps {
    viewport: { x: number; y: number; zoom: number }
  }
  
  export function Grid({ viewport }: GridProps) {
    const gridSize = 40
    const majorGridSize = gridSize * 5
  
    return (
      <svg
        className="absolute inset-0 h-full w-full"
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          transformOrigin: '0 0',
        }}
      >
        <defs>
          <pattern
            id="minor-grid"
            width={gridSize}
            height={gridSize}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
              fill="none"
              stroke="rgba(0,0,0,0.08)"
              strokeWidth="0.5"
            />
          </pattern>
          <pattern
            id="major-grid"
            width={majorGridSize}
            height={majorGridSize}
            patternUnits="userSpaceOnUse"
          >
            <rect width={majorGridSize} height={majorGridSize} fill="url(#minor-grid)" />
            <path
              d={`M ${majorGridSize} 0 L 0 0 0 ${majorGridSize}`}
              fill="none"
              stroke="rgba(0,0,0,0.15)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#major-grid)" />
      </svg>
    )
  }
  
  