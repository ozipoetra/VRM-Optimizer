import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { VRMLoaderPlugin, MToonMaterialLoaderPlugin, VRM } from '@pixiv/three-vrm'
import { MToonNodeMaterial } from '@pixiv/three-vrm/nodes'
import { loadVRM } from '@webxr-jp/avatar-optimizer'
import { WebGPURenderer } from 'three/webgpu'

export async function isWebGPUSupported(): Promise<boolean> {
  try {
    if (!navigator.gpu) return false
    const adapter = await navigator.gpu.requestAdapter()
    return adapter !== null
  } catch {
    return false
  }
}

export async function createWebGPURenderer() {
  const renderer = new WebGPURenderer({ antialias: true })
  await renderer.init()
  return renderer
}

export function createWebGLRenderer() {
  return new THREE.WebGLRenderer({ antialias: true })
}

export async function loadVRMWebGL(file: File): Promise<VRM> {
  const result = await loadVRM(file)
  if (result.isErr()) {
    throw result.error
  }
  return result.value
}

export async function loadVRMWebGPU(file: File): Promise<VRM> {
  const url = URL.createObjectURL(file)

  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader()

    loader.register((parser) => {
      const mtoonMaterialPlugin = new MToonMaterialLoaderPlugin(parser, {
        materialType: MToonNodeMaterial,
      })
      return new VRMLoaderPlugin(parser, {
        mtoonMaterialPlugin,
      })
    })

    loader.load(
      url,
      (gltf) => {
        URL.revokeObjectURL(url)
        const vrm = gltf.userData.vrm as VRM
        if (!vrm) {
          reject(new Error('Failed to load VRM'))
          return
        }
        resolve(vrm)
      },
      undefined,
      (error) => {
        URL.revokeObjectURL(url)
        reject(error)
      }
    )
  })
}
