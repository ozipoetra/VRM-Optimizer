# VRM Optimizer

A web-based VRM model optimizer built with React, Three.js, and DaisyUI. Upload, preview, optimize, and export VRM avatar models directly in your browser with real-time progress tracking.

## Features

### Model Loading & Preview
- **Drag & drop** or file picker for `.vrm` files
- **WebGPU rendering** with automatic **WebGL fallback**
- **OrbitControls** — drag to rotate, scroll to zoom, right-click to pan
- **ACES Filmic tone mapping** for high-quality rendering
- **Multi-light setup** — ambient, directional, and hemisphere lights
- **Auto-centering** camera on model hips position
- **Viewer pause** during optimization to free GPU/CPU resources

### VRM Features
- **Expression controls** — manipulate all VRM expressions (happy, angry, sad, blink, mouth shapes A/I/U/E/O, look directions) with real-time sliders grouped by category
- **Model info panel** — view metadata (title, author, version, VRM spec), feature counts (bones, expressions, spring bones), and full humanoid bone list
- **SpringBone support** — hair and clothes physics update in real-time

### Optimization Pipeline
Sequential processing with real-time progress tracking and multi-level fallback:

1. **VRM0 → VRM1 Migration** — automatic skeleton and SpringBone conversion
2. **Texture Atlas Merging** — combine multiple material textures into a single atlas to reduce draw calls
3. **Mesh Simplification** — reduce polygon count using meshoptimizer with configurable target ratio
4. **KTX2 Texture Compression** — UASTC format with Zstandard supercompression (optional)
5. **WebP Texture Export** — convert all textures to WebP format with configurable quality (10-100%)

**Fallback System:**
- If mesh simplification fails → retry with atlas only
- If atlas merging fails → retry with migration only
- Never crashes — always produces a result

### Export
- Download optimized VRM as `.vrm` file
- WebP textures automatically applied when quality < 100%
- Exported files get `_webp` suffix for WebP-optimized versions

### UI/UX
- **DaisyUI 5** components with custom dark theme
- **Toast notifications** for success/error with auto-dismiss
- **Responsive layout** — drawer/sidebar on mobile, side-by-side on desktop
- **Real-time progress** — step indicator, progress bar, and status messages during optimization
- **Tabbed interface** — Optimize / Expressions / Info

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build tool | Vite 8 |
| Styling | Tailwind CSS 4 + DaisyUI 5 |
| 3D engine | Three.js 0.184 |
| VRM loader | @pixiv/three-vrm 3.5 |
| Optimization | @webxr-jp/avatar-optimizer 0.1 |
| glTF processing | @gltf-transform/core 4.3 |
| WebP encoding | Native OffscreenCanvas |
| Package manager | Bun |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) 1.0+ (or npm/pnpm/yarn)
- A modern browser with WebGL 2.0 support
- For WebGPU: Chrome 113+, Edge 113+, or Firefox Nightly with flag enabled

### Installation

```bash
# Clone the repository
git clone https://github.com/ozipoetra/VRM-Optimizer.git
cd VRM-Optimizer

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
- Click **Reset** to return to default view

### 3. Test Expressions
- Switch to the **Expressions** tab
- Use sliders to control facial expressions, mouth shapes, and gaze direction
- Expressions are grouped by category (Emotions, Mouth, Eyes, Gaze)
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
  - **KTX2 Compression** — enable UASTC texture compression
  - **WebP Quality** — convert textures to WebP on export (10-100%)
- Click **Optimize Model**
- Watch real-time progress through each optimization step
- View before/after statistics

### 6. Export
- Click **Export VRM** to download the result
- WebP textures are applied automatically if quality < 100%

## Project Structure

```
src/
├── App.tsx                          # Main application with drawer layout
├── components/
│   ├── VRMViewer.tsx                # Three.js 3D viewer with pause/resume
│   ├── FileUpload.tsx               # Drag & drop / file picker with hero section
│   ├── OptimizationPanel.tsx        # Settings, progress, stats, and export
│   ├── ExpressionControls.tsx       # Grouped expression sliders with progress bars
│   └── VRMInfo.tsx                  # Model metadata, stats, and bone list
└── utils/
    ├── vrmOptimizer.ts              # Sequential optimization pipeline with progress
    ├── vrmLoader.ts                 # WebGPU/WebGL renderer and VRM loading
    └── webpOptimizer.ts             # Parallel WebP texture conversion
```

## WebGPU Support

The app automatically detects WebGPU availability and uses the appropriate renderer:

- **WebGPU available** → `WebGPURenderer` with `MToonNodeMaterial` for MToon shaders
- **WebGPU unavailable** → Falls back to `WebGLRenderer` with standard `MToonMaterial`

A badge in the header shows which renderer is active (green for WebGPU, yellow for WebGL).

## Optimization Pipeline Details

### Sequential Processing
Each step runs one at a time with `yieldToMain()` between steps to keep the UI responsive:

1. **Migration** — VRM0 skeleton and SpringBone → VRM1 format
2. **Atlas** — Merge textures into single atlas, reduce draw calls
3. **Simplify** — Reduce mesh vertices using meshoptimizer

### Fallback System
If a step fails due to incompatible geometry:
- Simplify fails → retry with atlas + migration only
- Atlas fails → retry with migration only
- Always produces a usable result

### WebP Texture Conversion
- Runs during export, not during optimization
- Processes textures in parallel (4 concurrent)
- Uses native `OffscreenCanvas.convertToBlob('image/webp')`
- Quality slider controls compression level (10-100%)

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

## Browser Compatibility

| Browser | WebGL | WebGPU |
|---------|-------|--------|
| Chrome 113+ | Yes | Yes |
| Edge 113+ | Yes | Yes |
| Firefox 121+ | Yes | No (flag required) |
| Safari 17+ | Yes | No |

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
- `daisyui` — component library

### Dev
- `vite` — build tool and dev server
- `typescript` — type safety
- `eslint` — linting

## License

MIT
