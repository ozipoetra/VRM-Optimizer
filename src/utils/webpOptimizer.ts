import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'

export interface WebPOptions {
  quality: number
}

export async function convertTexturesToWebP(
  vrmBuffer: ArrayBuffer,
  options: WebPOptions = { quality: 0.8 }
): Promise<ArrayBuffer> {
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
  const document = await io.readBinary(new Uint8Array(vrmBuffer))
  const root = document.getRoot()

  const textures = root.listTextures()
  const converted: { texture: ReturnType<typeof root.listTextures>[number]; data: Uint8Array }[] = []

  for (const texture of textures) {
    const mimeType = texture.getMimeType()
    if (mimeType === 'image/webp') continue

    const image = texture.getImage()
    if (!image || image.byteLength === 0) continue

    try {
      const blob = new Blob([image])
      const bitmap = await createImageBitmap(blob)

      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        bitmap.close()
        continue
      }

      ctx.drawImage(bitmap, 0, 0)
      bitmap.close()

      const webpBlob = await new Promise<Blob | null>((resolve) => {
        canvas.convertToBlob({ type: 'image/webp', quality: options.quality }).then(resolve)
      })

      if (!webpBlob) continue

      const arrayBuffer = await webpBlob.arrayBuffer()
      converted.push({ texture, data: new Uint8Array(arrayBuffer) })
    } catch (err) {
      console.warn('Failed to convert texture to WebP:', texture.getName(), err)
    }
  }

  for (const { texture, data } of converted) {
    texture.setImage(data)
    texture.setMimeType('image/webp')
  }

  const output = await io.writeBinary(document)
  return output.buffer.slice(output.byteOffset, output.byteOffset + output.byteLength)
}
