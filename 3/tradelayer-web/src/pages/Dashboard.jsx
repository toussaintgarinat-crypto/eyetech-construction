import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

function StatCard({ icon, label, value, color, sub }) {
  return (
    <div style={{ ...styles.statCard, borderLeftColor: color }}>
      <div style={{ ...styles.statIcon, background: color + '22', color }}>
        {icon}
      </div>
      <div style={styles.statContent}>
        <div style={styles.statValue}>{value ?? '—'}</div>
        <div style={styles.statLabel}>{label}</div>
        {sub && <div style={styles.statSub}>{sub}</div>}
      </div>
    </div>
  )
}

function QuickAction({ icon, label, to, color }) {
  return (
    <Link to={to} style={{ ...styles.quickAction, borderColor: color + '44' }}>
      <span style={{ fontSize: '28px' }}>{icon}</span>
      <span style={styles.quickLabel}>{label}</span>
      <span style={styles.quickArrow}>→</span>
    </Link>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    projets: null,
    calques: null,
    corpsMetiers: null,
    elements: null,
  })
  const [loading, setLoading] = useState(true)

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}') }
    catch { return {} }
  })()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [projRes, calRes, cmRes] = await Promise.allSettled([
          api.get('/api/calques-metiers/api/projets/'),
          api.get('/api/calques-metiers/api/calques/'),
          api.get('/api/calques-metiers/api/corps-metiers/'),
        ])

        const getValue = (res) => {
          if (res.status === 'fulfilled') {
            const data = res.value.data
            if (Array.isArray(data)) return data.length
            if (data?.count !== undefined) return data.count
            if (data?.results) return data.results.length
          }
          return null
        }

        const calData = calRes.status === 'fulfilled' ? calRes.value.data : null
        let calquesActifs = null
        if (calData) {
          const arr = Array.isArray(calData) ? calData : (calData.results || [])
          calquesActifs = arr.filter(c => c.statut === 'actif' || c.is_active).length
        }

        setStats({
          projets: getValue(projRes),
          calques: getValue(calRes),
          calquesActifs,
          corpsMetiers: getValue(cmRes),
        })
      } catch (e) {
        console.error('Dashboard stats error:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const now = new Date()
  const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div style={styles.root}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Tableau de bord</h1>
          <p style={styles.date}>{dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}</p>
        </div>
        <div style={styles.userBadge}>
          <div style={styles.avatarCircle}>
            {(user.username || user.email || 'U')[0].toUpperCase()}
          </div>
          <div>
            <div style={styles.userName}>{user.username || user.email || 'Chef de projet'}</div>
            <div style={styles.userRole}>Chef de projet</div>
          </div>
        </div>
      </div>

      {/* Concept banner */}
      <div style={styles.banner}>
        <div style={styles.bannerIcon}>🏗</div>
        <div>
          <strong style={{ color: '#f1f5f9' }}>TradeLayer Intelligence</strong>
          <p style={styles.bannerText}>
            Créez des calques métiers dans le jumeau numérique — les ouvriers les visualisent en réalité augmentée directement sur chantier.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <StatCard
          icon="📁"
          label="Projets actifs"
          value={loading ? '...' : stats.projets}
          color="#3b82f6"
          sub="Tous projets confondus"
        />
        <StatCard
          icon="🗂"
          label="Calques créés"
          value={loading ? '...' : stats.calques}
          color="#8b5cf6"
          sub="Total base de données"
        />
        <StatCard
          icon="✅"
          label="Calques actifs"
          value={loading ? '...' : stats.calquesActifs}
          color="#10b981"
          sub="Visibles sur chantier (AR)"
        />
        <StatCard
          icon="👷"
          label="Corps de métier"
          value={loading ? '...' : stats.corpsMetiers}
          color="#f59e0b"
          sub="Disciplines référencées"
        />
      </div>

      {/* Quick actions */}
      <div style={styles.sectionTitle}>Accès rapide</div>
      <div style={styles.quickGrid}>
        <QuickAction icon="📋" label="Mes projets" to="/projets" color="#3b82f6" />
        <QuickAction icon="🗂" label="Tous les calques" to="/projets" color="#8b5cf6" />
        <QuickAction icon="🏗" label="Aide & FAQ" to="/aide" color="#10b981" />
        <QuickAction icon="📖" label="Tutoriel" to="/tutoriel" color="#f59e0b" />
      </div>

      {/* Corps métier legend */}
      <div style={styles.sectionTitle}>Codes couleur par corps de métier</div>
      <div style={styles.legendGrid}>
        {[
          { label: 'Plomberie', color: '#3b82f6', icon: '🔵' },
          { label: 'Électricité', color: '#eab308', icon: '🟡' },
          { label: 'Placo / Cloisons', color: '#94a3b8', icon: '⬜' },
          { label: 'Charpente', color: '#92400e', icon: '🟫' },
          { label: 'CVC / Climatisation', color: '#ef4444', icon: '🔴' },
          { label: 'Peinture / Revêtement', color: '#22c55e', icon: '🟢' },
          { label: 'Maçonnerie', color: '#d97706', icon: '🟠' },
          { label: 'Menuiserie', color: '#a78bfa', icon: '🟣' },
        ].map(item => (
          <div key={item.label} style={{ ...styles.legendItem, borderLeftColor: item.color }}>
            <div style={{ ...styles.legendDot, background: item.color }} />
            <span style={styles.legendLabel}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  root: {
    maxWidth: '1200px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: '4px',
  },
  date: {
    fontSize: '13px',
    color: '#64748b',
  },
  userBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#1e293b',
    borderRadius: '12px',
    padding: '10px 16px',
    border: '1px solid #334155',
  },
  avatarCircle: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: '#3b82f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    color: '#fff',
    fontSize: '16px',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#f1f5f9',
  },
  userRole: {
    fontSize: '11px',
    color: '#64748b',
  },
  banner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.08) 100%)',
    border: '1px solid rgba(59,130,246,0.25)',
    borderRadius: '12px',
    padding: '20px 24px',
    marginBottom: '28px',
  },
  bannerIcon: {
    fontSize: '32px',
    flexShrink: 0,
  },
  bannerText: {
    fontSize: '13px',
    color: '#94a3b8',
    marginTop: '4px',
    lineHeight: '1.6',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    marginBottom: '32px',
  },
  statCard: {
    background: '#1e293b',
    borderRadius: '12px',
    border: '1px solid #334155',
    borderLeft: '4px solid',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    flexShrink: 0,
  },
  statContent: {},
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#f1f5f9',
    lineHeight: '1',
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#94a3b8',
  },
  statSub: {
    fontSize: '11px',
    color: '#475569',
    marginTop: '2px',
  },
  sectionTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '14px',
    marginTop: '4px',
  },
  quickGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    marginBottom: '32px',
  },
  quickAction: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    background: '#1e293b',
    borderRadius: '10px',
    border: '1px solid',
    padding: '18px 20px',
    cursor: 'pointer',
    transition: 'background 0.15s',
    textDecoration: 'none',
  },
  quickLabel: {
    flex: 1,
    fontSize: '14px',
    fontWeight: '500',
    color: '#e2e8f0',
  },
  quickArrow: {
    color: '#475569',
    fontSize: '16px',
  },
  legendGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '10px',
    marginBottom: '16px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#1e293b',
    borderRadius: '8px',
    border: '1px solid #334155',
    borderLeft: '4px solid',
    padding: '10px 14px',
  },
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  legendLabel: {
    fontSize: '13px',
    color: '#cbd5e1',
  },
}
