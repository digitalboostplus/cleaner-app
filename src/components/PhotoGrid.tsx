'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Trash2, Eye, Copy, Check, Camera } from 'lucide-react'
import { Photo } from '@/types'
import PhotoComparison from './PhotoComparison'
import ClientOnly from './ClientOnly'

interface PhotoGridProps {
  photos: Photo[]
  onPhotoDeleted: (photoId: string) => void
}

export default function PhotoGrid({ photos, onPhotoDeleted }: PhotoGridProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'grid' | 'duplicates'>('grid')
  const [showComparison, setShowComparison] = useState(false)
  const [comparisonPhotos, setComparisonPhotos] = useState<Photo[]>([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos(prev => {
      const newSet = new Set(prev)
      if (newSet.has(photoId)) {
        newSet.delete(photoId)
      } else {
        newSet.add(photoId)
      }
      return newSet
    })
  }

  const handleBatchDelete = () => {
    selectedPhotos.forEach(photoId => {
      onPhotoDeleted(photoId)
    })
    setSelectedPhotos(new Set())
  }

  const handleCompareGroup = (groupPhotos: Photo[]) => {
    setComparisonPhotos(groupPhotos)
    setShowComparison(true)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const duplicatePhotos = photos.filter(photo => photo.isDuplicate)
  const uniquePhotos = photos.filter(photo => !photo.isDuplicate)
  
  const groupedPhotos = duplicatePhotos.reduce((acc, photo) => {
    const group = photo.group || 'ungrouped'
    if (!acc[group]) {
      acc[group] = []
    }
    acc[group].push(photo)
    return acc
  }, {} as Record<string, Photo[]>)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between lg:items-center lg:gap-6">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Photo Library ({photos.length} photos)
          </h2>
          <div className="flex w-full flex-wrap items-stretch overflow-hidden rounded-lg border border-gray-200 sm:w-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors sm:flex-none ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All Photos
            </button>
            <button
              onClick={() => setViewMode('duplicates')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors sm:flex-none ${
                viewMode === 'duplicates'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Duplicates
            </button>
          </div>
        </div>

        {selectedPhotos.size > 0 && (
          <button
            onClick={handleBatchDelete}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 sm:w-auto"
          >
            <Trash2 className="w-4 h-4" />
            Delete Selected ({selectedPhotos.size})
          </button>
        )}
      </div>

      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className={`relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${
                selectedPhotos.has(photo.id)
                  ? 'border-blue-500 scale-95'
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              <Image
                src={photo.url}
                alt={photo.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
              />
              
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => togglePhotoSelection(photo.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selectedPhotos.has(photo.id)
                        ? 'bg-blue-600 border-blue-600'
                        : 'bg-white border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {selectedPhotos.has(photo.id) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </button>
                </div>
                
                <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onPhotoDeleted(photo.id)}
                    className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <div className="text-white text-xs">
                  <div className="font-medium truncate">{photo.name}</div>
                  <div className="text-gray-300">{formatFileSize(photo.size)}</div>
                </div>
              </div>
              
              {photo.isDuplicate && (
                <div className="absolute top-2 left-2">
                  <div className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                    <Copy className="w-3 h-3" />
                    Duplicate
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {viewMode === 'duplicates' && (
        <div className="space-y-6">
          {Object.keys(groupedPhotos).length === 0 ? (
            <div className="text-center py-12">
              <Camera className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No duplicates found</h3>
              <p className="text-gray-600">Upload more photos to detect duplicates</p>
            </div>
          ) : (
            Object.entries(groupedPhotos).map(([group, groupPhotos]) => (
              <div key={group} className="rounded-lg border p-4 sm:p-5">
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Copy className="w-5 h-5 text-orange-500" />
                    Duplicate Group ({groupPhotos.length} photos)
                  </h3>
                  <button
                    onClick={() => handleCompareGroup(groupPhotos)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:w-auto"
                  >
                    <Eye className="w-4 h-4" />
                    Compare
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
                  {groupPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden"
                    >
                      <Image
                        src={photo.url}
                        alt={photo.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      />
                      
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all">
                        <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onPhotoDeleted(photo.id)}
                            className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                        <div className="text-white text-xs">
                          <div className="font-medium truncate">{photo.name}</div>
                          <div className="text-gray-300">{formatFileSize(photo.size)}</div>
                          {photo.similarityScore && (
                            <div className="text-yellow-300">
                              {Math.round(photo.similarityScore * 100)}% similar
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      {showComparison && (
        <PhotoComparison
          photos={comparisonPhotos}
          onClose={() => setShowComparison(false)}
          onPhotoDeleted={onPhotoDeleted}
        />
      )}
    </div>
  )
}