import type { ChangeEvent, FormEvent } from 'react'
import type { PlanetSortField, PlanetSortOrder } from '../api/types'

/**
 * Form state used by the planet filters bar component.
 */
export interface PlanetFiltersFormState {
  name: string
  disc_method: string
  min_year: string
  max_year: string
  min_orbperd: string
  max_orbperd: string
  min_rade: string
  max_rade: string
  min_masse: string
  max_masse: string
  min_st_teff: string
  max_st_teff: string
  min_st_rad: string
  max_st_rad: string
  min_st_mass: string
  max_st_mass: string
  limit: string
  sort_by: PlanetSortField
  sort_order: PlanetSortOrder
}

/**
 * Props accepted by {@link FiltersBar}.
 */
export interface FiltersBarProps {
  /** Current filter form values. */
  value: PlanetFiltersFormState
  /** Handler invoked when the user edits any field. */
  onChange: (value: PlanetFiltersFormState) => void
  /** Submission handler triggered when the form is applied. */
  onSubmit: () => void
  /** Handler invoked when the filters should be reset. */
  onReset: () => void
  /** Whether the apply button should be disabled. */
  submitting?: boolean
}

const containerStyle: React.CSSProperties = {
  background: 'rgba(15, 23, 42, 0.65)',
  border: '1px solid rgba(148, 163, 184, 0.25)',
  borderRadius: '1rem',
  padding: '1.25rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gap: '0.75rem',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'rgba(226, 232, 240, 0.6)',
}

const actionsStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.75rem',
  justifyContent: 'flex-end',
}

const buttonPrimaryStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #38bdf8, #6366f1)',
  color: '#0f172a',
  fontWeight: 600,
}

const buttonSecondaryStyle: React.CSSProperties = {
  background: 'rgba(148, 163, 184, 0.2)',
  color: '#e2e8f0',
  fontWeight: 500,
}

const sortOptions: PlanetSortField[] = [
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

/**
 * Controlled filters bar for the planets listing page.
 *
 * @param props - Controlled values and callbacks.
 * @returns A form allowing visitors to adjust query parameters.
 */
export const FiltersBar = ({ value, onChange, onSubmit, onReset, submitting = false }: FiltersBarProps) => {
  const handleInput = (key: keyof PlanetFiltersFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      onChange({ ...value, [key]: event.target.value })
    }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form style={containerStyle} onSubmit={handleSubmit}>
      <div style={gridStyle}>
        <label style={labelStyle}>
          Name
          <input type="text" value={value.name} onChange={handleInput('name')} placeholder="e.g. Kepler" />
        </label>
        <label style={labelStyle}>
          Discovery method
          <input
            type="text"
            value={value.disc_method}
            onChange={handleInput('disc_method')}
            placeholder="Transit"
          />
        </label>
        <label style={labelStyle}>
          Min year
          <input type="number" inputMode="numeric" value={value.min_year} onChange={handleInput('min_year')} />
        </label>
        <label style={labelStyle}>
          Max year
          <input type="number" inputMode="numeric" value={value.max_year} onChange={handleInput('max_year')} />
        </label>
        <label style={labelStyle}>
          Min orbital period
          <input
            type="number"
            inputMode="decimal"
            step="any"
            value={value.min_orbperd}
            onChange={handleInput('min_orbperd')}
          />
        </label>
        <label style={labelStyle}>
          Max orbital period
          <input
            type="number"
            inputMode="decimal"
            step="any"
            value={value.max_orbperd}
            onChange={handleInput('max_orbperd')}
          />
        </label>
        <label style={labelStyle}>
          Min radius
          <input
            type="number"
            inputMode="decimal"
            step="any"
            value={value.min_rade}
            onChange={handleInput('min_rade')}
          />
        </label>
        <label style={labelStyle}>
          Max radius
          <input
            type="number"
            inputMode="decimal"
            step="any"
            value={value.max_rade}
            onChange={handleInput('max_rade')}
          />
        </label>
        <label style={labelStyle}>
          Min mass
          <input
            type="number"
            inputMode="decimal"
            step="any"
            value={value.min_masse}
            onChange={handleInput('min_masse')}
          />
        </label>
        <label style={labelStyle}>
          Max mass
          <input
            type="number"
            inputMode="decimal"
            step="any"
            value={value.max_masse}
            onChange={handleInput('max_masse')}
          />
        </label>
        <label style={labelStyle}>
          Min star Teff
          <input type="number" value={value.min_st_teff} onChange={handleInput('min_st_teff')} />
        </label>
        <label style={labelStyle}>
          Max star Teff
          <input type="number" value={value.max_st_teff} onChange={handleInput('max_st_teff')} />
        </label>
        <label style={labelStyle}>
          Min star radius
          <input
            type="number"
            inputMode="decimal"
            step="any"
            value={value.min_st_rad}
            onChange={handleInput('min_st_rad')}
          />
        </label>
        <label style={labelStyle}>
          Max star radius
          <input
            type="number"
            inputMode="decimal"
            step="any"
            value={value.max_st_rad}
            onChange={handleInput('max_st_rad')}
          />
        </label>
        <label style={labelStyle}>
          Min star mass
          <input
            type="number"
            inputMode="decimal"
            step="any"
            value={value.min_st_mass}
            onChange={handleInput('min_st_mass')}
          />
        </label>
        <label style={labelStyle}>
          Max star mass
          <input
            type="number"
            inputMode="decimal"
            step="any"
            value={value.max_st_mass}
            onChange={handleInput('max_st_mass')}
          />
        </label>
        <label style={labelStyle}>
          Page size
          <select value={value.limit} onChange={handleInput('limit')}>
            {['10', '25', '50', '100', '200'].map((size) => (
              <option key={size} value={size}>
                {size} rows
              </option>
            ))}
          </select>
        </label>
        <label style={labelStyle}>
          Sort by
          <select value={value.sort_by} onChange={handleInput('sort_by')}>
            {sortOptions.map((option) => (
              <option key={option} value={option}>
                {option.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </label>
        <label style={labelStyle}>
          Sort order
          <select value={value.sort_order} onChange={handleInput('sort_order')}>
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </label>
      </div>
      <div style={actionsStyle}>
        <button type="button" style={{ ...buttonSecondaryStyle }} onClick={onReset}>
          Reset
        </button>
        <button type="submit" style={{ ...buttonPrimaryStyle }} disabled={submitting}>
          {submitting ? 'Loading…' : 'Apply filters'}
        </button>
      </div>
    </form>
  )
}
