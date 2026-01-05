'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { saveSetting, loadAllSettings } from '@/lib/storage'

export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  similarityThreshold: number
  maxFileSize: number
  maxTotalSize: number
  autoSave: boolean
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  similarityThreshold: 0.85,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxTotalSize: 100 * 1024 * 1024, // 100MB
  autoSave: true,
}

interface SettingsContextType {
  settings: AppSettings
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>
  resetSettings: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const saved = await loadAllSettings()
        setSettings({ ...DEFAULT_SETTINGS, ...saved })
      } catch (error) {
        console.error('Error loading settings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  // Apply theme
  useEffect(() => {
    if (typeof window === 'undefined') return

    const applyTheme = () => {
      const root = document.documentElement
      let isDark = false

      if (settings.theme === 'dark') {
        isDark = true
      } else if (settings.theme === 'system') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      }

      if (isDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }

    applyTheme()

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (settings.theme === 'system') {
        applyTheme()
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [settings.theme])

  const updateSetting = async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    await saveSetting(key, value)
  }

  const resetSettings = async () => {
    setSettings(DEFAULT_SETTINGS)
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      await saveSetting(key, value)
    }
  }

  if (isLoading) {
    return null
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
