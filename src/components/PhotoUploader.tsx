'use client'

import { useRef, useState, useEffect } from 'react'
import { Upload, Camera, AlertCircle, Folder, Clipboard } from 'lucide-react'
import { Photo } from '@/types'
import { DevicePhotoManager, loadPhotosFromClipboard, isDevicePhotoAccessSupported } from '@/lib/devicePhotos'
import ClientOnly from './ClientOnly'

interface PhotoUploaderProps {
  onPhotosUploaded: (photos: Photo[]) => void
}

export default function PhotoUploader({ onPhotosUploaded }: PhotoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deviceManager] = useState(() => new DevicePhotoManager())
  const [isDeviceSupported, setIsDeviceSupported] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setIsDeviceSupported(isDevicePhotoAccessSupported())
  }, [])

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setIsUploading(true)
    setError(null)

    try {
      const photos: Photo[] = []
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        if (!file.type.startsWith('image/')) {
          continue
        }

        const url = URL.createObjectURL(file)
        const photo: Photo = {
          id: `${Date.now()}-${i}`,
          name: file.name,
          size: file.size,
          type: file.type,
          url,
          file,
          createdAt: new Date(file.lastModified),
        }
        
        photos.push(photo)
      }

      onPhotosUploaded(photos)
    } catch (err) {
      setError('Error processing files. Please try again.')
      console.error('Upload error:', err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleDeviceAccess = async () => {
    setIsUploading(true)
    setError(null)
    
    try {
      const hasAccess = await deviceManager.requestPhotoLibraryAccess()
      if (hasAccess) {
        const photos = await deviceManager.loadPhotosFromDevice()
        onPhotosUploaded(photos)
      } else {
        setError('Unable to access device photo library')
      }
    } catch (err) {
      setError('Error accessing device photos. Please try again.')
      console.error('Device access error:', err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleClipboardPaste = async () => {
    setIsUploading(true)
    setError(null)
    
    try {
      const photos = await loadPhotosFromClipboard()
      if (photos.length > 0) {
        onPhotosUploaded(photos)
      } else {
        setError('No images found in clipboard')
      }
    } catch (err) {
      setError('Error loading from clipboard. Please try again.')
      console.error('Clipboard error:', err)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <div className="flex flex-col items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Camera className="w-8 h-8 text-blue-600" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upload Your Photos
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop your photos here, or click to select files
            </p>
            
            {isUploading && (
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Processing photos...</span>
              </div>
            )}
            
            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500">
              Supports JPG, PNG, GIF, and other image formats
            </span>
          </div>
        </div>
      </div>
      
      {/* Alternative upload methods */}
      <ClientOnly fallback={<div className="mt-6 h-24 bg-gray-50 rounded-lg animate-pulse"></div>}>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isDeviceSupported && (
            <button
              onClick={handleDeviceAccess}
              disabled={isUploading}
              className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="p-2 bg-blue-600 rounded-lg">
                <Folder className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h4 className="font-medium text-gray-900">Access Device Photos</h4>
                <p className="text-sm text-gray-600">Load photos directly from your device</p>
              </div>
            </button>
          )}
          
          <button
            onClick={handleClipboardPaste}
            disabled={isUploading}
            className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="p-2 bg-green-600 rounded-lg">
              <Clipboard className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h4 className="font-medium text-gray-900">Paste from Clipboard</h4>
              <p className="text-sm text-gray-600">Load copied images instantly</p>
            </div>
          </button>
        </div>
      </ClientOnly>

      <div className="mt-6 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Privacy Notice:</h4>
        <p>
          Your photos are processed locally in your browser. No images are uploaded to external servers.
        </p>
      </div>
    </div>
  )
}