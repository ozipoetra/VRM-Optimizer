import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function patchThreeVrmNodes(): Plugin {
  return {
    name: 'patch-three-vrm-nodes',
    enforce: 'pre',
    transform(code, id) {
      if (id.includes('@pixiv/three-vrm') && id.includes('nodes/index.module.js')) {
        const patched = code.replace(
          /return THREE_WEBGPU\.tslFn\(jsFunc\);/,
          'return THREE_TSL.Fn(jsFunc);'
        )
        return { code: patched, map: null }
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), patchThreeVrmNodes()],
})
