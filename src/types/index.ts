export interface Photo {
  id: string
  name: string
  size: number
  type: string
  url: string
  file: File
  hash?: string
  createdAt: Date
  isDeleted?: boolean
  isDuplicate?: boolean
  similarityScore?: number
  group?: string
}

export interface PhotoStats {
  totalPhotos: number
  duplicates: number
  spaceFreed: number
  processed: number
}

export interface DuplicateGroup {
  hash: string
  photos: Photo[]
  recommended?: Photo
}