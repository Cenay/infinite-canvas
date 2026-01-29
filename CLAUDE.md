# Infinite Canvas - Project Guide

## Overview
An Excalidraw-inspired infinite canvas drawing application built with Next.js, React, TypeScript, and Rough.js.

## Tech Stack
- **Next.js 16** with Turbopack
- **React 19** with hooks
- **TypeScript** for type safety
- **Rough.js** for hand-drawn style rendering
- **Tailwind CSS** for styling
- **Canvas API** for rendering

## Project Structure
```
app/
├── components/
│   ├── InfiniteCanvas.tsx  # Main canvas - rendering, selection, resize, events
│   └── Toolbar.tsx         # Floating toolbar with tools and settings
├── types.ts                # TypeScript definitions for all element types
├── page.tsx                # Main page - state management, keyboard shortcuts
├── layout.tsx              # Root layout
└── globals.css             # Global styles
```

## Key Files

### `types.ts`
Defines all element types: `PathElement`, `RectangleElement`, `CircleElement`, `EllipseElement`, `DiamondElement`, `LineElement`, `ArrowElement`, `TextElement`, `ImageElement`

### `InfiniteCanvas.tsx`
Core canvas logic including:
- `draw()` - Main render loop with Rough.js
- `drawElement()` - Renders individual elements with selection highlight and resize handles
- `getElementBounds()` - Returns bounding box for each element type
- `isPointInElement()` - Hit detection for selection
- `getResizeHandles()` / `getHandleAtPoint()` - Resize handle positioning and detection
- `measureText()` - Accurate text width measurement with caching
- Mouse event handlers for drawing, selecting, resizing, panning

### `Toolbar.tsx`
Floating, draggable toolbar with:
- Tool selection buttons
- Color pickers (stroke/fill)
- Stroke width and style options
- Opacity and roughness sliders
- Undo/redo and export buttons

## Data Persistence
- Elements saved to `localStorage` key: `canvasElements`
- Viewport saved to `localStorage` key: `canvasViewport`
- Toolbar position saved to `localStorage` key: `toolbarPosition`

## Important Patterns

### Element Selection
- `selectedElements` is a `Set<string>` of element IDs
- Selection works with any tool (except eraser)
- Multi-select via Ctrl/Cmd+click or selection box

### Resize System
- Single selected element shows 8 resize handles
- Handles: `nw`, `n`, `ne`, `e`, `se`, `s`, `sw`, `w`
- Corner handles preserve aspect ratio for images
- Edge handles allow free resize

### Image Handling
- Images stored with `src` (data URL) and `imageData` (HTMLImageElement)
- `imageData` is reconstructed from `src` when loading from localStorage (HTMLImageElement can't be serialized)

## Commands
```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npx tsc --noEmit # Type check without emitting
```

## Known Limitations
- No element rotation
- No layer ordering (z-index control)
- No collaborative editing
- Images are stored as data URLs (can bloat localStorage)

## Debugging Tips
- Check browser console for canvas errors
- Clear localStorage to reset: `localStorage.clear()`
- Text measurement uses canvas context - ensure canvas is mounted before measuring
