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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4">
      <div className="flex w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white shadow-xl max-h-[90vh]">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">Photo Comparison</h2>
            <span className="text-sm text-gray-600">
              {currentIndex + 1} of {photos.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main comparison area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={() => handleDelete(currentPhoto)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 sm:flex-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
                <button
                  onClick={() => setSelectedPhoto(currentPhoto)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 sm:flex-1"
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

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={() => handleDelete(nextPhoto)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 sm:flex-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                  <button
                    onClick={() => setSelectedPhoto(nextPhoto)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 sm:flex-1"
                  >
                    <Heart className="w-4 h-4" />
                    Keep
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center justify-center gap-2 text-center text-sm text-gray-600">
              <Info className="w-4 h-4" />
              <span>Compare photos side-by-side to choose which to keep</span>
            </div>

            <button
              onClick={handleNext}
              disabled={currentIndex >= photos.length - 1}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
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