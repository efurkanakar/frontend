/**
 * Networking utilities for talking to the Exoplanet API, including error shaping and admin headers.
 */

export interface ApiErrorShape {
  /** Human readable message describing the failure. */
  message: string
  /** Fully qualified request URL that failed. */
  url: string
  /** HTTP status code, if the response was received. */
  status?: number
  /** HTTP status text, if the response was received. */
  statusText?: string
  /** Additional payload returned by the server (if JSON) or raw text body. */
  details?: unknown
}

/** Error type thrown by `http` when a request fails. */
export class ApiError extends Error implements ApiErrorShape {
  public readonly url: string
  public readonly status?: number
  public readonly statusText?: string
  public readonly details?: unknown

  constructor({ message, url, status, statusText, details }: ApiErrorShape) {
    super(message)
    this.name = 'ApiError'
    this.url = url
    this.status = status
    this.statusText = statusText
    this.details = details
  }
}

/** Default base URL when an explicit environment variable is not present. */
const FALLBACK_BASE_URL = 'https://exoplanet-api-lg16.onrender.com'

/** Cached environment derived base URL without trailing slash. */
export const apiBaseUrl = (() => {
  const configured = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? ''
  const normalised = configured.trim().replace(/\/$/, '')
  return normalised.length > 0 ? normalised : FALLBACK_BASE_URL
})()

/** Optional admin API key used for protected endpoints. */
export const adminApiKey = (() => {
  const configured = (import.meta.env.VITE_ADMIN_API_KEY as string | undefined)?.trim()
  return configured && configured.length > 0 ? configured : undefined
})()

/** Shared Accept header for all JSON requests. */
const defaultHeaders: HeadersInit = {
  Accept: 'application/json',
}

/**
 * Determines if the provided error is an {@link ApiError} instance.
 *
 * @param error - Any thrown error.
 * @returns True when the error originates from the HTTP client utilities.
 */
export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError

/**
 * Ensures the supplied path is absolute against the resolved API base URL.
 *
 * @param path - Relative or absolute request path.
 * @returns Fully qualified request URL.
 */
export const resolveUrl = (path: string): string =>
  path.startsWith('http://') || path.startsWith('https://') ? path : `${apiBaseUrl}${path}`

/**
 * Adds the admin key header to a given request initialiser when the key exists.
 *
 * @param init - Optional base request configuration.
 * @returns A new init object containing the `x-api-key` header when available.
 */
export const withAdminAuth = (init: RequestInit = {}): RequestInit => {
  if (!adminApiKey) {
    return init
  }

  const headers = new Headers(init.headers)
  headers.set('x-api-key', adminApiKey)

  return {
    ...init,
    headers,
  }
}

/**
 * Executes an HTTP request against the API with consistent error shaping.
 *
 * @typeParam T - Expected response payload type.
 * @param path - Relative API path or absolute URL.
 * @param init - Optional fetch configuration.
 * @throws {@link ApiError} when the request fails or the response is not `ok`.
 * @returns Parsed JSON body (or `undefined` for empty responses) cast to `T`.
 */
export const http = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const url = resolveUrl(path)
  const headers = new Headers({ ...defaultHeaders, ...Object.fromEntries(new Headers(init.headers)) })

  let response: Response
  try {
    response = await fetch(url, {
      ...init,
      headers,
    })
  } catch (error) {
    throw new ApiError({
      message: 'Failed to reach the Exoplanet API.',
      url,
      details: error instanceof Error ? error.message : error,
    })
  }

  const contentType = response.headers.get('content-type') ?? ''
  const isJson = contentType.includes('application/json')

  if (!response.ok) {
    let details: unknown
    if (isJson) {
      try {
        details = await response.json()
      } catch (error) {
        details = (error as Error)?.message
      }
    } else {
      details = await response.text()
    }

    throw new ApiError({
      message: 'The Exoplanet API returned an error response.',
      url,
      status: response.status,
      statusText: response.statusText,
      details,
    })
  }

  if (response.status === 204) {
    return undefined as T
  }

  if (!isJson) {
    const textBody = await response.text()
    return textBody as unknown as T
  }

  return (await response.json()) as T
}

/**
 * Serialises a dictionary of query parameters into a stable query string.
 *
 * @param params - Key-value map of query parameters to serialise.
 * @returns An encoded query string beginning with `?`, or an empty string.
 */
export const toQueryString = (params: unknown): string => {
  if (!params || typeof params !== 'object') {
    return ''
  }

  const entries = Object.entries(params as Record<string, unknown>).flatMap(([key, value]) => {
    if (value === undefined || value === null) {
      return []
    }

    if (typeof value === 'string') {
      const trimmed = value.trim()
      return trimmed.length > 0 ? [[key, trimmed]] : []
    }

    if (typeof value === 'number') {
      return Number.isFinite(value) ? [[key, String(value)]] : []
    }

    if (typeof value === 'boolean') {
      return value ? [[key, 'true']] : []
    }

    return [[key, String(value)]]
  })

  if (entries.length === 0) {
    return ''
  }

  const search = new URLSearchParams(entries)
  return `?${search.toString()}`
}
