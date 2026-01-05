'use client'

import { SettingsProvider } from '@/contexts/SettingsContext'

export default function SettingsProviderWrapper({ children }: { children: React.ReactNode }) {
  return <SettingsProvider>{children}</SettingsProvider>
}
