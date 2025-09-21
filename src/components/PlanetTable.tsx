import type { PlanetSummary } from '../types'

export default function PlanetTable({ items, loading }: { items: PlanetSummary[], loading?: boolean }) {
  if (loading) return <div>Loading planets…</div>
  if (!items?.length) return <div className="muted">No planets.</div>
  return (
    <div className="card" style={{overflowX:'auto'}}>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Method</th>
            <th>Year</th>
            <th>Period (d)</th>
            <th>Radius</th>
            <th>Mass</th>
            <th>Host Star</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={String(p.id)}>
              <td>{p.name}</td>
              <td>{p.discovery_method ?? '—'}</td>
              <td>{p.discovery_year ?? '—'}</td>
              <td>{p.orbital_period ?? '—'}</td>
              <td>{p.radius ?? '—'}</td>
              <td>{p.mass ?? '—'}</td>
              <td>{p.host_star ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
