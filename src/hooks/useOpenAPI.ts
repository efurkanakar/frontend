/**
 * React Query hook wrapping retrieval of the OpenAPI document.
 */

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchOpenApiDocument } from '../api/client'
import type { OpenApiRoute } from '../api/types'

const STALE_TIME = 5 * 60_000
const GC_TIME = 30 * 60_000

/**
 * Fetches and caches the OpenAPI document routes for display in the Endpoints page.
 *
 * @returns A query resolving to the extracted routes metadata.
 */
export const useOpenApiRoutes = () =>
  useQuery<OpenApiRoute[], Error>({
    queryKey: ['openapi', 'routes'],
    queryFn: fetchOpenApiDocument,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    placeholderData: keepPreviousData,
  })
