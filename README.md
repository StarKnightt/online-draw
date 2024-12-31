# Collaborative Whiteboard App

A modern, feature-rich whiteboard application built with Next.js and TypeScript. This interactive whiteboard provides a seamless drawing experience with multiple tools and features.

## Features

- 🎨 Multiple Drawing Tools:
  - Pen tool for freehand drawing
  - Rectangle and ellipse shapes
  - Text tool with resizable text boxes
  - Eraser tool
  
- 🎯 Advanced Controls:
  - Customizable brush sizes
  - Color picker with preset colors
  - Undo/redo functionality
  - Clear canvas option

- 🔄 Interactive Canvas:
  - Pan and zoom functionality
  - Grid background for better alignment
  - Custom cursor indicators
  - Responsive design

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
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

## Usage

### Drawing Tools

- **Pen Tool**: Click and drag to draw freehand
- **Rectangle/Ellipse**: Click and drag to create shapes
- **Text**: Click to place a text box, type your text, and press Enter to commit
- **Eraser**: Click and drag to erase content
- **Selection**: Select and move elements (coming soon)

### Canvas Controls

- **Pan**: Middle-click and drag or use scroll wheel
- **Zoom**: Ctrl + scroll wheel
- **Undo/Redo**: Use the toolbar buttons or keyboard shortcuts (Ctrl+Z, Ctrl+Y)

### Customization

- Choose from preset colors in the color picker
- Adjust brush sizes using the size selector
- Different size options available for text and drawing tools

## Project Structure

```
app/
├── components/     # UI components
├── hooks/         # Custom React hooks
├── lib/           # Utility functions
└── whiteboard.tsx # Main whiteboard component
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
