// Types are flexible to tolerate minor backend variations.
export interface PlanetSummary {
  id: number | string
  name: string
  discovery_method?: string
  discovery_year?: number
  orbital_period?: number | null
  radius?: number | null
  mass?: number | null
  host_star?: string | null
  [k: string]: unknown
}

export interface DiscoveryStats {
  planet_count: number
  methods?: Record<string, number>
  orbital_period?: { min: number; max: number; mean: number; median: number }
  discovery_years?: Record<string, number>
  [k: string]: unknown
}

export interface TimelinePoint {
  year: number
  count: number
}
