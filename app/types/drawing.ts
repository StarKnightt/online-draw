export type Tool = 'select' | 'pen' | 'rectangle' | 'ellipse' | 'text' | 'eraser' | 'path';

export interface Point {
  x: number;
  y: number;
  pressure?: number;
}

export interface DrawingElement {
  id: string;
  type: Tool;
  points: Point[];
  color: string;
  size: number;
  text?: string;
  width?: number;
  height?: number;
}

export interface TextBox {
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

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
} 