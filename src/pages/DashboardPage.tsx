import { useDiscoveryStats, useDiscoveryTimeline } from '../hooks/useAnalytics'
import MetricCard from '../components/MetricCard'
import TimelineChart from '../components/TimelineChart'

export default function DashboardPage() {
  const { data: stats, isLoading: sLoad, error: sErr } = useDiscoveryStats()
  const { data: timeline, isLoading: tLoad, error: tErr } = useDiscoveryTimeline()

  if (sErr || tErr) {
    return <div className="card">Unable to load metrics. {(sErr ?? tErr)?.message}</div>
  }

  return (
    <section className="grid">
      <MetricCard title="Catalogued Planets" metric={stats?.planet_count ?? 0} loading={sLoad}
        description="Total number of confirmed exoplanets." />
      <MetricCard title="Median Orbital Period" metric={stats?.orbital_period?.median ?? 0} unit=" days" loading={sLoad}
        description="Half of all planets have shorter periods than this." />
      <div className="card" style={{gridColumn:'1 / -1'}}>
        <h3 style={{marginTop:0}}>Discoveries per Year</h3>
        <TimelineChart data={timeline ?? []} loading={tLoad} />
      </div>
    </section>
  )
}
