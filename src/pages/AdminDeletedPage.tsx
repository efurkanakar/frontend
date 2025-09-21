import { adminApiKey } from '../api/http'
import { ErrorState } from '../components/ErrorState'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { useDeletedPlanets } from '../hooks/usePlanets'

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
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

const wrapperStyle: React.CSSProperties = {
  background: 'rgba(15, 23, 42, 0.65)',
  border: '1px solid rgba(148, 163, 184, 0.25)',
  borderRadius: '1rem',
  marginTop: '1.5rem',
  overflow: 'hidden',
}

/**
 * Admin-only view displaying soft-deleted planets for auditing.
 *
 * @returns The admin deleted planets route element.
 */
const AdminDeletedPage = () => {
  const hasKey = Boolean(adminApiKey)
  const deletedQuery = useDeletedPlanets(hasKey)

  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.25rem' }}>Soft-deleted planets</h1>
        <p style={{ color: 'rgba(226, 232, 240, 0.7)', maxWidth: 640 }}>
          View soft-deleted entries. A valid admin API key is required and must be configured via
          <code> VITE_ADMIN_API_KEY</code>.
        </p>
      </header>

      {!hasKey ? (
        <ErrorState
          error={new Error('Admin API key is not configured.')}
          title="Missing admin API key"
          action={<p style={{ margin: 0 }}>Set <code>VITE_ADMIN_API_KEY</code> in your environment.</p>}
        />
      ) : deletedQuery.isError ? (
        <ErrorState
          error={deletedQuery.error}
          title="Unable to load deleted planets"
          action={
            <button
              style={{ background: 'rgba(148, 163, 184, 0.2)', color: '#e2e8f0', fontWeight: 500 }}
              onClick={() => void deletedQuery.refetch()}
            >
              Retry
            </button>
          }
        />
      ) : deletedQuery.isLoading ? (
        <LoadingSkeleton height="320px" />
      ) : deletedQuery.data && deletedQuery.data.length > 0 ? (
        <div style={wrapperStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={headerCellStyle}>ID</th>
                <th style={headerCellStyle}>Name</th>
                <th style={headerCellStyle}>Discovery method</th>
                <th style={headerCellStyle}>Discovery year</th>
                <th style={headerCellStyle}>Deleted at</th>
              </tr>
            </thead>
            <tbody>
              {deletedQuery.data.map((planet) => (
                <tr key={planet.id}>
                  <td style={rowCellStyle}>{planet.id}</td>
                  <td style={rowCellStyle}>{planet.name}</td>
                  <td style={rowCellStyle}>{planet.disc_method ?? '—'}</td>
                  <td style={rowCellStyle}>{planet.disc_year ?? '—'}</td>
                  <td style={rowCellStyle}>{planet.deleted_at ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{ color: 'rgba(226, 232, 240, 0.6)' }}>No soft-deleted planets were found.</p>
      )}
    </div>
  )
}

export default AdminDeletedPage
