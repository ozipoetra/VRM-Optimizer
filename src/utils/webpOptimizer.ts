import { NodeIO, Texture } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'

export interface WebPOptions {
  quality: number
  concurrency?: number
}

interface TextureTask {
  texture: Texture
  data: Uint8Array
}

async function convertSingleTexture(
  texture: Texture,
  quality: number
): Promise<TextureTask | null> {
  const mimeType = texture.getMimeType()
  if (mimeType === 'image/webp') return null

  const image = texture.getImage()
  if (!image || image.byteLength === 0) return null

  const blob = new Blob([image])
  const bitmap = await createImageBitmap(blob)

  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    return null
  }

  ctx.drawImage(bitmap, 0, 0)
  bitmap.close()

  const webpBlob = await canvas.convertToBlob({ type: 'image/webp', quality })
  if (!webpBlob) return null

  const arrayBuffer = await webpBlob.arrayBuffer()
  return { texture, data: new Uint8Array(arrayBuffer) }
}

async function runWithConcurrency<T>(
  tasks: (() => Promise<T | null>)[],
  limit: number
): Promise<(T | null)[]> {
  const results: (T | null)[] = new Array(tasks.length).fill(null)
  let index = 0

  async function worker() {
    while (index < tasks.length) {
      const currentIndex = index++
      const task = tasks[currentIndex]
      try {
        results[currentIndex] = await task()
      } catch (err) {
        console.warn('Texture conversion failed:', err)
        results[currentIndex] = null
      }
    }
  }

  const workers = Array.from({ length: Math.min(limit, tasks.length) }, () => worker())
  await Promise.all(workers)
  return results
}

export async function convertTexturesToWebP(
  vrmBuffer: ArrayBuffer,
  options: WebPOptions = { quality: 0.8 }
): Promise<ArrayBuffer> {
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
  const document = await io.readBinary(new Uint8Array(vrmBuffer))
  const root = document.getRoot()

  const textures = root.listTextures()
  const concurrency = options.concurrency ?? 4

  const tasks = textures.map(
    (texture) => () => convertSingleTexture(texture, options.quality)
  )

  const results = await runWithConcurrency(tasks, concurrency)

  for (const result of results) {
    if (result) {
      result.texture.setImage(result.data)
      result.texture.setMimeType('image/webp')
    }
  }

  const output = await io.writeBinary(document)
  return output.buffer.slice(output.byteOffset, output.byteOffset + output.byteLength)
}
