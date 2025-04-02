# 🎨 Online Whiteboard

A modern, feature-rich whiteboard application built with Next.js 14, TypeScript, and tldraw. Perfect for sketching, diagramming, and collaborative work.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- 🖌️ Powerful Drawing Tools:
  - Pen and pencil with pressure sensitivity
  - Geometric shapes (rectangles, ellipses, arrows)
  - Text with rich formatting
  - Advanced eraser
  - Selection and transformation tools
  
- 🎯 Professional Features:
  - Infinite canvas with smooth pan/zoom
  - Multiple pages support
  - Precise snapping and alignment
  - Customizable styles
  
- 🔄 Advanced Capabilities:
  - Undo/Redo
  - Local state persistence
  - Export/Import support
  - Keyboard shortcuts
  
- 💻 Technical Excellence:
  - Built on tldraw's robust engine
  - Optimized performance
  - Mobile and tablet support
  - Touch and pen input support

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/online-whiteboard.git

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:3000` to start creating!

## 🛠️ How It Works

The application is built using:
- **Next.js 14**: For server-side rendering and routing
- **tldraw**: Powers the core whiteboard functionality
- **TypeScript**: Ensures type safety
- **TailwindCSS**: For styling

Key implementation details:
1. Uses tldraw's powerful editor for drawing and manipulation
2. Implements local storage persistence for saving work
3. Customized UI with responsive design
4. Optimized for both desktop and mobile use

## 📦 Project Structure

```
online-draw/
├── app/
│   ├── whiteboard.tsx    # Main whiteboard component
│   └── layout.tsx        # App layout
├── public/               # Static assets
└── package.json         # Dependencies and scripts
```

## 🔜 Future Enhancements

- [ ] Collaborative editing
- [ ] Custom tool extensions
- [ ] Cloud storage integration
- [ ] Additional export formats

## 🙏 Credits

This project is built with:
- [tldraw](https://tldraw.dev) - The incredible whiteboard engine
- [Next.js](https://nextjs.org) - React framework
- [TailwindCSS](https://tailwindcss.com) - Styling
- [TypeScript](https://www.typescriptlang.org) - Type safety

Special thanks to:
- The tldraw team for their amazing work
- Next.js team for the framework
- The open-source community

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Note on Implementation:**
This project utilizes the tldraw library (MIT License) as its core drawing engine. As per the MIT License terms, we can freely use, modify, and distribute the software. The library is used to provide robust drawing capabilities while focusing on the integration, state management, and user interface aspects of the application for academic purposes.
