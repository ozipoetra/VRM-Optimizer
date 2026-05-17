import { useState } from 'react'
import type { OptimizationOptions, ModelStats } from '../utils/vrmOptimizer'

interface OptimizationPanelProps {
  onOptimize: (options: OptimizationOptions) => void
  onExport: () => void
  originalStats: ModelStats | null
  optimizedStats: ModelStats | null
  isOptimizing: boolean
  isExporting: boolean
  hasVrm: boolean
  hasOptimized: boolean
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
}: OptimizationPanelProps) {
  const [migrateVRM0ToVRM1, setMigrateVRM0ToVRM1] = useState(true)
  const [atlasResolution, setAtlasResolution] = useState(2048)
  const [simplifyRatio, setSimplifyRatio] = useState(0.5)
  const [textureCompression, setTextureCompression] = useState(false)

  const handleOptimize = () => {
    onOptimize({
      migrateVRM0ToVRM1,
      atlasResolution,
      simplifyRatio,
      textureCompression,
    })
  }

  const getReduction = (original: number, optimized: number | undefined) => {
    if (!optimized || original === 0) return 0
    return Math.round(((original - optimized) / original) * 100)
  }

  return (
    <div className="space-y-5">
      {/* Settings */}
      <fieldset className="fieldset">
        <legend className="fieldset-legend text-base font-semibold">Optimization Settings</legend>

        {/* VRM0 to VRM1 Migration */}
        <div className="flex items-center justify-between py-2">
          <div>
            <label className="font-medium text-sm">VRM0 → VRM1</label>
            <p className="text-xs text-base-content/50">Migrate legacy format</p>
          </div>
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={migrateVRM0ToVRM1}
            onChange={(e) => setMigrateVRM0ToVRM1(e.target.checked)}
          />
        </div>

        <div className="divider my-1"></div>

        {/* Atlas Resolution */}
        <div className="py-2">
          <div className="flex justify-between items-center mb-1">
            <label className="font-medium text-sm">Atlas Resolution</label>
            <span className="badge badge-primary badge-sm">{atlasResolution}px</span>
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
          <div className="flex justify-between text-xs text-base-content/40 mt-1">
            <span>512</span>
            <span>4096</span>
          </div>
        </div>

        <div className="divider my-1"></div>

        {/* Simplify Ratio */}
        <div className="py-2">
          <div className="flex justify-between items-center mb-1">
            <label className="font-medium text-sm">Mesh Simplify</label>
            <span className="badge badge-secondary badge-sm">{Math.round(simplifyRatio * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={simplifyRatio}
            onChange={(e) => setSimplifyRatio(Number(e.target.value))}
            className="range range-secondary range-sm"
          />
          <div className="flex justify-between text-xs text-base-content/40 mt-1">
            <span>More</span>
            <span>Less</span>
          </div>
        </div>

        <div className="divider my-1"></div>

        {/* Texture Compression */}
        <div className="flex items-center justify-between py-2">
          <div>
            <label className="font-medium text-sm">KTX2 Compression</label>
            <p className="text-xs text-base-content/50">UASTC texture format</p>
          </div>
          <input
            type="checkbox"
            className="toggle toggle-accent"
            checked={textureCompression}
            onChange={(e) => setTextureCompression(e.target.checked)}
          />
        </div>
      </fieldset>

      {/* Optimize Button */}
      <button
        onClick={handleOptimize}
        disabled={!hasVrm || isOptimizing}
        className="btn btn-primary btn-block gap-2"
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
        <div className="card bg-base-300/50">
          <div className="card-body p-4">
            <h3 className="card-title text-sm">Statistics</h3>

            <div className="stats stats-vertical shadow-sm bg-base-100">
              <div className="stat place-items-center py-3 px-4">
                <div className="stat-title text-xs">Vertices</div>
                <div className="stat-value text-lg">{originalStats.vertexCount.toLocaleString()}</div>
                {optimizedStats && (
                  <div className="stat-desc text-success">
                    {optimizedStats.vertexCount.toLocaleString()} ({getReduction(originalStats.vertexCount, optimizedStats.vertexCount)}% ↓)
                  </div>
                )}
              </div>
              <div className="stat place-items-center py-3 px-4">
                <div className="stat-title text-xs">Triangles</div>
                <div className="stat-value text-lg">{originalStats.triangleCount.toLocaleString()}</div>
                {optimizedStats && (
                  <div className="stat-desc text-success">
                    {optimizedStats.triangleCount.toLocaleString()} ({getReduction(originalStats.triangleCount, optimizedStats.triangleCount)}% ↓)
                  </div>
                )}
              </div>
              <div className="stat place-items-center py-3 px-4">
                <div className="stat-title text-xs">Materials</div>
                <div className="stat-value text-lg">{originalStats.materialCount}</div>
                {optimizedStats && (
                  <div className="stat-desc text-success">
                    {optimizedStats.materialCount} ({getReduction(originalStats.materialCount, optimizedStats.materialCount)}% ↓)
                  </div>
                )}
              </div>
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
