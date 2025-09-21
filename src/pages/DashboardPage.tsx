import { FormEvent, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ErrorState } from '../components/ErrorState'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { MetricCard } from '../components/MetricCard'
import { createPlanet, fetchPlanetByName, softDeletePlanet } from '../api/client'
import { usePlanetCount, usePlanetStats } from '../hooks/usePlanets'
import type { PlanetCreateInput, PlanetRow } from '../api/types'

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
  const [createForm, setCreateForm] = useState({
    name: '',
    disc_method: '',
    disc_year: '',
    orbperd: '',
    rade: '',
    masse: '',
    st_teff: '',
    st_rad: '',
    st_mass: '',
  })
  const [deleteForm, setDeleteForm] = useState({ planetId: '', planetName: '' })
  const [createFormError, setCreateFormError] = useState<string | null>(null)
  const [deleteFormError, setDeleteFormError] = useState<string | null>(null)
  const [createdPlanetName, setCreatedPlanetName] = useState<string | null>(null)
  const [createdPlanetId, setCreatedPlanetId] = useState<number | null>(null)
  const [deletedPlanetId, setDeletedPlanetId] = useState<number | null>(null)
  const [deletedPlanetName, setDeletedPlanetName] = useState<string | null>(null)
  const [pendingDeletionName, setPendingDeletionName] = useState<string | null>(null)
  const [lookupPlanet, setLookupPlanet] = useState<PlanetRow | null>(null)
  const [lookupError, setLookupError] = useState<string | null>(null)

  const countQuery = usePlanetCount()
  const statsQuery = usePlanetStats()

  const createPlanetMutation = useMutation<PlanetRow, Error, PlanetCreateInput>({
    mutationFn: async (input: PlanetCreateInput) => createPlanet(input),
    onSuccess: (planet) => {
      setCreateForm({
        name: '',
        disc_method: '',
        disc_year: '',
        orbperd: '',
        rade: '',
        masse: '',
        st_teff: '',
        st_rad: '',
        st_mass: '',
      })
      setCreateFormError(null)
      setCreatedPlanetName(planet?.name ?? null)
      setCreatedPlanetId(planet?.id ?? null)
      void queryClient.invalidateQueries({ queryKey: ['planets'] })
    },
  })

  const deletePlanetMutation = useMutation<void, Error, number>({
    mutationFn: async (planetId: number) => softDeletePlanet(planetId),
    onSuccess: (_data, planetId) => {
      setDeleteForm({ planetId: '', planetName: '' })
      setDeleteFormError(null)
      setDeletedPlanetId(planetId)
      setDeletedPlanetName(pendingDeletionName)
      setPendingDeletionName(null)
      setLookupPlanet(null)
      void queryClient.invalidateQueries({ queryKey: ['planets'] })
    },
    onError: () => {
      setPendingDeletionName(null)
    },
  })

  const lookupPlanetMutation = useMutation<PlanetRow, Error, string>({
    mutationFn: async (name: string) => fetchPlanetByName(name),
    onMutate: () => {
      setLookupError(null)
    },
    onSuccess: (planet) => {
      setLookupPlanet(planet)
      setLookupError(null)
      setDeleteForm((state) => ({ ...state, planetId: planet.id.toString() }))
    },
    onError: (error) => {
      setLookupPlanet(null)
      setLookupError(error.message)
    },
  })

  const cards = useMemo(() => {
    const count = countQuery.data?.total
    const avgTeff = statsQuery.data?.st_teff?.avg ?? statsQuery.data?.st_teff?.mean
    const medianTeff = statsQuery.data?.st_teff?.median

    return [
      {
        title: 'Catalogue size',
        value: typeof count === 'number' ? numberFormatter.format(count) : '—',
        hint: 'Total planets tracked by the API',
        loading: countQuery.isLoading,
      },
      {
        title: 'Average host star temperature',
        value:
          typeof avgTeff === 'number' ? `${numberFormatter.format(Math.round(avgTeff))} K` : '—',
        hint: 'Mean effective temperature of known host stars',
        loading: statsQuery.isLoading,
      },
      {
        title: 'Median host star temperature',
        value:
          typeof medianTeff === 'number'
            ? `${numberFormatter.format(Math.round(medianTeff))} K`
            : '—',
        hint: 'Median effective temperature across host stars',
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

    type AdditionalNumericField = Extract<
      keyof PlanetCreateInput,
      'orbperd' | 'rade' | 'masse' | 'st_teff' | 'st_rad' | 'st_mass'
    >

    const numericFields: Array<[AdditionalNumericField, string]> = [
      ['orbperd', createForm.orbperd],
      ['rade', createForm.rade],
      ['masse', createForm.masse],
      ['st_teff', createForm.st_teff],
      ['st_rad', createForm.st_rad],
      ['st_mass', createForm.st_mass],
    ]

    numericFields.forEach(([key, value]) => {
      const numericValue = toNumber(value)
      if (typeof numericValue === 'number') {
        payload[key] = numericValue
      }
    })

    setCreateFormError(null)
    setCreatedPlanetName(null)
    setCreatedPlanetId(null)
    void createPlanetMutation.mutateAsync(payload)
  }

  const handleDeleteSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const parsedId = toNumber(deleteForm.planetId)
    if (typeof parsedId !== 'number') {
      setDeleteFormError('Enter a valid numeric planet ID.')
      return
    }

    setDeleteFormError(null)
    setDeletedPlanetId(null)
    setPendingDeletionName(lookupPlanet?.id === parsedId ? lookupPlanet.name : null)
    setDeletedPlanetName(null)
    void deletePlanetMutation.mutateAsync(parsedId)
  }

  const handleLookupClick = () => {
    const trimmed = deleteForm.planetName.trim()
    if (trimmed.length === 0) {
      setLookupError('Enter a planet name to search for its ID.')
      setLookupPlanet(null)
      return
    }

    setLookupError(null)
    void lookupPlanetMutation.mutateAsync(trimmed)
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
            <label style={fieldStyle}>
              Orbital period (days)
              <input
                type="number"
                inputMode="decimal"
                value={createForm.orbperd}
                onChange={(event) =>
                  setCreateForm((state) => ({ ...state, orbperd: event.target.value }))
                }
                placeholder="10.5"
                min="0"
                step="any"
              />
            </label>
            <label style={fieldStyle}>
              Planet radius (Earth radii)
              <input
                type="number"
                inputMode="decimal"
                value={createForm.rade}
                onChange={(event) =>
                  setCreateForm((state) => ({ ...state, rade: event.target.value }))
                }
                placeholder="1.1"
                min="0"
                step="any"
              />
            </label>
            <label style={fieldStyle}>
              Planet mass (Earth masses)
              <input
                type="number"
                inputMode="decimal"
                value={createForm.masse}
                onChange={(event) =>
                  setCreateForm((state) => ({ ...state, masse: event.target.value }))
                }
                placeholder="5.97"
                min="0"
                step="any"
              />
            </label>
            <label style={fieldStyle}>
              Host star temperature (K)
              <input
                type="number"
                inputMode="decimal"
                value={createForm.st_teff}
                onChange={(event) =>
                  setCreateForm((state) => ({ ...state, st_teff: event.target.value }))
                }
                placeholder="5772"
                min="0"
                step="any"
              />
            </label>
            <label style={fieldStyle}>
              Host star radius (Solar radii)
              <input
                type="number"
                inputMode="decimal"
                value={createForm.st_rad}
                onChange={(event) =>
                  setCreateForm((state) => ({ ...state, st_rad: event.target.value }))
                }
                placeholder="1"
                min="0"
                step="any"
              />
            </label>
            <label style={fieldStyle}>
              Host star mass (Solar masses)
              <input
                type="number"
                inputMode="decimal"
                value={createForm.st_mass}
                onChange={(event) =>
                  setCreateForm((state) => ({ ...state, st_mass: event.target.value }))
                }
                placeholder="1"
                min="0"
                step="any"
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
                Planet {createdPlanetName ? <strong>{createdPlanetName}</strong> : 'entry'}
                {createdPlanetId ? ` (#${createdPlanetId})` : ''} created successfully.
              </p>
            ) : null}

            <button type="submit" style={buttonStyle} disabled={createPlanetMutation.isPending}>
              {createPlanetMutation.isPending ? 'Creating…' : 'Create planet'}
            </button>
          </form>

          <form onSubmit={handleDeleteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <h3 style={{ margin: '0 0 0.5rem' }}>Remove a planet</h3>
              <p style={helperTextStyle}>
                Search for a planet by name to retrieve its identifier, then confirm the deletion.
              </p>
            </div>

            <label style={fieldStyle}>
              Planet name
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={deleteForm.planetName}
                  onChange={(event) => {
                    const value = event.target.value
                    setDeleteForm((state) => ({ ...state, planetName: value }))
                    setLookupError(null)
                    if (value.trim().length === 0) {
                      setLookupPlanet(null)
                    }
                  }}
                  placeholder="Kepler-186 f"
                  style={{ flex: '1 1 220px' }}
                />
                <button
                  type="button"
                  style={{ ...buttonStyle, padding: '0.45rem 1.25rem' }}
                  onClick={handleLookupClick}
                  disabled={lookupPlanetMutation.isPending}
                >
                  {lookupPlanetMutation.isPending ? 'Searching…' : 'Find ID'}
                </button>
              </div>
            </label>
            <label style={fieldStyle}>
              Planet ID
              <input
                type="number"
                inputMode="numeric"
                min="1"
                value={deleteForm.planetId}
                onChange={(event) =>
                  setDeleteForm((state) => ({ ...state, planetId: event.target.value }))
                }
                placeholder="1024"
              />
            </label>

            {deleteFormError ? (
              <p style={{ ...helperTextStyle, color: '#f87171' }}>{deleteFormError}</p>
            ) : null}
            {lookupError ? (
              <p style={{ ...helperTextStyle, color: '#f87171' }}>{lookupError}</p>
            ) : null}
            {lookupPlanet ? (
              <p style={{ ...helperTextStyle, color: '#34d399' }} role="status">
                Found <strong>{lookupPlanet.name}</strong> with ID <strong>{lookupPlanet.id}</strong>
                {lookupPlanet.disc_method ? ` · ${lookupPlanet.disc_method}` : ''}
                {lookupPlanet.disc_year ? ` · ${lookupPlanet.disc_year}` : ''}
              </p>
            ) : null}
            {deletePlanetMutation.isError ? (
              <p style={{ ...helperTextStyle, color: '#f87171' }}>
                {(deletePlanetMutation.error as Error).message}
              </p>
            ) : null}
            {deletePlanetMutation.isSuccess ? (
              <p style={{ ...helperTextStyle, color: '#34d399' }} role="status">
                Planet
                {deletedPlanetName ? (
                  <>
                    {' '}
                    <strong>{deletedPlanetName}</strong>
                  </>
                ) : null}
                {deletedPlanetId ? ` (#${deletedPlanetId})` : ''} removed successfully.
              </p>
            ) : null}

            <button type="submit" style={buttonStyle} disabled={deletePlanetMutation.isPending}>
              {deletePlanetMutation.isPending ? 'Removing…' : 'Delete planet'}
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}

export default DashboardPage
