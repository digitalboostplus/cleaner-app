'use client'

import { useState, useEffect, useCallback } from 'react'
import { Photo } from '@/types'
import { findDuplicates, findSimilarPhotos } from '@/lib/imageHash'

export function usePhotoAnalysis(photos: Photo[]) {
  const [duplicates, setDuplicates] = useState<Photo[]>([])
  const [similar, setSimilar] = useState<Photo[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const analyzePhotos = useCallback(async () => {
    setIsAnalyzing(true)
    setProgress(0)
    
    try {
      // Step 1: Find exact duplicates (fast)
      setProgress(25)
      const exactDuplicates = findDuplicates(photos)
      setDuplicates(exactDuplicates)
      
      // Step 2: Find similar photos using perceptual hashing (slower)
      setProgress(50)
      const similarPhotos = await findSimilarPhotos(photos, 0.85)
      setSimilar(similarPhotos)
      
      setProgress(100)
    } catch (error) {
      console.error('Error analyzing photos:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }, [photos])

  useEffect(() => {
    if (!isMounted || photos.length === 0) {
      setDuplicates([])
      setSimilar([])
      setProgress(0)
      return
    }

    analyzePhotos()
  }, [isMounted, analyzePhotos, photos.length])

  const getAllDuplicates = () => {
    const allDuplicates = [...duplicates, ...similar]
    const uniqueDuplicates = allDuplicates.filter((photo, index, self) => 
      self.findIndex(p => p.id === photo.id) === index
    )
    return uniqueDuplicates
  }

  const getDuplicateGroups = () => {
    const allDuplicates = getAllDuplicates()
    const groups: { [key: string]: Photo[] } = {}
    
    allDuplicates.forEach(photo => {
      if (photo.group) {
        if (!groups[photo.group]) {
          groups[photo.group] = []
        }
        groups[photo.group].push(photo)
      }
    })
    
    return groups
  }

  const getSpaceSavings = () => {
    const allDuplicates = getAllDuplicates()
    const totalBytes = allDuplicates.reduce((sum, photo) => sum + photo.size, 0)
    return totalBytes
  }

  return {
    duplicates,
    similar,
    isAnalyzing,
    progress,
    getAllDuplicates,
    getDuplicateGroups,
    getSpaceSavings,
    reanalyze: analyzePhotos,
  }
}