import { FormEvent, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ErrorState } from '../components/ErrorState'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { MetricCard } from '../components/MetricCard'
import { BarChart } from '../components/BarChart'
import { TimelineChart } from '../components/TimelineChart'
import { createPlanet, fetchPlanetByName, softDeletePlanet } from '../api/client'
import { useMethodCounts, usePlanetCount, usePlanetStats, usePlanetTimeline } from '../hooks/usePlanets'
import type { PlanetCreateInput } from '../api/types'
import type { PlanetTimelinePoint, PlanetRow } from '../api/types'

const numberFormatter = new Intl.NumberFormat('en-US')
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

const primaryButtonStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #38bdf8, #6366f1)',
  color: '#0f172a',
  fontWeight: 600,
}

const secondaryButtonStyle: React.CSSProperties = {
  background: 'rgba(148, 163, 184, 0.2)',
  color: '#e2e8f0',
  fontWeight: 500,
}

const cardPlaceholder = <LoadingSkeleton height="4.5rem" />
const chartPlaceholder = <LoadingSkeleton height="20rem" />

const toNumber = (value: string): number | undefined => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

const formGridStyle: React.CSSProperties = {
  display: 'grid',
  gap: '1.5rem',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
}

const fieldStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.35rem',
  fontSize: '0.9rem',
}

const inlineFieldStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
  fontSize: '0.85rem',
}

const visualisationGridStyle: React.CSSProperties = {
  display: 'grid',
  gap: '1.5rem',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
}

const timelineControlsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '1rem',
  flexWrap: 'wrap',
  alignItems: 'flex-end',
  justifyContent: 'flex-start',
}

const helperTextStyle: React.CSSProperties = {
  color: 'rgba(226, 232, 240, 0.6)',
  fontSize: '0.8rem',
  marginTop: '0.25rem',
}

/**
 * Dashboard landing page displaying KPIs, timeline, and method breakdowns.
 *
 * @returns The dashboard route element.
 */
const DashboardPage = () => {
  const queryClient = useQueryClient()
  const [createForm, setCreateForm] = useState({ name: '', disc_method: '', disc_year: '' })
  const [deleteForm, setDeleteForm] = useState({ planetName: '' })
  const [createFormError, setCreateFormError] = useState<string | null>(null)
  const [deleteFormError, setDeleteFormError] = useState<string | null>(null)
  const [createdPlanetName, setCreatedPlanetName] = useState<string | null>(null)
  const [deletedPlanet, setDeletedPlanet] = useState<Pick<PlanetRow, 'id' | 'name'> | null>(null)
  const [timelineFilters, setTimelineFilters] = useState({ startYear: '', endYear: '' })

  const countQuery = usePlanetCount()
  const statsQuery = usePlanetStats()
  const methodCountsQuery = useMethodCounts()

  const timelineParams = useMemo(() => {
    const start = toNumber(timelineFilters.startYear)
    const end = toNumber(timelineFilters.endYear)
    const params: { start_year?: number; end_year?: number } = {}
    if (typeof start === 'number') {
      params.start_year = start
    }
    if (typeof end === 'number') {
      params.end_year = end
    }
    return params
  }, [timelineFilters])

  const timelineQuery = usePlanetTimeline(timelineParams)

  const createPlanetMutation = useMutation({
    mutationFn: async (input: PlanetCreateInput) => createPlanet(input),
    onSuccess: (planet) => {
      setCreateForm({ name: '', disc_method: '', disc_year: '' })
      setCreateFormError(null)
      setCreatedPlanetName(planet?.name ?? null)
      void queryClient.invalidateQueries({ queryKey: ['planets'] })
    },
  })

  const deletePlanetMutation = useMutation({
    mutationFn: async (planetName: string) => {
      const planet = await fetchPlanetByName(planetName)
      await softDeletePlanet(planet.id)
      return planet
    },
    onSuccess: (planet) => {
      setDeleteForm({ planetName: '' })
      setDeleteFormError(null)
      setDeletedPlanet({ id: planet.id, name: planet.name })
      void queryClient.invalidateQueries({ queryKey: ['planets'] })
    },
  })

  const cards = useMemo(() => {
    const count = countQuery.data?.total
    const medianTeff = statsQuery.data?.st_teff?.median
    const avgTeff = statsQuery.data?.st_teff?.avg ?? statsQuery.data?.st_teff?.mean

    return [
      {
        title: 'Catalogue size',
        value: typeof count === 'number' ? numberFormatter.format(count) : '—',
        hint: 'Total planets tracked by the API',
        loading: countQuery.isLoading,
      },
      {
        title: 'Median host star temperature',
        value:
          typeof medianTeff === 'number'
            ? `${numberFormatter.format(Math.round(medianTeff))} K`
            : '—',
        hint: 'Median effective temperature of known host stars',
        loading: statsQuery.isLoading,
      },
      {
        title: 'Average host star temperature',
        value:
          typeof avgTeff === 'number' ? `${numberFormatter.format(Math.round(avgTeff))} K` : '—',
        hint: 'Mean effective temperature of known host stars',
        loading: statsQuery.isLoading,
      },
    ]
  }, [countQuery.data?.total, countQuery.isLoading, statsQuery.data, statsQuery.isLoading])

  const handleCreateSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedName = createForm.name.trim()
    if (trimmedName.length === 0) {
      setCreateFormError('Planet name is required.')
      return
    }

    const payload: PlanetCreateInput = {
      name: trimmedName,
    }

    const discYear = toNumber(createForm.disc_year)
    if (typeof discYear === 'number') {
      payload.disc_year = discYear
    }

    const method = createForm.disc_method.trim()
    if (method.length > 0) {
      payload.disc_method = method
    }

    setCreateFormError(null)
    setCreatedPlanetName(null)
    void createPlanetMutation.mutateAsync(payload)
  }

  const methodChartData = useMemo(
    () =>
      (methodCountsQuery.data ?? [])
        .slice()
        .sort((a, b) => b.count - a.count)
        .map((item) => ({ name: item.method, value: item.count })),
    [methodCountsQuery.data],
  )

  const timelineData: PlanetTimelinePoint[] = timelineQuery.data ?? []

  const handleDeleteSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = deleteForm.planetName.trim()
    if (name.length === 0) {
      setDeleteFormError('Enter the planet name you wish to remove.')
      return
    }

    setDeleteFormError(null)
    setDeletedPlanet(null)
    void deletePlanetMutation.mutateAsync(name)
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
            <button
              style={primaryButtonStyle}
              onClick={() => {
                void countQuery.refetch()
                void statsQuery.refetch()
                void methodCountsQuery.refetch()
                void timelineQuery.refetch()
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
        <div>
          <h2 style={{ margin: 0 }}>Manage catalogue entries</h2>
          <p style={{ color: 'rgba(226, 232, 240, 0.7)', margin: 0 }}>
            Quickly create or remove planets using the live API endpoints.
          </p>
        </div>

        <div style={helperTextStyle}>
          <span>
            Create planets via <code>POST /planets/</code> and remove them with{' '}
            <code>DELETE /planets/{'{'}planet_id{'}'}</code>.
          </span>
        </div>

        <div style={formGridStyle}>
          <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <h3 style={{ margin: '0 0 0.5rem' }}>Add a planet</h3>
              <p style={helperTextStyle}>Provide at least a name. Other fields are optional.</p>
            </div>

            <label style={fieldStyle}>
              Name
              <input
                type="text"
                value={createForm.name}
                onChange={(event) => setCreateForm((state) => ({ ...state, name: event.target.value }))}
                placeholder="Planet Nine"
                required
              />
            </label>
            <label style={fieldStyle}>
              Discovery method
              <input
                type="text"
                value={createForm.disc_method}
                onChange={(event) =>
                  setCreateForm((state) => ({ ...state, disc_method: event.target.value }))
                }
                placeholder="Transit"
              />
            </label>
            <label style={fieldStyle}>
              Discovery year
              <input
                type="number"
                inputMode="numeric"
                value={createForm.disc_year}
                onChange={(event) =>
                  setCreateForm((state) => ({ ...state, disc_year: event.target.value }))
                }
                placeholder="2024"
                min="0"
              />
            </label>

            {createFormError ? (
              <p style={{ ...helperTextStyle, color: '#f87171' }}>{createFormError}</p>
            ) : null}
            {createPlanetMutation.isError ? (
              <p style={{ ...helperTextStyle, color: '#f87171' }}>
                {(createPlanetMutation.error as Error).message}
              </p>
            ) : null}
            {createPlanetMutation.isSuccess ? (
              <p style={{ ...helperTextStyle, color: '#34d399' }} role="status">
                Planet {createdPlanetName ? <strong>{createdPlanetName}</strong> : 'entry'} created successfully.
              </p>
            ) : null}

            <button type="submit" style={primaryButtonStyle} disabled={createPlanetMutation.isPending}>
              {createPlanetMutation.isPending ? 'Creating…' : 'Create planet'}
            </button>
          </form>

          <form onSubmit={handleDeleteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <h3 style={{ margin: '0 0 0.5rem' }}>Remove a planet</h3>
              <p style={helperTextStyle}>
                Enter the planet name to look up its identifier and soft delete the record.
              </p>
            </div>

            <label style={fieldStyle}>
              Planet name
              <input
                type="text"
                value={deleteForm.planetName}
                onChange={(event) =>
                  setDeleteForm((state) => ({ ...state, planetName: event.target.value }))
                }
                placeholder="Kepler-22b"
              />
            </label>

            {deleteFormError ? (
              <p style={{ ...helperTextStyle, color: '#f87171' }}>{deleteFormError}</p>
            ) : null}
            {deletePlanetMutation.isError ? (
              <p style={{ ...helperTextStyle, color: '#f87171' }}>
                {(deletePlanetMutation.error as Error).message}
              </p>
            ) : null}
            {deletePlanetMutation.isSuccess ? (
              <p style={{ ...helperTextStyle, color: '#34d399' }} role="status">
                Planet
                {deletedPlanet ? (
                  <>
                    {' '}
                    <strong>{deletedPlanet.name}</strong> (ID {deletedPlanet.id})
                  </>
                ) : (
                  ' entry'
                )}
                {' '}removed successfully.
              </p>
            ) : null}

            <button type="submit" style={primaryButtonStyle} disabled={deletePlanetMutation.isPending}>
              {deletePlanetMutation.isPending ? 'Removing…' : 'Delete planet'}
            </button>
          </form>
        </div>
      </section>

      <section style={sectionStyle}>
        <div>
          <h2 style={{ margin: 0 }}>Discovery insights</h2>
          <p style={{ color: 'rgba(226, 232, 240, 0.7)', margin: 0 }}>
            Visualise annual discovery rates and the most common detection methods.
          </p>
        </div>

        <div style={visualisationGridStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ margin: 0 }}>Discovery timeline</h3>
                <p style={helperTextStyle}>Annual counts sourced from <code>GET /planets/timeline</code>.</p>
              </div>
              <div style={timelineControlsStyle}>
                <label style={inlineFieldStyle}>
                  Start year
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="1995"
                    value={timelineFilters.startYear}
                    onChange={(event) =>
                      setTimelineFilters((state) => ({ ...state, startYear: event.target.value }))
                    }
                    min="0"
                  />
                </label>
                <label style={inlineFieldStyle}>
                  End year
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="2024"
                    value={timelineFilters.endYear}
                    onChange={(event) =>
                      setTimelineFilters((state) => ({ ...state, endYear: event.target.value }))
                    }
                    min="0"
                  />
                </label>
                {(timelineFilters.startYear || timelineFilters.endYear) && (
                  <button
                    type="button"
                    style={secondaryButtonStyle}
                    onClick={() => setTimelineFilters({ startYear: '', endYear: '' })}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {timelineQuery.isError ? (
              <ErrorState
                error={timelineQuery.error}
                title="Unable to load discovery timeline"
                action={
                  <button style={primaryButtonStyle} onClick={() => void timelineQuery.refetch()}>
                    Retry
                  </button>
                }
              />
            ) : timelineQuery.isLoading ? (
              chartPlaceholder
            ) : (
              <TimelineChart data={timelineData} />
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <h3 style={{ margin: 0 }}>Discovery methods</h3>
              <p style={helperTextStyle}>Breakdown from <code>GET /planets/method-counts</code>.</p>
            </div>

            {methodCountsQuery.isError ? (
              <ErrorState
                error={methodCountsQuery.error}
                title="Unable to load discovery methods"
                action={
                  <button style={primaryButtonStyle} onClick={() => void methodCountsQuery.refetch()}>
                    Retry
                  </button>
                }
              />
            ) : methodCountsQuery.isLoading ? (
              chartPlaceholder
            ) : (
              <BarChart data={methodChartData} title="Planets by discovery method" />
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default DashboardPage
