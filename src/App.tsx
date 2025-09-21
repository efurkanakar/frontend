import { NavLink, Outlet } from 'react-router-dom'
import { adminApiKey } from './api/http'

const headerStyle: React.CSSProperties = {
  borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
  padding: '1.25rem 0',
  marginBottom: '2rem',
}

const navStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1.5rem',
}

const navLinksStyle: React.CSSProperties = {
  display: 'flex',
  gap: '0.5rem',
  flexWrap: 'wrap',
}

const navButtonStyle: React.CSSProperties = {
  padding: '0.45rem 1rem',
  borderRadius: '999px',
  fontWeight: 600,
}

const activeNavStyle: React.CSSProperties = {
  background: 'rgba(56, 189, 248, 0.15)',
  color: '#38bdf8',
}

/**
 * Root layout containing the navigation header and outlet for route content.
 *
 * @returns The shared application shell component.
 */
const App = () => {
  const showAdmin = Boolean(adminApiKey)

  return (
    <div className="container">
      <header style={headerStyle}>
        <nav style={navStyle} aria-label="Primary navigation">
          <div>
            <NavLink to="/" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>
              🪐 Exoplanet Explorer
            </NavLink>
            <p style={{ margin: 0, color: 'rgba(226, 232, 240, 0.65)', fontSize: '0.85rem' }}>
              Live analytics &amp; catalogue for confirmed exoplanets
            </p>
          </div>
          <div style={navLinksStyle}>
            <NavLink
              to="/"
              end
              style={({ isActive }) => ({
                ...navButtonStyle,
                ...(isActive ? activeNavStyle : { background: 'rgba(148, 163, 184, 0.15)', color: '#f8fafc' }),
              })}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/planets"
              style={({ isActive }) => ({
                ...navButtonStyle,
                ...(isActive ? activeNavStyle : { background: 'rgba(148, 163, 184, 0.15)', color: '#f8fafc' }),
              })}
            >
              Planets
            </NavLink>
            <NavLink
              to="/endpoints"
              style={({ isActive }) => ({
                ...navButtonStyle,
                ...(isActive ? activeNavStyle : { background: 'rgba(148, 163, 184, 0.15)', color: '#f8fafc' }),
              })}
            >
              Endpoints
            </NavLink>
            {showAdmin ? (
              <NavLink
                to="/admin/deleted"
                style={({ isActive }) => ({
                  ...navButtonStyle,
                  ...(isActive ? activeNavStyle : { background: 'rgba(148, 163, 184, 0.15)', color: '#f8fafc' }),
                })}
              >
                Admin
              </NavLink>
            ) : null}
          </div>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <footer
        style={{
          borderTop: '1px solid rgba(148, 163, 184, 0.2)',
          padding: '1.5rem 0',
          marginTop: '3rem',
          fontSize: '0.85rem',
          color: 'rgba(226, 232, 240, 0.7)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          justifyContent: 'space-between',
        }}
      >
        <span>
          API base URL:{' '}
          <code>{(import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'https://exoplanet-api-lg16.onrender.com'}</code>
        </span>
        <span>Admin key: {showAdmin ? 'configured' : 'not configured'}</span>
      </footer>
    </div>
  )
}

export default App
