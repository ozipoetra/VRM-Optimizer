import { useState } from 'react'
import type { OptimizationOptions, ModelStats, OptimizationProgress } from '../utils/vrmOptimizer'

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
        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-2.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p className="text-sm font-medium">No model loaded</p>
        <p className="text-xs mt-1">Upload a VRM file to optimize</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Settings */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/50">Settings</h3>

        {/* VRM0 to VRM1 Migration */}
        <div className="flex items-center justify-between p-3 bg-base-100 rounded-xl border border-base-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
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

        {/* Atlas Resolution */}
        <div className="p-3 bg-base-100 rounded-xl border border-base-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
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

        {/* Simplify Ratio */}
        <div className="p-3 bg-base-100 rounded-xl border border-base-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
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

        {/* Texture Compression */}
        <div className="flex items-center justify-between p-3 bg-base-100 rounded-xl border border-base-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
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

        {/* WebP Quality */}
        <div className="p-3 bg-base-100 rounded-xl border border-base-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
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

      {/* Optimize Button */}
      {isOptimizing && progress && (
        <div className="card bg-base-100 border border-base-300 p-4 mb-4">
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Optimize Model
          </>
        )}
      </button>

      {/* Statistics */}
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

      {/* Export Button */}
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export VRM
          </>
        )}
      </button>
    </div>
  )
}
