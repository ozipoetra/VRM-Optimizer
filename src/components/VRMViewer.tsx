import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { VRM, VRMExpressionPresetName } from '@pixiv/three-vrm'
import { createWebGPURenderer, createWebGLRenderer } from '../utils/vrmLoader'

interface VRMViewerProps {
  vrm: VRM | null
  useWebGPU: boolean
  isPaused: boolean
}

export function VRMViewer({ vrm, useWebGPU, isPaused }: VRMViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<any>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const animationIdRef = useRef<number>(0)
  const currentVRMRef = useRef<VRM | null>(null)
  const timerRef = useRef<THREE.Timer>(new THREE.Timer())
  const [vrmReady, setVrmReady] = useState(false)
  const [rendererType, setRendererType] = useState<string>('')

  const setupScene = useCallback(async () => {
    if (!containerRef.current) return null

    const width = containerRef.current.clientWidth
    const height = containerRef.current.clientHeight

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1a1a2e)

    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 1000)
    camera.position.set(0, 1.3, 3)

    let renderer: any
    let rendererLabel = 'WebGL'

    if (useWebGPU) {
      try {
        renderer = await createWebGPURenderer()
        rendererLabel = 'WebGPU'
      } catch {
        renderer = createWebGLRenderer()
        rendererLabel = 'WebGL'
      }
    } else {
      renderer = createWebGLRenderer()
    }

    setRendererType(rendererLabel)

    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0

    containerRef.current.innerHTML = ''
    containerRef.current.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 1.0, 0)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 0.5
    controls.maxDistance = 10
    controls.maxPolarAngle = Math.PI * 0.9
    controls.update()

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2)
    dirLight.position.set(5, 8, 5)
    scene.add(dirLight)

    const dirLight2 = new THREE.DirectionalLight(0x8888ff, 0.4)
    dirLight2.position.set(-5, 3, -5)
    scene.add(dirLight2)

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.3)
    scene.add(hemiLight)

    const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222)
    scene.add(gridHelper)

    sceneRef.current = scene
    cameraRef.current = camera
    rendererRef.current = renderer
    controlsRef.current = controls

    return { scene, camera, renderer, controls }
  }, [useWebGPU])

  const animateRef = useRef<(() => void) | null>(null)

  const startAnimation = useCallback(() => {
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)

      if (isPaused) return

      const delta = timerRef.current.getDelta()

      if (currentVRMRef.current) {
        currentVRMRef.current.update(delta)
      }

      if (controlsRef.current) {
        controlsRef.current.update()
      }
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }
    }

    animateRef.current = animate
    animate()
  }, [isPaused])

  useEffect(() => {
    let cleanup: (() => void) | null = null

    const init = async () => {
      const result = await setupScene()
      if (!result) return

      const { camera, renderer, controls } = result

      const handleResize = () => {
        if (!containerRef.current) return
        const width = containerRef.current.clientWidth
        const height = containerRef.current.clientHeight
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height)
      }

      window.addEventListener('resize', handleResize)

      if (!isPaused) {
        startAnimation()
      }

      cleanup = () => {
        cancelAnimationFrame(animationIdRef.current)
        window.removeEventListener('resize', handleResize)
        controls.dispose()
        renderer.dispose()
      }
    }

    init()

    return () => {
      cleanup?.()
    }
  }, [setupScene, startAnimation, isPaused])

  useEffect(() => {
    if (isPaused) {
      cancelAnimationFrame(animationIdRef.current)
      animationIdRef.current = 0
    } else if (animateRef.current) {
      animateRef.current()
    }
  }, [isPaused])

  useEffect(() => {
    if (!sceneRef.current) return

    if (currentVRMRef.current) {
      sceneRef.current.remove(currentVRMRef.current.scene)
      currentVRMRef.current = null
      setVrmReady(false)
    }

    if (vrm && !isPaused) {
      sceneRef.current.add(vrm.scene)
      currentVRMRef.current = vrm

      vrm.scene.traverse((obj: THREE.Object3D) => {
        if (obj instanceof THREE.Mesh) {
          obj.castShadow = true
          obj.receiveShadow = true
        }
      })

      const hipsNode = vrm.humanoid?.getNormalizedBoneNode('hips')
      if (hipsNode && controlsRef.current) {
        const hipsPosition = new THREE.Vector3()
        hipsNode.getWorldPosition(hipsPosition)
        controlsRef.current.target.set(0, hipsPosition.y * 0.5, 0)
        controlsRef.current.update()
      }

      if (vrm.expressionManager) {
        const presetNames = Object.values(VRMExpressionPresetName)
        presetNames.forEach((preset) => {
          vrm.expressionManager!.setValue(preset, 0)
        })
      }

      setVrmReady(true)
    }
  }, [vrm, isPaused])

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {/* Paused overlay */}
      {isPaused && (
        <div className="absolute inset-0 bg-base-300/90 backdrop-blur-sm flex flex-col items-center justify-center z-10">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-base font-semibold">Preview Paused</p>
          <p className="text-sm text-base-content/60 mt-1">Resuming after optimization...</p>
        </div>
      )}

      {/* Top controls */}
      {!isPaused && (
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="mockup-window bg-base-300/80 backdrop-blur-sm">
            <div className="flex items-center gap-1 px-3 py-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-error/70"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-warning/70"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-success/70"></div>
            </div>
          </div>
          <div className={`badge ${rendererType === 'WebGPU' ? 'badge-success badge-outline' : 'badge-warning badge-outline'} gap-1.5`}>
            <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
            {rendererType || '...'}
          </div>
        </div>

        <button
          onClick={() => {
            if (controlsRef.current) {
              controlsRef.current.reset()
              controlsRef.current.target.set(0, 1.0, 0)
              controlsRef.current.update()
            }
          }}
          className="btn btn-sm btn-ghost bg-base-300/80 backdrop-blur-sm gap-1.5 hover:bg-base-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset
        </button>
        </div>
      )}

      {/* Bottom info */}
      {vrm && !isPaused && (
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div className="badge badge-ghost bg-base-300/80 backdrop-blur-sm gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            Drag to rotate · Scroll to zoom
          </div>
        </div>
      )}

      {/* Empty state */}
      {!vrmReady && !vrm && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-base-300 to-base-200">
          <div className="text-center text-base-content/50">
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-base-100/50 backdrop-blur-sm flex items-center justify-center shadow-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-lg font-semibold">Upload a VRM file</p>
            <p className="text-sm mt-1">Drag & drop or browse to preview</p>
          </div>
        </div>
      )}
    </div>
  )
}
