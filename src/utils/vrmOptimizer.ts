import { loadVRM, optimizeModel, exportVRM } from '@webxr-jp/avatar-optimizer'
import type { VRM } from '@pixiv/three-vrm'
import * as THREE from 'three'

export interface OptimizationOptions {
  migrateVRM0ToVRM1: boolean
  atlasResolution: number
  simplifyRatio: number
  textureCompression: boolean
}

export interface ModelStats {
  vertexCount: number
  triangleCount: number
  materialCount: number
  textureCount: number
  fileSize: number
}

export async function loadVRMFile(file: File) {
  const result = await loadVRM(file)
  if (result.isErr()) {
    throw result.error
  }
  return result.value
}

export async function optimizeVRM(vrm: VRM, options: OptimizationOptions) {
  try {
    const result = await optimizeModel(vrm, {
      migrateVRM0ToVRM1: options.migrateVRM0ToVRM1,
      atlas: {
        defaultResolution: options.atlasResolution,
      },
      simplify: {
        targetRatio: options.simplifyRatio,
        targetError: 0.01,
        lockBorder: true,
        uvWeight: 1.0,
        normalWeight: 0.5,
      },
    })

    if (result.isErr()) {
      throw result.error
    }
    return result.value
  } catch (err) {
    const message = err instanceof Error ? err.message : ''
    if (
      message.includes('mergeAttributes') ||
      message.includes('mergeGeometries') ||
      message.includes('array types') ||
      message.includes('skinIndex')
    ) {
      console.warn('Mesh simplification failed due to incompatible geometry, retrying without simplification...')
      try {
        const result = await optimizeModel(vrm, {
          migrateVRM0ToVRM1: options.migrateVRM0ToVRM1,
          atlas: {
            defaultResolution: options.atlasResolution,
          },
        })

        if (result.isOk()) {
          return result.value
        }
      } catch {
        console.warn('Atlas merging also failed, falling back to migration only...')
      }

      const result = await optimizeModel(vrm, {
        migrateVRM0ToVRM1: options.migrateVRM0ToVRM1,
      })

      if (result.isErr()) {
        throw result.error
      }
      return result.value
    }
    throw err
  }
}

export async function exportVRMFile(vrm: VRM) {
  const result = await exportVRM(vrm)
  if (result.isErr()) {
    throw result.error
  }
  return result.value
}

export function getModelStats(vrm: VRM): ModelStats {
  let vertexCount = 0
  let triangleCount = 0
  let materialCount = 0
  let textureCount = 0

  const materials = new Set()

  vrm.scene.traverse((obj: THREE.Object3D) => {
    if (obj instanceof THREE.Mesh) {
      const geo = obj.geometry
      if (geo.attributes.position) {
        vertexCount += geo.attributes.position.count
      }
      if (geo.index) {
        triangleCount += geo.index.count / 3
      } else if (geo.attributes.position) {
        triangleCount += geo.attributes.position.count / 3
      }
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
        mats.forEach((m: THREE.Material) => {
          if (m && !materials.has(m.name)) {
            materials.add(m.name)
            materialCount++
          }
        })
      }
    }
  })

  return {
    vertexCount,
    triangleCount: Math.floor(triangleCount),
    materialCount,
    textureCount,
    fileSize: 0,
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
