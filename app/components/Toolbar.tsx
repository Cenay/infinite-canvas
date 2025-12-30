'use client';

import { useState, useEffect, useRef } from 'react';
import { Tool, StrokeStyle } from '../types';

interface ToolbarProps {
  tool: Tool;
  onToolChange: (tool: Tool) => void;
  color: string;
  onColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  fill?: string;
  onFillChange?: (fill: string) => void;
  opacity?: number;
  onOpacityChange?: (opacity: number) => void;
  roughness?: number;
  onRoughnessChange?: (roughness: number) => void;
  strokeStyle?: StrokeStyle;
  onStrokeStyleChange?: (style: StrokeStyle) => void;
  onClear: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onExport?: () => void;
  onImageUpload: (file: File) => void;
  canUndo: boolean;
  canRedo: boolean;
}

const tools: { id: Tool; icon: string; label: string; shortcut: string }[] = [
  { id: 'select', icon: '⌖', label: 'Selection', shortcut: '1' },
  { id: 'rectangle', icon: '▭', label: 'Rectangle', shortcut: '2' },
  { id: 'diamond', icon: '◇', label: 'Diamond', shortcut: '3' },
  { id: 'ellipse', icon: '○', label: 'Ellipse', shortcut: '4' },
  { id: 'arrow', icon: '→', label: 'Arrow', shortcut: '5' },
  { id: 'line', icon: '/', label: 'Line', shortcut: '6' },
  { id: 'pen', icon: '✎', label: 'Draw', shortcut: '7' },
  { id: 'text', icon: 'T', label: 'Text', shortcut: '8' },
  { id: 'image', icon: '🖼', label: 'Image', shortcut: '9' },
  { id: 'eraser', icon: '🗑', label: 'Eraser', shortcut: '0' },
];


export default function Toolbar({
  tool,
  onToolChange,
  color,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  fill = 'transparent',
  onFillChange,
  opacity = 1,
  onOpacityChange,
  roughness = 1,
  onRoughnessChange,
  strokeStyle = 'solid',
  onStrokeStyleChange,
  onClear,
  onUndo,
  onRedo,
  onExport,
  onImageUpload,
  canUndo,
  canRedo,
}: ToolbarProps) {
  const [position, setPosition] = useState({ x: 50, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Load position from localStorage
  useEffect(() => {
    const savedPosition = localStorage.getItem('toolbarPosition');
    if (savedPosition) {
      try {
        setPosition(JSON.parse(savedPosition));
      } catch (error) {
        console.error('Failed to load toolbar position:', error);
      }
    }
  }, []);

  // Save position to localStorage
  useEffect(() => {
    localStorage.setItem('toolbarPosition', JSON.stringify(position));
  }, [position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        
        // Constrain to viewport
        const toolbarWidth = toolbarRef.current?.offsetWidth || 0;
        const toolbarHeight = toolbarRef.current?.offsetHeight || 0;
        const maxX = window.innerWidth - toolbarWidth;
        const maxY = window.innerHeight - toolbarHeight;
        
        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging, dragStart]);

  const handleImageClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        onImageUpload(file);
      }
    };
    input.click();
  };

  return (
    <div
      ref={toolbarRef}
      className="fixed bg-white rounded-lg shadow-lg border border-gray-200 flex items-center gap-1 px-2 py-2 z-10"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
        transition: isDragging ? 'none' : 'transform 0.1s',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Six-dot drag handle */}
      <div className="drag-handle cursor-move px-1.5 py-1.5 hover:bg-gray-100 rounded flex flex-col gap-0.5 justify-center">
        <div className="flex gap-0.5">
          <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
        </div>
        <div className="flex gap-0.5">
          <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
        </div>
        <div className="flex gap-0.5">
          <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
        </div>
      </div>

      {/* Tools */}
      <div className="flex items-center gap-1">
        {tools.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              if (t.id === 'image') {
                handleImageClick();
              } else {
                onToolChange(t.id);
              }
            }}
            className={`relative w-10 h-10 rounded-md flex items-center justify-center transition-all ${
              tool === t.id
                ? 'bg-blue-100 text-blue-700'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
            title={t.label}
          >
            <span className="text-lg">{t.icon}</span>
            <span className="absolute bottom-0 right-0 text-[9px] text-gray-400/60 font-medium leading-none pb-0.5 pr-0.5">
              {t.shortcut}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
