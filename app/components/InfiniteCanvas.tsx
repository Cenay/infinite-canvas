'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import rough from 'roughjs';
import type { RoughCanvas } from 'roughjs/bin/canvas';
import {
  CanvasElementType,
  Point,
  Tool,
  ViewportTransform,
  PathElement,
  RectangleElement,
  CircleElement,
  EllipseElement,
  DiamondElement,
  LineElement,
  ArrowElement,
  TextElement,
  ImageElement,
  StrokeStyle,
  TextDecorators,
} from '../types';

interface InfiniteCanvasProps {
  tool: Tool;
  color: string;
  strokeWidth: number;
  fill?: string;
  opacity?: number;
  roughness?: number;
  strokeStyle?: StrokeStyle;
  fontFamily?: string;
  fontSize?: number;
  textDecorators?: TextDecorators;
  eraserSize?: number;
  onElementsChange?: (elements: CanvasElementType[]) => void;
}

export default function InfiniteCanvas({
  tool,
  color,
  strokeWidth,
  fill,
  opacity = 1,
  roughness = 1,
  strokeStyle = 'solid',
  fontFamily = 'Arial',
  fontSize = 20,
  textDecorators = {},
  eraserSize = 20,
  onElementsChange,
}: InfiniteCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const roughCanvasRef = useRef<RoughCanvas | null>(null);
  const [elements, setElements] = useState<CanvasElementType[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [currentElement, setCurrentElement] = useState<CanvasElementType | null>(null);
  const [viewport, setViewport] = useState<ViewportTransform>({ x: 0, y: 0, scale: 1 });
  const [lastPanPoint, setLastPanPoint] = useState<Point | null>(null);
  const [textInput, setTextInput] = useState<{ x: number; y: number; show: boolean }>({
    x: 0,
    y: 0,
    show: false,
  });
  const [selectedElements, setSelectedElements] = useState<Set<string>>(new Set());
  const [selectionBox, setSelectionBox] = useState<{ start: Point; end: Point } | null>(null);
  const [resizeHandle, setResizeHandle] = useState<{
    handle: 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';
    elementId: string;
    startBounds: { x: number; y: number; width: number; height: number };
    startPoint: Point;
  } | null>(null);
  const [hoveredHandle, setHoveredHandle] = useState<'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | null>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const textMeasureCache = useRef<Map<string, { width: number; height: number }>>(new Map());

  // Initialize rough canvas
  useEffect(() => {
    if (canvasRef.current && !roughCanvasRef.current) {
      roughCanvasRef.current = rough.canvas(canvasRef.current);
    }
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    const savedElements = localStorage.getItem('canvasElements');
    const savedViewport = localStorage.getItem('canvasViewport');

    if (savedElements) {
      try {
        const parsed = JSON.parse(savedElements) as CanvasElementType[];
        // Reconstruct HTMLImageElement for image elements
        const loadedElements = parsed.map((el) => {
          if (el.type === 'image' && (el as ImageElement).src) {
            const imgEl = el as ImageElement;
            const img = new Image();
            img.src = imgEl.src;
            return { ...imgEl, imageData: img };
          }
          return el;
        });
        setElements(loadedElements);
      } catch (error) {
        console.error('Failed to load canvas elements:', error);
      }
    }

    if (savedViewport) {
      try {
        setViewport(JSON.parse(savedViewport));
      } catch (error) {
        console.error('Failed to load viewport:', error);
      }
    }
  }, []);

  // Clear drawing state when tool changes
  useEffect(() => {
    setCurrentElement(null);
    setIsDrawing(false);
  }, [tool]);

  // Save to localStorage when elements change
  useEffect(() => {
    if (elements.length > 0) {
      localStorage.setItem('canvasElements', JSON.stringify(elements));
      onElementsChange?.(elements);
    }
  }, [elements]);

  // Save viewport to localStorage
  useEffect(() => {
    localStorage.setItem('canvasViewport', JSON.stringify(viewport));
  }, [viewport]);

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback(
    (screenX: number, screenY: number): Point => {
      return {
        x: (screenX - viewport.x) / viewport.scale,
        y: (screenY - viewport.y) / viewport.scale,
      };
    },
    [viewport]
  );

  // Get stroke lineDash pattern
  const getStrokeDash = (style: StrokeStyle = 'solid'): number[] => {
    switch (style) {
      case 'dashed':
        return [10, 5];
      case 'dotted':
        return [2, 3];
      default:
        return [];
    }
  };

  // Measure text dimensions
  const measureText = useCallback((text: string, fontSize: number, fontFamily: string): { width: number; height: number } => {
    const cacheKey = `${text}-${fontSize}-${fontFamily}`;
    if (textMeasureCache.current.has(cacheKey)) {
      return textMeasureCache.current.get(cacheKey)!;
    }

    const canvas = canvasRef.current;
    if (!canvas) return { width: 100, height: fontSize };

    const ctx = canvas.getContext('2d');
    if (!ctx) return { width: 100, height: fontSize };

    ctx.font = `${fontSize}px ${fontFamily}`;
    const metrics = ctx.measureText(text);
    const width = metrics.width;
    const height = fontSize * 1.2; // Approximate line height

    textMeasureCache.current.set(cacheKey, { width, height });
    return { width, height };
  }, []);

  // Get resize handle positions for an element's bounds
  const getResizeHandles = useCallback((bounds: { x: number; y: number; width: number; height: number }) => {
    const handleSize = 8;
    return {
      nw: { x: bounds.x - handleSize / 2, y: bounds.y - handleSize / 2, cursor: 'nwse-resize' },
      n: { x: bounds.x + bounds.width / 2 - handleSize / 2, y: bounds.y - handleSize / 2, cursor: 'ns-resize' },
      ne: { x: bounds.x + bounds.width - handleSize / 2, y: bounds.y - handleSize / 2, cursor: 'nesw-resize' },
      e: { x: bounds.x + bounds.width - handleSize / 2, y: bounds.y + bounds.height / 2 - handleSize / 2, cursor: 'ew-resize' },
      se: { x: bounds.x + bounds.width - handleSize / 2, y: bounds.y + bounds.height - handleSize / 2, cursor: 'nwse-resize' },
      s: { x: bounds.x + bounds.width / 2 - handleSize / 2, y: bounds.y + bounds.height - handleSize / 2, cursor: 'ns-resize' },
      sw: { x: bounds.x - handleSize / 2, y: bounds.y + bounds.height - handleSize / 2, cursor: 'nesw-resize' },
      w: { x: bounds.x - handleSize / 2, y: bounds.y + bounds.height / 2 - handleSize / 2, cursor: 'ew-resize' },
    };
  }, []);

  // Check if a point is on a resize handle
  const getHandleAtPoint = useCallback((point: Point, bounds: { x: number; y: number; width: number; height: number }): 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | null => {
    const handleSize = 12; // Slightly larger hit area
    const handles = getResizeHandles(bounds);

    for (const [key, handle] of Object.entries(handles)) {
      if (
        point.x >= handle.x - handleSize / 2 &&
        point.x <= handle.x + handleSize &&
        point.y >= handle.y - handleSize / 2 &&
        point.y <= handle.y + handleSize
      ) {
        return key as 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';
      }
    }
    return null;
  }, [getResizeHandles]);

  // Draw everything on canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const rc = roughCanvasRef.current;
    if (!canvas || !rc) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply viewport transformation
    ctx.save();
    ctx.translate(viewport.x, viewport.y);
    ctx.scale(viewport.scale, viewport.scale);

    // Draw grid
    drawGrid(ctx);

    // Draw all elements
    [...elements, currentElement].filter(Boolean).forEach((element) => {
      drawElement(ctx, rc, element as CanvasElementType);
    });

    // Draw selection box
    if (selectionBox) {
      ctx.strokeStyle = '#6965db';
      ctx.lineWidth = 1 / viewport.scale;
      ctx.setLineDash([5 / viewport.scale, 5 / viewport.scale]);
      ctx.strokeRect(
        selectionBox.start.x,
        selectionBox.start.y,
        selectionBox.end.x - selectionBox.start.x,
        selectionBox.end.y - selectionBox.start.y
      );
      ctx.setLineDash([]);
    }

    ctx.restore();
  }, [elements, currentElement, viewport, selectionBox, selectedElements]);

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    const gridSize = 20;
    const startX = Math.floor(-viewport.x / viewport.scale / gridSize) * gridSize;
    const startY = Math.floor(-viewport.y / viewport.scale / gridSize) * gridSize;
    const endX = startX + (ctx.canvas.width / viewport.scale) + gridSize;
    const endY = startY + (ctx.canvas.height / viewport.scale) + gridSize;

    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 0.5 / viewport.scale;
    ctx.beginPath();

    for (let x = startX; x < endX; x += gridSize) {
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
    }

    for (let y = startY; y < endY; y += gridSize) {
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
    }

    ctx.stroke();
  };

  const drawElement = (
    ctx: CanvasRenderingContext2D,
    rc: RoughCanvas,
    element: CanvasElementType
  ) => {
    const options = {
      stroke: element.color,
      strokeWidth: element.strokeWidth,
      roughness: element.roughness ?? 1,
      seed: element.seed ?? 1,
      fill: element.fill,
      fillStyle: 'hachure' as const,
      strokeLineDash: getStrokeDash(element.strokeStyle),
    };

    ctx.globalAlpha = element.opacity ?? 1;

    // Draw selection highlight and resize handles
    if (selectedElements.has(element.id)) {
      ctx.save();
      ctx.strokeStyle = '#6965db';
      ctx.lineWidth = 2 / viewport.scale;
      ctx.setLineDash([5 / viewport.scale, 5 / viewport.scale]);

      const bounds = getElementBounds(element);
      if (bounds) {
        // Draw selection rectangle
        const padding = 5;
        const selectionBounds = {
          x: bounds.x - padding,
          y: bounds.y - padding,
          width: bounds.width + padding * 2,
          height: bounds.height + padding * 2,
        };
        ctx.strokeRect(selectionBounds.x, selectionBounds.y, selectionBounds.width, selectionBounds.height);

        ctx.setLineDash([]);

        // Draw resize handles (only if single element selected)
        if (selectedElements.size === 1) {
          const handleSize = 8 / viewport.scale;
          const handles = [
            { x: selectionBounds.x, y: selectionBounds.y }, // nw
            { x: selectionBounds.x + selectionBounds.width / 2, y: selectionBounds.y }, // n
            { x: selectionBounds.x + selectionBounds.width, y: selectionBounds.y }, // ne
            { x: selectionBounds.x + selectionBounds.width, y: selectionBounds.y + selectionBounds.height / 2 }, // e
            { x: selectionBounds.x + selectionBounds.width, y: selectionBounds.y + selectionBounds.height }, // se
            { x: selectionBounds.x + selectionBounds.width / 2, y: selectionBounds.y + selectionBounds.height }, // s
            { x: selectionBounds.x, y: selectionBounds.y + selectionBounds.height }, // sw
            { x: selectionBounds.x, y: selectionBounds.y + selectionBounds.height / 2 }, // w
          ];

          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#6965db';
          ctx.lineWidth = 2 / viewport.scale;

          handles.forEach((handle) => {
            ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
            ctx.strokeRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
          });
        }
      }

      ctx.restore();
    }

    switch (element.type) {
      case 'path': {
        const pathEl = element as PathElement;
        if (pathEl.points.length < 2) return;

        // Use regular canvas for freehand paths
        ctx.strokeStyle = element.color;
        ctx.lineWidth = element.strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.setLineDash(getStrokeDash(element.strokeStyle));

        ctx.beginPath();
        ctx.moveTo(pathEl.points[0].x, pathEl.points[0].y);
        for (let i = 1; i < pathEl.points.length; i++) {
          ctx.lineTo(pathEl.points[i].x, pathEl.points[i].y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        break;
      }
      case 'rectangle': {
        const rectEl = element as RectangleElement;
        rc.rectangle(rectEl.x, rectEl.y, rectEl.width, rectEl.height, options);
        break;
      }
      case 'circle': {
        const circleEl = element as CircleElement;
        rc.circle(circleEl.x, circleEl.y, circleEl.radius * 2, options);
        break;
      }
      case 'ellipse': {
        const ellipseEl = element as EllipseElement;
        const cx = ellipseEl.x + ellipseEl.width / 2;
        const cy = ellipseEl.y + ellipseEl.height / 2;
        rc.ellipse(cx, cy, Math.abs(ellipseEl.width), Math.abs(ellipseEl.height), options);
        break;
      }
      case 'diamond': {
        const diamondEl = element as DiamondElement;
        const cx = diamondEl.x + diamondEl.width / 2;
        const cy = diamondEl.y + diamondEl.height / 2;
        const hw = Math.abs(diamondEl.width) / 2;
        const hh = Math.abs(diamondEl.height) / 2;

        rc.polygon(
          [
            [cx, diamondEl.y],
            [diamondEl.x + diamondEl.width, cy],
            [cx, diamondEl.y + diamondEl.height],
            [diamondEl.x, cy],
          ],
          options
        );
        break;
      }
      case 'line': {
        const lineEl = element as LineElement;
        rc.line(lineEl.startX, lineEl.startY, lineEl.endX, lineEl.endY, options);
        break;
      }
      case 'arrow': {
        const arrowEl = element as ArrowElement;
        const headLength = 15;
        const angle = Math.atan2(
          arrowEl.endY - arrowEl.startY,
          arrowEl.endX - arrowEl.startX
        );

        rc.line(arrowEl.startX, arrowEl.startY, arrowEl.endX, arrowEl.endY, options);

        // Draw arrowhead
        rc.line(
          arrowEl.endX,
          arrowEl.endY,
          arrowEl.endX - headLength * Math.cos(angle - Math.PI / 6),
          arrowEl.endY - headLength * Math.sin(angle - Math.PI / 6),
          options
        );
        rc.line(
          arrowEl.endX,
          arrowEl.endY,
          arrowEl.endX - headLength * Math.cos(angle + Math.PI / 6),
          arrowEl.endY - headLength * Math.sin(angle + Math.PI / 6),
          options
        );
        break;
      }
      case 'text': {
        const textEl = element as TextElement;
        let fontStyle = '';
        if (textEl.textDecorators?.bold) fontStyle += 'bold ';
        if (textEl.textDecorators?.italic) fontStyle += 'italic ';
        ctx.font = `${fontStyle}${textEl.fontSize}px ${textEl.fontFamily}`;
        ctx.fillStyle = element.color;
        
        // Draw text
        ctx.fillText(textEl.text, textEl.x, textEl.y);
        
        // Draw underline manually if needed
        if (textEl.textDecorators?.underline) {
          const metrics = ctx.measureText(textEl.text);
          ctx.strokeStyle = element.color;
          ctx.lineWidth = Math.max(1, textEl.fontSize / 20);
          ctx.beginPath();
          ctx.moveTo(textEl.x, textEl.y + 2);
          ctx.lineTo(textEl.x + metrics.width, textEl.y + 2);
          ctx.stroke();
        }
        
        // Draw strikethrough manually if needed
        if (textEl.textDecorators?.strikethrough) {
          const metrics = ctx.measureText(textEl.text);
          const textHeight = textEl.fontSize * 0.3; // Position strikethrough at ~30% of font height
          ctx.strokeStyle = element.color;
          ctx.lineWidth = Math.max(1, textEl.fontSize / 20);
          ctx.beginPath();
          ctx.moveTo(textEl.x, textEl.y - textHeight);
          ctx.lineTo(textEl.x + metrics.width, textEl.y - textHeight);
          ctx.stroke();
        }
        break;
      }
      case 'image': {
        const imgEl = element as ImageElement;
        if (imgEl.imageData) {
          ctx.drawImage(imgEl.imageData, imgEl.x, imgEl.y, imgEl.width, imgEl.height);
        }
        break;
      }
    }

    ctx.globalAlpha = 1;
  };

  const getElementBounds = (element: CanvasElementType): { x: number; y: number; width: number; height: number } | null => {
    switch (element.type) {
      case 'rectangle':
      case 'ellipse':
      case 'diamond': {
        const el = element as RectangleElement | EllipseElement | DiamondElement;
        return { x: el.x, y: el.y, width: el.width, height: el.height };
      }
      case 'circle': {
        const el = element as CircleElement;
        return { x: el.x - el.radius, y: el.y - el.radius, width: el.radius * 2, height: el.radius * 2 };
      }
      case 'line':
      case 'arrow': {
        const el = element as LineElement | ArrowElement;
        return {
          x: Math.min(el.startX, el.endX),
          y: Math.min(el.startY, el.endY),
          width: Math.abs(el.endX - el.startX),
          height: Math.abs(el.endY - el.startY),
        };
      }
      case 'text': {
        const el = element as TextElement;
        const textSize = measureText(el.text, el.fontSize, el.fontFamily || 'Arial');
        return { x: el.x, y: el.y - textSize.height, width: textSize.width, height: textSize.height };
      }
      case 'path': {
        const el = element as PathElement;
        if (el.points.length === 0) return null;
        const xs = el.points.map(p => p.x);
        const ys = el.points.map(p => p.y);
        return {
          x: Math.min(...xs),
          y: Math.min(...ys),
          width: Math.max(...xs) - Math.min(...xs),
          height: Math.max(...ys) - Math.min(...ys),
        };
      }
      case 'image': {
        const el = element as ImageElement;
        return { x: el.x, y: el.y, width: el.width, height: el.height };
      }
      default:
        return null;
    }
  };

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      draw();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [draw]);

  const isPointInElement = (point: Point, element: CanvasElementType): boolean => {
    const bounds = getElementBounds(element);
    if (!bounds) return false;

    return (
      point.x >= bounds.x &&
      point.x <= bounds.x + bounds.width &&
      point.y >= bounds.y &&
      point.y <= bounds.y + bounds.height
    );
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const canvasPoint = screenToCanvas(screenX, screenY);

    // Pan with middle mouse button, space + left click, or hand tool
    if (e.button === 1 || (e.button === 0 && e.shiftKey) || tool === 'hand') {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    // Check if clicking on a resize handle (only when single element is selected)
    if (selectedElements.size === 1) {
      const selectedId = Array.from(selectedElements)[0];
      const selectedElement = elements.find(el => el.id === selectedId);
      if (selectedElement) {
        const bounds = getElementBounds(selectedElement);
        if (bounds) {
          const padding = 5;
          const selectionBounds = {
            x: bounds.x - padding,
            y: bounds.y - padding,
            width: bounds.width + padding * 2,
            height: bounds.height + padding * 2,
          };
          const handle = getHandleAtPoint(canvasPoint, selectionBounds);
          if (handle) {
            setResizeHandle({
              handle,
              elementId: selectedId,
              startBounds: bounds,
              startPoint: canvasPoint,
            });
            return;
          }
        }
      }
    }

    // Check if clicking on an element (works with any tool except eraser)
    if (tool !== 'eraser') {
      const clickedElement = [...elements].reverse().find(el => isPointInElement(canvasPoint, el));

      if (clickedElement) {
        // Select the clicked element
        if (!e.ctrlKey && !e.metaKey) {
          setSelectedElements(new Set([clickedElement.id]));
        } else {
          setSelectedElements(prev => {
            const next = new Set(prev);
            if (next.has(clickedElement.id)) {
              next.delete(clickedElement.id);
            } else {
              next.add(clickedElement.id);
            }
            return next;
          });
        }
        // Allow dragging to move selected elements
        setIsPanning(true);
        setLastPanPoint({ x: e.clientX, y: e.clientY });
        return;
      }
    }

    if (tool === 'select') {
      // Start selection box on empty space
      if (!e.ctrlKey && !e.metaKey) {
        setSelectedElements(new Set());
      }
      setSelectionBox({ start: canvasPoint, end: canvasPoint });
      return;
    }

    if (tool === 'text') {
      setTextInput({ x: screenX, y: screenY, show: true });
      setTimeout(() => textInputRef.current?.focus(), 0);
      return;
    }

    if (tool === 'eraser') {
      const clickedElement = [...elements].reverse().find(el => isPointInElement(canvasPoint, el));
      if (clickedElement) {
        setElements(prev => prev.filter(el => el.id !== clickedElement.id));
      }
      return;
    }

    setIsDrawing(true);

    const baseElement = {
      id: Date.now().toString(),
      color,
      strokeWidth,
      fill: fill && fill !== 'transparent' ? fill : undefined,
      opacity,
      roughness,
      strokeStyle,
      seed: Math.random() * 1000,
    };

    switch (tool) {
      case 'pen':
        setCurrentElement({
          ...baseElement,
          type: 'path',
          points: [canvasPoint],
        } as PathElement);
        break;
      case 'rectangle':
        setCurrentElement({
          ...baseElement,
          type: 'rectangle',
          x: canvasPoint.x,
          y: canvasPoint.y,
          width: 0,
          height: 0,
        } as RectangleElement);
        break;
      case 'circle':
        setCurrentElement({
          ...baseElement,
          type: 'circle',
          x: canvasPoint.x,
          y: canvasPoint.y,
          radius: 0,
        } as CircleElement);
        break;
      case 'ellipse':
        setCurrentElement({
          ...baseElement,
          type: 'ellipse',
          x: canvasPoint.x,
          y: canvasPoint.y,
          width: 0,
          height: 0,
        } as EllipseElement);
        break;
      case 'diamond':
        setCurrentElement({
          ...baseElement,
          type: 'diamond',
          x: canvasPoint.x,
          y: canvasPoint.y,
          width: 0,
          height: 0,
        } as DiamondElement);
        break;
      case 'line':
        setCurrentElement({
          ...baseElement,
          type: 'line',
          startX: canvasPoint.x,
          startY: canvasPoint.y,
          endX: canvasPoint.x,
          endY: canvasPoint.y,
        } as LineElement);
        break;
      case 'arrow':
        setCurrentElement({
          ...baseElement,
          type: 'arrow',
          startX: canvasPoint.x,
          startY: canvasPoint.y,
          endX: canvasPoint.x,
          endY: canvasPoint.y,
        } as ArrowElement);
        break;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const canvasPoint = screenToCanvas(screenX, screenY);

    // Handle resizing
    if (resizeHandle) {
      const { handle, elementId, startBounds, startPoint } = resizeHandle;
      const dx = canvasPoint.x - startPoint.x;
      const dy = canvasPoint.y - startPoint.y;

      setElements(prev => prev.map(el => {
        if (el.id !== elementId) return el;

        let newX = startBounds.x;
        let newY = startBounds.y;
        let newWidth = startBounds.width;
        let newHeight = startBounds.height;

        // Calculate new bounds based on which handle is being dragged
        switch (handle) {
          case 'nw':
            newX = startBounds.x + dx;
            newY = startBounds.y + dy;
            newWidth = startBounds.width - dx;
            newHeight = startBounds.height - dy;
            break;
          case 'n':
            newY = startBounds.y + dy;
            newHeight = startBounds.height - dy;
            break;
          case 'ne':
            newY = startBounds.y + dy;
            newWidth = startBounds.width + dx;
            newHeight = startBounds.height - dy;
            break;
          case 'e':
            newWidth = startBounds.width + dx;
            break;
          case 'se':
            newWidth = startBounds.width + dx;
            newHeight = startBounds.height + dy;
            break;
          case 's':
            newHeight = startBounds.height + dy;
            break;
          case 'sw':
            newX = startBounds.x + dx;
            newWidth = startBounds.width - dx;
            newHeight = startBounds.height + dy;
            break;
          case 'w':
            newX = startBounds.x + dx;
            newWidth = startBounds.width - dx;
            break;
        }

        // Ensure minimum size
        const minSize = 10;
        if (newWidth < minSize) {
          if (handle.includes('w')) newX = startBounds.x + startBounds.width - minSize;
          newWidth = minSize;
        }
        if (newHeight < minSize) {
          if (handle.includes('n')) newY = startBounds.y + startBounds.height - minSize;
          newHeight = minSize;
        }

        // Apply resize based on element type
        switch (el.type) {
          case 'rectangle':
          case 'ellipse':
          case 'diamond': {
            return { ...el, x: newX, y: newY, width: newWidth, height: newHeight };
          }
          case 'image': {
            // Corner handles lock aspect ratio, edge handles allow free resize
            const isCornerHandle = ['nw', 'ne', 'se', 'sw'].includes(handle);
            if (isCornerHandle) {
              const aspectRatio = startBounds.width / startBounds.height;
              let finalWidth = newWidth;
              let finalHeight = newHeight;
              let finalX = newX;
              let finalY = newY;

              // Determine which dimension to use as reference based on which changed more
              const widthChange = Math.abs(newWidth - startBounds.width);
              const heightChange = Math.abs(newHeight - startBounds.height);

              if (widthChange > heightChange) {
                finalHeight = newWidth / aspectRatio;
              } else {
                finalWidth = newHeight * aspectRatio;
              }

              // Adjust position for handles that anchor from right or bottom
              if (handle === 'nw') {
                finalX = startBounds.x + startBounds.width - finalWidth;
                finalY = startBounds.y + startBounds.height - finalHeight;
              } else if (handle === 'ne') {
                finalY = startBounds.y + startBounds.height - finalHeight;
              } else if (handle === 'sw') {
                finalX = startBounds.x + startBounds.width - finalWidth;
              }
              // 'se' doesn't need adjustment - it anchors from top-left

              return { ...el, x: finalX, y: finalY, width: finalWidth, height: finalHeight };
            }
            // Edge handles - free resize (stretch/crop)
            return { ...el, x: newX, y: newY, width: newWidth, height: newHeight };
          }
          case 'circle': {
            const radius = Math.max(newWidth, newHeight) / 2;
            return { ...el, x: newX + radius, y: newY + radius, radius };
          }
          case 'line':
          case 'arrow': {
            const lineEl = el as LineElement | ArrowElement;
            // For lines, resize adjusts endpoints
            const scaleX = newWidth / startBounds.width;
            const scaleY = newHeight / startBounds.height;
            return {
              ...lineEl,
              startX: newX + (lineEl.startX - startBounds.x) * scaleX,
              startY: newY + (lineEl.startY - startBounds.y) * scaleY,
              endX: newX + (lineEl.endX - startBounds.x) * scaleX,
              endY: newY + (lineEl.endY - startBounds.y) * scaleY,
            };
          }
          case 'text': {
            const textEl = el as TextElement;
            // Scale font size proportionally
            const scale = newHeight / startBounds.height;
            return { ...textEl, x: newX, y: newY + newHeight, fontSize: Math.max(8, textEl.fontSize * scale) };
          }
          case 'path': {
            const pathEl = el as PathElement;
            const scaleX = newWidth / Math.max(startBounds.width, 1);
            const scaleY = newHeight / Math.max(startBounds.height, 1);
            return {
              ...pathEl,
              points: pathEl.points.map(p => ({
                x: newX + (p.x - startBounds.x) * scaleX,
                y: newY + (p.y - startBounds.y) * scaleY,
              })),
            };
          }
          default:
            return el;
        }
      }));
      return;
    }

    if (isPanning && lastPanPoint) {
      const dx = e.clientX - lastPanPoint.x;
      const dy = e.clientY - lastPanPoint.y;

      if (tool === 'select' && selectedElements.size > 0) {
        // Move selected elements
        setElements(prev => prev.map(el => {
          if (selectedElements.has(el.id)) {
            const dxCanvas = dx / viewport.scale;
            const dyCanvas = dy / viewport.scale;

            switch (el.type) {
              case 'rectangle':
              case 'ellipse':
              case 'diamond':
              case 'text':
              case 'image': {
                return { ...el, x: el.x + dxCanvas, y: el.y + dyCanvas };
              }
              case 'circle': {
                return { ...el, x: el.x + dxCanvas, y: el.y + dyCanvas };
              }
              case 'line':
              case 'arrow': {
                const lineEl = el as LineElement | ArrowElement;
                return {
                  ...lineEl,
                  startX: lineEl.startX + dxCanvas,
                  startY: lineEl.startY + dyCanvas,
                  endX: lineEl.endX + dxCanvas,
                  endY: lineEl.endY + dyCanvas,
                };
              }
              case 'path': {
                const pathEl = el as PathElement;
                return {
                  ...pathEl,
                  points: pathEl.points.map(p => ({ x: p.x + dxCanvas, y: p.y + dyCanvas })),
                };
              }
              default:
                return el;
            }
          }
          return el;
        }));
      } else {
        // Pan viewport
        setViewport((prev) => ({
          ...prev,
          x: prev.x + dx,
          y: prev.y + dy,
        }));
      }

      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    if (selectionBox) {
      setSelectionBox(prev => prev ? { ...prev, end: canvasPoint } : null);
      return;
    }

    if (!isDrawing || !currentElement) return;

    switch (currentElement.type) {
      case 'path': {
        const pathEl = currentElement as PathElement;
        setCurrentElement({
          ...pathEl,
          points: [...pathEl.points, canvasPoint],
        });
        break;
      }
      case 'rectangle': {
        const rectEl = currentElement as RectangleElement;
        setCurrentElement({
          ...rectEl,
          width: canvasPoint.x - rectEl.x,
          height: canvasPoint.y - rectEl.y,
        });
        break;
      }
      case 'ellipse': {
        const ellipseEl = currentElement as EllipseElement;
        setCurrentElement({
          ...ellipseEl,
          width: canvasPoint.x - ellipseEl.x,
          height: canvasPoint.y - ellipseEl.y,
        });
        break;
      }
      case 'diamond': {
        const diamondEl = currentElement as DiamondElement;
        setCurrentElement({
          ...diamondEl,
          width: canvasPoint.x - diamondEl.x,
          height: canvasPoint.y - diamondEl.y,
        });
        break;
      }
      case 'circle': {
        const circleEl = currentElement as CircleElement;
        const radius = Math.sqrt(
          Math.pow(canvasPoint.x - circleEl.x, 2) + Math.pow(canvasPoint.y - circleEl.y, 2)
        );
        setCurrentElement({
          ...circleEl,
          radius,
        });
        break;
      }
      case 'line': {
        const lineEl = currentElement as LineElement;
        setCurrentElement({
          ...lineEl,
          endX: canvasPoint.x,
          endY: canvasPoint.y,
        });
        break;
      }
      case 'arrow': {
        const arrowEl = currentElement as ArrowElement;
        setCurrentElement({
          ...arrowEl,
          endX: canvasPoint.x,
          endY: canvasPoint.y,
        });
        break;
      }
    }

    // Check for handle hover (for cursor feedback)
    if (selectedElements.size === 1 && !isDrawing && !isPanning && !resizeHandle) {
      const selectedId = Array.from(selectedElements)[0];
      const selectedElement = elements.find(el => el.id === selectedId);
      if (selectedElement) {
        const bounds = getElementBounds(selectedElement);
        if (bounds) {
          const padding = 5;
          const selectionBounds = {
            x: bounds.x - padding,
            y: bounds.y - padding,
            width: bounds.width + padding * 2,
            height: bounds.height + padding * 2,
          };
          const handle = getHandleAtPoint(canvasPoint, selectionBounds);
          setHoveredHandle(handle);
        } else {
          setHoveredHandle(null);
        }
      } else {
        setHoveredHandle(null);
      }
    } else if (!resizeHandle) {
      setHoveredHandle(null);
    }
  };

  const handleMouseUp = () => {
    // Clear resize handle
    if (resizeHandle) {
      setResizeHandle(null);
      return;
    }

    if (selectionBox) {
      // Select elements in box
      const minX = Math.min(selectionBox.start.x, selectionBox.end.x);
      const maxX = Math.max(selectionBox.start.x, selectionBox.end.x);
      const minY = Math.min(selectionBox.start.y, selectionBox.end.y);
      const maxY = Math.max(selectionBox.start.y, selectionBox.end.y);

      const selected = elements.filter(el => {
        const bounds = getElementBounds(el);
        if (!bounds) return false;
        return (
          bounds.x >= minX &&
          bounds.x + bounds.width <= maxX &&
          bounds.y >= minY &&
          bounds.y + bounds.height <= maxY
        );
      }).map(el => el.id);

      setSelectedElements(new Set(selected));
      setSelectionBox(null);
      return;
    }

    if (isPanning) {
      setIsPanning(false);
      setLastPanPoint(null);
      return;
    }

    if (isDrawing && currentElement) {
      setElements((prev) => [...prev, currentElement]);
      setCurrentElement(null);
    }
    setIsDrawing(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoom = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.max(0.1, Math.min(10, viewport.scale * zoom));

    setViewport((prev) => ({
      x: mouseX - ((mouseX - prev.x) * newScale) / prev.scale,
      y: mouseY - ((mouseY - prev.y) * newScale) / prev.scale,
      scale: newScale,
    }));
  };

  const handleTextSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const text = e.currentTarget.value;
      if (text.trim()) {
        const canvasPoint = screenToCanvas(textInput.x, textInput.y);
        const textElement: TextElement = {
          id: Date.now().toString(),
          type: 'text',
          x: canvasPoint.x,
          y: canvasPoint.y,
          text,
          color,
          strokeWidth,
          fill,
          opacity,
          roughness,
          strokeStyle,
          fontSize: fontSize,
          fontFamily: fontFamily,
          textDecorators: textDecorators,
        };
        setElements((prev) => [...prev, textElement]);
      }
      setTextInput({ x: 0, y: 0, show: false });
      e.currentTarget.value = '';
    } else if (e.key === 'Escape') {
      setTextInput({ x: 0, y: 0, show: false });
      e.currentTarget.value = '';
    }
  };

  // Selection state is now derived during rendering, not stored on elements

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete selected elements
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElements.size > 0 && !textInput.show) {
        e.preventDefault();
        setElements(prev => prev.filter(el => !selectedElements.has(el.id)));
        setSelectedElements(new Set());
      }

      // Escape to cancel drawing or clear selection
      if (e.key === 'Escape') {
        if (isDrawing || currentElement) {
          setCurrentElement(null);
          setIsDrawing(false);
        } else if (selectedElements.size > 0) {
          setSelectedElements(new Set());
        }
      }

      // Copy
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedElements.size > 0) {
        const selected = elements.filter(el => selectedElements.has(el.id));
        localStorage.setItem('clipboard', JSON.stringify(selected));
      }

      // Paste
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        const clipboard = localStorage.getItem('clipboard');
        if (clipboard) {
          try {
            const copied = JSON.parse(clipboard) as CanvasElementType[];
            const pasted = copied.map(el => ({
              ...el,
              id: Date.now().toString() + Math.random(),
              x: 'x' in el ? el.x + 20 : undefined,
              y: 'y' in el ? el.y + 20 : undefined,
              startX: 'startX' in el ? el.startX + 20 : undefined,
              startY: 'startY' in el ? el.startY + 20 : undefined,
              endX: 'endX' in el ? el.endX + 20 : undefined,
              endY: 'endY' in el ? el.endY + 20 : undefined,
            })) as CanvasElementType[];
            setElements(prev => [...prev, ...pasted]);
          } catch (error) {
            console.error('Failed to paste:', error);
          }
        }
      }

      // Duplicate
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedElements.size > 0) {
        e.preventDefault();
        const selected = elements.filter(el => selectedElements.has(el.id));
        const duplicated = selected.map(el => ({
          ...el,
          id: Date.now().toString() + Math.random(),
          x: 'x' in el ? el.x + 20 : undefined,
          y: 'y' in el ? el.y + 20 : undefined,
          startX: 'startX' in el ? el.startX + 20 : undefined,
          startY: 'startY' in el ? el.startY + 20 : undefined,
          endX: 'endX' in el ? el.endX + 20 : undefined,
          endY: 'endY' in el ? el.endY + 20 : undefined,
        })) as CanvasElementType[];
        setElements(prev => [...prev, ...duplicated]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElements, elements, textInput.show, isDrawing, currentElement]);

  return (
    <>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="absolute inset-0"
        style={{
          cursor: resizeHandle || hoveredHandle
            ? {
                nw: 'nwse-resize', n: 'ns-resize', ne: 'nesw-resize', e: 'ew-resize',
                se: 'nwse-resize', s: 'ns-resize', sw: 'nesw-resize', w: 'ew-resize'
              }[resizeHandle?.handle || hoveredHandle!]
            : tool === 'hand'
              ? (isPanning ? 'grabbing' : 'grab')
              : tool === 'select'
                ? 'default'
                : 'crosshair'
        }}
      />
      {textInput.show && (
        <input
          ref={textInputRef}
          type="text"
          onKeyDown={handleTextSubmit}
          onBlur={() => setTextInput({ x: 0, y: 0, show: false })}
          className="absolute border-2 border-blue-500 px-2 py-1 text-xl outline-none"
          style={{
            left: `${textInput.x}px`,
            top: `${textInput.y}px`,
          }}
          placeholder="Type text..."
        />
      )}
    </>
  );
}
