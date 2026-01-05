import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { Photo } from '@/types'

interface PhotoCleanerDB extends DBSchema {
  photos: {
    key: string
    value: {
      id: string
      name: string
      size: number
      type: string
      blobData: Blob
      createdAt: string
      isDuplicate?: boolean
      group?: string
      similarityScore?: number
    }
  }
  sessions: {
    key: string
    value: {
      id: string
      timestamp: number
      photoCount: number
      processedCount: number
      spaceSaved: number
    }
  }
  settings: {
    key: string
    value: any
  }
}

const DB_NAME = 'photo-cleaner-db'
const DB_VERSION = 1

let dbInstance: IDBPDatabase<PhotoCleanerDB> | null = null

export async function getDB(): Promise<IDBPDatabase<PhotoCleanerDB>> {
  if (dbInstance) {
    return dbInstance
  }

  dbInstance = await openDB<PhotoCleanerDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create photos store
      if (!db.objectStoreNames.contains('photos')) {
        const photoStore = db.createObjectStore('photos', { keyPath: 'id' })
        // @ts-ignore
        photoStore.createIndex('createdAt', 'createdAt')
        // @ts-ignore
        photoStore.createIndex('isDuplicate', 'isDuplicate')
        // @ts-ignore
        photoStore.createIndex('group', 'group')
      }

      // Create sessions store
      if (!db.objectStoreNames.contains('sessions')) {
        const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' })
        // @ts-ignore
        photoStore.createIndex('timestamp', 'timestamp')
      }

      // Create settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' })
      }
    },
  })

  return dbInstance
}

// Photo operations
export async function savePhotos(photos: Photo[]): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('photos', 'readwrite')

  for (const photo of photos) {
    // Convert blob URL to actual blob for storage
    let blobData: Blob
    if (photo.file) {
      blobData = photo.file
    } else {
      // If we only have URL, fetch it
      const response = await fetch(photo.url)
      blobData = await response.blob()
    }

    await tx.store.put({
      id: photo.id,
      name: photo.name,
      size: photo.size,
      type: photo.type,
      blobData,
      createdAt: photo.createdAt.toISOString(),
      isDuplicate: photo.isDuplicate,
      group: photo.group,
      similarityScore: photo.similarityScore,
    })
  }

  await tx.done
}

export async function loadPhotos(): Promise<Photo[]> {
  const db = await getDB()
  const storedPhotos = await db.getAll('photos')

  return storedPhotos.map((stored) => {
    const url = URL.createObjectURL(stored.blobData)
    const file = new File([stored.blobData], stored.name, { type: stored.type })

    return {
      id: stored.id,
      name: stored.name,
      size: stored.size,
      type: stored.type,
      url,
      file,
      createdAt: new Date(stored.createdAt),
      isDuplicate: stored.isDuplicate,
      group: stored.group,
      similarityScore: stored.similarityScore,
    }
  })
}

export async function deletePhoto(photoId: string): Promise<void> {
  const db = await getDB()
  await db.delete('photos', photoId)
}

export async function deleteAllPhotos(): Promise<void> {
  const db = await getDB()
  await db.clear('photos')
}

export async function getPhotoCount(): Promise<number> {
  const db = await getDB()
  return await db.count('photos')
}

// Session operations
export async function saveSession(session: {
  id: string
  photoCount: number
  processedCount: number
  spaceSaved: number
}): Promise<void> {
  const db = await getDB()
  await db.put('sessions', {
    ...session,
    timestamp: Date.now(),
  })
}

export async function loadLastSession() {
  const db = await getDB()
  // @ts-ignore
  const sessions = await db.getAllFromIndex('sessions', 'timestamp')
  return sessions.length > 0 ? sessions[sessions.length - 1] : null
}

// Settings operations
export async function saveSetting(key: string, value: any): Promise<void> {
  const db = await getDB()
  await db.put('settings', { key, value })
}

export async function loadSetting<T>(key: string): Promise<T | null> {
  const db = await getDB()
  const setting = await db.get('settings', key)
  return setting ? setting.value : null
}

export async function loadAllSettings(): Promise<Record<string, any>> {
  const db = await getDB()
  const settings = await db.getAll('settings')
  return settings.reduce((acc, setting) => {
    acc[setting.key] = setting.value
    return acc
  }, {} as Record<string, any>)
}

// Utility functions
export async function getStorageSize(): Promise<number> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate()
    return estimate.usage || 0
  }
  return 0
}

export async function clearAllData(): Promise<void> {
  const db = await getDB()
  await db.clear('photos')
  await db.clear('sessions')
  await db.clear('settings')
}
