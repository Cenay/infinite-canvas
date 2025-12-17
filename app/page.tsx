'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import InfiniteCanvas from './components/InfiniteCanvas';
import Toolbar from './components/Toolbar';
import { Tool, CanvasElementType, ImageElement, StrokeStyle } from './types';

export default function Home() {
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#1e1e1e');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fill, setFill] = useState<string>('transparent');
  const [opacity, setOpacity] = useState(1);
  const [roughness, setRoughness] = useState(1);
  const [strokeStyle, setStrokeStyle] = useState<StrokeStyle>('solid');
  const [history, setHistory] = useState<CanvasElementType[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('canvasHistory');
    const savedHistoryIndex = localStorage.getItem('canvasHistoryIndex');

    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to load history:', error);
      }
    }

    if (savedHistoryIndex) {
      try {
        setHistoryIndex(JSON.parse(savedHistoryIndex));
      } catch (error) {
        console.error('Failed to load history index:', error);
      }
    }
  }, []);

  // Save history to localStorage with error handling
  useEffect(() => {
    try {
      // Limit history to last 50 states to prevent quota issues
      const limitedHistory = history.slice(-50);
      const adjustedIndex = Math.min(historyIndex, limitedHistory.length - 1);

      localStorage.setItem('canvasHistory', JSON.stringify(limitedHistory));
      localStorage.setItem('canvasHistoryIndex', JSON.stringify(adjustedIndex));
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, clearing history...');
        // Clear history but keep current state
        const currentElements = history[historyIndex] || [];
        try {
          localStorage.setItem('canvasHistory', JSON.stringify([currentElements]));
          localStorage.setItem('canvasHistoryIndex', JSON.stringify(0));
        } catch {
          // If still failing, clear everything
          localStorage.removeItem('canvasHistory');
          localStorage.removeItem('canvasHistoryIndex');
        }
      }
    }
  }, [history, historyIndex]);

  const handleElementsChange = useCallback((elements: CanvasElementType[]) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(elements);
      return newHistory;
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      const elements = history[historyIndex - 1];
      localStorage.setItem('canvasElements', JSON.stringify(elements));
      window.location.reload();
    }
  }, [historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      const elements = history[historyIndex + 1];
      localStorage.setItem('canvasElements', JSON.stringify(elements));
      window.location.reload();
    }
  }, [historyIndex, history]);

  const handleClear = useCallback(() => {
    if (confirm('Are you sure you want to clear the canvas?')) {
      localStorage.setItem('canvasElements', JSON.stringify([]));
      setHistory([[]]);
      setHistoryIndex(0);
      window.location.reload();
    }
  }, []);

  const handleExport = useCallback(() => {
    // Create a temporary canvas for export
    const exportCanvas = document.createElement('canvas');
    const sourceCanvas = document.querySelector('canvas');

    if (!sourceCanvas) return;

    exportCanvas.width = sourceCanvas.width;
    exportCanvas.height = sourceCanvas.height;

    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // Draw the current canvas content
    ctx.drawImage(sourceCanvas, 0, 0);

    // Download as PNG
    exportCanvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `excalidraw-${Date.now()}.png`;
      link.click();
      URL.revokeObjectURL(url);
    });
  }, []);

  const handleImageUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const imageElement: ImageElement = {
          id: Date.now().toString(),
          type: 'image',
          x: 0,
          y: 0,
          width: img.width,
          height: img.height,
          src: e.target?.result as string,
          color: color,
          strokeWidth: strokeWidth,
          fill,
          opacity,
          roughness,
          strokeStyle,
          imageData: img,
        };

        const savedElements = localStorage.getItem('canvasElements');
        const elements = savedElements ? JSON.parse(savedElements) : [];
        elements.push(imageElement);
        localStorage.setItem('canvasElements', JSON.stringify(elements));
        window.location.reload();
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [color, strokeWidth, fill, opacity, roughness, strokeStyle]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo/Redo
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          handleUndo();
        } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          handleRedo();
        }
      }

      // Don't trigger tool shortcuts if typing in an input
      if (document.activeElement?.tagName === 'INPUT') return;

      // Tool shortcuts
      switch (e.key.toLowerCase()) {
        case 'v':
          setTool('select');
          break;
        case 'p':
          setTool('pen');
          break;
        case 'r':
          setTool('rectangle');
          break;
        case 'o':
          setTool('ellipse');
          break;
        case 'd':
          if (!e.ctrlKey && !e.metaKey) {
            setTool('diamond');
          }
          break;
        case 'l':
          setTool('line');
          break;
        case 'a':
          setTool('arrow');
          break;
        case 't':
          setTool('text');
          break;
        case 'e':
          setTool('eraser');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-50 relative">
      <Toolbar
        tool={tool}
        onToolChange={setTool}
        color={color}
        onColorChange={setColor}
        strokeWidth={strokeWidth}
        onStrokeWidthChange={setStrokeWidth}
        fill={fill}
        onFillChange={setFill}
        opacity={opacity}
        onOpacityChange={setOpacity}
        roughness={roughness}
        onRoughnessChange={setRoughness}
        strokeStyle={strokeStyle}
        onStrokeStyleChange={setStrokeStyle}
        onClear={handleClear}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onExport={handleExport}
        onImageUpload={handleImageUpload}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
      />
      <InfiniteCanvas
        tool={tool}
        color={color}
        strokeWidth={strokeWidth}
        fill={fill}
        opacity={opacity}
        roughness={roughness}
        strokeStyle={strokeStyle}
        onElementsChange={handleElementsChange}
      />
    </div>
  );
}
