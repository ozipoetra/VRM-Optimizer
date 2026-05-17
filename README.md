# VRM Optimizer

A web-based VRM model optimizer built with React, Three.js, and the `@webxr-jp/avatar-optimizer` library. Upload, preview, optimize, and export VRM avatar models directly in your browser.

## Features

### Model Loading & Preview
- **Drag & drop** or file picker for `.vrm` files
- **WebGPU rendering** with automatic **WebGL fallback**
- **OrbitControls** — drag to rotate, scroll to zoom, right-click to pan
- **ACES Filmic tone mapping** for high-quality rendering
- **Multi-light setup** — ambient, directional, and hemisphere lights
- **Auto-centering** camera on model hips position

### VRM Features
- **Expression controls** — manipulate all VRM expressions (happy, angry, sad, blink, mouth shapes A/I/U/E/O, look directions, etc.) with real-time sliders
- **Model info panel** — view metadata (title, author, version, VRM spec), feature counts (bones, expressions, spring bones), and full humanoid bone list
- **SpringBone support** — hair and clothes physics update in real-time

### Optimization
- **VRM0 → VRM1 migration** — automatic skeleton and SpringBone conversion
- **Texture atlas merging** — combine multiple material textures into a single atlas to reduce draw calls
- **Mesh simplification** — reduce polygon count using meshoptimizer with configurable target ratio
- **KTX2 texture compression** — UASTC format with Zstandard supercompression (optional)
- **Before/after statistics** — compare vertices, triangles, and materials with percentage reduction

### Export
- Download optimized VRM as `.vrm` file
- Original or optimized version export

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build tool | Vite 8 |
| Styling | Tailwind CSS 4 |
| 3D engine | Three.js 0.184 |
| VRM loader | @pixiv/three-vrm 3.5 |
| Optimization | @webxr-jp/avatar-optimizer 0.1 |
| glTF processing | @gltf-transform/core 4.3 |
| Package manager | Bun |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) 1.0+ (or npm/pnpm/yarn)
- A modern browser with WebGL 2.0 support
- For WebGPU: Chrome 113+, Edge 113+, or Firefox Nightly with flag enabled

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd optimizer

# Install dependencies
bun install

# Start development server
bun run dev
```

Open `http://localhost:5173` in your browser.

### Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server with HMR |
| `bun run build` | Type-check and build for production |
| `bun run preview` | Preview production build locally |
| `bun run lint` | Run ESLint |

## Usage

### 1. Upload a VRM Model
- Drag and drop a `.vrm` file onto the upload area, or click to browse
- The model loads and appears in the 3D viewer

### 2. Preview the Model
- **Left-click + drag** to orbit around the model
- **Scroll** to zoom in/out
- **Right-click + drag** to pan
- Click **Reset Camera** to return to default view

### 3. Test Expressions
- Switch to the **Expressions** tab
- Use sliders to control facial expressions, mouth shapes, and gaze direction
- Click **Reset All** to clear all expressions

### 4. View Model Info
- Switch to the **Info** tab
- See model metadata, feature counts, and available humanoid bones

### 5. Optimize
- Switch to the **Optimize** tab
- Configure settings:
  - **Migrate VRM0 to VRM1** — convert older VRM format
  - **Atlas Resolution** — texture atlas size (512px–4096px)
  - **Simplify Ratio** — target polygon reduction (10%–100%)
  - **Texture Compression** — enable KTX2/UASTC compression
- Click **Optimize Model**
- View before/after statistics

### 6. Export
- Click **Export Optimized VRM** to download the result

## Project Structure

```
src/
├── App.tsx                          # Main application component
├── components/
│   ├── VRMViewer.tsx                # Three.js 3D viewer with OrbitControls
│   ├── FileUpload.tsx               # Drag & drop / file picker component
│   ├── OptimizationPanel.tsx        # Optimization settings and stats panel
│   ├── ExpressionControls.tsx       # VRM expression sliders
│   └── VRMInfo.tsx                  # Model metadata and bone info
└── utils/
    ├── vrmOptimizer.ts              # Core optimization utilities
    └── vrmLoader.ts                 # WebGPU/WebGL renderer and VRM loading
```

## WebGPU Support

The app automatically detects WebGPU availability and uses the appropriate renderer:

- **WebGPU available** → `WebGPURenderer` with `MToonNodeMaterial` for MToon shaders
- **WebGPU unavailable** → Falls back to `WebGLRenderer` with standard `MToonMaterial`

A badge in the header shows which renderer is active.

## Deployment

### Vercel

No configuration needed. Connect your repository and Vercel auto-detects Vite.

### Cloudflare Pages

- **Build command:** `bun run build`
- **Output directory:** `dist`

### Netlify

- **Build command:** `bun run build`
- **Publish directory:** `dist`

> For SPA routing on all platforms, ensure the server falls back to `index.html` for all routes.

## Dependencies

### Core
- `three` — 3D graphics library
- `@pixiv/three-vrm` — VRM loader and runtime for Three.js
- `@webxr-jp/avatar-optimizer` — VRM optimization (atlas, simplify, migrate, export)
- `@gltf-transform/core` — glTF processing pipeline
- `@gltf-transform/extensions` — glTF extension support

### UI
- `react` / `react-dom` — UI framework
- `tailwindcss` / `@tailwindcss/vite` — utility-first CSS

### Dev
- `vite` — build tool and dev server
- `typescript` — type safety
- `eslint` — linting

## Browser Compatibility

| Browser | WebGL | WebGPU |
|---------|-------|--------|
| Chrome 113+ | Yes | Yes |
| Edge 113+ | Yes | Yes |
| Firefox 121+ | Yes | No (flag required) |
| Safari 17+ | Yes | No |

## License

MIT
