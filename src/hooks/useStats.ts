import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import type { DiscoveryStats, TimelinePoint } from '../types'

export function useDiscoveryStats() {
  return useQuery<DiscoveryStats, Error>({
    queryKey: ['stats'],
    queryFn: api.getStats
  })
}

export function useDiscoveryTimeline() {
  return useQuery<TimelinePoint[], Error>({
    queryKey: ['timeline'],
    queryFn: api.getDiscoveryTimeline
  })
}
