const BASE = (import.meta.env.VITE_API_BASE_URL as string) ?? 'https://exoplanet-api-lg16.onrender.com'

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const url = path.startsWith('http') ? path : `${BASE}${path}`
  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`)
  }
  return res.json() as Promise<T>
}

// Guess common endpoints; adjust to your API if needed.
export const api = {
  // e.g. GET /analytics/stats
  getStats: () => http('/analytics/stats'),
  // e.g. GET /analytics/discovery/timeline
  getDiscoveryTimeline: () => http('/analytics/discovery/timeline'),
  // e.g. GET /planets?limit=50&offset=0&name=Kepler
  getPlanets: (params: Record<string, string | number | boolean | undefined> = {}) => {
    const sp = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) sp.append(k, String(v))
    })
    return http(`/planets?${sp.toString()}`)
  }
}
