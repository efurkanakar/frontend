import { useMemo, useState } from 'react'
import { usePlanets } from '../hooks/usePlanets'
import PlanetTable from '../components/PlanetTable'

export default function PlanetsPage() {
  const [q, setQ] = useState('')
  const [method, setMethod] = useState('')
  const [minP, setMinP] = useState<string>('')
  const [maxP, setMaxP] = useState<string>('')
  const [limit, setLimit] = useState<number>(50)

  const filters = useMemo(() => ({
    q: q || undefined,
    method: method || undefined,
    min_period: minP ? Number(minP) : undefined,
    max_period: maxP ? Number(maxP) : undefined,
    limit,
    offset: 0
  }), [q, method, minP, maxP, limit])

  const { data, isLoading, error } = usePlanets(filters)

  const items = Array.isArray(data) ? data : (data?.items ?? [])

  return (
    <section>
      <div className="toolbar">
        <input placeholder="Search name…" value={q} onChange={e=>setQ(e.target.value)} />
        <input placeholder="Min period (days)" value={minP} onChange={e=>setMinP(e.target.value)} />
        <input placeholder="Max period (days)" value={maxP} onChange={e=>setMaxP(e.target.value)} />
        <select value={method} onChange={e=>setMethod(e.target.value)}>
          <option value="">All methods</option>
          <option>Transit</option>
          <option>Radial Velocity</option>
          <option>Imaging</option>
          <option>Microlensing</option>
          <option>Pulsar Timing</option>
        </select>
        <select value={limit} onChange={e=>setLimit(Number(e.target.value))}>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      {error && <div className="card">Error: {error.message}</div>}
      <PlanetTable loading={isLoading} items={items as any} />
    </section>
  )
}
