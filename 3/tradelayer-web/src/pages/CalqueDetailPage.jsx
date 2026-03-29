import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api'
import CorpsMetierBadge from '../components/CorpsMetierBadge'

const TYPE_ICONS = {
  point: '📍',
  ligne: '📏',
  polygone: '⬡',
  polygon: '⬡',
  line: '📏',
  linestring: '📏',
}

const TYPE_LABELS = {
  point: 'Point',
  ligne: 'Ligne',
  lignestring: 'Ligne',
  linestring: 'Ligne',
  polygone: 'Polygone',
  polygon: 'Polygone',
}

function getTypeLabel(type) {
  const key = (type || '').toLowerCase()
  return TYPE_LABELS[key] || type || 'Élément'
}

function getTypeIcon(type) {
  const key = (type || '').toLowerCase()
  return TYPE_ICONS[key] || '📌'
}

export default function CalqueDetailPage() {
  const { id } = useParams()
  const [calque, setCalque] = useState(null)
  const [elements, setElements] = useState([])
  const [loading, setLoading] = useState(true)
  const [corpsMetier, setCorpsMetier] = useState(null)
  const [statutChanging, setStatutChanging] = useState(false)
  const [showStatutMenu, setShowStatutMenu] = useState(false)
  const statutMenuRef = useRef(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const calRes = await api.get(`/api/calques-metiers/api/calques/${id}/`)
        const cal = calRes.data
        setCalque(cal)

        // Fetch elements
        const elRes = await api.get(`/api/calques-metiers/api/elements/?calque=${id}`)
        const elData = elRes.data
        setElements(Array.isArray(elData) ? elData : (elData.results || []))

        // Fetch corps metier if present
        if (cal.corps_metier) {
          try {
            const cmRes = await api.get(`/api/calques-metiers/api/corps-metiers/${cal.corps_metier}/`)
            setCorpsMetier(cmRes.data)
          } catch {
            // might be already embedded in calque
            if (cal.corps_metier_detail) setCorpsMetier(cal.corps_metier_detail)
          }
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const changeStatut = async (newStatut) => {
    setStatutChanging(true)
    setShowStatutMenu(false)
    try {
      const res = await api.patch(`/api/calques-metiers/api/calques/${id}/`, { statut: newStatut })
      setCalque(res.data)
    } catch (e) {
      console.error('Erreur changement statut:', e)
    } finally {
      setStatutChanging(false)
    }
  }

  if (loading) return <div style={styles.loading}>Chargement du calque...</div>
  if (!calque) return <div style={styles.loading}>Calque introuvable.</div>

  const cmNom = corpsMetier ? (corpsMetier.nom || corpsMetier.name) : null

  const STATUT_COLORS = {
    actif: '#10b981',
    brouillon: '#f59e0b',
    archivé: '#64748b',
    archive: '#64748b',
  }
  const statutColor = STATUT_COLORS[calque.statut] || '#64748b'

  // Count by type
  const typeCounts = elements.reduce((acc, el) => {
    const t = getTypeLabel(el.type_geometrie || el.type || el.geometrie_type || '')
    acc[t] = (acc[t] || 0) + 1
    return acc
  }, {})

  return (
    <div style={styles.root}>
      {/* Breadcrumb */}
      <div style={styles.breadcrumb}>
        <Link to="/projets" style={styles.breadLink}>Projets</Link>
        <span style={styles.breadSep}>/</span>
        {calque.projet && (
          <>
            <Link to={`/projets/${calque.projet}`} style={styles.breadLink}>Projet</Link>
            <span style={styles.breadSep}>/</span>
          </>
        )}
        <span style={styles.breadCurrent}>{calque.nom}</span>
      </div>

      {/* Header */}
      <div style={styles.pageHeader}>
        <div style={{ flex: 1 }}>
          <div style={styles.titleRow}>
            <h1 style={styles.title}>{calque.nom}</h1>
            {/* Statut + dropdown pour changer */}
            <div style={{ position: 'relative' }} ref={statutMenuRef}>
              <button
                onClick={() => setShowStatutMenu(v => !v)}
                disabled={statutChanging}
                style={{
                  fontSize: '12px', fontWeight: '600', color: statutColor,
                  background: statutColor + '22', border: `1px solid ${statutColor}44`,
                  borderRadius: '20px', padding: '4px 12px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                }}
              >
                {statutChanging ? '...' : (calque.statut || 'Inconnu')}
                <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {showStatutMenu && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, zIndex: 200,
                  background: '#1e293b', border: '1px solid #334155', borderRadius: '10px',
                  padding: '6px', marginTop: '4px', minWidth: '160px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                }}>
                  {[
                    { val: 'brouillon', label: 'Brouillon', color: '#f59e0b', icon: '✏️' },
                    { val: 'actif', label: 'Actif (AR visible)', color: '#10b981', icon: '✅' },
                    { val: 'archive', label: 'Archiver', color: '#64748b', icon: '📦' },
                  ].filter(s => s.val !== calque.statut && s.val !== 'archivé').map(s => (
                    <button
                      key={s.val}
                      onClick={() => changeStatut(s.val)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        width: '100%', padding: '8px 12px', borderRadius: '7px',
                        background: 'transparent', border: 'none',
                        color: s.color, fontSize: '13px', fontWeight: '500',
                        cursor: 'pointer', textAlign: 'left',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#334155'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span>{s.icon}</span> {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
            {cmNom && <div style={{ marginTop: '8px' }}><CorpsMetierBadge nom={cmNom} /></div>}
            {calque.description && <p style={styles.desc}>{calque.description}</p>}
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div style={styles.infoGrid}>
        <div style={styles.infoCard}>
          <div style={styles.infoIcon}>📊</div>
          <div style={styles.infoContent}>
            <div style={styles.infoNum}>{elements.length}</div>
            <div style={styles.infoLabel}>Éléments total</div>
          </div>
        </div>
        {Object.entries(typeCounts).map(([type, count]) => (
          <div key={type} style={styles.infoCard}>
            <div style={styles.infoIcon}>{getTypeIcon(type)}</div>
            <div style={styles.infoContent}>
              <div style={styles.infoNum}>{count}</div>
              <div style={styles.infoLabel}>{type}{count > 1 ? 's' : ''}</div>
            </div>
          </div>
        ))}
        {calque.created_at && (
          <div style={styles.infoCard}>
            <div style={styles.infoIcon}>📅</div>
            <div style={styles.infoContent}>
              <div style={{ ...styles.infoNum, fontSize: '14px' }}>
                {new Date(calque.created_at).toLocaleDateString('fr-FR')}
              </div>
              <div style={styles.infoLabel}>Date de création</div>
            </div>
          </div>
        )}
      </div>

      {/* AR notice */}
      <div style={styles.arBanner}>
        <span style={{ fontSize: '20px' }}>📱</span>
        <div>
          <strong style={{ color: '#f1f5f9', fontSize: '13px' }}>
            {calque.statut === 'actif' ? 'Ce calque est visible en AR sur chantier' : 'Ce calque n\'est pas encore visible en AR'}
          </strong>
          <p style={styles.arText}>
            {calque.statut === 'actif'
              ? 'Les ouvriers peuvent visualiser ces éléments via l\'application mobile TradeLayer sur leur chantier.'
              : 'Passez le statut en "Actif" pour que les ouvriers puissent voir ce calque en réalité augmentée.'}
          </p>
        </div>
      </div>

      {/* Elements table */}
      <div style={styles.sectionTitle}>
        Éléments du calque
        <span style={styles.sectionCount}>{elements.length}</span>
      </div>

      {elements.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>📌</div>
          <div style={styles.emptyTitle}>Aucun élément</div>
          <div style={styles.emptyText}>Les éléments sont créés via l'application mobile AR sur chantier ou l'outil de dessin.</div>
        </div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Nom / Identifiant</th>
                <th style={styles.th}>Coordonnées</th>
                <th style={styles.th}>Propriétés</th>
                <th style={styles.th}>Créé le</th>
              </tr>
            </thead>
            <tbody>
              {elements.map((el, idx) => {
                const typeLabel = getTypeLabel(el.type_geometrie || el.type || el.geometrie_type || '')
                const typeIcon = getTypeIcon(el.type_geometrie || el.type || el.geometrie_type || '')
                const coords = el.geometrie || el.coordinates || el.coords
                const coordStr = coords
                  ? (typeof coords === 'object' ? JSON.stringify(coords).slice(0, 60) + (JSON.stringify(coords).length > 60 ? '…' : '') : String(coords))
                  : '—'
                const props = el.proprietes || el.properties || el.attributs
                const propsStr = props
                  ? (typeof props === 'object' ? JSON.stringify(props).slice(0, 60) + (JSON.stringify(props).length > 60 ? '…' : '') : String(props))
                  : '—'

                return (
                  <tr key={el.id} style={idx % 2 === 0 ? styles.trEven : styles.trOdd}>
                    <td style={styles.td}>{idx + 1}</td>
                    <td style={styles.td}>
                      <span style={styles.typeCell}>
                        {typeIcon} {typeLabel}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.elId}>{el.nom || el.name || el.label || `#${el.id}`}</span>
                    </td>
                    <td style={styles.tdMono}>{coordStr}</td>
                    <td style={styles.tdMono}>{propsStr}</td>
                    <td style={styles.td}>
                      {el.created_at
                        ? new Date(el.created_at).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const styles = {
  root: { maxWidth: '1100px' },
  loading: { textAlign: 'center', padding: '80px', color: '#64748b', fontSize: '15px' },
  breadcrumb: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' },
  breadLink: { color: '#3b82f6', fontSize: '13px', textDecoration: 'none' },
  breadSep: { color: '#334155', fontSize: '13px' },
  breadCurrent: { color: '#94a3b8', fontSize: '13px' },
  pageHeader: { marginBottom: '24px' },
  titleRow: { display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' },
  title: { fontSize: '26px', fontWeight: '700', color: '#f1f5f9', margin: 0 },
  desc: { fontSize: '13px', color: '#94a3b8', marginTop: '10px', maxWidth: '700px', lineHeight: '1.6' },
  infoGrid: {
    display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px',
  },
  infoCard: {
    display: 'flex', alignItems: 'center', gap: '14px',
    background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '16px 20px',
  },
  infoIcon: { fontSize: '24px' },
  infoContent: {},
  infoNum: { fontSize: '22px', fontWeight: '700', color: '#f1f5f9', lineHeight: '1' },
  infoLabel: { fontSize: '11px', color: '#64748b', marginTop: '2px' },
  arBanner: {
    display: 'flex', alignItems: 'flex-start', gap: '14px',
    background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
    borderRadius: '10px', padding: '16px 20px', marginBottom: '24px',
  },
  arText: { fontSize: '12px', color: '#94a3b8', marginTop: '4px', lineHeight: '1.5' },
  sectionTitle: {
    fontSize: '14px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase',
    letterSpacing: '0.08em', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px',
  },
  sectionCount: {
    background: '#334155', color: '#94a3b8', borderRadius: '12px',
    padding: '2px 10px', fontSize: '12px', fontWeight: '600',
  },
  empty: { textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  emptyTitle: { fontSize: '16px', fontWeight: '600', color: '#94a3b8' },
  emptyText: { fontSize: '13px', color: '#475569', maxWidth: '400px', lineHeight: '1.5' },
  tableWrapper: { overflowX: 'auto', borderRadius: '10px', border: '1px solid #334155' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  th: {
    background: '#1e293b', color: '#94a3b8', padding: '12px 16px',
    textAlign: 'left', fontWeight: '600', fontSize: '11px',
    textTransform: 'uppercase', letterSpacing: '0.05em',
    borderBottom: '1px solid #334155',
  },
  trEven: { background: '#0f172a' },
  trOdd: { background: '#111827' },
  td: { padding: '12px 16px', color: '#cbd5e1', borderBottom: '1px solid #1e293b', verticalAlign: 'middle' },
  tdMono: { padding: '12px 16px', color: '#64748b', borderBottom: '1px solid #1e293b', fontFamily: 'ui-monospace, monospace', fontSize: '11px', verticalAlign: 'middle' },
  typeCell: { display: 'inline-flex', alignItems: 'center', gap: '6px' },
  elId: { fontWeight: '500', color: '#f1f5f9' },
}
