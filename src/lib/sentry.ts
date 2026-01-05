/**
 * Sentry Error Monitoring Configuration
 *
 * To enable Sentry error tracking:
 * 1. Install @sentry/nextjs: npm install @sentry/nextjs
 * 2. Set NEXT_PUBLIC_SENTRY_DSN environment variable
 * 3. Import and call initSentry() in your app
 *
 * For now, this is a placeholder configuration.
 */

export function initSentry() {
  if (typeof window === 'undefined') return

  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

  if (!dsn) {
    console.info('Sentry DSN not configured. Error monitoring disabled.')
    return
  }

  try {
    // @ts-ignore - Sentry will be available if installed
    if (window.Sentry) {
      // @ts-ignore
      window.Sentry.init({
        dsn,
        environment: process.env.NODE_ENV,
        tracesSampleRate: 1.0,
        beforeSend(event: any, hint: any) {
          // Don't send errors in development
          if (process.env.NODE_ENV === 'development') {
            console.error('Sentry would send:', event, hint)
            return null
          }
          return event
        },
      })

      console.info('Sentry error monitoring initialized')
    }
  } catch (error) {
    console.error('Failed to initialize Sentry:', error)
  }
}

export function captureException(error: Error, context?: Record<string, any>) {
  console.error('Error captured:', error, context)

  if (typeof window !== 'undefined' && (window as any).Sentry) {
    ;(window as any).Sentry.captureException(error, {
      extra: context,
    })
  }
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  console.log(`[${level.toUpperCase()}]`, message)

  if (typeof window !== 'undefined' && (window as any).Sentry) {
    ;(window as any).Sentry.captureMessage(message, level)
  }
}
