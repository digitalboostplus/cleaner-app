import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ImageHasher, findDuplicates } from '../imageHash'
import { Photo } from '@/types'

// Mock canvas in test environment
const mockCanvas = {
  width: 0,
  height: 0,
  getContext: vi.fn(() => mockContext),
}

const mockContext = {
  drawImage: vi.fn(),
  getImageData: vi.fn(() => ({
    data: new Uint8ClampedArray(32 * 32 * 4).fill(128),
  })),
  clearRect: vi.fn(),
}

global.HTMLCanvasElement = class HTMLCanvasElement {
  width = 0
  height = 0
  getContext = vi.fn(() => mockContext)
} as any

describe('imageHash', () => {
  describe('ImageHasher', () => {
    let hasher: ImageHasher

    beforeEach(() => {
      hasher = new ImageHasher()
    })

    afterEach(() => {
      hasher.destroy()
    })

    it('should create hasher instance', () => {
      expect(hasher).toBeDefined()
    })

    it('should calculate similarity between identical hashes', () => {
      const hash1 = '1010101010101010'
      const hash2 = '1010101010101010'
      expect(hasher.calculateSimilarity(hash1, hash2)).toBe(1)
    })

    it('should calculate similarity between different hashes', () => {
      const hash1 = '1111111111111111'
      const hash2 = '0000000000000000'
      expect(hasher.calculateSimilarity(hash1, hash2)).toBe(0)
    })

    it('should calculate partial similarity', () => {
      const hash1 = '11110000'
      const hash2 = '11000000'
      expect(hasher.calculateSimilarity(hash1, hash2)).toBe(0.75)
    })

    it('should clean up resources on destroy', () => {
      const hasher = new ImageHasher()
      hasher.destroy()
      // After destroy, canvas should be null
      expect(hasher['canvas']).toBeNull()
      expect(hasher['ctx']).toBeNull()
    })
  })

  describe('findDuplicates', () => {
    it('should find exact duplicates by name', () => {
      const photos: Photo[] = [
        {
          id: '1',
          name: 'photo.jpg',
          size: 1000,
          type: 'image/jpeg',
          url: 'blob:1',
          file: new File([], 'photo.jpg'),
          createdAt: new Date(),
        },
        {
          id: '2',
          name: 'photo.jpg',
          size: 1100,
          type: 'image/jpeg',
          url: 'blob:2',
          file: new File([], 'photo.jpg'),
          createdAt: new Date(),
        },
      ]

      const duplicates = findDuplicates(photos)
      expect(duplicates.length).toBeGreaterThan(0)
      expect(duplicates[0].isDuplicate).toBe(true)
      expect(duplicates[0].group).toBeDefined()
    })

    it('should find duplicates by similar size', () => {
      const photos: Photo[] = [
        {
          id: '1',
          name: 'photo1.jpg',
          size: 1000,
          type: 'image/jpeg',
          url: 'blob:1',
          file: new File([], 'photo1.jpg'),
          createdAt: new Date(),
        },
        {
          id: '2',
          name: 'photo2.jpg',
          size: 1050, // Within 10% threshold
          type: 'image/jpeg',
          url: 'blob:2',
          file: new File([], 'photo2.jpg'),
          createdAt: new Date(),
        },
      ]

      const duplicates = findDuplicates(photos)
      expect(duplicates.length).toBeGreaterThan(0)
    })

    it('should not find duplicates for different photos', () => {
      const photos: Photo[] = [
        {
          id: '1',
          name: 'photo1.jpg',
          size: 1000,
          type: 'image/jpeg',
          url: 'blob:1',
          file: new File([], 'photo1.jpg'),
          createdAt: new Date(),
        },
        {
          id: '2',
          name: 'photo2.jpg',
          size: 5000, // Different size
          type: 'image/jpeg',
          url: 'blob:2',
          file: new File([], 'photo2.jpg'),
          createdAt: new Date(),
        },
      ]

      const duplicates = findDuplicates(photos)
      expect(duplicates.length).toBe(0)
    })
  })
})
