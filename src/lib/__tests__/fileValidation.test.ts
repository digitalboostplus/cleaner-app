import { describe, it, expect } from 'vitest'
import {
  formatBytes,
  getFileExtension,
  isImageExtension,
  validateFile,
  DEFAULT_VALIDATION_CONFIG,
} from '../fileValidation'

describe('fileValidation', () => {
  describe('formatBytes', () => {
    it('should format bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 Bytes')
      expect(formatBytes(1024)).toBe('1 KB')
      expect(formatBytes(1024 * 1024)).toBe('1 MB')
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB')
      expect(formatBytes(1536)).toBe('1.5 KB')
    })

    it('should handle decimal places', () => {
      expect(formatBytes(1536, 0)).toBe('2 KB')
      expect(formatBytes(1536, 1)).toBe('1.5 KB')
      expect(formatBytes(1536, 2)).toBe('1.50 KB')
    })
  })

  describe('getFileExtension', () => {
    it('should extract file extension', () => {
      expect(getFileExtension('photo.jpg')).toBe('jpg')
      expect(getFileExtension('document.pdf')).toBe('pdf')
      expect(getFileExtension('archive.tar.gz')).toBe('gz')
    })

    it('should return empty string for files without extension', () => {
      expect(getFileExtension('README')).toBe('')
      expect(getFileExtension('')).toBe('')
    })

    it('should be case insensitive', () => {
      expect(getFileExtension('PHOTO.JPG')).toBe('jpg')
    })
  })

  describe('isImageExtension', () => {
    it('should identify image extensions', () => {
      expect(isImageExtension('photo.jpg')).toBe(true)
      expect(isImageExtension('image.png')).toBe(true)
      expect(isImageExtension('pic.gif')).toBe(true)
      expect(isImageExtension('photo.webp')).toBe(true)
    })

    it('should reject non-image extensions', () => {
      expect(isImageExtension('document.pdf')).toBe(false)
      expect(isImageExtension('video.mp4')).toBe(false)
      expect(isImageExtension('README')).toBe(false)
    })
  })

  describe('validateFile', () => {
    it('should reject files that are too large', async () => {
      const largeFile = new File(['x'.repeat(20 * 1024 * 1024)], 'large.jpg', {
        type: 'image/jpeg',
      })

      const result = await validateFile(largeFile)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('too large')
    })

    it('should reject files with unsupported MIME types', async () => {
      const textFile = new File(['hello'], 'test.txt', { type: 'text/plain' })

      const result = await validateFile(textFile)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('unsupported type')
    })

    it('should accept valid image files', async () => {
      // Create a small JPEG file with proper magic number
      const jpegHeader = new Uint8Array([0xff, 0xd8, 0xff, 0xe0])
      const file = new File([jpegHeader], 'test.jpg', { type: 'image/jpeg' })

      const result = await validateFile(file)
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })
  })
})
