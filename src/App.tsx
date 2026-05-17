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
  const [success, setSuccess] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const [activeTab, setActiveTab] = useState<TabType>('optimize')
  const [useWebGPU, setUseWebGPU] = useState<boolean | null>(null)

  useEffect(() => {
    isWebGPUSupported().then((supported) => {
      setUseWebGPU(supported)
    })
  }, [])

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null)
        setSuccess(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, success])

  const handleFileSelect = useCallback(async (file: File) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)
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
      setSuccess('Model loaded successfully!')
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
      setSuccess(null)

      try {
        await optimizeVRM(vrm, options)

        const stats = getModelStats(vrm)
        setOptimizedStats(stats)
        setOptimizedVrm(vrm)
        setSuccess('Model optimized successfully!')
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
    setSuccess(null)

    try {
      const buffer = await exportVRMFile(targetVrm)
      const blob = new Blob([buffer], { type: 'application/octet-stream' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = optimizedVrm ? 'optimized_' + fileName : fileName
      a.click()
      URL.revokeObjectURL(url)
      setSuccess('Model exported successfully!')
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
    setSuccess(null)
  }, [])

  if (useWebGPU === null) {
    return (
      <div className="min-h-screen bg-base-100 flex flex-col items-center justify-center gap-4">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-base-content/60 text-sm">Initializing renderer...</p>
      </div>
    )
  }

  return (
    <div className="drawer lg:drawer-open">
      <input id="app-drawer" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col min-h-screen bg-base-100">
        {/* Toast Notifications */}
        <div className="toast toast-top toast-end z-[100] p-4 gap-2">
          {error && (
            <div className="alert alert-error shadow-lg max-w-sm animate-slide-in">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h3 className="font-bold text-sm">Error</h3>
                <p className="text-xs">{error}</p>
              </div>
              <button className="btn btn-ghost btn-xs" onClick={() => setError(null)}>✕</button>
            </div>
          )}
          {success && (
            <div className="alert alert-success shadow-lg max-w-sm animate-slide-in">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium">{success}</p>
              </div>
              <button className="btn btn-ghost btn-xs" onClick={() => setSuccess(null)}>✕</button>
            </div>
          )}
        </div>

        {/* Navbar */}
        <div className="navbar bg-base-100 border-b border-base-200 px-4 lg:px-6 sticky top-0 z-40 shadow-sm">
          <div className="navbar-start gap-2">
            <label htmlFor="app-drawer" className="btn btn-ghost btn-square btn-sm lg:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </label>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <svg className="w-5 h-5 text-primary-content" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base font-bold leading-tight">VRM Optimizer</h1>
                <p className="text-[10px] text-base-content/40 leading-tight">Model Optimization Tool</p>
              </div>
            </div>
          </div>

          <div className="navbar-center hidden lg:flex">
            {fileName && (
              <div className="flex items-center gap-3 bg-base-200 rounded-full px-4 py-1.5">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                <span className="font-medium text-sm truncate max-w-[200px]">{fileName}</span>
                {originalStats && (
                  <span className="text-base-content/40 text-xs">{formatFileSize(originalStats.fileSize)}</span>
                )}
              </div>
            )}
          </div>

          <div className="navbar-end gap-2">
            <div className={`badge ${useWebGPU ? 'badge-success badge-outline' : 'badge-warning badge-outline'} gap-1.5 badge-sm`}>
              <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
              {useWebGPU ? 'WebGPU' : 'WebGL'}
            </div>
            {vrm && (
              <button className="btn btn-ghost btn-sm gap-1.5" onClick={handleNewModel}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">New Model</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="flex flex-col xl:flex-row gap-6 max-w-7xl mx-auto">
            {/* Viewer Section */}
            <div className="flex-1 min-w-0">
              {vrm ? (
                <div className="card bg-base-200 shadow-xl border border-base-300 overflow-hidden">
                  <div className="card-body p-3 md:p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="card-title text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        3D Preview
                      </h2>
                      <div className="badge badge-ghost badge-xs gap-1">
                        {optimizedStats ? 'Optimized' : 'Original'}
                      </div>
                    </div>
                    <div className="h-[400px] sm:h-[450px] md:h-[500px] lg:h-[550px] rounded-xl overflow-hidden bg-base-300">
                      <VRMViewer vrm={optimizedVrm || vrm} useWebGPU={useWebGPU} />
                    </div>
                  </div>
                </div>
              ) : (
                <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
              )}
            </div>

            {/* Sidebar Panel */}
            <div className="w-full xl:w-96 shrink-0">
              <div className="card bg-base-200 shadow-xl border border-base-300 sticky top-20">
                <div className="card-body p-0">
                  {/* Tabs */}
                  <div role="tablist" className="tabs tabs-lifted tabs-lg bg-base-100 rounded-t-xl">
                    <button
                      role="tab"
                      className={`tab gap-2 ${activeTab === 'optimize' ? 'tab-active [--tab-bg:var(--color-base-200)]' : ''}`}
                      onClick={() => setActiveTab('optimize')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="hidden sm:inline">Optimize</span>
                    </button>
                    <button
                      role="tab"
                      className={`tab gap-2 ${activeTab === 'expressions' ? 'tab-active [--tab-bg:var(--color-base-200)]' : ''}`}
                      onClick={() => setActiveTab('expressions')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="hidden sm:inline">Expressions</span>
                    </button>
                    <button
                      role="tab"
                      className={`tab gap-2 ${activeTab === 'info' ? 'tab-active [--tab-bg:var(--color-base-200)]' : ''}`}
                      onClick={() => setActiveTab('info')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="hidden sm:inline">Info</span>
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="p-5 min-h-[400px]">
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
        <footer className="footer footer-center p-4 bg-base-200 border-t border-base-300 text-base-content/50 text-xs">
          <aside className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gradient-to-br from-primary to-secondary rounded-md flex items-center justify-center">
              <svg className="w-3 h-3 text-primary-content" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p>VRM Optimizer — Built with React, Three.js & DaisyUI</p>
          </aside>
        </footer>
      </div>

      {/* Drawer Sidebar */}
      <div className="drawer-side z-50">
        <label htmlFor="app-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
        <div className="menu bg-base-200 min-h-full w-80 p-0">
          {/* Sidebar Header */}
          <div className="p-5 bg-gradient-to-br from-primary/10 to-secondary/10 border-b border-base-300">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                <svg className="w-7 h-7 text-primary-content" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h2 className="font-bold text-lg">VRM Optimizer</h2>
                <p className="text-xs text-base-content/50">Model Optimization Tool</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <ul className="menu menu-lg p-4 gap-1">
            <li>
              <button
                className={`gap-3 rounded-xl ${activeTab === 'optimize' ? 'active bg-primary/10 text-primary' : ''}`}
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
                className={`gap-3 rounded-xl ${activeTab === 'expressions' ? 'active bg-primary/10 text-primary' : ''}`}
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
                className={`gap-3 rounded-xl ${activeTab === 'info' ? 'active bg-primary/10 text-primary' : ''}`}
                onClick={() => { setActiveTab('info'); document.getElementById('app-drawer')?.click() }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Model Info
              </button>
            </li>
          </ul>

          <div className="divider mx-4 my-2"></div>

          {/* Model Info in Sidebar */}
          {fileName && (
            <div className="px-4 pb-4">
              <div className="card bg-base-100 border border-base-300">
                <div className="card-body p-4">
                  <h3 className="card-title text-xs text-base-content/50 uppercase tracking-wider">Current Model</h3>
                  <p className="font-semibold text-sm truncate">{fileName}</p>
                  {originalStats && (
                    <div className="flex items-center gap-3 text-xs text-base-content/50">
                      <span>{formatFileSize(originalStats.fileSize)}</span>
                      <span>·</span>
                      <span>{originalStats.vertexCount.toLocaleString()} vertices</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
