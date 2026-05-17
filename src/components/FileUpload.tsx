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
    <div
      className="card bg-base-200 shadow-xl"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => inputRef.current?.click()}
    >
      <div className="card-body items-center text-center py-12 cursor-pointer hover:bg-base-300/50 transition-colors">
        <input
          ref={inputRef}
          type="file"
          accept=".vrm"
          onChange={handleFileChange}
          className="hidden"
        />

        {isLoading ? (
          <>
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <h3 className="card-title">Loading model...</h3>
            <p className="text-base-content/60 text-sm">Parsing VRM file</p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3" />
              </svg>
            </div>
            <h3 className="card-title">Upload VRM Model</h3>
            <p className="text-base-content/60 text-sm">
              Drag & drop your <code className="badge badge-ghost badge-sm">.vrm</code> file here
            </p>
            <div className="card-actions mt-2">
              <button className="btn btn-primary btn-sm gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Browse Files
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
