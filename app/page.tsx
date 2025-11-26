'use client';

import { useState, useCallback, useEffect } from 'react';
import InfiniteCanvas from './components/InfiniteCanvas';
import Toolbar from './components/Toolbar';
import { Tool, CanvasElementType, ImageElement } from './types';

export default function Home() {
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [history, setHistory] = useState<CanvasElementType[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [pendingImage, setPendingImage] = useState<File | null>(null);

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

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('canvasHistory', JSON.stringify(history));
    localStorage.setItem('canvasHistoryIndex', JSON.stringify(historyIndex));
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
  }, [color, strokeWidth]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          handleUndo();
        } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          handleRedo();
        }
      }

      // Tool shortcuts
      switch (e.key) {
        case 'v':
          setTool('select');
          break;
        case 'p':
          setTool('pen');
          break;
        case 'r':
          setTool('rectangle');
          break;
        case 'c':
          setTool('circle');
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
        onClear={handleClear}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onImageUpload={handleImageUpload}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
      />
      <InfiniteCanvas
        tool={tool}
        color={color}
        strokeWidth={strokeWidth}
        onElementsChange={handleElementsChange}
      />
    </div>
  );
}
