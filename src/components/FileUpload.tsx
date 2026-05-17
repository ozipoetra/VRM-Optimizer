import { useRef, useCallback } from 'react'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  isLoading: boolean
}

export function FileUpload({ onFileSelect, isLoading }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file && file.name.endsWith('.vrm')) {
        onFileSelect(file)
      }
    },
    [onFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        onFileSelect(file)
      }
    },
    [onFileSelect]
  )

  return (
    <div className="card bg-base-200 shadow-xl border border-base-300 overflow-hidden">
      <div className="card-body p-0">
        {/* Hero section */}
        <div className="hero bg-gradient-to-br from-primary/5 via-base-200 to-secondary/5 min-h-[300px] sm:min-h-[350px]">
          <div className="hero-content text-center">
            <div className="max-w-md">
              {/* Animated icon */}
              <div className="w-24 h-24 mx-auto mb-6 relative">
                <div className="absolute inset-0 rounded-3xl bg-primary/10 animate-pulse"></div>
                <div className="absolute inset-2 rounded-2xl bg-primary/20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3" />
                  </svg>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold">Upload Your VRM Model</h1>
              <p className="py-3 text-base-content/60 text-sm sm:text-base">
                Optimize your VRM avatars with texture atlas merging, mesh simplification, and KTX2 compression
              </p>

              {/* Drop zone */}
              <div
                className="mt-6 border-2 border-dashed border-base-300 rounded-2xl p-8 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => inputRef.current?.click()}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".vrm"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {isLoading ? (
                  <div className="flex flex-col items-center gap-3">
                    <span className="loading loading-spinner loading-md text-primary"></span>
                    <p className="font-medium text-sm">Loading model...</p>
                    <p className="text-xs text-base-content/50">Parsing VRM file</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2">
                      <kbd className="kbd kbd-sm">.vrm</kbd>
                      <span className="text-sm text-base-content/60">file</span>
                    </div>
                    <p className="text-sm text-base-content/50">
                      Drag & drop here or <span className="text-primary font-medium">click to browse</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs text-base-content/50">
                <div className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Texture Atlas
                </div>
                <div className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Mesh Simplify
                </div>
                <div className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  KTX2 Compression
                </div>
                <div className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  VRM0 → VRM1
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
