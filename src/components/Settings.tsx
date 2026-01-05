'use client'

import { useState } from 'react'
import { Settings as SettingsIcon, X, Moon, Sun, Monitor } from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'
import { formatBytes } from '@/lib/fileValidation'

export default function Settings() {
  const [isOpen, setIsOpen] = useState(false)
  const { settings, updateSetting, resetSettings } = useSettings()

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700 z-40"
        aria-label="Open settings"
      >
        <SettingsIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            aria-label="Close settings"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => updateSetting('theme', 'light')}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                  settings.theme === 'light'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <Sun className="w-5 h-5" />
                <span className="text-sm">Light</span>
              </button>
              <button
                onClick={() => updateSetting('theme', 'dark')}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                  settings.theme === 'dark'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <Moon className="w-5 h-5" />
                <span className="text-sm">Dark</span>
              </button>
              <button
                onClick={() => updateSetting('theme', 'system')}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                  settings.theme === 'system'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <Monitor className="w-5 h-5" />
                <span className="text-sm">System</span>
              </button>
            </div>
          </div>

          {/* Similarity Threshold */}
          <div>
            <label
              htmlFor="similarity-threshold"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Similarity Threshold: {(settings.similarityThreshold * 100).toFixed(0)}%
            </label>
            <input
              id="similarity-threshold"
              type="range"
              min="50"
              max="100"
              step="5"
              value={settings.similarityThreshold * 100}
              onChange={(e) => updateSetting('similarityThreshold', parseInt(e.target.value) / 100)}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Higher values detect only very similar images. Lower values detect more variations.
            </p>
          </div>

          {/* Max File Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max File Size: {formatBytes(settings.maxFileSize)}
            </label>
            <select
              value={settings.maxFileSize}
              onChange={(e) => updateSetting('maxFileSize', parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={5 * 1024 * 1024}>5 MB</option>
              <option value={10 * 1024 * 1024}>10 MB</option>
              <option value={20 * 1024 * 1024}>20 MB</option>
              <option value={50 * 1024 * 1024}>50 MB</option>
            </select>
          </div>

          {/* Max Total Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Total Size: {formatBytes(settings.maxTotalSize)}
            </label>
            <select
              value={settings.maxTotalSize}
              onChange={(e) => updateSetting('maxTotalSize', parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={50 * 1024 * 1024}>50 MB</option>
              <option value={100 * 1024 * 1024}>100 MB</option>
              <option value={200 * 1024 * 1024}>200 MB</option>
              <option value={500 * 1024 * 1024}>500 MB</option>
            </select>
          </div>

          {/* Auto Save */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) => updateSetting('autoSave', e.target.checked)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Auto-save photos
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Automatically save your progress to browser storage
                </p>
              </div>
            </label>
          </div>

          {/* Reset Button */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={async () => {
                if (confirm('Are you sure you want to reset all settings to defaults?')) {
                  await resetSettings()
                }
              }}
              className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
