import type { PlanetRow } from '../api/types'

/**
 * Props for rendering the {@link PlanetTable} component.
 */
export interface PlanetTableProps {
  /** Planet rows to render. */
  planets: PlanetRow[]
}

const tableWrapperStyle: React.CSSProperties = {
  background: 'rgba(15, 23, 42, 0.65)',
  border: '1px solid rgba(148, 163, 184, 0.25)',
  borderRadius: '1rem',
  overflow: 'hidden',
}

const headerCellStyle: React.CSSProperties = {
  textAlign: 'left',
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  padding: '0.75rem 1rem',
  color: 'rgba(226, 232, 240, 0.6)',
}

const rowCellStyle: React.CSSProperties = {
  padding: '0.85rem 1rem',
  borderTop: '1px solid rgba(148, 163, 184, 0.2)',
  color: '#f8fafc',
}

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
})

const temperatureFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
})

const formatNumber = (value: number | null | undefined, formatter = numberFormatter): string => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—'
  }
  return formatter.format(value)
}

/**
 * Table presenting planet metadata with consistent formatting.
 *
 * @param props - Planet dataset to render in a tabular layout.
 * @returns A responsive table element.
 */
export const PlanetTable = ({ planets }: PlanetTableProps) => (
  <div style={tableWrapperStyle} role="region" aria-live="polite">
    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
      <thead>
        <tr>
          <th style={headerCellStyle}>Name</th>
          <th style={headerCellStyle}>Discovery Method</th>
          <th style={headerCellStyle}>Discovery Year</th>
          <th style={headerCellStyle}>Orbital Period (days)</th>
          <th style={headerCellStyle}>Radius (Earth)</th>
          <th style={headerCellStyle}>Mass (Earth)</th>
          <th style={headerCellStyle}>Star Teff (K)</th>
          <th style={headerCellStyle}>Star Radius (☉)</th>
          <th style={headerCellStyle}>Star Mass (☉)</th>
        </tr>
      </thead>
      <tbody>
        {planets.map((planet) => (
          <tr key={planet.id}>
            <td style={rowCellStyle}>{planet.name}</td>
            <td style={rowCellStyle}>{planet.disc_method ?? '—'}</td>
            <td style={rowCellStyle}>{planet.disc_year ?? '—'}</td>
            <td style={rowCellStyle}>{formatNumber(planet.orbperd)}</td>
            <td style={rowCellStyle}>{formatNumber(planet.rade)}</td>
            <td style={rowCellStyle}>{formatNumber(planet.masse)}</td>
            <td style={rowCellStyle}>{formatNumber(planet.st_teff, temperatureFormatter)}</td>
            <td style={rowCellStyle}>{formatNumber(planet.st_rad)}</td>
            <td style={rowCellStyle}>{formatNumber(planet.st_mass)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)
