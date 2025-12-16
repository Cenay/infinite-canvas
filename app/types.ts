export type Tool = 'select' | 'pen' | 'rectangle' | 'circle' | 'ellipse' | 'diamond' | 'line' | 'arrow' | 'text' | 'image' | 'eraser';

export type StrokeStyle = 'solid' | 'dashed' | 'dotted';

export interface Point {
  x: number;
  y: number;
}

export interface CanvasElement {
  id: string;
  type: 'path' | 'rectangle' | 'circle' | 'ellipse' | 'diamond' | 'line' | 'arrow' | 'text' | 'image';
  color: string;
  strokeWidth: number;
  fill?: string;
  opacity?: number;
  roughness?: number;
  strokeStyle?: StrokeStyle;
  seed?: number;
  selected?: boolean;
  rotation?: number;
}

export interface PathElement extends CanvasElement {
  type: 'path';
  points: Point[];
}

export interface RectangleElement extends CanvasElement {
  type: 'rectangle';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CircleElement extends CanvasElement {
  type: 'circle';
  x: number;
  y: number;
  radius: number;
}

export interface EllipseElement extends CanvasElement {
  type: 'ellipse';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DiamondElement extends CanvasElement {
  type: 'diamond';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LineElement extends CanvasElement {
  type: 'line';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface ArrowElement extends CanvasElement {
  type: 'arrow';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface TextElement extends CanvasElement {
  type: 'text';
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fontFamily: string;
}

export interface ImageElement extends CanvasElement {
  type: 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  src: string;
  imageData?: HTMLImageElement;
}

export type CanvasElementType =
  | PathElement
  | RectangleElement
  | CircleElement
  | EllipseElement
  | DiamondElement
  | LineElement
  | ArrowElement
  | TextElement
  | ImageElement;

export interface ViewportTransform {
  x: number;
  y: number;
  scale: number;
}
