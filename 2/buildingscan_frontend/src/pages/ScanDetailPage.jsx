import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api'

const ACCENT = '#7c3aed'

const STATUTS_CHANTIER = {
  en_cours: { label: 'En cours', color: '#10b981' },
  termine: { label: 'Terminé', color: '#64748b' },
  archive: { label: 'Archivé', color: '#475569' },
}

const STATUTS_SESSION = {
  en_cours: { label: 'En cours', color: '#10b981' },
  traitement: { label: 'En traitement', color: '#f59e0b' },
  termine: { label: 'Terminé', color: '#64748b' },
  erreur: { label: 'Erreur', color: '#ef4444' },
}

const METHODES = {
  lidar: 'LiDAR',
  photogrammetrie: 'Photogramm.',
  mixte: 'Mixte',
}

function Badge({ statut, map }) {
  const s = map[statut] || { label: statut || 'Inconnu', color: '#64748b' }
  return (
    <span style={{
      fontSize: '11px',
      fontWeight: '600',
      color: s.color,
      background: s.color + '22',
      border: `1px solid ${s.color}44`,
      borderRadius: '20px',
      padding: '2px 10px',
    }}>
      {s.label}
    </span>
  )
}

function formatBytes(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
}

export default function ScanDetailPage() {
  const { id } = useParams()
  const [scan, setScan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchScan = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/api/scans/chantiers/${id}/`)
        setScan(res.data)
      } catch (e) {
        setError('Impossible de charger ce chantier.')
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchScan()
  }, [id])

  if (loading) {
    return <div style={styles.loading}>Chargement du chantier...</div>
  }

  if (error || !scan) {
    return (
      <div style={styles.errorState}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠</div>
        <div style={{ color: '#94a3b8', fontSize: '16px' }}>{error || 'Chantier introuvable.'}</div>
        <Link to="/scans" style={styles.backLink}>← Retour aux scans</Link>
      </div>
    )
  }

  const fichiers = scan.fichiers || []
  const sessions = scan.sessions || []

  return (
    <div style={styles.root}>
      {/* Breadcrumb */}
      <div style={styles.breadcrumb}>
        <Link to="/scans" style={styles.breadLink}>Scans</Link>
        <span style={styles.breadSep}>/</span>
        <span style={styles.breadCurrent}>{scan.nom}</span>
      </div>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}>🏗</div>
          <div>
            <h1 style={styles.title}>{scan.nom}</h1>
            <p style={styles.address}>{scan.adresse}</p>
          </div>
        </div>
        <Badge statut={scan.statut} map={STATUTS_CHANTIER} />
      </div>

      {scan.description && (
        <div style={styles.descBlock}>
          <p style={styles.descText}>{scan.description}</p>
        </div>
      )}

      {/* Stats row */}
      <div style={styles.statsRow}>
        <div style={styles.statChip}>
          <span style={styles.statChipLabel}>Fichiers</span>
          <span style={styles.statChipValue}>{fichiers.length}</span>
        </div>
        <div style={styles.statChip}>
          <span style={styles.statChipLabel}>Sessions</span>
          <span style={styles.statChipValue}>{sessions.length}</span>
        </div>
        <div style={styles.statChip}>
          <span style={styles.statChipLabel}>Créé le</span>
          <span style={styles.statChipValue}>
            {scan.created_at ? new Date(scan.created_at).toLocaleDateString('fr-FR') : '—'}
          </span>
        </div>
      </div>

      {/* 3D Viewer Placeholder */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Visualiseur 3D</div>
        <div style={styles.viewer3d}>
          <div style={styles.viewerInner}>
            <div style={styles.viewerIcon}>🧊</div>
            <div style={styles.viewerTitle}>Visualiseur nuage de points</div>
            <p style={styles.viewerText}>
              Le rendu 3D interactif des nuages de points LiDAR sera disponible dans la version iOS de BuildingScan.
              Formats supportés : PLY, LAS, OBJ, GLB, IFC, E57.
            </p>
            {fichiers.length > 0 && (
              <div style={styles.viewerFiles}>
                <span style={styles.viewerFilesLabel}>{fichiers.length} fichier{fichiers.length !== 1 ? 's' : ''} disponible{fichiers.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fichiers */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Fichiers de scan ({fichiers.length})</div>
        {fichiers.length === 0 ? (
          <div style={styles.emptySection}>Aucun fichier uploadé pour ce chantier.</div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>Nom du fichier</th>
                  <th style={styles.th}>Format</th>
                  <th style={styles.th}>Taille</th>
                  <th style={styles.th}>Points</th>
                  <th style={styles.th}>Précision</th>
                  <th style={styles.th}>Uploadé le</th>
                </tr>
              </thead>
              <tbody>
                {fichiers.map(f => (
                  <tr
                    key={f.id}
                    style={styles.tr}
                    onMouseEnter={e => (e.currentTarget.style.background = '#253347')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={styles.td}>
                      <span style={styles.fileIcon}>📄</span>
                      {f.nom_fichier}
                    </td>
                    <td style={styles.td}>
                      <span style={styles.formatBadge}>{f.format_fichier}</span>
                    </td>
                    <td style={styles.td}>{formatBytes(f.taille_fichier)}</td>
                    <td style={styles.td}>{f.nb_points ? f.nb_points.toLocaleString('fr-FR') : '—'}</td>
                    <td style={styles.td}>{f.precision_cm ? `±${f.precision_cm} cm` : '—'}</td>
                    <td style={styles.td}>
                      {f.uploaded_at ? new Date(f.uploaded_at).toLocaleDateString('fr-FR') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sessions */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Sessions de scan ({sessions.length})</div>
        {sessions.length === 0 ? (
          <div style={styles.emptySection}>Aucune session de scan enregistrée.</div>
        ) : (
          <div style={styles.sessionGrid}>
            {sessions.map(sess => (
              <div key={sess.id} style={styles.sessionCard}>
                <div style={styles.sessionCardHeader}>
                  <span style={styles.sessionDevice}>{sess.device_utilise || 'iPhone Pro'}</span>
                  <Badge statut={sess.statut} map={STATUTS_SESSION} />
                </div>
                <div style={styles.sessionMeta}>
                  <div style={styles.sessionMetaItem}>
                    <span style={styles.sessionMetaLabel}>Méthode</span>
                    <span style={styles.sessionMetaValue}>{METHODES[sess.methode] || sess.methode}</span>
                  </div>
                  <div style={styles.sessionMetaItem}>
                    <span style={styles.sessionMetaLabel}>Durée</span>
                    <span style={styles.sessionMetaValue}>{sess.duree_minutes} min</span>
                  </div>
                  <div style={styles.sessionMetaItem}>
                    <span style={styles.sessionMetaLabel}>Surface</span>
                    <span style={styles.sessionMetaValue}>{sess.surface_scannee_m2} m²</span>
                  </div>
                  <div style={styles.sessionMetaItem}>
                    <span style={styles.sessionMetaLabel}>Date</span>
                    <span style={styles.sessionMetaValue}>
                      {sess.date_session ? new Date(sess.date_session).toLocaleDateString('fr-FR') : '—'}
                    </span>
                  </div>
                </div>
                {sess.notes && (
                  <p style={styles.sessionNotes}>{sess.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  root: { maxWidth: '1100px' },
  loading: { textAlign: 'center', padding: '80px', color: '#64748b', fontSize: '15px' },
  errorState: {
    textAlign: 'center',
    padding: '80px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  backLink: {
    color: ACCENT,
    fontSize: '14px',
    fontWeight: '500',
    marginTop: '8px',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '20px',
    fontSize: '13px',
    color: '#64748b',
  },
  breadLink: { color: ACCENT, fontWeight: '500' },
  breadSep: { color: '#334155' },
  breadCurrent: { color: '#94a3b8' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  headerIcon: {
    fontSize: '40px',
    lineHeight: '1',
  },
  title: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: '4px',
  },
  address: {
    fontSize: '14px',
    color: '#64748b',
  },
  descBlock: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '10px',
    padding: '14px 18px',
    marginBottom: '20px',
  },
  descText: {
    fontSize: '14px',
    color: '#94a3b8',
    lineHeight: '1.6',
  },
  statsRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '28px',
    flexWrap: 'wrap',
  },
  statChip: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '10px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: '100px',
  },
  statChipLabel: {
    fontSize: '11px',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  statChipValue: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#f1f5f9',
  },
  section: {
    marginBottom: '32px',
  },
  sectionTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '14px',
  },
  viewer3d: {
    background: 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(15,23,42,1) 100%)',
    border: '1px solid rgba(124,58,237,0.25)',
    borderRadius: '12px',
    minHeight: '220px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px',
  },
  viewerInner: {
    textAlign: 'center',
    maxWidth: '400px',
  },
  viewerIcon: {
    fontSize: '48px',
    marginBottom: '12px',
  },
  viewerTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: '8px',
  },
  viewerText: {
    fontSize: '13px',
    color: '#64748b',
    lineHeight: '1.6',
  },
  viewerFiles: {
    marginTop: '12px',
    display: 'inline-block',
    background: 'rgba(124,58,237,0.15)',
    border: '1px solid rgba(124,58,237,0.3)',
    borderRadius: '20px',
    padding: '4px 12px',
  },
  viewerFilesLabel: {
    fontSize: '12px',
    color: ACCENT,
    fontWeight: '600',
  },
  emptySection: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '10px',
    padding: '24px',
    textAlign: 'center',
    color: '#475569',
    fontSize: '14px',
  },
  tableWrap: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '10px',
    overflow: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  thead: {
    borderBottom: '1px solid #334155',
  },
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
  tr: {
    borderBottom: '1px solid rgba(51,65,85,0.5)',
  },
  td: {
    padding: '12px 16px',
    fontSize: '13px',
    color: '#cbd5e1',
    whiteSpace: 'nowrap',
    display: 'table-cell',
    verticalAlign: 'middle',
  },
  fileIcon: {
    marginRight: '8px',
    fontSize: '14px',
  },
  formatBadge: {
    background: 'rgba(124,58,237,0.15)',
    color: ACCENT,
    border: `1px solid rgba(124,58,237,0.3)`,
    borderRadius: '6px',
    padding: '2px 8px',
    fontSize: '11px',
    fontWeight: '700',
  },
  sessionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '14px',
  },
  sessionCard: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '10px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  sessionCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionDevice: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#f1f5f9',
  },
  sessionMeta: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
  },
  sessionMetaItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  sessionMetaLabel: {
    fontSize: '10px',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  sessionMetaValue: {
    fontSize: '13px',
    color: '#cbd5e1',
    fontWeight: '500',
  },
  sessionNotes: {
    fontSize: '12px',
    color: '#64748b',
    lineHeight: '1.5',
    fontStyle: 'italic',
    margin: 0,
  },
}
