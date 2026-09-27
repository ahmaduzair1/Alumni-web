function canvasToJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not compress image'))),
      'image/jpeg',
      quality,
    )
  })
}

function drawScaled(bitmap: ImageBitmap, maxSide: number): HTMLCanvasElement {
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not prepare the image')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(bitmap, 0, 0, width, height)
  return canvas
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Could not read the compressed image'))
    reader.readAsDataURL(blob)
  })
}

/**
 * Shrinks a photo to a small JPEG, the same way the mobile app does.
 * The result is a short data URL (under 4,000 characters) so it can be
 * saved on the Firestore profile. Cloud Storage is not used.
 */
export async function compressToDataUrl(
  file: File,
  options: { maxSide: number; maxChars: number },
): Promise<string> {
  const bitmap = await createImageBitmap(file)
  let maxSide = Math.min(options.maxSide, Math.max(bitmap.width, bitmap.height))
  let quality = 0.6
  let url = ''

  try {
    while (maxSide >= 32) {
      const blob = await canvasToJpeg(drawScaled(bitmap, maxSide), quality)
      url = await blobToDataUrl(blob)
      if (url.length <= options.maxChars) return url
      const over = url.length / options.maxChars
      if (over > 1.6 && maxSide > 48) {
        maxSide = Math.max(48, Math.round(maxSide / Math.sqrt(over)))
        quality = 0.45
        continue
      }
      if (quality > 0.32) {
        quality = Math.round((quality - 0.1) * 100) / 100
      } else {
        maxSide = Math.max(32, Math.round(maxSide * 0.7))
        quality = 0.5
        if (maxSide === 32 && quality === 0.5) {
          const smallest = await canvasToJpeg(drawScaled(bitmap, 32), 0.3)
          url = await blobToDataUrl(smallest)
          if (url.length <= options.maxChars) return url
          break
        }
      }
    }
  } finally {
    bitmap.close()
  }

  throw new Error('Photo is still too large after compression. Try another picture.')
}
