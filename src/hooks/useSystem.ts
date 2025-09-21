/**
 * React Query hooks for service diagnostics endpoints (root, health, readiness).
 */

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchSystemHealth, fetchSystemReadiness, fetchSystemRoot } from '../api/client'
import type { SystemProbeResponse, SystemRootResponse } from '../api/types'

const STALE_TIME = 30_000
const GC_TIME = 5 * 60_000

/**
 * Fetches the `/system/root` message to confirm the API is reachable.
 *
 * @returns A query containing the welcome message payload.
 */
export const useSystemRoot = () =>
  useQuery<SystemRootResponse, Error>({
    queryKey: ['system', 'root'],
    queryFn: fetchSystemRoot,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    placeholderData: keepPreviousData,
  })

/**
 * Fetches the `/system/health` liveness probe.
 *
 * @returns A query representing the liveness response payload.
 */
export const useSystemHealth = () =>
  useQuery<SystemProbeResponse, Error>({
    queryKey: ['system', 'health'],
    queryFn: fetchSystemHealth,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    placeholderData: keepPreviousData,
  })

/**
 * Fetches the `/system/readiness` probe that verifies dependencies.
 *
 * @returns A query capturing the readiness response payload.
 */
export const useSystemReadiness = () =>
  useQuery<SystemProbeResponse, Error>({
    queryKey: ['system', 'readiness'],
    queryFn: fetchSystemReadiness,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    placeholderData: keepPreviousData,
  })
