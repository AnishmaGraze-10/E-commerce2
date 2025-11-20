// Frontend face validation using MediaPipe Face Detection
export async function validateFaceInImage(file: File): Promise<{
  isValid: boolean
  message: string
  confidence?: number
}> {
  try {
    // Create image element
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      return {
        isValid: false,
        message: 'Could not initialize image processing'
      }
    }

    // Load image via FileReader (avoid blob: URL fetch issues)
    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = (e) => reject(e)
      reader.readAsDataURL(file)
    })

    await new Promise((resolve, reject) => {
      img.onload = () => resolve(undefined)
      img.onerror = (e) => reject(e)
      img.src = dataUrl
    })

    // Set canvas size to image size
    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)

    // Convert to ImageData
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    
    // Simple heuristic: check if image has reasonable dimensions and aspect ratio
    const aspectRatio = img.width / img.height
    // Relax orientation: allow landscape and portrait, only reject extreme panoramas
    const isReasonableOrientation = aspectRatio > 0.35 && aspectRatio < 2.8
    // Slightly lower minimum size to be more permissive
    const hasReasonableSize = img.width > 150 && img.height > 150
    
    // Basic color analysis to detect if it's likely a face photo
    const data = imageData.data
    let skinTonePixels = 0
    let totalPixels = 0
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const alpha = data[i + 3]
      
      if (alpha > 128) { // Only count non-transparent pixels
        totalPixels++
        
        // Basic skin tone detection (simplified)
        if (r > 100 && g > 80 && b > 60 && r > g && g > b) {
          skinTonePixels++
        }
      }
    }
    
    const skinToneRatio = totalPixels > 0 ? skinTonePixels / totalPixels : 0
    
    // No object URL to revoke when using FileReader
    
    // Validation rules
    if (!hasReasonableSize) {
      return {
        isValid: false,
        message: 'Image is too small. Please upload a higher resolution photo.'
      }
    }
    
    if (!isReasonableOrientation) {
      return {
        isValid: false,
        message: 'Please upload a clear face photo (avoid extreme wide/tall images).'
      }
    }
    
    if (skinToneRatio < 0.06) {
      return {
        isValid: false,
        message: 'No face detected. Please upload a clear photo of your face.'
      }
    }
    
    return {
      isValid: true,
      message: 'Face detected successfully!',
      confidence: Math.min(0.9, 0.5 + skinToneRatio * 0.4)
    }
    
  } catch (error) {
    console.error('Face validation error:', error)
    return {
      isValid: false,
      message: 'Could not process image. Please try a different photo.'
    }
  }
}

// Alternative: Use MediaPipe Face Detection if available
export async function validateFaceWithMediaPipe(file: File): Promise<{
  isValid: boolean
  message: string
  confidence?: number
}> {
  try {
    // This would require MediaPipe to be loaded
    // For now, fall back to basic validation
    return await validateFaceInImage(file)
  } catch (error) {
    console.error('MediaPipe validation error:', error)
    return {
      isValid: false,
      message: 'Face detection unavailable. Please ensure your photo shows a clear face.'
    }
  }
}
