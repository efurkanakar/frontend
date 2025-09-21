import { useMemo, type CSSProperties } from 'react'
import { ErrorState } from '../components/ErrorState'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { MetricCard } from '../components/MetricCard'
import { PlanetManagement } from '../components/PlanetManagement'
import { usePlanetCount } from '../hooks/usePlanets'

const numberFormatter = new Intl.NumberFormat('en-US')
const kpiGridStyle: CSSProperties = {
  display: 'grid',
  gap: '1.5rem',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
}

const buttonStyle: CSSProperties = {
  background: 'linear-gradient(135deg, #38bdf8, #6366f1)',
  color: '#0f172a',
  fontWeight: 600,
}

const cardPlaceholder = <LoadingSkeleton height="4.5rem" />

/**
 * Dashboard landing page displaying KPIs and quick management tools.
 *
 * @returns The dashboard route element.
 */
const DashboardPage = () => {
  const countQuery = usePlanetCount()
  const cards = useMemo(() => {
    const count = countQuery.data?.total

    return [
      {
        title: 'Catalogue size',
        value: typeof count === 'number' ? numberFormatter.format(count) : '—',
        hint: 'Total planets tracked by the API',
        loading: countQuery.isLoading,
      },
    ]
  }, [countQuery.data?.total, countQuery.isLoading])

  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.25rem' }}>Exoplanet Observatory</h1>
        <p style={{ color: 'rgba(226, 232, 240, 0.7)', maxWidth: 640 }}>
          Review catalogue totals and manage planets directly using the live API.
        </p>
      </header>

      {countQuery.isError ? (
        <ErrorState
          error={countQuery.error}
          title="Unable to load dashboard metrics"
          action={
            <button style={buttonStyle} onClick={() => {
              void countQuery.refetch()
            }}
            >
              Retry
            </button>
          }
        />
      ) : (
        <div style={kpiGridStyle}>
          {cards.map((card) => (
            <MetricCard
              key={card.title}
              title={card.title}
              value={card.loading ? cardPlaceholder : card.value}
              hint={card.hint}
            />
          ))}
        </div>
      )}

      <PlanetManagement buttonStyle={buttonStyle} />
    </div>
  )
}

export default DashboardPage
