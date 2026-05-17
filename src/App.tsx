import { useState, useCallback, useEffect } from 'react'
import type { VRM } from '@pixiv/three-vrm'
import { VRMViewer } from './components/VRMViewer'
import { FileUpload } from './components/FileUpload'
import { OptimizationPanel } from './components/OptimizationPanel'
import { ExpressionControls } from './components/ExpressionControls'
import { VRMInfo } from './components/VRMInfo'
import {
  loadVRMFile,
  optimizeVRM,
  exportVRMFile,
  getModelStats,
  formatFileSize,
  type OptimizationOptions,
  type ModelStats,
} from './utils/vrmOptimizer'
import { isWebGPUSupported, loadVRMWebGPU } from './utils/vrmLoader'

type TabType = 'optimize' | 'expressions' | 'info'

function App() {
  const [vrm, setVrm] = useState<VRM | null>(null)
  const [optimizedVrm, setOptimizedVrm] = useState<VRM | null>(null)
  const [originalStats, setOriginalStats] = useState<ModelStats | null>(null)
  const [optimizedStats, setOptimizedStats] = useState<ModelStats | null>(null)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const [activeTab, setActiveTab] = useState<TabType>('optimize')
  const [useWebGPU, setUseWebGPU] = useState<boolean | null>(null)

  useEffect(() => {
    isWebGPUSupported().then((supported) => {
      setUseWebGPU(supported)
    })
  }, [])

  const handleFileSelect = useCallback(async (file: File) => {
    setIsLoading(true)
    setError(null)
    setFileName(file.name)

    try {
      let loadedVrm: VRM

      if (useWebGPU) {
        loadedVrm = await loadVRMWebGPU(file)
      } else {
        loadedVrm = await loadVRMFile(file)
      }

      setVrm(loadedVrm)
      setOptimizedVrm(null)
      setOptimizedStats(null)

      const stats = getModelStats(loadedVrm)
      stats.fileSize = file.size
      setOriginalStats(stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load VRM file')
    } finally {
      setIsLoading(false)
    }
  }, [useWebGPU])

  const handleOptimize = useCallback(
    async (options: OptimizationOptions) => {
      if (!vrm) return

      setIsOptimizing(true)
      setError(null)

      try {
        await optimizeVRM(vrm, options)

        const stats = getModelStats(vrm)
        setOptimizedStats(stats)
        setOptimizedVrm(vrm)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to optimize model')
      } finally {
        setIsOptimizing(false)
      }
    },
    [vrm]
  )

  const handleExport = useCallback(async () => {
    const targetVrm = optimizedVrm || vrm
    if (!targetVrm) return

    setIsExporting(true)
    setError(null)

    try {
      const buffer = await exportVRMFile(targetVrm)
      const blob = new Blob([buffer], { type: 'application/octet-stream' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = optimizedVrm ? 'optimized_' + fileName : fileName
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export VRM file')
    } finally {
      setIsExporting(false)
    }
  }, [vrm, optimizedVrm, fileName])

  const handleNewModel = useCallback(() => {
    setVrm(null)
    setOptimizedVrm(null)
    setOriginalStats(null)
    setOptimizedStats(null)
    setFileName('')
    setError(null)
  }, [])

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'optimize', label: 'Optimize', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { id: 'expressions', label: 'Expressions', icon: 'M15.182 15.182a4.5 4.5 0 010 6.364M14.02 14.02a4.5 4.5 0 010 6.364M8.818 15.182a4.5 4.5 0 000 6.364M14.5 6.5a4.5 4.5 0 01-5 0M12 8.5a2.5 2.5 0 010 5 2.5 2.5 0 010-5z' },
    { id: 'info', label: 'Info', icon: 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a1.5 1.5 0 001.063 1.063l2.836-.708a.75.75 0 01.852 1.063l-.02.041a1.5 1.5 0 01-1.206.847 28.859 28.859 0 01-7.848 0 1.5 1.5 0 01-1.206-.847l-.02-.041a.75.75 0 01.852-1.063l2.836.708a1.5 1.5 0 001.063-1.063l-.708-2.836a.75.75 0 01.852-.852zM9.75 9.75a2.25 2.25 0 114.5 0 2.25 2.25 0 01-4.5 0z' },
  ]

  if (useWebGPU === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white/60">Initializing...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <header className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h1 className="text-xl font-bold">VRM Optimizer</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-2 py-1 text-xs rounded-lg ${useWebGPU ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                {useWebGPU ? 'WebGPU' : 'WebGL'}
              </span>
              {fileName && (
                <div className="text-sm text-white/60">
                  <span className="text-white/40">Loaded:</span> {fileName}
                  {originalStats && (
                    <span className="ml-2 text-white/40">({formatFileSize(originalStats.fileSize)})</span>
                  )}
                </div>
              )}
              {vrm && (
                <button
                  onClick={handleNewModel}
                  className="px-3 py-1.5 text-sm text-white/60 hover:text-white border border-white/20 rounded-lg hover:border-white/40 transition-colors"
                >
                  New Model
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="h-[500px]">
                <VRMViewer vrm={optimizedVrm || vrm} useWebGPU={useWebGPU} />
              </div>
            </div>

            {!vrm && (
              <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
            )}
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
            {vrm && (
              <div className="flex border-b border-white/10">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-3 py-3 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                      activeTab === tab.id
                        ? 'bg-white/10 text-white border-b-2 border-blue-500'
                        : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                    </svg>
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            <div className="p-5">
              {activeTab === 'optimize' && (
                <OptimizationPanel
                  onOptimize={handleOptimize}
                  onExport={handleExport}
                  originalStats={originalStats}
                  optimizedStats={optimizedStats}
                  isOptimizing={isOptimizing}
                  isExporting={isExporting}
                  hasVrm={!!vrm}
                  hasOptimized={!!optimizedStats}
                />
              )}

              {activeTab === 'expressions' && (
                <ExpressionControls vrm={vrm} />
              )}

              {activeTab === 'info' && (
                <VRMInfo vrm={vrm} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
