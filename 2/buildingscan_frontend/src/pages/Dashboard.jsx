import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

const ACCENT = '#7c3aed'

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

function ScanCard({ scan }) {
  const STATUTS = {
    en_cours: { label: 'En cours', color: '#10b981' },
    termine: { label: 'Terminé', color: '#64748b' },
    archive: { label: 'Archivé', color: '#475569' },
  }
  const s = STATUTS[scan.statut] || { label: scan.statut, color: '#64748b' }

  return (
    <Link to={`/scans/${scan.id}`} style={styles.scanCard}>
      <div style={styles.scanCardHeader}>
        <span style={styles.scanCardIcon}>🏗</span>
        <span style={{
          fontSize: '11px',
          fontWeight: '600',
          color: s.color,
          background: s.color + '22',
          border: `1px solid ${s.color}44`,
          borderRadius: '20px',
          padding: '2px 8px',
        }}>
          {s.label}
        </span>
      </div>
      <div style={styles.scanCardTitle}>{scan.nom}</div>
      <div style={styles.scanCardAddr}>{scan.adresse}</div>
      <div style={styles.scanCardArrow}>Voir le scan →</div>
    </Link>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    scans: null,
    mesures: null,
    jumeaux: null,
  })
  const [recentScans, setRecentScans] = useState([])
  const [loading, setLoading] = useState(true)

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}') }
    catch { return {} }
  })()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [scansRes, mesuresRes, jumeauxRes] = await Promise.allSettled([
          api.get('/api/scans/chantiers/'),
          api.get('/api/mesures/mesures/'),
          api.get('/api/jumeaux/jumeaux/'),
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

        // Récupérer les derniers scans
        if (scansRes.status === 'fulfilled') {
          const data = scansRes.value.data
          const arr = Array.isArray(data) ? data : (data.results || [])
          setRecentScans(arr.slice(0, 4))
        }

        setStats({
          scans: getValue(scansRes),
          mesures: getValue(mesuresRes),
          jumeaux: getValue(jumeauxRes),
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
            <div style={styles.userName}>{user.username || user.email || 'Opérateur scan'}</div>
            <div style={styles.userRole}>Opérateur scan</div>
          </div>
        </div>
      </div>

      {/* Concept banner */}
      <div style={styles.banner}>
        <div style={styles.bannerIcon}>📡</div>
        <div>
          <strong style={{ color: '#f1f5f9' }}>BuildingScan — Scan 3D de bâtiments</strong>
          <p style={styles.bannerText}>
            Capturez des nuages de points LiDAR et photogrammétriques avec iPhone Pro. Générez des jumeaux numériques 3D pour les équipes de planification et alimentez TradeLayer avec les données de terrain.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <StatCard
          icon="🏗"
          label="Chantiers scannés"
          value={loading ? '...' : stats.scans}
          color={ACCENT}
          sub="Total base de données"
        />
        <StatCard
          icon="📐"
          label="Mesures relevées"
          value={loading ? '...' : stats.mesures}
          color="#8b5cf6"
          sub="Distances, surfaces, volumes"
        />
        <StatCard
          icon="🧊"
          label="Jumeaux numériques"
          value={loading ? '...' : stats.jumeaux}
          color="#a78bfa"
          sub="Modèles 3D générés"
        />
        <StatCard
          icon="📡"
          label="Précision LiDAR"
          value="±1 cm"
          color="#10b981"
          sub="iPhone Pro — LiDAR Scanner"
        />
      </div>

      {/* Quick actions */}
      <div style={styles.sectionTitle}>Accès rapide</div>
      <div style={styles.quickGrid}>
        <QuickAction icon="📷" label="Mes scans chantier" to="/scans" color={ACCENT} />
        <QuickAction icon="📐" label="Voir les mesures" to="/mesures" color="#8b5cf6" />
        <QuickAction icon="🧊" label="Jumeaux numériques" to="/jumeaux" color="#a78bfa" />
        <QuickAction icon="📖" label="Tutoriel" to="/tutoriel" color="#10b981" />
      </div>

      {/* Recent scans */}
      {recentScans.length > 0 && (
        <>
          <div style={styles.sectionTitle}>Derniers scans</div>
          <div style={styles.scansGrid}>
            {recentScans.map(scan => (
              <ScanCard key={scan.id} scan={scan} />
            ))}
          </div>
        </>
      )}
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
    background: '#7c3aed',
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
    background: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(139,92,246,0.08) 100%)',
    border: '1px solid rgba(124,58,237,0.25)',
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
  scansGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '14px',
    marginBottom: '16px',
  },
  scanCard: {
    background: '#1e293b',
    borderRadius: '10px',
    border: '1px solid #334155',
    padding: '16px',
    textDecoration: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    cursor: 'pointer',
  },
  scanCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scanCardIcon: { fontSize: '20px' },
  scanCardTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#f1f5f9',
  },
  scanCardAddr: {
    fontSize: '12px',
    color: '#64748b',
  },
  scanCardArrow: {
    fontSize: '12px',
    color: '#7c3aed',
    fontWeight: '500',
    marginTop: '4px',
  },
}
