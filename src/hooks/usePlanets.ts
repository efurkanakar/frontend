import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import type { PlanetSummary } from '../types'

export interface PlanetFilterState {
  q?: string
  method?: string
  min_period?: number
  max_period?: number
  limit?: number
  offset?: number
}

export function usePlanets(filters: PlanetFilterState) {
  return useQuery<{ items: PlanetSummary[]; total?: number } | PlanetSummary[], Error>({
    queryKey: ['planets', filters],
    queryFn: () => api.getPlanets(filters) as any,
    staleTime: 30_000,
  })
}
