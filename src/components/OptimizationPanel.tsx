import { useState } from 'react'
import type { OptimizationOptions, ModelStats, OptimizationProgress } from '../utils/vrmOptimizer'
import { Settings, ArrowLeftRight, Image, Sliders, Box, Zap, Download } from 'lucide-react'

interface OptimizationPanelProps {
  onOptimize: (options: OptimizationOptions) => void
  onExport: () => void
  originalStats: ModelStats | null
  optimizedStats: ModelStats | null
  isOptimizing: boolean
  isExporting: boolean
  hasVrm: boolean
  hasOptimized: boolean
  progress: OptimizationProgress | null
}

export function OptimizationPanel({
  onOptimize,
  onExport,
  originalStats,
  optimizedStats,
  isOptimizing,
  isExporting,
  hasVrm,
  hasOptimized,
  progress,
}: OptimizationPanelProps) {
  const [migrateVRM0ToVRM1, setMigrateVRM0ToVRM1] = useState(true)
  const [atlasResolution, setAtlasResolution] = useState(2048)
  const [simplifyRatio, setSimplifyRatio] = useState(0.5)
  const [textureCompression, setTextureCompression] = useState(false)
  const [webpQuality, setWebpQuality] = useState(80)

  const handleOptimize = () => {
    onOptimize({
      migrateVRM0ToVRM1,
      atlasResolution,
      simplifyRatio,
      textureCompression,
      webpQuality,
    })
  }

  const getReduction = (original: number, optimized: number | undefined) => {
    if (!optimized || original === 0) return 0
    return Math.round(((original - optimized) / original) * 100)
  }

  if (!hasVrm) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-base-content/40">
        <Settings className="w-16 h-16 mb-4 opacity-50" strokeWidth={1.5} />
        <p className="text-sm font-medium">No model loaded</p>
        <p className="text-xs mt-1">Upload a VRM file to optimize</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <fieldset className="fieldset">
        <legend className="fieldset-legend text-sm font-bold uppercase tracking-wider text-base-content/50">
          Settings
        </legend>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-base-100 rounded-xl border border-base-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ArrowLeftRight className="w-5 h-5 text-primary" />
              </div>
              <div>
                <label className="font-medium text-sm">VRM0 → VRM1</label>
                <p className="text-xs text-base-content/50">Migrate legacy format</p>
              </div>
            </div>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={migrateVRM0ToVRM1}
              onChange={(e) => setMigrateVRM0ToVRM1(e.target.checked)}
            />
          </div>

          <div className="p-3 bg-base-100 rounded-xl border border-base-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Image className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <label className="font-medium text-sm">Atlas Resolution</label>
                  <span className="badge badge-primary badge-sm">{atlasResolution}px</span>
                </div>
              </div>
            </div>
            <input
              type="range"
              min="512"
              max="4096"
              step="512"
              value={atlasResolution}
              onChange={(e) => setAtlasResolution(Number(e.target.value))}
              className="range range-primary range-sm"
            />
            <div className="flex justify-between text-xs text-base-content/40 mt-2">
              <span>512px</span>
              <span>1024</span>
              <span>2048</span>
              <span>4096px</span>
            </div>
          </div>

          <div className="p-3 bg-base-100 rounded-xl border border-base-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Sliders className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <label className="font-medium text-sm">Mesh Simplify</label>
                  <span className="badge badge-accent badge-sm">{Math.round(simplifyRatio * 100)}%</span>
                </div>
              </div>
            </div>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={simplifyRatio}
              onChange={(e) => setSimplifyRatio(Number(e.target.value))}
              className="range range-accent range-sm"
            />
            <div className="flex justify-between text-xs text-base-content/40 mt-2">
              <span>More simplified</span>
              <span>Less simplified</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-base-100 rounded-xl border border-base-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Box className="w-5 h-5 text-info" />
              </div>
              <div>
                <label className="font-medium text-sm">KTX2 Compression</label>
                <p className="text-xs text-base-content/50">UASTC texture format</p>
              </div>
            </div>
            <input
              type="checkbox"
              className="toggle toggle-info"
              checked={textureCompression}
              onChange={(e) => setTextureCompression(e.target.checked)}
            />
          </div>

          <div className="p-3 bg-base-100 rounded-xl border border-base-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Image className="w-5 h-5 text-warning" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <label className="font-medium text-sm">WebP Export</label>
                  <span className="badge badge-warning badge-sm">{webpQuality}%</span>
                </div>
                <p className="text-xs text-base-content/50 mt-0.5">Converts textures to WebP on export</p>
              </div>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={webpQuality}
              onChange={(e) => setWebpQuality(Number(e.target.value))}
              className="range range-warning range-sm"
            />
            <div className="flex justify-between text-xs text-base-content/40 mt-2">
              <span>Smaller size</span>
              <span>Better quality</span>
            </div>
          </div>
        </div>
      </fieldset>

      {isOptimizing && progress && (
        <div className="card bg-base-100 border border-base-300 p-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="loading loading-spinner loading-sm text-primary"></span>
            <span className="text-sm font-medium">{progress.message}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <div className="flex justify-between text-xs text-base-content/50 mb-1">
                <span>Step {progress.current} of {progress.total}</span>
                <span>{Math.round((progress.current / progress.total) * 100)}%</span>
              </div>
              <progress
                className="progress progress-primary w-full"
                value={progress.current}
                max={progress.total}
              ></progress>
            </div>
          </div>
          <div className="flex gap-1 mt-2">
            {['migrating', 'atlas', 'simplify'].map((step, i) => (
              <div
                key={step}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i < progress.current ? 'bg-primary' : 'bg-base-300'
                }`}
              ></div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleOptimize}
        disabled={isOptimizing}
        className="btn btn-primary btn-block gap-2 shadow-lg shadow-primary/20"
      >
        {isOptimizing ? (
          <>
            <span className="loading loading-spinner loading-sm"></span>
            Optimizing...
          </>
        ) : (
          <>
            <Zap className="h-4 w-4" />
            Optimize Model
          </>
        )}
      </button>

      {originalStats && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/50">Statistics</h3>

          <div className="grid grid-cols-3 gap-2">
            <div className="stat bg-base-100 rounded-xl border border-base-300 py-3 px-2">
              <div className="stat-title text-[10px]">Vertices</div>
              <div className="stat-value text-base text-primary">{originalStats.vertexCount > 9999 ? `${(originalStats.vertexCount / 1000).toFixed(1)}k` : originalStats.vertexCount.toLocaleString()}</div>
              {optimizedStats && (
                <div className="stat-desc text-success text-[10px]">
                  {getReduction(originalStats.vertexCount, optimizedStats.vertexCount)}% ↓
                </div>
              )}
            </div>
            <div className="stat bg-base-100 rounded-xl border border-base-300 py-3 px-2">
              <div className="stat-title text-[10px]">Triangles</div>
              <div className="stat-value text-base text-secondary">{originalStats.triangleCount > 9999 ? `${(originalStats.triangleCount / 1000).toFixed(1)}k` : originalStats.triangleCount.toLocaleString()}</div>
              {optimizedStats && (
                <div className="stat-desc text-success text-[10px]">
                  {getReduction(originalStats.triangleCount, optimizedStats.triangleCount)}% ↓
                </div>
              )}
            </div>
            <div className="stat bg-base-100 rounded-xl border border-base-300 py-3 px-2">
              <div className="stat-title text-[10px]">Materials</div>
              <div className="stat-value text-base text-accent">{originalStats.materialCount}</div>
              {optimizedStats && (
                <div className="stat-desc text-success text-[10px]">
                  {getReduction(originalStats.materialCount, optimizedStats.materialCount)}% ↓
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={onExport}
        disabled={!hasOptimized || isExporting}
        className="btn btn-success btn-block gap-2"
      >
        {isExporting ? (
          <>
            <span className="loading loading-spinner loading-sm"></span>
            Exporting...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Export VRM
          </>
        )}
      </button>
    </div>
  )
}
