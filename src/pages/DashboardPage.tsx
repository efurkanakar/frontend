import { useMemo, useState } from 'react'
import { BarChart } from '../components/BarChart'
import { ErrorState } from '../components/ErrorState'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { MetricCard } from '../components/MetricCard'
import { TimelineChart } from '../components/TimelineChart'
import { useMethodCounts, usePlanetCount, usePlanetStats, usePlanetTimeline } from '../hooks/usePlanets'
import type { PlanetTimelineParams } from '../api/types'

const numberFormatter = new Intl.NumberFormat('en-US')
const decimalFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })

const kpiGridStyle: React.CSSProperties = {
  display: 'grid',
  gap: '1.5rem',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
}

const sectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  marginTop: '2rem',
}

const sectionHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '1rem',
}

const timelineControlsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '0.75rem',
  flexWrap: 'wrap',
}

const buttonStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #38bdf8, #6366f1)',
  color: '#0f172a',
  fontWeight: 600,
}

const cardPlaceholder = <LoadingSkeleton height="4.5rem" />

const toNumber = (value: string): number | undefined => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

/**
 * Dashboard landing page displaying KPIs, timeline, and method breakdowns.
 *
 * @returns The dashboard route element.
 */
const DashboardPage = () => {
  const [timelineForm, setTimelineForm] = useState<{ start: string; end: string }>({ start: '', end: '' })
  const [timelineParams, setTimelineParams] = useState<PlanetTimelineParams>({})

  const countQuery = usePlanetCount()
  const statsQuery = usePlanetStats()
  const methodCountsQuery = useMethodCounts()
  const timelineQuery = usePlanetTimeline(timelineParams)

  const cards = useMemo(() => {
    const count = countQuery.data?.total
    const newest = statsQuery.data?.disc_year?.max
    const avgRadius = statsQuery.data?.rade?.avg ?? statsQuery.data?.rade?.mean
    const avgMass = statsQuery.data?.masse?.avg ?? statsQuery.data?.masse?.mean

    return [
      {
        title: 'Catalogue size',
        value: typeof count === 'number' ? numberFormatter.format(count) : '—',
        hint: 'Total planets tracked by the API',
        loading: countQuery.isLoading,
      },
      {
        title: 'Newest discovery year',
        value: typeof newest === 'number' ? numberFormatter.format(newest) : '—',
        hint: 'Latest confirmed discovery in the catalogue',
        loading: statsQuery.isLoading,
      },
      {
        title: 'Average planet radius',
        value: typeof avgRadius === 'number' ? `${decimalFormatter.format(avgRadius)} R⊕` : '—',
        hint: 'Mean planetary radius across the dataset',
        loading: statsQuery.isLoading,
      },
      {
        title: 'Average planet mass',
        value: typeof avgMass === 'number' ? `${decimalFormatter.format(avgMass)} M⊕` : '—',
        hint: 'Mean planetary mass across the dataset',
        loading: statsQuery.isLoading,
      },
    ]
  }, [countQuery.data?.total, countQuery.isLoading, statsQuery.data, statsQuery.isLoading])

  const methodChartData = useMemo(
    () =>
      methodCountsQuery.data?.map((item) => ({
        name: item.method,
        value: item.count,
      })) ?? [],
    [methodCountsQuery.data],
  )

  const applyTimelineFilters = () => {
    setTimelineParams({
      start_year: toNumber(timelineForm.start),
      end_year: toNumber(timelineForm.end),
    })
  }

  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.25rem' }}>Exoplanet Observatory</h1>
        <p style={{ color: 'rgba(226, 232, 240, 0.7)', maxWidth: 640 }}>
          Explore discovery trends, aggregate statistics, and discovery methods from the live
          catalogue.
        </p>
      </header>

      {countQuery.isError || statsQuery.isError ? (
        <ErrorState
          error={countQuery.error ?? statsQuery.error}
          title="Unable to load dashboard metrics"
          action={
            <button style={buttonStyle} onClick={() => {
              void countQuery.refetch()
              void statsQuery.refetch()
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

      <section style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <div>
            <h2 style={{ margin: 0 }}>Discovery timeline</h2>
            <p style={{ color: 'rgba(226, 232, 240, 0.7)', margin: 0 }}>
              Number of confirmed planets discovered per calendar year.
            </p>
          </div>
          <form
            style={timelineControlsStyle}
            onSubmit={(event) => {
              event.preventDefault()
              applyTimelineFilters()
            }}
          >
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem' }}>
              Start year
              <input
                type="number"
                inputMode="numeric"
                value={timelineForm.start}
                onChange={(event) =>
                  setTimelineForm((state) => ({ ...state, start: event.target.value }))
                }
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem' }}>
              End year
              <input
                type="number"
                inputMode="numeric"
                value={timelineForm.end}
                onChange={(event) => setTimelineForm((state) => ({ ...state, end: event.target.value }))}
              />
            </label>
            <button type="submit" style={buttonStyle}>
              Update
            </button>
          </form>
        </div>

        {timelineQuery.isError ? (
          <ErrorState
            error={timelineQuery.error}
            title="Unable to load timeline"
            action={
              <button style={buttonStyle} onClick={() => void timelineQuery.refetch()}>
                Retry
              </button>
            }
          />
        ) : timelineQuery.isLoading ? (
          <LoadingSkeleton height="320px" />
        ) : timelineQuery.data && timelineQuery.data.length > 0 ? (
          <TimelineChart data={timelineQuery.data} />
        ) : (
          <p style={{ color: 'rgba(226, 232, 240, 0.6)' }}>No timeline data available.</p>
        )}
      </section>

      <section style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <div>
            <h2 style={{ margin: 0 }}>Discovery methods</h2>
            <p style={{ color: 'rgba(226, 232, 240, 0.7)', margin: 0 }}>
              Top discovery methods ranked by total confirmed planets.
            </p>
          </div>
        </div>

        {methodCountsQuery.isError ? (
          <ErrorState
            error={methodCountsQuery.error}
            title="Unable to load method breakdown"
            action={
              <button style={buttonStyle} onClick={() => void methodCountsQuery.refetch()}>
                Retry
              </button>
            }
          />
        ) : methodCountsQuery.isLoading ? (
          <LoadingSkeleton height="320px" />
        ) : methodChartData.length > 0 ? (
          <BarChart data={methodChartData} title="Discovery methods" />
        ) : (
          <p style={{ color: 'rgba(226, 232, 240, 0.6)' }}>No discovery method data available.</p>
        )}
      </section>
    </div>
  )
}

export default DashboardPage
