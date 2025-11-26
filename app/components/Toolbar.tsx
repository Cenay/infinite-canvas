'use client';

import { Tool } from '../types';

interface ToolbarProps {
  tool: Tool;
  onToolChange: (tool: Tool) => void;
  color: string;
  onColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  onClear: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onImageUpload: (file: File) => void;
  canUndo: boolean;
  canRedo: boolean;
}

const tools: { id: Tool; icon: string; label: string }[] = [
  { id: 'select', icon: '👆', label: 'Select/Pan' },
  { id: 'pen', icon: '✏️', label: 'Pen' },
  { id: 'rectangle', icon: '▭', label: 'Rectangle' },
  { id: 'circle', icon: '○', label: 'Circle' },
  { id: 'line', icon: '/', label: 'Line' },
  { id: 'arrow', icon: '→', label: 'Arrow' },
  { id: 'text', icon: 'T', label: 'Text' },
  { id: 'image', icon: '🖼️', label: 'Image' },
];

const colors = [
  '#000000',
  '#FF0000',
  '#00FF00',
  '#0000FF',
  '#FFFF00',
  '#FF00FF',
  '#00FFFF',
  '#FFA500',
  '#800080',
  '#FFC0CB',
];

const strokeWidths = [1, 2, 4, 6, 8];

export default function Toolbar({
  tool,
  onToolChange,
  color,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  onClear,
  onUndo,
  onRedo,
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
    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg p-4 flex flex-col gap-4 z-10">
      {/* Tools */}
      <div className="flex gap-2 flex-wrap max-w-md">
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
            className={`px-3 py-2 rounded-lg border-2 transition-colors hover:bg-gray-100 ${
              tool === t.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300'
            }`}
            title={t.label}
          >
            <span className="text-xl">{t.icon}</span>
          </button>
        ))}
      </div>

      {/* Colors */}
      <div className="flex gap-2 items-center">
        <span className="text-sm font-medium text-gray-700">Color:</span>
        <div className="flex gap-2 flex-wrap">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => onColorChange(c)}
              className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                color === c ? 'border-gray-800 scale-110' : 'border-gray-300'
              }`}
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer"
            title="Custom color"
          />
        </div>
      </div>

      {/* Stroke Width */}
      <div className="flex gap-2 items-center">
        <span className="text-sm font-medium text-gray-700">Width:</span>
        <div className="flex gap-2">
          {strokeWidths.map((w) => (
            <button
              key={w}
              onClick={() => onStrokeWidthChange(w)}
              className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-colors hover:bg-gray-100 ${
                strokeWidth === w
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300'
              }`}
              title={`${w}px`}
            >
              <div
                className="rounded-full bg-black"
                style={{ width: `${w * 2}px`, height: `${w * 2}px` }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-gray-200">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="px-3 py-2 rounded-lg border-2 border-gray-300 transition-colors hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Undo (Ctrl+Z)"
        >
          ↶ Undo
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="px-3 py-2 rounded-lg border-2 border-gray-300 transition-colors hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Redo (Ctrl+Y)"
        >
          ↷ Redo
        </button>
        <button
          onClick={onClear}
          className="px-3 py-2 rounded-lg border-2 border-red-300 text-red-600 transition-colors hover:bg-red-50"
          title="Clear canvas"
        >
          🗑️ Clear
        </button>
      </div>

      {/* Instructions */}
      <div className="text-xs text-gray-500 pt-2 border-t border-gray-200 max-w-md">
        <p><strong>Tips:</strong></p>
        <p>• Scroll to zoom in/out</p>
        <p>• Shift + drag or use Select tool to pan</p>
        <p>• Press Enter after typing text</p>
      </div>
    </div>
  );
}
