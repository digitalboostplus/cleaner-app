'use client'

import { useState } from 'react'
import { Camera, Trash2, Sparkles, BarChart3 } from 'lucide-react'
import PhotoUploader from '@/components/PhotoUploader'
import PhotoGrid from '@/components/PhotoGrid'
import SwipeInterface from '@/components/SwipeInterface'
import StatsPanel from '@/components/StatsPanel'
import { Photo } from '@/types'
import { usePhotoAnalysis } from '@/hooks/usePhotoAnalysis'
import ClientOnly from '@/components/ClientOnly'

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [currentView, setCurrentView] = useState<'upload' | 'grid' | 'swipe' | 'stats'>('upload')
  const [processedCount, setProcessedCount] = useState(0)
  const [spaceSaved, setSpaceSaved] = useState(0)
  
  const { duplicates, isAnalyzing, progress, getAllDuplicates, getSpaceSavings } = usePhotoAnalysis(photos)

  const handlePhotosUploaded = (newPhotos: Photo[]) => {
    setPhotos(newPhotos)
    setCurrentView('grid')
  }

  const handlePhotoDeleted = (photoId: string) => {
    const deletedPhoto = photos.find(p => p.id === photoId)
    if (deletedPhoto) {
      setSpaceSaved(prev => prev + deletedPhoto.size)
    }
    setPhotos(prev => prev.filter(p => p.id !== photoId))
    setProcessedCount(prev => prev + 1)
  }

  const stats = {
    totalPhotos: photos.length,
    duplicates: getAllDuplicates().length,
    spaceFreed: Math.round(spaceSaved / (1024 * 1024)), // Convert to MB
    processed: processedCount
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <header className="mb-8 text-center sm:mb-12">
        <div className="mb-4 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
          <Camera className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800 sm:text-4xl">Photo Cleaner</h1>
        </div>
        <p className="mx-auto max-w-2xl text-base text-gray-600 sm:text-lg">
          Clean up your photo library with AI-powered duplicate detection and smart organization
        </p>
      </header>

      <nav className="mb-8 flex w-full max-w-3xl flex-wrap items-stretch justify-center gap-3 sm:gap-4">
        <button
          onClick={() => setCurrentView('upload')}
          className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors sm:w-auto sm:px-6 sm:py-3 ${
            currentView === 'upload'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Camera className="w-5 h-5" />
          Upload
        </button>
        <button
          onClick={() => setCurrentView('grid')}
          className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors sm:w-auto sm:px-6 sm:py-3 ${
            currentView === 'grid'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
          disabled={photos.length === 0}
        >
          <Sparkles className="w-5 h-5" />
          Organize
        </button>
        <button
          onClick={() => setCurrentView('swipe')}
          className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors sm:w-auto sm:px-6 sm:py-3 ${
            currentView === 'swipe'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
          disabled={photos.length === 0}
        >
          <Trash2 className="w-5 h-5" />
          Clean
        </button>
        <button
          onClick={() => setCurrentView('stats')}
          className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors sm:w-auto sm:px-6 sm:py-3 ${
            currentView === 'stats'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          Stats
        </button>
      </nav>

      <div className="rounded-xl bg-white p-4 shadow-lg sm:p-6">
        <ClientOnly>
          {isAnalyzing && (
            <div className="mb-6 bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="font-medium text-blue-900">Analyzing photos for duplicates...</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-blue-700 mt-1">{progress}% complete</p>
            </div>
          )}
        </ClientOnly>
        
        {currentView === 'upload' && (
          <PhotoUploader onPhotosUploaded={handlePhotosUploaded} />
        )}
        {currentView === 'grid' && (
          <ClientOnly fallback={<div className="h-96 bg-gray-50 rounded-lg animate-pulse"></div>}>
            <PhotoGrid photos={photos} onPhotoDeleted={handlePhotoDeleted} />
          </ClientOnly>
        )}
        {currentView === 'swipe' && (
          <ClientOnly fallback={<div className="h-96 bg-gray-50 rounded-lg animate-pulse"></div>}>
            <SwipeInterface photos={photos} onPhotoDeleted={handlePhotoDeleted} />
          </ClientOnly>
        )}
        {currentView === 'stats' && (
          <ClientOnly fallback={<div className="h-96 bg-gray-50 rounded-lg animate-pulse"></div>}>
            <StatsPanel stats={stats} />
          </ClientOnly>
        )}
      </div>
    </div>
  )
}