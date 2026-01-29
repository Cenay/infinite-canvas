# Excalidraw Clone - Infinite Canvas Drawing App

A feature-rich infinite canvas drawing application inspired by Excalidraw, built with Next.js, React, TypeScript, and Rough.js.

## Features

### ✨ Hand-Drawn Style
- **Rough.js Integration**: All shapes are rendered with a hand-drawn, sketchy appearance
- **Adjustable Sloppiness**: Control the roughness/sketchiness of drawings with a slider (0-3)
- **Consistent Rendering**: Each shape maintains its unique hand-drawn character with seed-based randomness

### 🎨 Drawing Tools
- **Selection Tool (1)**: Select, move, and resize elements
- **Hand Tool (H)**: Pan/navigate the canvas by click-and-drag
- **Rectangle (2)**: Draw rectangles with optional fill
- **Diamond (3)**: Create diamond/rhombus shapes
- **Ellipse (4)**: Draw ellipses with custom dimensions
- **Arrow (5)**: Directional arrows with arrowheads
- **Line (6)**: Straight lines
- **Pen (7)**: Freehand drawing
- **Text (8)**: Add text labels
- **Image (9)**: Upload and place images
- **Eraser (0)**: Remove elements by clicking

### 🎨 Styling Options
- **Stroke Color**: Choose from preset colors or use custom color picker
- **Fill Color**: Optional background fill for shapes (transparent or colored)
- **Stroke Width**: 4 preset widths (Thin, Medium, Bold, Extra Bold)
- **Stroke Style**: Solid, Dashed, or Dotted lines
- **Opacity**: Adjustable transparency (0-100%)

### 📐 Element Manipulation
- **Selection**: Click any element to select it (works with any tool)
- **Multi-Select**:
  - Drag to create selection box (in Select mode)
  - Ctrl/Cmd + Click to add/remove from selection
- **Move**: Drag selected elements to reposition
- **Resize**:
  - 8 resize handles appear when single element is selected
  - Corner handles: Resize proportionally
  - Edge handles: Resize width or height independently
  - **Images**: Corner handles lock aspect ratio; edge handles allow stretching
- **Delete**: Press Delete or Backspace to remove selected elements
- **Copy/Paste**: Ctrl/Cmd + C/V to duplicate elements
- **Duplicate**: Ctrl/Cmd + D to quickly duplicate selection
- **Cancel Drawing**: Press Escape to cancel in-progress drawing or clear selection

### 🔄 Canvas Controls
- **Infinite Canvas**: Pan in any direction
- **Zoom**: Scroll wheel to zoom in/out
- **Pan**:
  - **Hand Tool (H)**: Click and drag to pan
  - Shift + Drag (any tool)
  - Middle mouse button (any tool)
- **Grid**: Visual grid for alignment reference

### ⚡ Keyboard Shortcuts
- **1**: Selection tool
- **H**: Hand/Pan tool
- **2**: Rectangle
- **3**: Diamond
- **4**: Ellipse
- **5**: Arrow
- **6**: Line
- **7**: Pen/Draw tool
- **8**: Text
- **9**: Image
- **0**: Eraser
- **Escape**: Cancel drawing / Clear selection
- **Ctrl/Cmd + Z**: Undo
- **Ctrl/Cmd + Shift + Z** or **Ctrl/Cmd + Y**: Redo
- **Ctrl/Cmd + C**: Copy
- **Ctrl/Cmd + V**: Paste
- **Ctrl/Cmd + D**: Duplicate
- **Delete/Backspace**: Delete selection

### 💾 Persistence
- **Auto-Save**: All drawings automatically saved to localStorage
- **Viewport Memory**: Canvas position and zoom level preserved
- **History**: Full undo/redo support with history management
- **Image Persistence**: Uploaded images stored as data URLs

### 📤 Export
- **PNG Export**: Download your canvas as a PNG image with white background
- **One-Click**: Export button in the toolbar

### 🎯 User Interface
- **Vertical Sidebar**: Excalidraw-style toolbar on the left
- **Organized Sections**: Tools, colors, and properties logically grouped
- **Visual Feedback**: Selected tools and colors clearly highlighted
- **Responsive Controls**: Sliders for opacity and roughness
- **Clean Design**: Modern, minimal interface that stays out of the way

### 🌐 Browser Features
- **No Backend Required**: Runs entirely in the browser
- **Client-Side Only**: All data stored locally
- **Fast**: Optimized rendering with React hooks
- **TypeScript**: Fully typed for better development experience

## Technical Stack

- **Next.js 16**: React framework with Turbopack
- **React 19**: Latest React with hooks
- **TypeScript**: Type-safe development
- **Rough.js**: Hand-drawn style rendering
- **Tailwind CSS**: Utility-first styling
- **Canvas API**: High-performance rendering

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd infinite-canvas
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Architecture

### Component Structure
- `page.tsx`: Main application component managing state
- `InfiniteCanvas.tsx`: Canvas rendering and interaction logic
- `Toolbar.tsx`: Vertical sidebar with all controls
- `types.ts`: TypeScript definitions for all data structures

### Key Features Implementation

#### Hand-Drawn Rendering
Uses Rough.js to render all geometric shapes with configurable roughness, maintaining consistency through seed-based randomness.

#### Element Management
Each element stores:
- Position and dimensions
- Style properties (color, fill, stroke width, opacity)
- Rendering properties (roughness, stroke style)
- Unique ID for selection and manipulation

#### State Management
- React hooks for local state
- localStorage for persistence
- History array for undo/redo
- Viewport transform for pan/zoom

#### Selection System
- Bounding box calculations for each element type
- Point-in-element collision detection
- Multi-select with Ctrl/Cmd modifier
- Visual selection highlighting

## Project Structure

```
infinite-canvas/
├── app/
│   ├── components/
│   │   ├── InfiniteCanvas.tsx  # Canvas with Rough.js rendering
│   │   └── Toolbar.tsx          # Excalidraw-style sidebar
│   ├── types.ts                 # TypeScript type definitions
│   ├── page.tsx                 # Main application page
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── public/                      # Static assets
└── package.json                 # Dependencies
```

## Differences from Excalidraw

This is a clone focusing on core features. Not implemented:
- Collaboration/real-time editing
- Elbow arrows (connector arrows with bends)
- Element rotation (resize handles are implemented)
- Layer ordering (bring to front/send to back)
- SVG export
- Library of shapes
- Command palette
- Advanced text editing/wrapping
- Touch/mobile optimization

## Future Enhancements

Potential additions:
- [ ] Elbow arrows with waypoints
- [ ] Layer ordering controls
- [ ] SVG export
- [ ] Element rotation
- [ ] Text wrapping
- [ ] Shape library
- [ ] Mobile touch support
- [ ] Collaboration features
- [ ] More shape types (stars, polygons, etc.)

## Browser Support

Works best in modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Credits

Inspired by [Excalidraw](https://excalidraw.com/) - an excellent open-source whiteboard tool.

Uses [Rough.js](https://roughjs.com/) for the hand-drawn rendering style.

## License

This is a learning/demonstration project. For production use, consider using the official [Excalidraw](https://github.com/excalidraw/excalidraw) project.

## Changelog

### 2026-01-28
- **Added Hand Tool**: New dedicated pan tool (H key) with grab cursor for intuitive canvas navigation
- **Added Resize Handles**: 8-point resize handles (corners + edges) appear when element is selected
  - All element types support resizing (shapes, text, images, paths, lines)
  - Visual cursor feedback when hovering over handles
- **Image Aspect Ratio**: Corner handles lock aspect ratio; edge handles allow free stretch/crop
- **Fixed Image Selection**: Images can now be properly selected and deleted
- **Fixed Text Selection Bounds**: Text elements now show accurate selection boxes based on measured text width
- **Fixed Drawing Artifacts**: Switching tools mid-draw no longer leaves ghost elements
- **Added Escape Key**: Cancel in-progress drawing or clear current selection
- **Universal Selection**: Click any element to select it regardless of active tool (except eraser)

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.
