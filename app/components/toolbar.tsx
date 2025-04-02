'use client'

import { motion } from 'framer-motion'
import { 
  Pointer, 
  Pencil, 
  Square, 
  Circle, 
  Eraser, 
  Undo2, 
  Redo2, 
  Trash2,
  Menu
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tool } from '../types/drawing'

interface ToolbarProps {
  tool: Tool
  setTool: (tool: Tool) => void
  clear: () => void
  undo: () => void
  redo: () => void
}

export function Toolbar({ tool, setTool, clear, undo, redo }: ToolbarProps) {
  const tools: { id: Tool; icon: string; label: string }[] = [
    { id: 'select', icon: '⬚', label: 'Select' },
    { id: 'pen', icon: '✎', label: 'Draw' },
    { id: 'rectangle', icon: '□', label: 'Rectangle' },
    { id: 'ellipse', icon: '○', label: 'Circle' },
    { id: 'eraser', icon: '⌫', label: 'Eraser' }
  ]

  return (
    <>
      {/* Mobile Toolbar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex md:hidden">
        <motion.div 
          className="bg-white rounded-full shadow-lg p-2 flex items-center gap-2"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {tools.map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => setTool(id)}
              className={`p-3 rounded-full ${
                tool === id ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
              title={label}
            >
              {icon}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Desktop Toolbar */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 hidden md:block">
        <motion.div 
          className="bg-white rounded-xl shadow-lg p-2 flex flex-col gap-2"
          initial={{ x: -100 }}
          animate={{ x: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {tools.map(({ id, icon, label }) => (
            <motion.button
              key={id}
              onClick={() => setTool(id)}
              className={`p-3 rounded-lg ${
                tool === id ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
              title={label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {icon}
            </motion.button>
          ))}
          <div className="h-px bg-gray-200 my-1" />
          <motion.button
            onClick={undo}
            className="p-3 rounded-lg hover:bg-gray-100 text-gray-700"
            title="Undo"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ↩
          </motion.button>
          <motion.button
            onClick={redo}
            className="p-3 rounded-lg hover:bg-gray-100 text-gray-700"
            title="Redo"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ↪
          </motion.button>
          <motion.button
            onClick={clear}
            className="p-3 rounded-lg hover:bg-red-100 text-red-600"
            title="Clear Canvas"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ×
          </motion.button>
        </motion.div>
      </div>
    </>
  )
}

