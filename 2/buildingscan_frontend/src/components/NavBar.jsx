import { NavLink } from 'react-router-dom'
import { logout } from '../api'

const NAV_ITEMS = [
  {
    to: '/',
    label: 'Dashboard',
    exact: true,
    iconSvg: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    to: '/scans',
    label: 'Scans',
    iconSvg: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    to: '/mesures',
    label: 'Mesures',
    iconSvg: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="2" y1="12" x2="22" y2="12" />
        <line x1="12" y1="2" x2="12" y2="22" />
        <path d="M2 7h3M2 17h3M19 7h3M19 17h3" />
      </svg>
    ),
  },
  {
    to: '/jumeaux',
    label: 'Jumeaux Numériques',
    iconSvg: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    to: '/tutoriel',
    label: 'Tutoriel',
    iconSvg: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
]

const ACCENT = '#7c3aed'

export default function NavBar() {
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}') }
    catch { return {} }
  })()

  const handleLogout = () => {
    logout()
  }

  return (
    <aside style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logoBlock}>
        <div style={styles.logoIcon}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill={ACCENT} />
            <path d="M6 24 L16 8 L26 24" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M10 18 L22 18" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <circle cx="16" cy="8" r="2" fill="white" />
          </svg>
        </div>
        <div>
          <div style={styles.logoTitle}>BuildingScan</div>
          <div style={styles.logoSub}>Eyetech Construction</div>
        </div>
      </div>

      {/* Nav section label */}
      <div style={styles.navSection}>Navigation</div>

      {/* Nav items */}
      <nav style={styles.nav}>
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {}),
            })}
          >
            <span style={styles.navIcon}>{item.iconSvg || item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Formats scan legend */}
      <div style={styles.navSection}>Formats supportés</div>
      <div style={styles.legend}>
        {[
          { label: 'LiDAR (PLY / LAS)', color: ACCENT },
          { label: 'Photogramm. (OBJ)', color: '#8b5cf6' },
          { label: 'BIM (IFC)', color: '#a78bfa' },
          { label: 'Temps réel (GLB)', color: '#c4b5fd' },
        ].map(item => (
          <div key={item.label} style={styles.legendItem}>
            <div style={{ ...styles.dot, background: item.color }} />
            <span style={styles.legendLabel}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* User block at bottom */}
      <div style={styles.userBlock}>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            {(user.username || user.email || 'U')[0].toUpperCase()}
          </div>
          <div style={styles.userText}>
            <div style={styles.userName}>{user.username || user.email || 'Opérateur scan'}</div>
            <div style={styles.userRole}>Opérateur scan</div>
          </div>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn} title="Se déconnecter">
          <LogoutIcon />
        </button>
      </div>
    </aside>
  )
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

const styles = {
  sidebar: {
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    width: '240px',
    background: '#1e293b',
    borderRight: '1px solid #334155',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 100,
    overflowY: 'auto',
  },
  logoBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '20px 20px 16px',
    borderBottom: '1px solid #334155',
  },
  logoIcon: { flexShrink: 0 },
  logoTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#f1f5f9',
    lineHeight: '1.2',
  },
  logoSub: {
    fontSize: '10px',
    color: '#64748b',
    marginTop: '1px',
  },
  navSection: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    padding: '16px 20px 6px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    padding: '0 10px 8px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '9px 12px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#94a3b8',
    textDecoration: 'none',
    transition: 'background 0.12s, color 0.12s',
  },
  navItemActive: {
    background: 'rgba(124,58,237,0.15)',
    color: '#7c3aed',
  },
  navIcon: { fontSize: '16px', flexShrink: 0 },
  legend: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '0 16px 16px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 0',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  legendLabel: {
    fontSize: '12px',
    color: '#64748b',
  },
  userBlock: {
    marginTop: 'auto',
    padding: '14px 16px',
    borderTop: '1px solid #334155',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1,
    minWidth: 0,
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#7c3aed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    color: '#fff',
    fontSize: '13px',
    flexShrink: 0,
  },
  userText: { minWidth: 0 },
  userName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#e2e8f0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  userRole: { fontSize: '10px', color: '#475569' },
  logoutBtn: {
    background: 'transparent',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
}
