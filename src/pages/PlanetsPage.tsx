import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ErrorState } from '../components/ErrorState'
import { FiltersBar, type PlanetFiltersFormState } from '../components/FiltersBar'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { PlanetTable } from '../components/PlanetTable'
import type { PlanetListParams, PlanetSortField, PlanetSortOrder } from '../api/types'
import { usePlanetList } from '../hooks/usePlanets'

const numberFormatter = new Intl.NumberFormat('en-US')

const defaultFormState: PlanetFiltersFormState = {
  name: '',
  disc_method: '',
  min_year: '',
  max_year: '',
  min_orbperd: '',
  max_orbperd: '',
  min_rade: '',
  max_rade: '',
  min_masse: '',
  max_masse: '',
  min_st_teff: '',
  max_st_teff: '',
  min_st_rad: '',
  max_st_rad: '',
  min_st_mass: '',
  max_st_mass: '',
  limit: '25',
  sort_by: 'id',
  sort_order: 'desc',
}

const parseNumberParam = (value: string | null): number | undefined => {
  if (!value) {
    return undefined
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

const parseSortField = (value: string | null): PlanetSortField | undefined => {
  const allowed: PlanetSortField[] = [
    'id',
    'name',
    'disc_year',
    'disc_method',
    'orbperd',
    'rade',
    'masse',
    'st_teff',
    'st_rad',
    'st_mass',
    'created_at',
  ]
  return allowed.includes((value ?? '') as PlanetSortField) ? ((value as PlanetSortField) ?? undefined) : undefined
}

const parseSortOrder = (value: string | null): PlanetSortOrder | undefined =>
  value === 'asc' || value === 'desc' ? (value as PlanetSortOrder) : undefined

const paramsFromSearch = (search: URLSearchParams): PlanetListParams => ({
  name: search.get('name') ?? undefined,
  disc_method: search.get('disc_method') ?? undefined,
  min_year: parseNumberParam(search.get('min_year')),
  max_year: parseNumberParam(search.get('max_year')),
  min_orbperd: parseNumberParam(search.get('min_orbperd')),
  max_orbperd: parseNumberParam(search.get('max_orbperd')),
  min_rade: parseNumberParam(search.get('min_rade')),
  max_rade: parseNumberParam(search.get('max_rade')),
  min_masse: parseNumberParam(search.get('min_masse')),
  max_masse: parseNumberParam(search.get('max_masse')),
  min_st_teff: parseNumberParam(search.get('min_st_teff')),
  max_st_teff: parseNumberParam(search.get('max_st_teff')),
  min_st_rad: parseNumberParam(search.get('min_st_rad')),
  max_st_rad: parseNumberParam(search.get('max_st_rad')),
  min_st_mass: parseNumberParam(search.get('min_st_mass')),
  max_st_mass: parseNumberParam(search.get('max_st_mass')),
  limit: parseNumberParam(search.get('limit')),
  offset: parseNumberParam(search.get('offset')) ?? 0,
  sort_by: parseSortField(search.get('sort_by')),
  sort_order: parseSortOrder(search.get('sort_order')),
})

const formFromParams = (params: PlanetListParams): PlanetFiltersFormState => ({
  ...defaultFormState,
  name: params.name ?? '',
  disc_method: params.disc_method ?? '',
  min_year: params.min_year?.toString() ?? '',
  max_year: params.max_year?.toString() ?? '',
  min_orbperd: params.min_orbperd?.toString() ?? '',
  max_orbperd: params.max_orbperd?.toString() ?? '',
  min_rade: params.min_rade?.toString() ?? '',
  max_rade: params.max_rade?.toString() ?? '',
  min_masse: params.min_masse?.toString() ?? '',
  max_masse: params.max_masse?.toString() ?? '',
  min_st_teff: params.min_st_teff?.toString() ?? '',
  max_st_teff: params.max_st_teff?.toString() ?? '',
  min_st_rad: params.min_st_rad?.toString() ?? '',
  max_st_rad: params.max_st_rad?.toString() ?? '',
  min_st_mass: params.min_st_mass?.toString() ?? '',
  max_st_mass: params.max_st_mass?.toString() ?? '',
  limit: (params.limit ?? Number(defaultFormState.limit)).toString(),
  sort_by: params.sort_by ?? defaultFormState.sort_by,
  sort_order: params.sort_order ?? defaultFormState.sort_order,
})

const createSearchParamsFromForm = (
  form: PlanetFiltersFormState,
  overrides: Partial<Record<string, string>> = {},
): URLSearchParams => {
  const next = new URLSearchParams()
  const entries: Array<[keyof PlanetFiltersFormState, string]> = [
    ['name', form.name],
    ['disc_method', form.disc_method],
    ['min_year', form.min_year],
    ['max_year', form.max_year],
    ['min_orbperd', form.min_orbperd],
    ['max_orbperd', form.max_orbperd],
    ['min_rade', form.min_rade],
    ['max_rade', form.max_rade],
    ['min_masse', form.min_masse],
    ['max_masse', form.max_masse],
    ['min_st_teff', form.min_st_teff],
    ['max_st_teff', form.max_st_teff],
    ['min_st_rad', form.min_st_rad],
    ['max_st_rad', form.max_st_rad],
    ['min_st_mass', form.min_st_mass],
    ['max_st_mass', form.max_st_mass],
  ]

  entries.forEach(([key, value]) => {
    if (value.trim().length > 0) {
      next.set(key, value.trim())
    }
  })

  if (form.limit) {
    next.set('limit', form.limit)
  }
  if (form.sort_by) {
    next.set('sort_by', form.sort_by)
  }
  if (form.sort_order) {
    next.set('sort_order', form.sort_order)
  }

  Object.entries(overrides).forEach(([key, value]) => {
    if (typeof value === 'string') {
      next.set(key, value)
    }
  })

  return next
}

const controlsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '1rem',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  marginTop: '1.5rem',
}

const paginationStyle: React.CSSProperties = {
  display: 'flex',
  gap: '0.75rem',
  alignItems: 'center',
}

const buttonStyle: React.CSSProperties = {
  background: 'rgba(148, 163, 184, 0.2)',
  color: '#e2e8f0',
  fontWeight: 500,
}

/**
 * Detailed planets listing page with filtering, sorting, and pagination.
 *
 * @returns The planets route element.
 */
const PlanetsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const listParams = useMemo(() => paramsFromSearch(searchParams), [searchParams])
  const [formState, setFormState] = useState<PlanetFiltersFormState>(() => formFromParams(listParams))

  useEffect(() => {
    setFormState(formFromParams(listParams))
  }, [listParams])

  const listQuery = usePlanetList(listParams)

  const limit = listParams.limit ?? Number(defaultFormState.limit)
  const offset = listParams.offset ?? 0
  const total = listQuery.data?.total ?? 0
  const currentCount = listQuery.data?.items.length ?? 0
  const hasPrevious = offset > 0
  const nextOffset = offset + limit
  const hasNext = nextOffset < total

  const applyFilters = () => {
    const nextParams = createSearchParamsFromForm(formState, { offset: '0' })
    setSearchParams(nextParams)
  }

  const resetFilters = () => {
    setFormState(defaultFormState)
    const nextParams = createSearchParamsFromForm(defaultFormState, { offset: '0', limit: defaultFormState.limit })
    setSearchParams(nextParams)
  }

  const goToOffset = (newOffset: number) => {
    const params = createSearchParamsFromForm(formFromParams(listParams), {
      offset: Math.max(newOffset, 0).toString(),
      limit: limit.toString(),
    })
    setSearchParams(params)
  }

  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.25rem' }}>Planet catalogue</h1>
        <p style={{ color: 'rgba(226, 232, 240, 0.7)', maxWidth: 720 }}>
          Filter, sort, and page through the full exoplanet catalogue with live data from the API.
        </p>
      </header>

      <FiltersBar
        value={formState}
        onChange={setFormState}
        onSubmit={applyFilters}
        onReset={resetFilters}
        submitting={listQuery.isLoading}
      />

      <div style={controlsStyle}>
        <div>
          <strong>{numberFormatter.format(currentCount)}</strong>{' '}
          <span style={{ color: 'rgba(226, 232, 240, 0.7)' }}>of {numberFormatter.format(total)} results</span>
        </div>
        <div style={paginationStyle}>
          <button type="button" style={buttonStyle} disabled={!hasPrevious} onClick={() => goToOffset(offset - limit)}>
            Previous
          </button>
          <span style={{ color: 'rgba(226, 232, 240, 0.7)' }}>
            Page {Math.floor(offset / limit) + 1}
          </span>
          <button type="button" style={buttonStyle} disabled={!hasNext} onClick={() => goToOffset(nextOffset)}>
            Next
          </button>
        </div>
      </div>

      {listQuery.isError ? (
        <div style={{ marginTop: '1.5rem' }}>
          <ErrorState
            error={listQuery.error}
            title="Unable to load planets"
            action={
              <button style={buttonStyle} onClick={() => void listQuery.refetch()}>
                Retry
              </button>
            }
          />
        </div>
      ) : listQuery.isLoading ? (
        <div style={{ marginTop: '1.5rem' }}>
          <LoadingSkeleton height="420px" />
        </div>
      ) : listQuery.data && listQuery.data.items.length > 0 ? (
        <div style={{ marginTop: '1.5rem' }}>
          <PlanetTable planets={listQuery.data.items} />
        </div>
      ) : (
        <p style={{ color: 'rgba(226, 232, 240, 0.6)', marginTop: '1.5rem' }}>No planets match the current filters.</p>
      )}
    </div>
  )
}

export default PlanetsPage
