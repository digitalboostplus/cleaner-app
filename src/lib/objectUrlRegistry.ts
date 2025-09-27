const trackedObjectUrls = new Set<string>()

export function registerObjectUrl(url: string) {
  trackedObjectUrls.add(url)
}

export function revokeObjectUrl(url: string) {
  if (typeof window === 'undefined') {
    return
  }

  if (trackedObjectUrls.has(url)) {
    URL.revokeObjectURL(url)
    trackedObjectUrls.delete(url)
  }
}

export function revokeObjectUrls(urls: Iterable<string>) {
  for (const url of urls) {
    revokeObjectUrl(url)
  }
}

export function clearObjectUrls() {
  if (typeof window === 'undefined') {
    trackedObjectUrls.clear()
    return
  }

  trackedObjectUrls.forEach((url) => URL.revokeObjectURL(url))
  trackedObjectUrls.clear()
}
