import { NavLink } from 'react-router-dom'
import { logout } from '../api'

const links = [
  {
    to: '/',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    to: '/recherche',
    label: 'Recherche',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    to: '/produits',
    label: 'Produits',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      </svg>
    ),
  },
  {
    to: '/fournisseurs',
    label: 'Fournisseurs',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    to: '/tutoriel',
    label: 'Tutoriel',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    to: '/aide',
    label: 'Aide',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
]

export default function NavBar() {
  function handleLogout() {
    logout()
  }

  return (
    <aside
      style={{
        width: '240px',
        minHeight: '100vh',
        background: '#1e293b',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #334155',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '1.5rem 1.25rem',
          borderBottom: '1px solid #334155',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontWeight: 700,
              color: '#fff',
            }}
          >
            C
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#e2e8f0', lineHeight: 1.2 }}>
              ConstructOptimize
            </div>
            <div style={{ fontSize: 11, color: '#10b981', marginTop: 2 }}>Eyetech Construction</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '1rem 0' }}>
        <div style={{ padding: '0 0.75rem 0.5rem', fontSize: 10, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Menu principal
        </div>
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.65rem 1rem',
              margin: '0.1rem 0.5rem',
              borderRadius: 8,
              color: isActive ? '#10b981' : '#94a3b8',
              background: isActive ? 'rgba(16,185,129,0.12)' : 'transparent',
              fontWeight: isActive ? 600 : 400,
              fontSize: 14,
              transition: 'all 0.15s',
              borderLeft: isActive ? '3px solid #10b981' : '3px solid transparent',
            })}
          >
            {icon}
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Suite Eyetech */}
      <div style={{ padding: '0 0.75rem 0.5rem', fontSize: 10, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.5rem' }}>
        Suite Eyetech
      </div>
      <div style={{ padding: '0 1rem 1rem', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {[
          { label: 'Perce-Mur', short: 'PM', color: '#f97316', port: 5173 },
          { label: 'BuildingScan', short: 'BS', color: '#7c3aed', port: 5172 },
          { label: 'TradeLayer', short: 'TL', color: '#3b82f6', port: 5174 },
          { label: 'ConstructOpt.', short: 'CO', color: '#10b981', port: 5175, current: true },
        ].map(app => (
          <a
            key={app.label}
            href={`http://localhost:${app.port}`}
            title={app.label}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '4px 8px', borderRadius: '6px',
              background: app.current ? 'rgba(16,185,129,0.15)' : 'transparent',
              border: `1px solid ${app.current ? '#10b981' : '#334155'}`,
              textDecoration: 'none', fontSize: '11px',
              color: app.current ? '#10b981' : '#64748b',
              fontWeight: app.current ? 700 : 400,
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: app.color, flexShrink: 0 }} />
            {app.short}
          </a>
        ))}
      </div>

      {/* Logout */}
      <div style={{ padding: '1rem', borderTop: '1px solid #334155' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '0.65rem 1rem',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 8,
            color: '#ef4444',
            fontSize: 14,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.2)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Deconnexion
        </button>
      </div>
    </aside>
  )
}
