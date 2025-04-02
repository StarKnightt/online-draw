'use client'

import { motion } from 'framer-motion'
import { Palette } from 'lucide-react'

interface ColorPickerProps {
  color: string
  setColor: (color: string) => void
  size: number
  setSize: (size: number) => void
  tool: string
}

export function ColorPicker({ color, setColor, size, setSize, tool }: ColorPickerProps) {
  const colors = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#00ffff', '#ff00ff', '#808080', '#800000',
    '#808000', '#008000', '#800080', '#008080', '#000080',
  ]

  const sizes = [2, 4, 6, 8, 12, 16, 24]

  return (
    <motion.div 
      className="fixed right-4 top-4 bg-white rounded-xl shadow-lg p-4"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-5 gap-2">
          {colors.map((c) => (
            <motion.button
              key={c}
              className="w-8 h-8 rounded-full border-2"
              style={{ 
                backgroundColor: c,
                borderColor: color === c ? '#3b82f6' : '#e5e7eb'
              }}
              onClick={() => setColor(c)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-600">Size</label>
          <input
            type="range"
            min={2}
            max={24}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between">
            {sizes.map((s) => (
              <motion.button
                key={s}
                className={`w-${s/2} h-${s/2} rounded-full bg-current`}
                style={{ 
                  backgroundColor: color,
                  opacity: size === s ? 1 : 0.3
                }}
                onClick={() => setSize(s)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

