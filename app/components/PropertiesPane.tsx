'use client';

import { useState, useEffect, useRef } from 'react';
import { Tool, StrokeStyle, TextDecorators } from '../types';

interface PropertiesPaneProps {
  tool: Tool;
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
  // Text properties
  fontFamily?: string;
  onFontFamilyChange?: (family: string) => void;
  fontSize?: number;
  onFontSizeChange?: (size: number) => void;
  textDecorators?: TextDecorators;
  onTextDecoratorsChange?: (decorators: TextDecorators) => void;
  // Eraser properties
  eraserSize?: number;
  onEraserSizeChange?: (size: number) => void;
}

const colors = [
  { value: '#1e1e1e', name: 'Black' },
  { value: '#e03131', name: 'Red' },
  { value: '#2f9e44', name: 'Green' },
  { value: '#1971c2', name: 'Blue' },
  { value: '#f08c00', name: 'Orange' },
  { value: '#e64980', name: 'Pink' },
  { value: '#be4bdb', name: 'Purple' },
];

const strokeWidths = [
  { value: 1, label: 'Thin' },
  { value: 2, label: 'Medium' },
  { value: 4, label: 'Bold' },
  { value: 8, label: 'Extra Bold' },
];

const strokeStyles: { value: StrokeStyle; label: string; icon: string }[] = [
  { value: 'solid', label: 'Solid', icon: '─' },
  { value: 'dashed', label: 'Dashed', icon: '┄' },
  { value: 'dotted', label: 'Dotted', icon: '┈' },
];

const fontFamilies = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Comic Sans MS', label: 'Comic Sans MS' },
  { value: 'Trebuchet MS', label: 'Trebuchet MS' },
];

const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72];

export default function PropertiesPane({
  tool,
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
  fontFamily = 'Arial',
  onFontFamilyChange,
  fontSize = 20,
  onFontSizeChange,
  textDecorators = {},
  onTextDecoratorsChange,
  eraserSize = 20,
  onEraserSizeChange,
}: PropertiesPaneProps) {
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const paneRef = useRef<HTMLDivElement>(null);

  // Load position from localStorage
  useEffect(() => {
    const savedPosition = localStorage.getItem('propertiesPanePosition');
    if (savedPosition) {
      try {
        setPosition(JSON.parse(savedPosition));
      } catch (error) {
        console.error('Failed to load properties pane position:', error);
      }
    }
  }, []);

  // Save position to localStorage
  useEffect(() => {
    localStorage.setItem('propertiesPanePosition', JSON.stringify(position));
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
        const paneWidth = paneRef.current?.offsetWidth || 0;
        const paneHeight = paneRef.current?.offsetHeight || 0;
        const maxX = window.innerWidth - paneWidth;
        const maxY = window.innerHeight - paneHeight;
        
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

  const handleTextDecoratorToggle = (decorator: keyof TextDecorators) => {
    if (onTextDecoratorsChange) {
      onTextDecoratorsChange({
        ...textDecorators,
        [decorator]: !textDecorators[decorator],
      });
    }
  };

  const renderShapeProperties = () => (
    <>
      {/* Stroke Color */}
      <section>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Stroke
        </h3>
        <div className="flex gap-2 flex-wrap items-center mb-4">
          {colors.map((c) => (
            <button
              key={c.value}
              onClick={() => onColorChange(c.value)}
              className={`w-8 h-8 rounded-md border-2 transition-all ${
                color === c.value
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{ backgroundColor: c.value }}
              title={c.name}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-8 h-8 rounded-md border-2 border-gray-300 cursor-pointer"
            title="Custom color"
          />
        </div>
      </section>

      {/* Fill Color */}
      {onFillChange && (
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Fill
          </h3>
          <div className="flex gap-2 flex-wrap items-center mb-4">
            <button
              onClick={() => onFillChange('transparent')}
              className={`w-8 h-8 rounded-md border-2 transition-all relative ${
                fill === 'transparent'
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              title="Transparent"
              style={{
                background: 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)',
                backgroundSize: '8px 8px',
                backgroundPosition: '0 0, 4px 4px'
              }}
            />
            {colors.map((c) => (
              <button
                key={`fill-${c.value}`}
                onClick={() => onFillChange(c.value)}
                className={`w-8 h-8 rounded-md border-2 transition-all ${
                  fill === c.value
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ backgroundColor: c.value }}
                title={`Fill: ${c.name}`}
              />
            ))}
            <input
              type="color"
              value={fill === 'transparent' ? '#ffffff' : fill}
              onChange={(e) => onFillChange(e.target.value)}
              className="w-8 h-8 rounded-md border-2 border-gray-300 cursor-pointer"
              title="Custom fill color"
            />
          </div>
        </section>
      )}

      {/* Stroke Width */}
      <section>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Stroke Width
        </h3>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {strokeWidths.map((w) => (
            <button
              key={w.value}
              onClick={() => onStrokeWidthChange(w.value)}
              className={`h-10 rounded-md border-2 flex flex-col items-center justify-center transition-all ${
                strokeWidth === w.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              title={w.label}
            >
              <div
                className="rounded-full bg-gray-800"
                style={{ width: `${w.value * 2}px`, height: `${w.value * 2}px` }}
              />
            </button>
          ))}
        </div>
      </section>

      {/* Stroke Style */}
      {onStrokeStyleChange && (
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Style
          </h3>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {strokeStyles.map((s) => (
              <button
                key={s.value}
                onClick={() => onStrokeStyleChange(s.value)}
                className={`px-3 py-2 rounded-md border transition-all text-sm ${
                  strokeStyle === s.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                }`}
                title={s.label}
              >
                <span className="text-lg">{s.icon}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Opacity */}
      {onOpacityChange && (
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Opacity: {Math.round(opacity * 100)}%
          </h3>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={opacity}
            onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 mb-4"
          />
        </section>
      )}

      {/* Roughness */}
      {onRoughnessChange && (
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Sloppiness: {roughness.toFixed(1)}
          </h3>
          <input
            type="range"
            min="0"
            max="3"
            step="0.5"
            value={roughness}
            onChange={(e) => onRoughnessChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 mb-4"
          />
          <div className="flex justify-between text-xs text-gray-500 mb-4">
            <span>Architect</span>
            <span>Cartoonist</span>
          </div>
        </section>
      )}
    </>
  );

  const renderTextProperties = () => (
    <>
      {/* Font Family */}
      {onFontFamilyChange && (
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Font Family
          </h3>
          <select
            value={fontFamily}
            onChange={(e) => onFontFamilyChange(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {fontFamilies.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </section>
      )}

      {/* Font Size */}
      {onFontSizeChange && (
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Font Size: {fontSize}px
          </h3>
          <div className="flex gap-2 flex-wrap mb-4">
            {fontSizes.map((size) => (
              <button
                key={size}
                onClick={() => onFontSizeChange(size)}
                className={`px-3 py-1.5 rounded-md border text-sm transition-all ${
                  fontSize === size
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          <input
            type="range"
            min="12"
            max="144"
            step="2"
            value={fontSize}
            onChange={(e) => onFontSizeChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 mb-4"
          />
        </section>
      )}

      {/* Text Color */}
      <section>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Color
        </h3>
        <div className="flex gap-2 flex-wrap items-center mb-4">
          {colors.map((c) => (
            <button
              key={c.value}
              onClick={() => onColorChange(c.value)}
              className={`w-8 h-8 rounded-md border-2 transition-all ${
                color === c.value
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{ backgroundColor: c.value }}
              title={c.name}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-8 h-8 rounded-md border-2 border-gray-300 cursor-pointer"
            title="Custom color"
          />
        </div>
      </section>

      {/* Text Decorators */}
      {onTextDecoratorsChange && (
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Style
          </h3>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => handleTextDecoratorToggle('bold')}
              className={`px-3 py-2 rounded-md border transition-all text-sm font-bold ${
                textDecorators.bold
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
              title="Bold"
            >
              B
            </button>
            <button
              onClick={() => handleTextDecoratorToggle('italic')}
              className={`px-3 py-2 rounded-md border transition-all text-sm italic ${
                textDecorators.italic
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
              title="Italic"
            >
              I
            </button>
            <button
              onClick={() => handleTextDecoratorToggle('underline')}
              className={`px-3 py-2 rounded-md border transition-all text-sm underline ${
                textDecorators.underline
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
              title="Underline"
            >
              U
            </button>
            <button
              onClick={() => handleTextDecoratorToggle('strikethrough')}
              className={`px-3 py-2 rounded-md border transition-all text-sm line-through ${
                textDecorators.strikethrough
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
              title="Strikethrough"
            >
              S
            </button>
          </div>
        </section>
      )}
    </>
  );

  const renderEraserProperties = () => (
    <>
      {onEraserSizeChange && (
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Eraser Size: {eraserSize}px
          </h3>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={eraserSize}
            onChange={(e) => onEraserSizeChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 mb-4"
          />
        </section>
      )}
    </>
  );

  const renderProperties = () => {
    switch (tool) {
      case 'text':
        return renderTextProperties();
      case 'eraser':
        return renderEraserProperties();
      case 'select':
        return (
          <div className="text-sm text-gray-500 py-4">
            Select elements to edit their properties
          </div>
        );
      case 'image':
        return (
          <>
            {onOpacityChange && (
              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Opacity: {Math.round(opacity * 100)}%
                </h3>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={opacity}
                  onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 mb-4"
                />
              </section>
            )}
          </>
        );
      default:
        return renderShapeProperties();
    }
  };

  return (
    <div
      ref={paneRef}
      className="fixed bg-white rounded-lg shadow-lg border border-gray-200 w-64 z-10"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
        transition: isDragging ? 'none' : 'transform 0.1s',
        maxHeight: 'calc(100vh - 40px)',
        overflowY: 'auto',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header with drag handle */}
      <div className="p-3 border-b border-gray-200 flex items-center gap-2">
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
        <h2 className="text-sm font-semibold text-gray-800 flex-1">Properties</h2>
      </div>

      {/* Content */}
      <div className="p-4">
        {renderProperties()}
      </div>
    </div>
  );
}

