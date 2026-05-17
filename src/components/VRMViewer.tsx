import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { VRM, VRMExpressionPresetName } from '@pixiv/three-vrm'
import { createWebGPURenderer, createWebGLRenderer } from '../utils/vrmLoader'

interface VRMViewerProps {
  vrm: VRM | null
  useWebGPU: boolean
}

export function VRMViewer({ vrm, useWebGPU }: VRMViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rendererRef = useRef<any>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const animationIdRef = useRef<number>(0)
  const currentVRMRef = useRef<VRM | null>(null)
  const clockRef = useRef<THREE.Clock>(new THREE.Clock())
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let renderer: any
    let rendererLabel = 'WebGL'

    if (useWebGPU) {
      try {
        renderer = await createWebGPURenderer()
        rendererLabel = 'WebGPU'
      } catch {
        renderer = createWebGLRenderer()
        rendererLabel = 'WebGL (fallback)'
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
    rendererRef.current = renderer as unknown as THREE.WebGLRenderer
    controlsRef.current = controls

    return { scene, camera, renderer, controls }
  }, [useWebGPU])

  useEffect(() => {
    let cleanup: (() => void) | null = null

    const init = async () => {
      const result = await setupScene()
      if (!result) return

      const { scene, camera, renderer, controls } = result

      const animate = () => {
        animationIdRef.current = requestAnimationFrame(animate)

        const delta = clockRef.current.getDelta()

        if (currentVRMRef.current) {
          currentVRMRef.current.update(delta)
        }

        controls.update()
        renderer.render(scene, camera)
      }

      animate()

      const handleResize = () => {
        if (!containerRef.current) return
        const width = containerRef.current.clientWidth
        const height = containerRef.current.clientHeight
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height)
      }

      window.addEventListener('resize', handleResize)

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
  }, [setupScene])

  useEffect(() => {
    if (!sceneRef.current) return

    if (currentVRMRef.current) {
      sceneRef.current.remove(currentVRMRef.current.scene)
      currentVRMRef.current = null
      setVrmReady(false)
    }

    if (vrm) {
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
  }, [vrm])

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full rounded-lg overflow-hidden" />
      <div className="absolute top-3 right-3 flex gap-2">
        <span className="px-2 py-1 bg-white/10 backdrop-blur-sm text-white/60 text-xs rounded-lg">
          {rendererType || '...'}
        </span>
        <button
          onClick={() => {
            if (controlsRef.current) {
              controlsRef.current.reset()
              controlsRef.current.target.set(0, 1.0, 0)
              controlsRef.current.update()
            }
          }}
          className="px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white text-sm rounded-lg hover:bg-white/20 transition-colors"
        >
          Reset Camera
        </button>
      </div>
      {!vrmReady && !vrm && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white/50">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10l-2 1m0 0l-2-1m0 0v2.5m20-7.5a2.25 2.25 0 012.25 2.25v10.5A2.25 2.25 0 0120.25 21H3.75A2.25 2.25 0 011.5 18.75V8.25A2.25 2.25 0 013.75 6h16.5z" />
            </svg>
            <p className="text-lg font-medium">Upload a VRM file to preview</p>
            <p className="text-sm mt-1">Supports .vrm format</p>
          </div>
        </div>
      )}
    </div>
  )
}
