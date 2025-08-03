'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { X, ArrowLeft, ArrowRight, Trash2, Heart, Info } from 'lucide-react'
import { Photo } from '@/types'

interface PhotoComparisonProps {
  photos: Photo[]
  onClose: () => void
  onPhotoDeleted: (photoId: string) => void
}

export default function PhotoComparison({ photos, onClose, onPhotoDeleted }: PhotoComparisonProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

  const currentPhoto = photos[currentIndex]
  const nextPhoto = photos[currentIndex + 1]

  const handleNext = () => {
    if (currentIndex < photos.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleDelete = (photo: Photo) => {
    onPhotoDeleted(photo.id)
    if (photos.length === 1) {
      onClose()
    } else if (currentIndex === photos.length - 1) {
      setCurrentIndex(Math.max(0, currentIndex - 1))
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">Photo Comparison</h2>
            <span className="text-sm text-gray-600">
              {currentIndex + 1} of {photos.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main comparison area */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current photo */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={currentPhoto.url}
                  alt={currentPhoto.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2 truncate">
                  {currentPhoto.name}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Size:</span>
                    <span className="ml-2 font-medium">{formatFileSize(currentPhoto.size)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <span className="ml-2 font-medium">{currentPhoto.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <span className="ml-2 font-medium">
                      {currentPhoto.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  {currentPhoto.similarityScore && (
                    <div>
                      <span className="text-gray-600">Similarity:</span>
                      <span className="ml-2 font-medium text-orange-600">
                        {Math.round(currentPhoto.similarityScore * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete(currentPhoto)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
                <button
                  onClick={() => setSelectedPhoto(currentPhoto)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Heart className="w-4 h-4" />
                  Keep
                </button>
              </div>
            </div>

            {/* Next photo or comparison */}
            {nextPhoto && (
              <div className="space-y-4">
                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={nextPhoto.url}
                    alt={nextPhoto.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2 truncate">
                    {nextPhoto.name}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Size:</span>
                      <span className="ml-2 font-medium">{formatFileSize(nextPhoto.size)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Type:</span>
                      <span className="ml-2 font-medium">{nextPhoto.type}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Date:</span>
                      <span className="ml-2 font-medium">
                        {nextPhoto.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    {nextPhoto.similarityScore && (
                      <div>
                        <span className="text-gray-600">Similarity:</span>
                        <span className="ml-2 font-medium text-orange-600">
                          {Math.round(nextPhoto.similarityScore * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDelete(nextPhoto)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                  <button
                    onClick={() => setSelectedPhoto(nextPhoto)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                    Keep
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Info className="w-4 h-4" />
              <span>Compare photos side-by-side to choose which to keep</span>
            </div>
            
            <button
              onClick={handleNext}
              disabled={currentIndex >= photos.length - 1}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Selection confirmation */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Keep this photo?</h3>
            <p className="text-gray-600 mb-6">
              You selected &quot;{selectedPhoto.name}&quot; to keep. Continue with comparison?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedPhoto(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setSelectedPhoto(null)
                  handleNext()
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}