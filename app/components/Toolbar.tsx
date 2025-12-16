'use client';

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

const tools: { id: Tool; icon: string; label: string }[] = [
  { id: 'select', icon: '⌖', label: 'Selection (V)' },
  { id: 'rectangle', icon: '▭', label: 'Rectangle (R)' },
  { id: 'diamond', icon: '◇', label: 'Diamond (D)' },
  { id: 'ellipse', icon: '○', label: 'Ellipse (O)' },
  { id: 'arrow', icon: '→', label: 'Arrow (A)' },
  { id: 'line', icon: '/', label: 'Line (L)' },
  { id: 'pen', icon: '✎', label: 'Draw (P)' },
  { id: 'text', icon: 'T', label: 'Text (T)' },
  { id: 'image', icon: '🖼', label: 'Image (I)' },
  { id: 'eraser', icon: '🗑', label: 'Eraser (E)' },
];

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
    <div className="fixed left-4 top-4 bottom-4 w-72 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col overflow-hidden z-10">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Drawing Tools</h2>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Tools */}
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Tools
          </h3>
          <div className="grid grid-cols-2 gap-2">
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
                className={`px-3 py-2.5 rounded-md border transition-all text-sm flex items-center gap-2 ${
                  tool === t.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                }`}
                title={t.label}
              >
                <span className="text-base">{t.icon}</span>
                <span className="text-xs font-medium truncate">{t.id}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Stroke Color */}
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Stroke
          </h3>
          <div className="flex gap-2 flex-wrap items-center">
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
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Background
            </h3>
            <div className="flex gap-2 flex-wrap items-center">
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
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Stroke Width
          </h3>
          <div className="grid grid-cols-4 gap-2">
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
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Stroke Style
            </h3>
            <div className="grid grid-cols-3 gap-2">
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
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Opacity: {Math.round(opacity * 100)}%
            </h3>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={opacity}
              onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </section>
        )}

        {/* Roughness (Sloppiness) */}
        {onRoughnessChange && (
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Sloppiness: {roughness.toFixed(1)}
            </h3>
            <input
              type="range"
              min="0"
              max="3"
              step="0.5"
              value={roughness}
              onChange={(e) => onRoughnessChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Architect</span>
              <span>Cartoonist</span>
            </div>
          </section>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2 bg-gray-50">
        <div className="flex gap-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="flex-1 px-3 py-2 rounded-md border border-gray-300 text-sm font-medium transition-colors hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed text-gray-700"
            title="Undo (Ctrl+Z)"
          >
            ↶ Undo
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="flex-1 px-3 py-2 rounded-md border border-gray-300 text-sm font-medium transition-colors hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed text-gray-700"
            title="Redo (Ctrl+Y)"
          >
            ↷ Redo
          </button>
        </div>
        {onExport && (
          <button
            onClick={onExport}
            className="w-full px-3 py-2 rounded-md bg-blue-500 text-white text-sm font-medium transition-colors hover:bg-blue-600"
            title="Export to PNG"
          >
            📥 Export PNG
          </button>
        )}
        <button
          onClick={onClear}
          className="w-full px-3 py-2 rounded-md border border-red-300 text-red-600 text-sm font-medium transition-colors hover:bg-red-50"
          title="Clear canvas"
        >
          🗑 Clear All
        </button>
      </div>
    </div>
  );
}
