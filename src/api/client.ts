/**
 * Typed API client exposing the limited set of endpoints consumed by the frontend.
 */

import { http, QueryParams, toQueryString, withAdminAuth } from './http'
import {
  DeletedPlanetSchema,
  DiscoveryHistogramSchema,
  DiscoveryMethodSchema,
  DiscoveryYearSchema,
  DiscoveryQueryParams,
  MethodCountSchema,
  OpenApiDocumentSchema,
  PlanetCountSchema,
  PlanetListParams,
  PlanetListResponse,
  PlanetListResponseSchema,
  PlanetMethodStats,
  PlanetRow,
  PlanetRowSchema,
  PlanetStats,
  PlanetStatsSchema,
  PlanetTimelineParams,
  PlanetTimelinePoint,
  PlanetTimelineSchema,
  SystemProbeResponse,
  SystemRootResponse,
} from './types'

/**
 * Fetches the friendly root message from the API to verify connectivity.
 *
 * @returns Root payload containing the welcome message.
 */
export const fetchSystemRoot = async (): Promise<SystemRootResponse> =>
  http<SystemRootResponse>('/system/root')

/**
 * Fetches the liveness probe result for diagnostics.
 *
 * @returns Health payload describing the current service status.
 */
export const fetchSystemHealth = async (): Promise<SystemProbeResponse> =>
  http<SystemProbeResponse>('/system/health')

/**
 * Fetches the readiness probe result for diagnostics.
 *
 * @returns Readiness payload containing dependency checks.
 */
export const fetchSystemReadiness = async (): Promise<SystemProbeResponse> =>
  http<SystemProbeResponse>('/system/readiness')

/**
 * Lists planets with the provided filters and pagination parameters.
 *
 * @param params - Optional filters, paging, and sorting information.
 * @returns A validated paginated response containing planet rows.
 */
export const listPlanets = async (params: PlanetListParams = {}): Promise<PlanetListResponse> => {
  const query = toQueryString(params as QueryParams)
  const payload = await http<unknown>(`/planets/${query}`)
  return PlanetListResponseSchema.parse(payload)
}

/**
 * Retrieves the total number of planets stored within the catalogue.
 *
 * @returns A normalised total count object.
 */
export const fetchPlanetCount = async () => {
  const payload = await http<unknown>('/planets/count')
  return PlanetCountSchema.parse(payload)
}

/**
 * Retrieves global aggregate statistics for key planet metrics.
 *
 * @returns Structured statistics describing ranges and averages for key metrics.
 */
export const fetchPlanetStats = async (): Promise<PlanetStats> => {
  const payload = await http<unknown>('/planets/stats')
  return PlanetStatsSchema.parse(payload)
}

/**
 * Retrieves the number of planets grouped by discovery method.
 *
 * @returns An array of method/count tuples.
 */
export const fetchMethodCounts = async () => {
  const payload = await http<unknown>('/planets/method-counts')
  return MethodCountSchema.parse(payload)
}

/**
 * Retrieves the discovery timeline dataset.
 *
 * @param params - Optional filtering options including year range and deletion inclusion.
 * @returns An ordered collection of timeline points.
 */
export const fetchPlanetTimeline = async (
  params: PlanetTimelineParams = {},
): Promise<PlanetTimelinePoint[]> => {
  const query = toQueryString(params as QueryParams)
  const payload = await http<unknown>(`/planets/timeline${query}`)
  return PlanetTimelineSchema.parse(payload)
}

/**
 * Retrieves aggregate statistics for a specific discovery method.
 *
 * @param method - Discovery method identifier (case-sensitive as stored).
 * @returns Statistics scoped to the provided method.
 */
export const fetchMethodStats = async (method: string): Promise<PlanetMethodStats> => {
  const payload = await http<unknown>(`/planets/method/${encodeURIComponent(method)}/stats`)
  return PlanetStatsSchema.parse(payload) as PlanetMethodStats
}

/**
 * Retrieves a single planet by its numeric identifier.
 *
 * @param planetId - Numeric identifier of the planet to fetch.
 * @returns Planet row containing the requested planet details.
 */
export const fetchPlanetById = async (planetId: number): Promise<PlanetRow> => {
  const payload = await http<unknown>(`/planets/${planetId}`)
  return PlanetRowSchema.parse(payload)
}

/**
 * Retrieves a single planet by its case-insensitive name.
 *
 * @param name - The name of the planet to look up.
 * @returns Planet row for the matching planet.
 */
export const fetchPlanetByName = async (name: string): Promise<PlanetRow> => {
  const payload = await http<unknown>(`/planets/by-name/${encodeURIComponent(name)}`)
  return PlanetRowSchema.parse(payload)
}

/**
 * Retrieves raw discovery datasets used by the client-side charts.
 *
 * @param params - Query options selecting the dataset and optional tuning parameters.
 * @returns The dataset payload matching the requested chart type.
 */
export const fetchDiscoveryDataset = async (params: DiscoveryQueryParams) => {
  const query = toQueryString(params as QueryParams)
  const payload = await http<unknown>(`/vis/discovery${query}`)
  switch (params.chart) {
    case 'hist':
      return DiscoveryHistogramSchema.parse(payload)
    case 'year':
      return DiscoveryYearSchema.parse(payload)
    case 'method':
      return DiscoveryMethodSchema.parse(payload)
    default:
      return payload
  }
}

/**
 * Fetches the OpenAPI document to power the Endpoints page.
 *
 * @returns A tuple containing the path, HTTP method, and summary metadata.
 */
export const fetchOpenApiDocument = async () => {
  const payload = await http<unknown>('/openapi.json')
  const document = OpenApiDocumentSchema.parse(payload)
  const routes = Object.entries(document.paths).flatMap(([path, methods]) =>
    Object.entries(methods).map(([method, details]) => ({
      path,
      method: method.toUpperCase(),
      summary: details.summary,
      description: details.description,
      tags: details.tags,
    })),
  )
  return routes
}

/**
 * Lists soft-deleted planets; requires the admin API key to be configured.
 *
 * @returns A list of deleted planets ordered by deletion time.
 */
export const fetchDeletedPlanets = async () => {
  const payload = await http<unknown>('/planets/admin/deleted', withAdminAuth())
  return DeletedPlanetSchema.parse(payload)
}
