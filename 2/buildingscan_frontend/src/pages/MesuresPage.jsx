import { useEffect, useState } from 'react'
import api from '../api'

const ACCENT = '#7c3aed'

const TYPES_MESURE = {
  distance: { label: 'Distance', color: '#3b82f6', icon: '↔' },
  surface: { label: 'Surface', color: '#10b981', icon: '▦' },
  volume: { label: 'Volume', color: '#f59e0b', icon: '🧊' },
  angle: { label: 'Angle', color: '#ef4444', icon: '∠' },
  hauteur: { label: 'Hauteur', color: ACCENT, icon: '↕' },
}

const TYPES_ZONE = {
  piece: 'Pièce',
  couloir: 'Couloir',
  escalier: 'Escalier',
  facade: 'Façade',
  toiture: 'Toiture',
}

function TypeMesureBadge({ type }) {
  const t = TYPES_MESURE[type] || { label: type || '—', color: '#64748b', icon: '•' }
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '11px',
      fontWeight: '600',
      color: t.color,
      background: t.color + '22',
      border: `1px solid ${t.color}44`,
      borderRadius: '20px',
      padding: '3px 10px',
    }}>
      <span>{t.icon}</span>
      {t.label}
    </span>
  )
}

export default function MesuresPage() {
  const [mesures, setMesures] = useState([])
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('mesures')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [mesRes, zonesRes] = await Promise.allSettled([
          api.get('/api/mesures/mesures/'),
          api.get('/api/mesures/zones/'),
        ])
        if (mesRes.status === 'fulfilled') {
          const data = mesRes.value.data
          setMesures(Array.isArray(data) ? data : (data.results || []))
        }
        if (zonesRes.status === 'fulfilled') {
          const data = zonesRes.value.data
          setZones(Array.isArray(data) ? data : (data.results || []))
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredMesures = mesures.filter(m =>
    m.label?.toLowerCase().includes(search.toLowerCase()) ||
    m.type_mesure?.toLowerCase().includes(search.toLowerCase())
  )

  const filteredZones = zones.filter(z =>
    z.nom?.toLowerCase().includes(search.toLowerCase()) ||
    z.type_zone?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={styles.root}>
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.title}>Mesures</h1>
          <p style={styles.subtitle}>{mesures.length} mesure{mesures.length !== 1 ? 's' : ''} — {zones.length} zone{zones.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab('mesures')}
          style={{ ...styles.tab, ...(activeTab === 'mesures' ? styles.tabActive : {}) }}
        >
          Mesures ({mesures.length})
        </button>
        <button
          onClick={() => setActiveTab('zones')}
          style={{ ...styles.tab, ...(activeTab === 'zones' ? styles.tabActive : {}) }}
        >
          Zones de mesure ({zones.length})
        </button>
      </div>

      {/* Search bar */}
      <div style={styles.searchBar}>
        <span>🔍</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher..."
          style={styles.searchInput}
        />
      </div>

      {loading ? (
        <div style={styles.loading}>Chargement des mesures...</div>
      ) : activeTab === 'mesures' ? (
        filteredMesures.length === 0 ? (
          <div style={styles.empty}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📐</div>
            <div style={styles.emptyTitle}>Aucune mesure</div>
            <div style={styles.emptyText}>Les mesures sont prises lors des sessions de scan via l'app iOS BuildingScan.</div>
          </div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Valeur</th>
                  <th style={styles.th}>Label</th>
                  <th style={styles.th}>Point départ</th>
                  <th style={styles.th}>Point arrivée</th>
                  <th style={styles.th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredMesures.map(m => (
                  <tr
                    key={m.id}
                    style={styles.tr}
                    onMouseEnter={e => (e.currentTarget.style.background = '#253347')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={styles.td}><TypeMesureBadge type={m.type_mesure} /></td>
                    <td style={styles.td}>
                      <span style={styles.valueText}>{m.valeur} {m.unite || 'm'}</span>
                    </td>
                    <td style={styles.td}>{m.label || '—'}</td>
                    <td style={styles.tdMono}>
                      ({m.point_depart_x?.toFixed(2)}, {m.point_depart_y?.toFixed(2)}, {m.point_depart_z?.toFixed(2)})
                    </td>
                    <td style={styles.tdMono}>
                      ({m.point_arrivee_x?.toFixed(2)}, {m.point_arrivee_y?.toFixed(2)}, {m.point_arrivee_z?.toFixed(2)})
                    </td>
                    <td style={styles.td}>
                      {m.created_at ? new Date(m.created_at).toLocaleDateString('fr-FR') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        filteredZones.length === 0 ? (
          <div style={styles.empty}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🗺</div>
            <div style={styles.emptyTitle}>Aucune zone</div>
            <div style={styles.emptyText}>Les zones de mesure sont définies lors des sessions de scan.</div>
          </div>
        ) : (
          <div style={styles.zoneGrid}>
            {filteredZones.map(z => (
              <div key={z.id} style={styles.zoneCard}>
                <div style={styles.zoneCardHeader}>
                  <span style={styles.zoneIcon}>🗺</span>
                  <span style={styles.zoneTypeBadge}>
                    {TYPES_ZONE[z.type_zone] || z.type_zone}
                  </span>
                </div>
                <div style={styles.zoneName}>{z.nom}</div>
                <div style={styles.zoneMeta}>
                  <div style={styles.zoneMetaItem}>
                    <span style={styles.zoneMetaLabel}>Surface</span>
                    <span style={styles.zoneMetaValue}>{z.surface_m2} m²</span>
                  </div>
                  <div style={styles.zoneMetaItem}>
                    <span style={styles.zoneMetaLabel}>Volume</span>
                    <span style={styles.zoneMetaValue}>{z.volume_m3} m³</span>
                  </div>
                  <div style={styles.zoneMetaItem}>
                    <span style={styles.zoneMetaLabel}>Hauteur</span>
                    <span style={styles.zoneMetaValue}>{z.hauteur_m} m</span>
                  </div>
                  <div style={styles.zoneMetaItem}>
                    <span style={styles.zoneMetaLabel}>Périmètre</span>
                    <span style={styles.zoneMetaValue}>{z.perimetre_m} m</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}

const styles = {
  root: { maxWidth: '1200px' },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
  },
  title: { fontSize: '28px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' },
  subtitle: { fontSize: '13px', color: '#64748b' },
  tabs: {
    display: 'flex',
    gap: '4px',
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '10px',
    padding: '4px',
    marginBottom: '20px',
    width: 'fit-content',
  },
  tab: {
    background: 'transparent',
    border: 'none',
    borderRadius: '7px',
    padding: '8px 18px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  tabActive: {
    background: ACCENT,
    color: '#fff',
    fontWeight: '600',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '10px',
    padding: '10px 16px',
    marginBottom: '20px',
  },
  searchInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#f1f5f9',
    fontSize: '14px',
  },
  loading: { textAlign: 'center', padding: '60px', color: '#64748b', fontSize: '15px' },
  empty: {
    textAlign: 'center',
    padding: '80px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  emptyTitle: { fontSize: '18px', fontWeight: '600', color: '#94a3b8' },
  emptyText: { fontSize: '13px', color: '#475569', maxWidth: '340px', textAlign: 'center', lineHeight: '1.5' },
  tableWrap: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '10px',
    overflow: 'auto',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { borderBottom: '1px solid #334155' },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    whiteSpace: 'nowrap',
  },
  tr: { borderBottom: '1px solid rgba(51,65,85,0.5)' },
  td: {
    padding: '12px 16px',
    fontSize: '13px',
    color: '#cbd5e1',
    whiteSpace: 'nowrap',
  },
  tdMono: {
    padding: '12px 16px',
    fontSize: '12px',
    color: '#64748b',
    fontFamily: 'monospace',
    whiteSpace: 'nowrap',
  },
  valueText: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#f1f5f9',
  },
  zoneGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '14px',
  },
  zoneCard: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '10px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  zoneCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  zoneIcon: { fontSize: '20px' },
  zoneTypeBadge: {
    fontSize: '11px',
    fontWeight: '600',
    color: ACCENT,
    background: 'rgba(124,58,237,0.12)',
    border: '1px solid rgba(124,58,237,0.25)',
    borderRadius: '20px',
    padding: '2px 10px',
  },
  zoneName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#f1f5f9',
  },
  zoneMeta: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
  },
  zoneMetaItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  zoneMetaLabel: {
    fontSize: '10px',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  zoneMetaValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#f1f5f9',
  },
}
