/**
 * Domain types derived from the Exoplanet API responses used by the application UI.
 */

import { z } from 'zod'

/** Response payload returned by `GET /system/root`. */
export interface SystemRootResponse {
  message: string
}

/** Response payload returned by the health and readiness probes. */
export interface SystemProbeResponse {
  status: string
  details?: Record<string, unknown>
}

/** Schema describing a single planet row used within tables. */
export const PlanetRowSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    disc_method: z.string().nullable().optional(),
    disc_year: z.number().nullable().optional(),
    orbperd: z.number().nullable().optional(),
    rade: z.number().nullable().optional(),
    masse: z.number().nullable().optional(),
    st_teff: z.number().nullable().optional(),
    st_rad: z.number().nullable().optional(),
    st_mass: z.number().nullable().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
    deleted_at: z.string().nullable().optional(),
  })
  .passthrough()

/** Planet entry as consumed by the UI table. */
export type PlanetRow = z.infer<typeof PlanetRowSchema>

/** Schema capturing the paginated response envelope for the planet list endpoint. */
export const PlanetListResponseSchema = z
  .object({
    items: z.array(PlanetRowSchema),
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
    next_offset: z.number().nullable().optional(),
    prev_offset: z.number().nullable().optional(),
    sort_by: z.string().optional(),
    sort_order: z.enum(['asc', 'desc']).optional(),
  })
  .passthrough()

/** Response payload returned when listing planets. */
export type PlanetListResponse = z.infer<typeof PlanetListResponseSchema>

/** Query parameters supported by the `GET /planets/` endpoint. */
export interface PlanetListParams {
  limit?: number
  offset?: number
  name?: string
  disc_method?: string
  min_year?: number
  max_year?: number
  min_orbperd?: number
  max_orbperd?: number
  min_rade?: number
  max_rade?: number
  min_masse?: number
  max_masse?: number
  min_st_teff?: number
  max_st_teff?: number
  min_st_rad?: number
  max_st_rad?: number
  min_st_mass?: number
  max_st_mass?: number
  include_deleted?: boolean
  sort_by?: PlanetSortField
  sort_order?: PlanetSortOrder
}

/** Available fields that can be used for sorting the planet list. */
export type PlanetSortField =
  | 'id'
  | 'name'
  | 'disc_year'
  | 'disc_method'
  | 'orbperd'
  | 'rade'
  | 'masse'
  | 'st_teff'
  | 'st_rad'
  | 'st_mass'
  | 'created_at'

/** Allowed sort orders for the list endpoint. */
export type PlanetSortOrder = 'asc' | 'desc'

/** Schema representing the payload returned by `GET /planets/count`. */
export const PlanetCountSchema = z
  .object({
    total: z.number().nonnegative(),
  })
  .or(
    z
      .object({
        count: z.number().nonnegative(),
      })
      .transform((value) => ({ total: value.count })),
  )

/** Planet count aggregated across the catalogue. */
export type PlanetCount = z.infer<typeof PlanetCountSchema>

/** Shape of a statistical entry for a numeric metric (min/max/avg/median). */
export interface PlanetStatsMetric {
  min?: number | null
  max?: number | null
  avg?: number | null
  mean?: number | null
  median?: number | null
  [key: string]: number | null | undefined
}

/** Statistical aggregates for planets and host stars. */
export interface PlanetStats {
  disc_year?: PlanetStatsMetric
  orbperd?: PlanetStatsMetric
  rade?: PlanetStatsMetric
  masse?: PlanetStatsMetric
  st_teff?: PlanetStatsMetric
  st_rad?: PlanetStatsMetric
  st_mass?: PlanetStatsMetric
  [key: string]: unknown
}

/** Payload accepted by the `POST /planets/` endpoint when creating a planet. */
export interface PlanetCreateInput {
  name: string
  disc_year?: number
  disc_method?: string
  orbperd?: number
  rade?: number
  masse?: number
  st_teff?: number
  st_rad?: number
  st_mass?: number
}

/** Schema describing the raw statistics payload. */
export const PlanetStatsSchema = z
  .record(z.string(), z.any())
  .transform((value): PlanetStats => value as PlanetStats)

/** Count of planets grouped by discovery method. */
export interface MethodCount {
  method: string
  count: number
}

/** Schema describing the method counts payload. */
export const MethodCountSchema = z
  .array(
    z
      .object({
        method: z.string(),
        count: z.number(),
      })
      .passthrough(),
  )
  .transform((items) => items as MethodCount[])

/** Discovery timeline point (year + number of planets). */
export interface PlanetTimelinePoint {
  year: number
  count: number
}

/** Optional filters accepted by the discovery timeline endpoint. */
export interface PlanetTimelineParams {
  start_year?: number
  end_year?: number
  include_deleted?: boolean
}

/** Schema validating the timeline dataset. */
export const PlanetTimelineSchema = z
  .array(
    z
      .object({
        year: z.number(),
        count: z.number(),
      })
      .passthrough(),
  )
  .transform((points) => points as PlanetTimelinePoint[])

/** Histogram dataset returned when chart=hist. */
export interface DiscoveryHistogram {
  bins: number[]
  counts: number[]
}

/** Yearly discovery dataset when chart=year. */
export interface DiscoveryYearlyCounts {
  year: number
  count: number
}

/** Method discovery dataset when chart=method. */
export interface DiscoveryMethodCounts {
  method: string
  count: number
}

/** Available chart identifiers for the visualisation endpoints. */
export type DiscoveryChartType = 'hist' | 'year' | 'method'

/** Query parameters accepted by `GET /vis/discovery`. */
export interface DiscoveryQueryParams {
  chart: DiscoveryChartType
  bins?: number
  sigma?: number
}

/** Schema validating the histogram dataset. */
export const DiscoveryHistogramSchema = z
  .object({
    bins: z.array(z.number()),
    counts: z.array(z.number()),
  })
  .passthrough()
  .transform((payload) => payload as DiscoveryHistogram)

/** Schema validating the yearly dataset. */
export const DiscoveryYearSchema = z
  .array(
    z
      .object({
        year: z.number(),
        count: z.number(),
      })
      .passthrough(),
  )
  .transform((payload) => payload as DiscoveryYearlyCounts[])

/** Schema validating the method dataset. */
export const DiscoveryMethodSchema = z
  .array(
    z
      .object({
        method: z.string(),
        count: z.number(),
      })
      .passthrough(),
  )
  .transform((payload) => payload as DiscoveryMethodCounts[])

/** Statistics scoped to a single discovery method. */
export type PlanetMethodStats = PlanetStats

/** Representation of a soft-deleted planet returned by the admin list endpoint. */
export interface DeletedPlanetRow {
  id: number
  name: string
  disc_year?: number | null
  disc_method?: string | null
  deleted_at?: string | null
  [key: string]: unknown
}

/** Schema for the admin deleted planet payload. */
export const DeletedPlanetSchema = z
  .array(
    z
      .object({
        id: z.number(),
        name: z.string(),
        disc_year: z.number().nullable().optional(),
        disc_method: z.string().nullable().optional(),
        deleted_at: z.string().nullable().optional(),
      })
      .passthrough(),
  )
  .transform((items) => items as DeletedPlanetRow[])

/** Minimal subset of an OpenAPI path item used for the endpoints table. */
export interface OpenApiRoute {
  path: string
  method: string
  summary?: string
  description?: string
  tags?: string[]
}

/** Schema used to extract routes from the OpenAPI document. */
export const OpenApiDocumentSchema = z
  .object({
    paths: z.record(
      z.string(),
      z.record(
        z.string(),
        z
          .object({
            summary: z.string().optional(),
            description: z.string().optional(),
            tags: z.array(z.string()).optional(),
          })
          .passthrough(),
      ),
    ),
  })
  .passthrough()
