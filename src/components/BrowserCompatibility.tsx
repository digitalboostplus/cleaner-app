'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface BrowserCapabilities {
  hasIndexedDB: boolean
  hasFileSystemAccess: boolean
  hasClipboardAPI: boolean
  hasWebCrypto: boolean
  hasCanvas: boolean
}

export default function BrowserCompatibility() {
  const [capabilities, setCapabilities] = useState<BrowserCapabilities | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [hasCriticalIssues, setHasCriticalIssues] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const caps: BrowserCapabilities = {
      hasIndexedDB: 'indexedDB' in window,
      hasFileSystemAccess: 'showDirectoryPicker' in window,
      hasClipboardAPI: 'clipboard' in navigator && 'read' in navigator.clipboard,
      hasWebCrypto: 'crypto' in window && 'subtle' in window.crypto,
      hasCanvas: (() => {
        try {
          const canvas = document.createElement('canvas')
          return !!(canvas.getContext && canvas.getContext('2d'))
        } catch (e) {
          return false
        }
      })(),
    }

    setCapabilities(caps)

    // Check for critical issues (features required for basic functionality)
    const critical = !caps.hasIndexedDB || !caps.hasCanvas
    setHasCriticalIssues(critical)
  }, [])

  if (!capabilities || !isVisible) return null

  const warnings: string[] = []

  if (!capabilities.hasIndexedDB) {
    warnings.push('IndexedDB is not supported. Your photos will not be saved between sessions.')
  }

  if (!capabilities.hasCanvas) {
    warnings.push('Canvas API is not supported. Duplicate detection will not work.')
  }

  if (!capabilities.hasFileSystemAccess) {
    warnings.push('File System Access API is not supported. You can still upload photos via drag & drop or file picker.')
  }

  if (!capabilities.hasClipboardAPI) {
    warnings.push('Clipboard API is not fully supported. Paste from clipboard may not work.')
  }

  if (!capabilities.hasWebCrypto) {
    warnings.push('Web Crypto API is not supported. Some features may not work correctly.')
  }

  if (warnings.length === 0) return null

  return (
    <div
      className={`fixed bottom-4 right-4 left-4 md:left-auto md:max-w-md bg-white rounded-lg shadow-lg border-2 z-50 ${
        hasCriticalIssues ? 'border-red-500' : 'border-yellow-500'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full flex-shrink-0 ${
            hasCriticalIssues ? 'bg-red-100' : 'bg-yellow-100'
          }`}>
            <AlertTriangle className={`w-5 h-5 ${
              hasCriticalIssues ? 'text-red-600' : 'text-yellow-600'
            }`} />
          </div>

          <div className="flex-1">
            <h3 className={`font-semibold mb-2 ${
              hasCriticalIssues ? 'text-red-900' : 'text-yellow-900'
            }`}>
              {hasCriticalIssues ? 'Browser Compatibility Issues' : 'Limited Browser Support'}
            </h3>

            <ul className="text-sm text-gray-700 space-y-1">
              {warnings.map((warning, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>

            <p className="text-xs text-gray-600 mt-3">
              For the best experience, please use{' '}
              <strong>Chrome 86+</strong> or <strong>Edge 86+</strong>.
            </p>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="Close warning"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  )
}
