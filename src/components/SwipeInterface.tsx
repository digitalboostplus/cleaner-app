'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { motion, PanInfo } from 'framer-motion'
import { Heart, Trash2, ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react'
import { Photo } from '@/types'

interface SwipeInterfaceProps {
  photos: Photo[]
  onPhotoDeleted: (photoId: string) => void
}

export default function SwipeInterface({ photos, onPhotoDeleted }: SwipeInterfaceProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)
  const [recentlyDeleted, setRecentlyDeleted] = useState<Photo[]>([])
  const [isMounted, setIsMounted] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const currentPhoto = photos[currentIndex]
  const nextPhoto = photos[currentIndex + 1]

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!currentPhoto) return

    setSwipeDirection(direction)
    
    if (direction === 'left') {
      // Delete photo
      onPhotoDeleted(currentPhoto.id)
      setRecentlyDeleted(prev => [...prev, currentPhoto].slice(-10)) // Keep last 10 deleted
    }
    
    // Move to next photo
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1)
      setSwipeDirection(null)
    }, 300)
  }

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100
    const velocity = info.velocity.x
    
    if (Math.abs(info.offset.x) > threshold || Math.abs(velocity) > 500) {
      if (info.offset.x > 0) {
        handleSwipe('right')
      } else {
        handleSwipe('left')
      }
    }
  }

  const handleUndo = () => {
    if (recentlyDeleted.length === 0) return
    
    const lastDeleted = recentlyDeleted[recentlyDeleted.length - 1]
    setRecentlyDeleted(prev => prev.slice(0, -1))
    
    // In a real app, you'd restore the photo here
    // For now, we'll just move back one step
    setCurrentIndex(prev => Math.max(0, prev - 1))
  }

  const goToPrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex(prev => Math.min(photos.length - 1, prev + 1))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (currentIndex >= photos.length) {
    return (
      <div className="text-center py-12">
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Heart className="w-12 h-12 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">All Done!</h3>
          <p className="text-gray-600">You&apos;ve reviewed all your photos.</p>
        </div>
        <button
          onClick={() => setCurrentIndex(0)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Start Over
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Swipe to Clean</h2>
        <div className="text-sm text-gray-600">
          {currentIndex + 1} / {photos.length}
        </div>
      </div>

      <div className="relative h-96 bg-gray-100 rounded-xl overflow-hidden">
        {/* Next photo (background) */}
        {nextPhoto && (
          <div className="absolute inset-0">
            <Image
              src={nextPhoto.url}
              alt={nextPhoto.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        )}

        {/* Current photo */}
        {currentPhoto && (
          <motion.div
            ref={cardRef}
            className="absolute inset-0 bg-white rounded-xl shadow-lg overflow-hidden cursor-grab active:cursor-grabbing"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            animate={{
              x: swipeDirection === 'left' ? -400 : swipeDirection === 'right' ? 400 : 0,
              opacity: swipeDirection ? 0 : 1,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <Image
              src={currentPhoto.url}
              alt={currentPhoto.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            
            {/* Swipe indicators */}
            <div className="absolute inset-0 flex">
              <div className="flex-1 bg-red-500 bg-opacity-0 flex items-center justify-center">
                <div className="text-white text-6xl opacity-0" id="delete-indicator">
                  <Trash2 />
                </div>
              </div>
              <div className="flex-1 bg-green-500 bg-opacity-0 flex items-center justify-center">
                <div className="text-white text-6xl opacity-0" id="keep-indicator">
                  <Heart />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Photo info */}
      {currentPhoto && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold text-gray-900 truncate">{currentPhoto.name}</h3>
          <div className="flex items-center justify-between text-sm text-gray-600 mt-1">
            <span>{formatFileSize(currentPhoto.size)}</span>
            <span>{currentPhoto.createdAt.toLocaleDateString()}</span>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => handleSwipe('left')}
          className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
        >
          <Trash2 className="w-6 h-6" />
        </button>
        
        <button
          onClick={() => handleSwipe('right')}
          className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors shadow-lg"
        >
          <Heart className="w-6 h-6" />
        </button>
        
        <button
          onClick={goToNext}
          disabled={currentIndex >= photos.length - 1}
          className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Undo button */}
      <div className="text-center">
        <button
          onClick={handleUndo}
          disabled={recentlyDeleted.length === 0}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Undo ({recentlyDeleted.length})
        </button>
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
        <p>Swipe left to delete, right to keep</p>
        <p>Or use the buttons below</p>
      </div>
    </div>
  )
}