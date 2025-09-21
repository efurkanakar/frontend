/** @file Endpoints route listing documentation derived from OpenAPI. */

import { useMemo, useState } from 'react'
import { ErrorState } from '../components/ErrorState'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { useOpenApiRoutes } from '../hooks/useOpenAPI'

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

const methodBadgeStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '0.25rem 0.6rem',
  borderRadius: '999px',
  background: 'rgba(56, 189, 248, 0.15)',
  color: '#38bdf8',
  fontWeight: 600,
  fontSize: '0.75rem',
}

/**
 * Page listing all endpoints extracted from the OpenAPI specification.
 *
 * @returns The endpoints route element.
 */
const EndpointsPage = () => {
  const [search, setSearch] = useState('')
  const routesQuery = useOpenApiRoutes()

  const filteredRoutes = useMemo(() => {
    if (!routesQuery.data) {
      return []
    }
    const term = search.trim().toLowerCase()
    if (term.length === 0) {
      return routesQuery.data
    }
    return routesQuery.data.filter((route) =>
      `${route.method} ${route.path}`.toLowerCase().includes(term) ||
      route.summary?.toLowerCase().includes(term) ||
      route.tags?.some((tag) => tag.toLowerCase().includes(term)),
    )
  }, [routesQuery.data, search])

  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.25rem' }}>API endpoints</h1>
        <p style={{ color: 'rgba(226, 232, 240, 0.7)', maxWidth: 640 }}>
          Inspect all published endpoints directly from the API&apos;s OpenAPI specification.
        </p>
      </header>

      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Filter by method, path, or tag"
        style={{
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(148, 163, 184, 0.35)',
          borderRadius: '0.75rem',
          padding: '0.65rem 1rem',
          width: '100%',
          color: '#f8fafc',
        }}
      />

      {routesQuery.isError ? (
        <div style={{ marginTop: '1.5rem' }}>
          <ErrorState
            error={routesQuery.error}
            title="Unable to load OpenAPI document"
            action={
              <button
                style={{ background: 'rgba(148, 163, 184, 0.2)', color: '#e2e8f0', fontWeight: 500 }}
                onClick={() => void routesQuery.refetch()}
              >
                Retry
              </button>
            }
          />
        </div>
      ) : routesQuery.isLoading ? (
        <div style={{ marginTop: '1.5rem' }}>
          <LoadingSkeleton height="360px" />
        </div>
      ) : filteredRoutes.length > 0 ? (
        <div style={wrapperStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={headerCellStyle}>Method</th>
                <th style={headerCellStyle}>Path</th>
                <th style={headerCellStyle}>Summary</th>
                <th style={headerCellStyle}>Tags</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoutes.map((route) => (
                <tr key={`${route.method}-${route.path}`}>
                  <td style={rowCellStyle}>
                    <span style={methodBadgeStyle}>{route.method}</span>
                  </td>
                  <td style={rowCellStyle}>
                    <code>{route.path}</code>
                  </td>
                  <td style={rowCellStyle}>{route.summary ?? '—'}</td>
                  <td style={rowCellStyle}>{route.tags?.join(', ') ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{ color: 'rgba(226, 232, 240, 0.6)', marginTop: '1.5rem' }}>No endpoints match your search.</p>
      )}
    </div>
  )
}

export default EndpointsPage
