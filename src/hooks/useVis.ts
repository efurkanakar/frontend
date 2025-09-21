/**
 * React Query hooks for visualisation datasets exposed by the API.
 */

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchDiscoveryDataset } from '../api/client'
import type {
  DiscoveryHistogram,
  DiscoveryMethodCounts,
  DiscoveryQueryParams,
  DiscoveryYearlyCounts,
} from '../api/types'

const STALE_TIME = 60_000
const GC_TIME = 10 * 60_000

const clampNumber = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))

const sanitizeBins = (bins: number | undefined): number | undefined => {
  if (typeof bins !== 'number' || !Number.isFinite(bins)) {
    return undefined
  }
  return clampNumber(Math.round(bins), 5, 200)
}

const sanitizeSigma = (sigma: number | undefined): number | undefined => {
  if (typeof sigma !== 'number' || !Number.isFinite(sigma)) {
    return undefined
  }
  return clampNumber(sigma, 0, 10)
}

const normaliseParams = (params: DiscoveryQueryParams): DiscoveryQueryParams => {
  const normalised: DiscoveryQueryParams = { chart: params.chart }
  const bins = sanitizeBins(params.bins)
  if (typeof bins === 'number') {
    normalised.bins = bins
  }
  const sigma = sanitizeSigma(params.sigma)
  if (typeof sigma === 'number') {
    normalised.sigma = sigma
  }
  return normalised
}

/**
 * Fetches the histogram dataset (Teff distribution) used on the dashboard.
 *
 * @param params - Optional configuration overriding bin and sigma defaults.
 * @returns A query resolving to the histogram dataset.
 */
export const useDiscoveryHistogram = (params: Partial<DiscoveryQueryParams> = {}) => {
  const normalised = normaliseParams({ chart: 'hist', ...params })
  return useQuery<DiscoveryHistogram, Error>({
    queryKey: ['vis', 'discovery', normalised],
    queryFn: () => fetchDiscoveryDataset(normalised) as Promise<DiscoveryHistogram>,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    placeholderData: keepPreviousData,
  })
}

/**
 * Fetches the yearly discovery dataset used for line charts.
 *
 * @returns A query resolving to an array of discovery counts per year.
 */
export const useDiscoveryYearCounts = () =>
  useQuery<DiscoveryYearlyCounts[], Error>({
    queryKey: ['vis', 'discovery', 'year'],
    queryFn: () => fetchDiscoveryDataset({ chart: 'year' }) as Promise<DiscoveryYearlyCounts[]>,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    placeholderData: keepPreviousData,
  })

/**
 * Fetches the discovery method dataset used for bar charts.
 *
 * @returns A query resolving to discovery counts grouped by method.
 */
export const useDiscoveryMethodCounts = () =>
  useQuery<DiscoveryMethodCounts[], Error>({
    queryKey: ['vis', 'discovery', 'method'],
    queryFn: () => fetchDiscoveryDataset({ chart: 'method' }) as Promise<DiscoveryMethodCounts[]>,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    placeholderData: keepPreviousData,
  })
