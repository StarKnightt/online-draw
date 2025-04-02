import { Tool, Point } from '../types/drawing';

export interface DrawElement {
  id: string;
  type: Tool;
  points: Point[];
  color: string;
  size: number;
  text?: string;
  width?: number;
  height?: number;
}

export const isPointInShape = (x: number, y: number, element: DrawElement): boolean => {
  const tolerance = element.size / 2;

  switch (element.type) {
    case 'pen':
      return element.points.some((point, i) => {
        if (i === 0) return false;
        const prev = element.points[i - 1];
        return isPointNearLine(x, y, prev.x, prev.y, point.x, point.y, tolerance);
      });

    case 'rectangle': {
      const [start, end] = getShapeBounds(element.points);
      const expanded = expandBounds(start, end, tolerance);
      return isPointInRect(x, y, expanded);
    }

    case 'ellipse': {
      const [start, end] = getShapeBounds(element.points);
      const center = {
        x: (start.x + end.x) / 2,
        y: (start.y + end.y) / 2
      };
      const rx = Math.abs(end.x - start.x) / 2 + tolerance;
      const ry = Math.abs(end.y - start.y) / 2 + tolerance;
      return isPointInEllipse(x, y, center, rx, ry);
    }

    default:
      return false;
  }
};

const isPointNearLine = (
  px: number, py: number,
  x1: number, y1: number,
  x2: number, y2: number,
  tolerance: number
): boolean => {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) param = dot / lenSq;

  let xx, yy;
  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = px - xx;
  const dy = py - yy;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance <= tolerance;
};

const getShapeBounds = (points: Point[]): [Point, Point] => {
  const start = points[0];
  const end = points[points.length - 1];
  return [start, end];
};

const expandBounds = (start: Point, end: Point, tolerance: number): {
  left: number;
  top: number;
  right: number;
  bottom: number;
} => {
  return {
    left: Math.min(start.x, end.x) - tolerance,
    top: Math.min(start.y, end.y) - tolerance,
    right: Math.max(start.x, end.x) + tolerance,
    bottom: Math.max(start.y, end.y) + tolerance
  };
};

const isPointInRect = (x: number, y: number, rect: {
  left: number;
  top: number;
  right: number;
  bottom: number;
}): boolean => {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
};

const isPointInEllipse = (
  x: number, y: number,
  center: Point,
  rx: number, ry: number
): boolean => {
  const dx = (x - center.x) / rx;
  const dy = (y - center.y) / ry;
  return (dx * dx + dy * dy) <= 1;
}; 