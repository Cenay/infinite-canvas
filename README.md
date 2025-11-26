# Infinite Canvas App

A powerful, browser-based infinite canvas application built with Next.js that allows you to draw, create shapes, add text, and images on an unlimited creative workspace.

## Features

### Drawing Tools
- **Pen Tool**: Freehand drawing with customizable colors and stroke widths
- **Shapes**: Rectangle, Circle, Line, and Arrow tools
- **Text Tool**: Add text annotations anywhere on the canvas
- **Image Upload**: Import and place images on your canvas

### Canvas Controls
- **Infinite Canvas**: Pan and zoom to create unlimited workspace
- **Pan**: Shift + drag or use the Select tool to navigate
- **Zoom**: Scroll to zoom in and out
- **Grid**: Visual grid for alignment and reference

### Customization
- **Color Picker**: 10 preset colors plus custom color selector
- **Stroke Width**: 5 different stroke width options (1px to 8px)
- **Real-time Preview**: See your drawings as you create them

### Productivity Features
- **Undo/Redo**: Full history support with Ctrl+Z / Ctrl+Y shortcuts
- **Local Storage**: Automatically saves your work in browser storage
- **Persistent State**: Canvas state persists across browser sessions
- **Clear Canvas**: Reset your workspace with a single click

### Keyboard Shortcuts
- `v` - Select/Pan tool
- `p` - Pen tool
- `r` - Rectangle tool
- `c` - Circle tool
- `l` - Line tool
- `a` - Arrow tool
- `t` - Text tool
- `Ctrl+Z` / `Cmd+Z` - Undo
- `Ctrl+Y` / `Cmd+Y` - Redo
- `Shift+Drag` - Pan canvas
- `Scroll` - Zoom in/out

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

## Technology Stack

- **Next.js 16**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **HTML5 Canvas API**: High-performance drawing
- **Local Storage API**: Client-side data persistence

## Project Structure

```
infinite-canvas/
├── app/
│   ├── components/
│   │   ├── InfiniteCanvas.tsx  # Main canvas component
│   │   └── Toolbar.tsx          # Tool selection UI
│   ├── types.ts                 # TypeScript type definitions
│   ├── page.tsx                 # Main application page
│   └── layout.tsx               # Root layout
├── public/                      # Static assets
└── package.json                 # Dependencies
```

## Architecture

### Canvas Element System
The app uses a custom element system where each drawing (path, shape, text, image) is stored as a typed object. This allows for:
- Easy serialization to localStorage
- Efficient undo/redo operations
- Future extensibility for features like selection and editing

### Viewport Transform
The infinite canvas is implemented using viewport transformations:
- Pan: Translate the viewport origin
- Zoom: Scale the viewport
- All elements are drawn relative to the viewport for smooth performance

### State Management
- React hooks for UI state
- localStorage for persistence
- History array for undo/redo functionality

## Browser Support

Works best in modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Future Enhancements

Potential features for future development:
- Element selection and editing
- Multi-select and group operations
- Copy/paste functionality
- Export to PNG/SVG/PDF
- Collaborative editing
- More shape types
- Layers system
- Touch/stylus support optimization

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.
