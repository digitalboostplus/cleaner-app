import { Photo } from '@/types'

export class ImageHasher {
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null

  constructor() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      this.canvas = document.createElement('canvas')
      this.ctx = this.canvas.getContext('2d')!
    }
  }

  async generateHash(photo: Photo): Promise<string> {
    if (!this.canvas || !this.ctx) {
      throw new Error('Canvas not available in SSR environment')
    }
    
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        try {
          const hash = this.computePerceptualHash(img)
          resolve(hash)
        } catch (error) {
          reject(error)
        }
      }
      
      img.onerror = reject
      img.src = photo.url
    })
  }

  private computePerceptualHash(img: HTMLImageElement): string {
    if (!this.canvas || !this.ctx) {
      throw new Error('Canvas not available')
    }
    
    const size = 32
    this.canvas.width = size
    this.canvas.height = size
    
    // Draw image scaled to 32x32
    this.ctx.drawImage(img, 0, 0, size, size)
    
    // Get image data
    const imageData = this.ctx.getImageData(0, 0, size, size)
    const data = imageData.data
    
    // Convert to grayscale and calculate average
    const grayscale: number[] = []
    let total = 0
    
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
      grayscale.push(gray)
      total += gray
    }
    
    const average = total / grayscale.length
    
    // Create hash based on whether each pixel is above or below average
    let hash = ''
    for (let i = 0; i < grayscale.length; i++) {
      hash += grayscale[i] > average ? '1' : '0'
    }
    
    return hash
  }

  calculateSimilarity(hash1: string, hash2: string): number {
    if (hash1.length !== hash2.length) return 0
    
    let differences = 0
    for (let i = 0; i < hash1.length; i++) {
      if (hash1[i] !== hash2[i]) {
        differences++
      }
    }
    
    return 1 - (differences / hash1.length)
  }

  async generateFileHash(file: File): Promise<string> {
    if (typeof window === 'undefined' || !crypto.subtle) {
      throw new Error('Crypto API not available in SSR environment')
    }
    
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }
}

export function findDuplicates(photos: Photo[]): Photo[] {
  const hasher = new ImageHasher()
  const duplicates: Photo[] = []
  const processed = new Set<string>()
  
  for (let i = 0; i < photos.length; i++) {
    if (processed.has(photos[i].id)) continue
    
    const currentPhoto = photos[i]
    const group: Photo[] = [currentPhoto]
    
    // Find similar photos
    for (let j = i + 1; j < photos.length; j++) {
      if (processed.has(photos[j].id)) continue
      
      const comparePhoto = photos[j]
      
      // Check file size similarity (within 10%)
      const sizeDiff = Math.abs(currentPhoto.size - comparePhoto.size) / currentPhoto.size
      if (sizeDiff < 0.1) {
        group.push(comparePhoto)
        processed.add(comparePhoto.id)
      }
      
      // Check file name similarity
      if (currentPhoto.name === comparePhoto.name) {
        group.push(comparePhoto)
        processed.add(comparePhoto.id)
      }
    }
    
    if (group.length > 1) {
      // Mark all but the first as duplicates
      const groupId = `group-${Date.now()}-${Math.random()}`
      group.forEach((photo, index) => {
        if (index > 0) {
          photo.isDuplicate = true
          photo.group = groupId
          duplicates.push(photo)
        }
      })
    }
    
    processed.add(currentPhoto.id)
  }
  
  return duplicates
}

export async function findSimilarPhotos(photos: Photo[], threshold: number = 0.85): Promise<Photo[]> {
  const hasher = new ImageHasher()
  const hashes: { [key: string]: string } = {}
  const similar: Photo[] = []
  
  // Generate hashes for all photos
  for (const photo of photos) {
    try {
      hashes[photo.id] = await hasher.generateHash(photo)
    } catch (error) {
      console.error('Error generating hash for photo:', photo.name, error)
    }
  }
  
  // Compare all photos
  const processed = new Set<string>()
  
  for (let i = 0; i < photos.length; i++) {
    if (processed.has(photos[i].id)) continue
    
    const currentPhoto = photos[i]
    const currentHash = hashes[currentPhoto.id]
    if (!currentHash) continue
    
    const group: Photo[] = [currentPhoto]
    
    for (let j = i + 1; j < photos.length; j++) {
      if (processed.has(photos[j].id)) continue
      
      const comparePhoto = photos[j]
      const compareHash = hashes[comparePhoto.id]
      if (!compareHash) continue
      
      const similarity = hasher.calculateSimilarity(currentHash, compareHash)
      
      if (similarity >= threshold) {
        comparePhoto.similarityScore = similarity
        group.push(comparePhoto)
        processed.add(comparePhoto.id)
      }
    }
    
    if (group.length > 1) {
      const groupId = `similar-${Date.now()}-${Math.random()}`
      group.forEach((photo, index) => {
        if (index > 0) {
          photo.isDuplicate = true
          photo.group = groupId
          similar.push(photo)
        }
      })
    }
    
    processed.add(currentPhoto.id)
  }
  
  return similar
}