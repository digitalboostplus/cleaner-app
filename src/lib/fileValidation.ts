export interface ValidationResult {
  isValid: boolean
  error?: string
}

export interface ValidationConfig {
  maxFileSize: number // in bytes
  maxTotalSize: number // in bytes
  allowedTypes: string[]
}

export const DEFAULT_VALIDATION_CONFIG: ValidationConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB per file
  maxTotalSize: 100 * 1024 * 1024, // 100MB total
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'],
}

// Magic numbers (file signatures) for common image formats
const IMAGE_SIGNATURES: Record<string, number[][]> = {
  'image/jpeg': [
    [0xff, 0xd8, 0xff], // JPEG
  ],
  'image/png': [
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], // PNG
  ],
  'image/gif': [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
  ],
  'image/webp': [
    [0x52, 0x49, 0x46, 0x46, -1, -1, -1, -1, 0x57, 0x45, 0x42, 0x50], // RIFF....WEBP (-1 = any byte)
  ],
  'image/bmp': [
    [0x42, 0x4d], // BM
  ],
}

async function checkMagicNumber(file: File): Promise<boolean> {
  const signatures = IMAGE_SIGNATURES[file.type]
  if (!signatures) {
    // If we don't have a signature for this type, allow it
    return true
  }

  try {
    const buffer = await file.slice(0, 12).arrayBuffer()
    const bytes = new Uint8Array(buffer)

    // Check if any signature matches
    return signatures.some((signature) => {
      return signature.every((byte, index) => {
        // -1 in signature means "any byte"
        return byte === -1 || bytes[index] === byte
      })
    })
  } catch (error) {
    console.error('Error checking magic number:', error)
    return false
  }
}

export async function validateFile(
  file: File,
  config: ValidationConfig = DEFAULT_VALIDATION_CONFIG
): Promise<ValidationResult> {
  // Check file size
  if (file.size > config.maxFileSize) {
    return {
      isValid: false,
      error: `File "${file.name}" is too large. Maximum size is ${formatBytes(config.maxFileSize)}.`,
    }
  }

  // Check MIME type
  if (!config.allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File "${file.name}" has unsupported type: ${file.type}. Allowed types: ${config.allowedTypes.join(', ')}`,
    }
  }

  // Check magic number
  const hasValidMagicNumber = await checkMagicNumber(file)
  if (!hasValidMagicNumber) {
    return {
      isValid: false,
      error: `File "${file.name}" appears to be corrupted or is not a valid ${file.type} file.`,
    }
  }

  return { isValid: true }
}

export async function validateFiles(
  files: File[],
  config: ValidationConfig = DEFAULT_VALIDATION_CONFIG
): Promise<ValidationResult> {
  // Check total size
  const totalSize = files.reduce((sum, file) => sum + file.size, 0)
  if (totalSize > config.maxTotalSize) {
    return {
      isValid: false,
      error: `Total file size (${formatBytes(totalSize)}) exceeds maximum allowed (${formatBytes(config.maxTotalSize)}).`,
    }
  }

  // Validate each file
  for (const file of files) {
    const result = await validateFile(file, config)
    if (!result.isValid) {
      return result
    }
  }

  return { isValid: true }
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

export function isImageExtension(filename: string): boolean {
  const ext = getFileExtension(filename)
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)
}
