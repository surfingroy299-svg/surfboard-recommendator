// Neutral performance utilities shared by all directions.
export const clampedDpr = (): number =>
  Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2)

let webglCache: boolean | null = null
export const hasWebGL = (): boolean => {
  if (webglCache !== null) return webglCache
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    webglCache = !!gl
    // release the probe context immediately — don't hold a context slot
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    webglCache = false
  }
  return webglCache
}
