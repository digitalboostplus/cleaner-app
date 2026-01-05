import type { Metadata } from 'next'
import './globals.css'
import ClientErrorBoundary from '@/components/ClientErrorBoundary'
import BrowserCompatibility from '@/components/BrowserCompatibility'
import SettingsProviderWrapper from '@/components/SettingsProviderWrapper'
import Settings from '@/components/Settings'

export const metadata: Metadata = {
  title: 'Photo Cleaner - Smart Photo Organization',
  description: 'Clean up your photo library with AI-powered duplicate detection and smart organization',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <SettingsProviderWrapper>
          <ClientErrorBoundary>
            <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
              {children}
            </main>
            <BrowserCompatibility />
            <Settings />
          </ClientErrorBoundary>
        </SettingsProviderWrapper>
      </body>
    </html>
  )
}