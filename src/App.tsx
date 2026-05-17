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

  if (useWebGPU === null) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }

  return (
    <div className="drawer lg:drawer-open">
      <input id="app-drawer" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col min-h-screen">
        {/* Navbar */}
        <div className="navbar bg-base-200 border-b border-base-300 px-4 sticky top-0 z-50">
          <div className="navbar-start">
            <label htmlFor="app-drawer" className="btn btn-ghost lg:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </label>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-content" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-lg font-bold hidden sm:block">VRM Optimizer</h1>
            </div>
          </div>

          <div className="navbar-center hidden lg:flex">
            {fileName && (
              <div className="flex items-center gap-2">
                <span className="text-base-content/60 text-sm">Loaded:</span>
                <span className="font-medium text-sm">{fileName}</span>
                {originalStats && (
                  <span className="text-base-content/40 text-sm">({formatFileSize(originalStats.fileSize)})</span>
                )}
              </div>
            )}
          </div>

          <div className="navbar-end gap-2">
            <div className={`badge ${useWebGPU ? 'badge-success badge-outline' : 'badge-warning badge-outline'} gap-1`}>
              <div className="w-2 h-2 rounded-full bg-current"></div>
              {useWebGPU ? 'WebGPU' : 'WebGL'}
            </div>
            {vrm && (
              <button className="btn btn-ghost btn-sm gap-1" onClick={handleNewModel}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">New Model</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          {error && (
            <div role="alert" className="alert alert-error mb-4 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">{error}</span>
              <button className="btn btn-ghost btn-xs" onClick={() => setError(null)}>Dismiss</button>
            </div>
          )}

          <div className="flex flex-col xl:flex-row gap-6">
            {/* Viewer Section */}
            <div className="flex-1 space-y-4">
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body p-3 md:p-4">
                  <div className="h-[400px] sm:h-[500px] md:h-[550px]">
                    <VRMViewer vrm={optimizedVrm || vrm} useWebGPU={useWebGPU} />
                  </div>
                </div>
              </div>

              {!vrm && (
                <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
              )}
            </div>

            {/* Sidebar Panel - visible on mobile as inline section */}
            <div className="w-full xl:w-80 shrink-0">
              <div className="card bg-base-200 shadow-xl sticky top-20">
                <div className="card-body p-0">
                  {/* Tabs */}
                  <div role="tablist" className="tabs tabs-boxed tabs-lg bg-base-300 rounded-t-xl">
                    <button
                      role="tab"
                      className={`tab gap-2 ${activeTab === 'optimize' ? 'tab-active' : ''}`}
                      onClick={() => setActiveTab('optimize')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="hidden sm:inline">Optimize</span>
                    </button>
                    <button
                      role="tab"
                      className={`tab gap-2 ${activeTab === 'expressions' ? 'tab-active' : ''}`}
                      onClick={() => setActiveTab('expressions')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="hidden sm:inline">Expressions</span>
                    </button>
                    <button
                      role="tab"
                      className={`tab gap-2 ${activeTab === 'info' ? 'tab-active' : ''}`}
                      onClick={() => setActiveTab('info')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="hidden sm:inline">Info</span>
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="p-4">
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
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="footer footer-center p-4 bg-base-200 border-t border-base-300 text-base-content/60 text-sm">
          <aside>
            <p>VRM Optimizer — Built with React, Three.js & DaisyUI</p>
          </aside>
        </footer>
      </div>

      {/* Drawer Sidebar */}
      <div className="drawer-side z-50">
        <label htmlFor="app-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
        <div className="menu bg-base-200 min-h-full w-72 p-4">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-content" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-lg">VRM Optimizer</h2>
              <p className="text-xs text-base-content/50">Model Optimization Tool</p>
            </div>
          </div>

          <div className="divider my-2"></div>

          <ul className="menu menu-lg gap-1">
            <li>
              <button
                className={`gap-3 ${activeTab === 'optimize' ? 'active' : ''}`}
                onClick={() => { setActiveTab('optimize'); document.getElementById('app-drawer')?.click() }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Optimize
              </button>
            </li>
            <li>
              <button
                className={`gap-3 ${activeTab === 'expressions' ? 'active' : ''}`}
                onClick={() => { setActiveTab('expressions'); document.getElementById('app-drawer')?.click() }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Expressions
              </button>
            </li>
            <li>
              <button
                className={`gap-3 ${activeTab === 'info' ? 'active' : ''}`}
                onClick={() => { setActiveTab('info'); document.getElementById('app-drawer')?.click() }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Model Info
              </button>
            </li>
          </ul>

          <div className="divider my-2"></div>

          {fileName && (
            <div className="px-2">
              <p className="text-xs text-base-content/50 mb-1">Current Model</p>
              <p className="text-sm font-medium truncate">{fileName}</p>
              {originalStats && (
                <p className="text-xs text-base-content/40">{formatFileSize(originalStats.fileSize)}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
