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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Optimization Settings</h3>

        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-white/80 text-sm">Migrate VRM0 to VRM1</span>
            <input
              type="checkbox"
              checked={migrateVRM0ToVRM1}
              onChange={(e) => setMigrateVRM0ToVRM1(e.target.checked)}
              className="w-4 h-4 rounded accent-blue-500"
            />
          </label>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-white/80 text-sm">Atlas Resolution</label>
              <span className="text-white/60 text-sm">{atlasResolution}px</span>
            </div>
            <input
              type="range"
              min="512"
              max="4096"
              step="512"
              value={atlasResolution}
              onChange={(e) => setAtlasResolution(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-white/40 text-xs mt-1">
              <span>512</span>
              <span>4096</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-white/80 text-sm">Simplify Ratio</label>
              <span className="text-white/60 text-sm">{Math.round(simplifyRatio * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={simplifyRatio}
              onChange={(e) => setSimplifyRatio(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-white/40 text-xs mt-1">
              <span>More simplified</span>
              <span>Less simplified</span>
            </div>
          </div>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-white/80 text-sm">Texture Compression (KTX2)</span>
            <input
              type="checkbox"
              checked={textureCompression}
              onChange={(e) => setTextureCompression(e.target.checked)}
              className="w-4 h-4 rounded accent-blue-500"
            />
          </label>
        </div>
      </div>

      <button
        onClick={handleOptimize}
        disabled={!hasVrm || isOptimizing}
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-white/10 disabled:text-white/30 text-white font-medium rounded-lg transition-colors"
      >
        {isOptimizing ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Optimizing...
          </span>
        ) : (
          'Optimize Model'
        )}
      </button>

      {originalStats && (
        <div className="border-t border-white/10 pt-4">
          <h3 className="text-lg font-semibold text-white mb-4">Model Statistics</h3>

          <div className="space-y-3">
            <StatRow
              label="Vertices"
              original={originalStats.vertexCount}
              optimized={optimizedStats?.vertexCount}
              format={(v) => v.toLocaleString()}
            />
            <StatRow
              label="Triangles"
              original={originalStats.triangleCount}
              optimized={optimizedStats?.triangleCount}
              format={(v) => v.toLocaleString()}
            />
            <StatRow
              label="Materials"
              original={originalStats.materialCount}
              optimized={optimizedStats?.materialCount}
            />
          </div>
        </div>
      )}

      <button
        onClick={onExport}
        disabled={!hasOptimized || isExporting}
        className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-white/10 disabled:text-white/30 text-white font-medium rounded-lg transition-colors"
      >
        {isExporting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Exporting...
          </span>
        ) : (
          'Export Optimized VRM'
        )}
      </button>
    </div>
  )
}

function StatRow({
  label,
  original,
  optimized,
  format = (v: number) => v.toString(),
}: {
  label: string
  original: number
  optimized?: number
  format?: (v: number) => string
}) {
  const reduction = optimized !== undefined ? Math.round(((original - optimized) / original) * 100) : 0

  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-white/60">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-white/80">{format(original)}</span>
        {optimized !== undefined && (
          <>
            <span className="text-white/40">→</span>
            <span className="text-green-400">{format(optimized)}</span>
            {reduction > 0 && (
              <span className="text-green-400 text-xs bg-green-400/10 px-1.5 py-0.5 rounded">
                -{reduction}%
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
}
