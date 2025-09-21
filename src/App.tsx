import { NavLink, Outlet } from 'react-router-dom'

export default function App() {
  return (
    <>
      <header>
        <nav className="container">
          <div style={{display:'flex', gap:'.5rem', alignItems:'center'}}>
            <span style={{fontWeight:700}}>🪐 Exoplanet Explorer</span>
          </div>
          <div style={{display:'flex', gap:'.25rem'}}>
            <NavLink to="/" className={({isActive}) => isActive ? 'active' : ''}>Dashboard</NavLink>
            <NavLink to="/planets" className={({isActive}) => isActive ? 'active' : ''}>Planets</NavLink>
          </div>
        </nav>
      </header>
      <main className="container">
        <Outlet />
      </main>
      <footer className="container muted" style={{padding:'1rem 0'}}>
        API: <code>{import.meta.env.VITE_API_BASE_URL ?? '(configure .env)'}</code>
      </footer>
    </>
  )
}
