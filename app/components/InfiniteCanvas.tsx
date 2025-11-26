'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import {
  CanvasElementType,
  Point,
  Tool,
  ViewportTransform,
  PathElement,
  RectangleElement,
  CircleElement,
  LineElement,
  ArrowElement,
  TextElement,
  ImageElement,
} from '../types';

interface InfiniteCanvasProps {
  tool: Tool;
  color: string;
  strokeWidth: number;
  onElementsChange?: (elements: CanvasElementType[]) => void;
}

export default function InfiniteCanvas({
  tool,
  color,
  strokeWidth,
  onElementsChange,
}: InfiniteCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
  const textInputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedElements = localStorage.getItem('canvasElements');
    const savedViewport = localStorage.getItem('canvasViewport');

    if (savedElements) {
      try {
        setElements(JSON.parse(savedElements));
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

  // Save to localStorage when elements change
  useEffect(() => {
    if (elements.length > 0) {
      localStorage.setItem('canvasElements', JSON.stringify(elements));
      onElementsChange?.(elements);
    }
  }, [elements, onElementsChange]);

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

  // Draw everything on canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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
      drawElement(ctx, element as CanvasElementType);
    });

    ctx.restore();
  }, [elements, currentElement, viewport]);

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    const gridSize = 50;
    const startX = Math.floor(-viewport.x / viewport.scale / gridSize) * gridSize;
    const startY = Math.floor(-viewport.y / viewport.scale / gridSize) * gridSize;
    const endX = startX + (ctx.canvas.width / viewport.scale) + gridSize;
    const endY = startY + (ctx.canvas.height / viewport.scale) + gridSize;

    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1 / viewport.scale;
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

  const drawElement = (ctx: CanvasRenderingContext2D, element: CanvasElementType) => {
    ctx.strokeStyle = element.color;
    ctx.lineWidth = element.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (element.type) {
      case 'path': {
        const pathEl = element as PathElement;
        if (pathEl.points.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(pathEl.points[0].x, pathEl.points[0].y);
        for (let i = 1; i < pathEl.points.length; i++) {
          ctx.lineTo(pathEl.points[i].x, pathEl.points[i].y);
        }
        ctx.stroke();
        break;
      }
      case 'rectangle': {
        const rectEl = element as RectangleElement;
        if (rectEl.fill) {
          ctx.fillStyle = rectEl.fill;
          ctx.fillRect(rectEl.x, rectEl.y, rectEl.width, rectEl.height);
        }
        ctx.strokeRect(rectEl.x, rectEl.y, rectEl.width, rectEl.height);
        break;
      }
      case 'circle': {
        const circleEl = element as CircleElement;
        ctx.beginPath();
        ctx.arc(circleEl.x, circleEl.y, circleEl.radius, 0, 2 * Math.PI);
        if (circleEl.fill) {
          ctx.fillStyle = circleEl.fill;
          ctx.fill();
        }
        ctx.stroke();
        break;
      }
      case 'line': {
        const lineEl = element as LineElement;
        ctx.beginPath();
        ctx.moveTo(lineEl.startX, lineEl.startY);
        ctx.lineTo(lineEl.endX, lineEl.endY);
        ctx.stroke();
        break;
      }
      case 'arrow': {
        const arrowEl = element as ArrowElement;
        const headLength = 15 / viewport.scale;
        const angle = Math.atan2(
          arrowEl.endY - arrowEl.startY,
          arrowEl.endX - arrowEl.startX
        );

        ctx.beginPath();
        ctx.moveTo(arrowEl.startX, arrowEl.startY);
        ctx.lineTo(arrowEl.endX, arrowEl.endY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(arrowEl.endX, arrowEl.endY);
        ctx.lineTo(
          arrowEl.endX - headLength * Math.cos(angle - Math.PI / 6),
          arrowEl.endY - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(arrowEl.endX, arrowEl.endY);
        ctx.lineTo(
          arrowEl.endX - headLength * Math.cos(angle + Math.PI / 6),
          arrowEl.endY - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
        break;
      }
      case 'text': {
        const textEl = element as TextElement;
        ctx.font = `${textEl.fontSize}px ${textEl.fontFamily}`;
        ctx.fillStyle = element.color;
        ctx.fillText(textEl.text, textEl.x, textEl.y);
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

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    // Pan with middle mouse button or space + left click
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    if (tool === 'select') {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    const canvasPoint = screenToCanvas(screenX, screenY);

    if (tool === 'text') {
      setTextInput({ x: screenX, y: screenY, show: true });
      setTimeout(() => textInputRef.current?.focus(), 0);
      return;
    }

    setIsDrawing(true);

    const baseElement = {
      id: Date.now().toString(),
      color,
      strokeWidth,
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

    if (isPanning && lastPanPoint) {
      const dx = e.clientX - lastPanPoint.x;
      const dy = e.clientY - lastPanPoint.y;
      setViewport((prev) => ({
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy,
      }));
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    if (!isDrawing || !currentElement) return;

    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const canvasPoint = screenToCanvas(screenX, screenY);

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
  };

  const handleMouseUp = () => {
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
          fontSize: 24,
          fontFamily: 'Arial',
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

  return (
    <>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="absolute inset-0 cursor-crosshair"
        style={{ cursor: tool === 'select' || isPanning ? 'grab' : 'crosshair' }}
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
