'use client'

import { Camera, Trash2, HardDrive, TrendingUp, Copy, Clock } from 'lucide-react'
import { PhotoStats } from '@/types'

interface StatsPanelProps {
  stats: PhotoStats
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const completionPercentage = stats.totalPhotos > 0 ? (stats.processed / stats.totalPhotos) * 100 : 0
  const duplicatePercentage = stats.totalPhotos > 0 ? (stats.duplicates / stats.totalPhotos) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Cleanup Statistics</h2>
        <p className="text-gray-600">Track your photo organization progress</p>
      </div>

      {/* Main stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Photos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPhotos}</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
              <Copy className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Duplicates Found</p>
              <p className="text-2xl font-bold text-gray-900">{stats.duplicates}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Space Freed</p>
              <p className="text-2xl font-bold text-gray-900">{formatFileSize(stats.spaceFreed * 1024 * 1024)}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Processed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.processed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bars */}
      <div className="space-y-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Cleanup Progress</h3>
            <span className="text-sm text-gray-600">{completionPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {stats.processed} of {stats.totalPhotos} photos reviewed
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Duplicate Rate</h3>
            <span className="text-sm text-gray-600">{duplicatePercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${duplicatePercentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {stats.duplicates} duplicate photos found
          </p>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          {stats.processed > 0 && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Photos Processed</p>
                <p className="text-xs text-gray-600">{stats.processed} photos reviewed</p>
              </div>
            </div>
          )}
          
          {stats.duplicates > 0 && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                <Copy className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Duplicates Detected</p>
                <p className="text-xs text-gray-600">{stats.duplicates} duplicate photos found</p>
              </div>
            </div>
          )}
          
          {stats.spaceFreed > 0 && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <HardDrive className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Storage Optimized</p>
                <p className="text-xs text-gray-600">{formatFileSize(stats.spaceFreed * 1024 * 1024)} freed</p>
              </div>
            </div>
          )}
          
          {stats.processed === 0 && stats.duplicates === 0 && stats.spaceFreed === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Camera className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No activity yet. Start uploading photos to see statistics!</p>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-3">💡 Pro Tips</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Use the swipe interface for quick photo cleanup</li>
          <li>• Check the duplicates view to find similar photos</li>
          <li>• Larger files contribute more to space savings</li>
          <li>• Regular cleanup helps maintain an organized library</li>
        </ul>
      </div>
    </div>
  )
}