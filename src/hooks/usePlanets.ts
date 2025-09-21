/**
 * React Query hooks that encapsulate planet catalogue data access patterns.
 */

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  fetchMethodCounts,
  fetchMethodStats,
  fetchDeletedPlanets,
  fetchPlanetById,
  fetchPlanetByName,
  fetchPlanetCount,
  fetchPlanetStats,
  fetchPlanetTimeline,
  listPlanets,
} from '../api/client'
import type {
  MethodCount,
  PlanetListParams,
  PlanetListResponse,
  PlanetMethodStats,
  PlanetRow,
  PlanetSortField,
  PlanetSortOrder,
  PlanetStats,
  PlanetTimelineParams,
  PlanetTimelinePoint,
} from '../api/types'

const STALE_TIME = 60_000
const GC_TIME = 10 * 60_000

const clampInteger = (value: number, minimum: number): number =>
  Math.max(minimum, Math.floor(value))

const toOptionalNumber = (value: number | undefined): number | undefined =>
  (typeof value === 'number' && Number.isFinite(value) ? value : undefined)

const toOptionalPositiveInt = (value: number | undefined, minimum: number): number | undefined => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return undefined
  }
  return clampInteger(value, minimum)
}

const toOptionalString = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

const isSortField = (value: unknown): value is PlanetSortField =>
  typeof value === 'string' &&
  [
    'id',
    'name',
    'disc_year',
    'disc_method',
    'orbperd',
    'rade',
    'masse',
    'st_teff',
    'st_rad',
    'st_mass',
    'created_at',
  ].includes(value)

const isSortOrder = (value: unknown): value is PlanetSortOrder => value === 'asc' || value === 'desc'

const normaliseListParams = (params: PlanetListParams = {}): PlanetListParams => {
  const normalised: PlanetListParams = {}

  const limit = toOptionalPositiveInt(params.limit, 1)
  if (typeof limit === 'number') {
    normalised.limit = limit
  }

  const offset = toOptionalPositiveInt(params.offset, 0)
  if (typeof offset === 'number') {
    normalised.offset = offset
  }

  const name = toOptionalString(params.name)
  if (name) {
    normalised.name = name
  }

  const method = toOptionalString(params.disc_method)
  if (method) {
    normalised.disc_method = method
  }

  const assignOptional = <K extends keyof PlanetListParams>(key: K, value: number | undefined) => {
    if (typeof value === 'number') {
      normalised[key] = value as PlanetListParams[K]
    }
  }

  assignOptional('min_year', toOptionalNumber(params.min_year))
  assignOptional('max_year', toOptionalNumber(params.max_year))
  assignOptional('min_orbperd', toOptionalNumber(params.min_orbperd))
  assignOptional('max_orbperd', toOptionalNumber(params.max_orbperd))
  assignOptional('min_rade', toOptionalNumber(params.min_rade))
  assignOptional('max_rade', toOptionalNumber(params.max_rade))
  assignOptional('min_masse', toOptionalNumber(params.min_masse))
  assignOptional('max_masse', toOptionalNumber(params.max_masse))
  assignOptional('min_st_teff', toOptionalNumber(params.min_st_teff))
  assignOptional('max_st_teff', toOptionalNumber(params.max_st_teff))
  assignOptional('min_st_rad', toOptionalNumber(params.min_st_rad))
  assignOptional('max_st_rad', toOptionalNumber(params.max_st_rad))
  assignOptional('min_st_mass', toOptionalNumber(params.min_st_mass))
  assignOptional('max_st_mass', toOptionalNumber(params.max_st_mass))

  if (params.include_deleted) {
    normalised.include_deleted = true
  }

  if (isSortField(params.sort_by)) {
    normalised.sort_by = params.sort_by
  }

  if (isSortOrder(params.sort_order)) {
    normalised.sort_order = params.sort_order
  }

  return normalised
}

/**
 * Lists planets using the provided filters with caching and pagination support.
 *
 * @param params - Filter, paging, and sorting parameters.
 * @returns A query resolving to the paginated planet response.
 */
export const usePlanetList = (params: PlanetListParams) => {
  const normalised = normaliseListParams(params)
  return useQuery<PlanetListResponse, Error>({
    queryKey: ['planets', 'list', normalised],
    queryFn: () => listPlanets(normalised),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    placeholderData: keepPreviousData,
  })
}

/**
 * Retrieves the total number of planets in the catalogue.
 *
 * @returns A query resolving to the planet count response.
 */
export const usePlanetCount = () =>
  useQuery({
    queryKey: ['planets', 'count'],
    queryFn: fetchPlanetCount,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    placeholderData: keepPreviousData,
  })

/**
 * Retrieves aggregate planet statistics used for KPI cards.
 *
 * @returns A query resolving to the planet statistics payload.
 */
export const usePlanetStats = () =>
  useQuery<PlanetStats, Error>({
    queryKey: ['planets', 'stats'],
    queryFn: fetchPlanetStats,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  })

/**
 * Retrieves planet counts grouped by discovery method.
 *
 * @returns A query resolving to an array of method/count tuples.
 */
export const useMethodCounts = () =>
  useQuery<MethodCount[], Error>({
    queryKey: ['planets', 'method-counts'],
    queryFn: fetchMethodCounts,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  })

/**
 * Retrieves the discovery timeline dataset with optional filters.
 *
 * @param params - Timeline filter options.
 * @returns A query resolving to the ordered timeline points.
 */
export const usePlanetTimeline = (params: PlanetTimelineParams) => {
  const cleaned: PlanetTimelineParams = {}
  const start = toOptionalNumber(params.start_year)
  if (typeof start === 'number') {
    cleaned.start_year = start
  }
  const end = toOptionalNumber(params.end_year)
  if (typeof end === 'number') {
    cleaned.end_year = end
  }
  if (params.include_deleted) {
    cleaned.include_deleted = true
  }

  return useQuery<PlanetTimelinePoint[], Error>({
    queryKey: ['planets', 'timeline', cleaned],
    queryFn: () => fetchPlanetTimeline(cleaned),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    placeholderData: keepPreviousData,
  })
}

/**
 * Retrieves aggregate statistics scoped to a specific discovery method.
 *
 * @param method - Discovery method identifier.
 * @returns A query resolving to method specific statistics.
 */
export const useMethodStats = (method: string | undefined) =>
  useQuery<PlanetMethodStats, Error>({
    queryKey: ['planets', 'method-stats', method?.toLowerCase().trim() ?? null],
    queryFn: () => fetchMethodStats(method ?? ''),
    enabled: Boolean(method && method.trim().length > 0),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  })

/**
 * Retrieves a planet by its numeric identifier.
 *
 * @param planetId - Numeric identifier to fetch.
 * @returns A query resolving to the matching planet row.
 */
export const usePlanetById = (planetId: number | undefined) =>
  useQuery<PlanetRow, Error>({
    queryKey: ['planets', 'by-id', planetId ?? null],
    queryFn: () => fetchPlanetById(planetId as number),
    enabled: typeof planetId === 'number' && Number.isFinite(planetId),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  })

/**
 * Retrieves a planet by its name.
 *
 * @param name - Planet name search string.
 * @returns A query resolving to the matching planet row.
 */
export const usePlanetByName = (name: string | undefined) =>
  useQuery<PlanetRow, Error>({
    queryKey: ['planets', 'by-name', name?.toLowerCase().trim() ?? null],
    queryFn: () => fetchPlanetByName(name ?? ''),
    enabled: Boolean(name && name.trim().length > 0),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  })

/**
 * Lists soft-deleted planets (admin only) when an API key is provided.
 *
 * @param enabled - Whether the admin key is configured.
 * @returns A query resolving to deleted planets.
 */
export const useDeletedPlanets = (enabled: boolean) =>
  useQuery({
    queryKey: ['planets', 'deleted'],
    queryFn: fetchDeletedPlanets,
    enabled,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  })
