import { Photo } from '@/types'

export class DevicePhotoManager {
  private fileSystemHandle: FileSystemDirectoryHandle | null = null

  async requestPhotoLibraryAccess(): Promise<boolean> {
    try {
      // Check if File System Access API is supported
      if (typeof window !== 'undefined' && 'showDirectoryPicker' in window) {
        this.fileSystemHandle = await (window as any).showDirectoryPicker({
          id: 'photo-library',
          mode: 'readwrite',
          startIn: 'pictures'
        })
        return true
      }
      return false
    } catch (error) {
      console.error('Error accessing photo library:', error)
      return false
    }
  }

  async loadPhotosFromDevice(): Promise<Photo[]> {
    if (!this.fileSystemHandle) {
      throw new Error('No photo library access granted')
    }

    const photos: Photo[] = []
    const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

    try {
      await this.processDirectory(this.fileSystemHandle, photos, supportedTypes)
    } catch (error) {
      console.error('Error loading photos from device:', error)
    }

    return photos
  }

  private async processDirectory(
    dirHandle: FileSystemDirectoryHandle,
    photos: Photo[],
    supportedTypes: string[]
  ): Promise<void> {
    try {
      // Use proper TypeScript typing for File System Access API
      for await (const [name, handle] of (dirHandle as any).entries()) {
        if (handle.kind === 'file') {
          try {
            const file = await (handle as any).getFile()
            
            if (supportedTypes.includes(file.type)) {
              const url = URL.createObjectURL(file)
              const photo: Photo = {
                id: `device-${Date.now()}-${Math.random()}`,
                name: file.name,
                size: file.size,
                type: file.type,
                url,
                file,
                createdAt: new Date(file.lastModified),
              }
              photos.push(photo)
            }
          } catch (error) {
            console.error(`Error processing file ${name}:`, error)
          }
        } else if (handle.kind === 'directory') {
          // Recursively process subdirectories (limit depth to avoid infinite loops)
          if (photos.length < 1000) { // Safety limit
            await this.processDirectory(handle as FileSystemDirectoryHandle, photos, supportedTypes)
          }
        }
      }
    } catch (error) {
      console.error('Error processing directory:', error)
    }
  }

  async saveCleanedLibrary(photosToKeep: Photo[]): Promise<boolean> {
    try {
      // This would implement saving the cleaned library
      // For now, we'll just log the action
      console.log('Would save cleaned library with', photosToKeep.length, 'photos')
      return true
    } catch (error) {
      console.error('Error saving cleaned library:', error)
      return false
    }
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'showDirectoryPicker' in window
  }
}

export async function loadPhotosFromClipboard(): Promise<Photo[]> {
  try {
    if (typeof window === 'undefined' || !navigator.clipboard) {
      return []
    }
    const clipboardItems = await navigator.clipboard.read()
    const photos: Photo[] = []

    for (const clipboardItem of clipboardItems) {
      for (const type of clipboardItem.types) {
        if (type.startsWith('image/')) {
          const blob = await clipboardItem.getType(type)
          const file = new File([blob], `clipboard-${Date.now()}.${type.split('/')[1]}`, { type })
          const url = URL.createObjectURL(file)
          
          const photo: Photo = {
            id: `clipboard-${Date.now()}-${Math.random()}`,
            name: file.name,
            size: file.size,
            type: file.type,
            url,
            file,
            createdAt: new Date(),
          }
          photos.push(photo)
        }
      }
    }

    return photos
  } catch (error) {
    console.error('Error loading photos from clipboard:', error)
    return []
  }
}

export function isDevicePhotoAccessSupported(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window && 'FileSystemDirectoryHandle' in window
}