import { useEffect, useState } from 'react'
import api from '../api'

const ACCENT = '#7c3aed'

const STATUTS = {
  generation: { label: 'En génération', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  pret: { label: 'Prêt', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  archive: { label: 'Archivé', color: '#475569', bg: 'rgba(71,85,105,0.12)' },
}

const FORMATS = {
  GLB: { color: ACCENT },
  OBJ: { color: '#8b5cf6' },
  IFC: { color: '#a78bfa' },
}

function StatutBadge({ statut }) {
  const s = STATUTS[statut] || { label: statut || 'Inconnu', color: '#64748b', bg: 'rgba(100,116,139,0.12)' }
  return (
    <span style={{
      fontSize: '11px',
      fontWeight: '600',
      color: s.color,
      background: s.bg,
      border: `1px solid ${s.color}44`,
      borderRadius: '20px',
      padding: '3px 10px',
    }}>
      {s.label}
    </span>
  )
}

export default function JumeauxPage() {
  const [jumeaux, setJumeaux] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchJumeaux = async () => {
      setLoading(true)
      try {
        const res = await api.get('/api/jumeaux/jumeaux/')
        const data = res.data
        setJumeaux(Array.isArray(data) ? data : (data.results || []))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchJumeaux()
  }, [])

  const filtered = jumeaux.filter(j =>
    j.nom?.toLowerCase().includes(search.toLowerCase()) ||
    j.format_modele?.toLowerCase().includes(search.toLowerCase())
  )

  const prets = jumeaux.filter(j => j.statut === 'pret').length
  const exporte = jumeaux.filter(j => j.exporte_tradelayer).length

  return (
    <div style={styles.root}>
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.title}>Jumeaux numériques</h1>
          <p style={styles.subtitle}>{jumeaux.length} jumeau{jumeaux.length !== 1 ? 'x' : ''} — {prets} prêt{prets !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Info banner */}
      <div style={styles.infoBanner}>
        <div style={{ fontSize: '28px', flexShrink: 0 }}>🔗</div>
        <div>
          <strong style={{ color: '#f1f5f9', fontSize: '14px' }}>Intégration TradeLayer</strong>
          <p style={styles.bannerText}>
            Les jumeaux numériques exportés vers TradeLayer ({exporte} exporté{exporte !== 1 ? 's' : ''}) alimentent les calques métiers AR utilisés par les équipes sur le terrain.
          </p>
        </div>
      </div>

      {/* Search bar */}
      <div style={styles.searchBar}>
        <span>🔍</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un jumeau numérique..."
          style={styles.searchInput}
        />
      </div>

      {loading ? (
        <div style={styles.loading}>Chargement des jumeaux numériques...</div>
      ) : filtered.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🧊</div>
          <div style={styles.emptyTitle}>{search ? 'Aucun résultat' : 'Aucun jumeau numérique'}</div>
          <div style={styles.emptyText}>
            {search
              ? 'Modifiez votre recherche.'
              : 'Les jumeaux numériques sont générés automatiquement depuis les sessions de scan LiDAR et photogrammétriques.'
            }
          </div>
        </div>
      ) : (
        <div style={styles.grid}>
          {filtered.map(j => {
            const fmt = FORMATS[j.format_modele] || { color: '#64748b' }
            return (
              <div key={j.id} style={styles.card}>
                {/* Card header */}
                <div style={styles.cardHeader}>
                  <div style={{ ...styles.cardFormatBadge, color: fmt.color, borderColor: fmt.color + '44', background: fmt.color + '22' }}>
                    {j.format_modele || 'GLB'}
                  </div>
                  <StatutBadge statut={j.statut} />
                </div>

                {/* 3D Icon */}
                <div style={styles.cardIconWrap}>
                  <div style={styles.cardIcon3d}>
                    <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" stroke={fmt.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M2 17l10 5 10-5" stroke={fmt.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M2 12l10 5 10-5" stroke={fmt.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                {/* Name and version */}
                <div>
                  <h3 style={styles.cardName}>{j.nom}</h3>
                  <span style={styles.cardVersion}>v{j.version || '1.0'}</span>
                </div>

                {/* Metadata */}
                <div style={styles.cardMeta}>
                  <div style={styles.metaRow}>
                    <span style={styles.metaLabel}>Éléments</span>
                    <span style={styles.metaValue}>{j.nb_elements?.toLocaleString('fr-FR') || '—'}</span>
                  </div>
                  <div style={styles.metaRow}>
                    <span style={styles.metaLabel}>Précision</span>
                    <span style={styles.metaValue}>±{j.precision_globale_cm || 1} cm</span>
                  </div>
                  <div style={styles.metaRow}>
                    <span style={styles.metaLabel}>Créé le</span>
                    <span style={styles.metaValue}>
                      {j.created_at ? new Date(j.created_at).toLocaleDateString('fr-FR') : '—'}
                    </span>
                  </div>
                  <div style={styles.metaRow}>
                    <span style={styles.metaLabel}>Mis à jour</span>
                    <span style={styles.metaValue}>
                      {j.updated_at ? new Date(j.updated_at).toLocaleDateString('fr-FR') : '—'}
                    </span>
                  </div>
                </div>

                {/* TradeLayer export */}
                {j.exporte_tradelayer && (
                  <div style={styles.exportedBadge}>
                    <span>✓</span>
                    <span>Exporté vers TradeLayer</span>
                    {j.url_tradelayer && (
                      <a href={j.url_tradelayer} target="_blank" rel="noopener noreferrer" style={styles.tradelayerLink}>
                        Ouvrir →
                      </a>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
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
  infoBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(139,92,246,0.06) 100%)',
    border: '1px solid rgba(124,58,237,0.2)',
    borderRadius: '12px',
    padding: '16px 20px',
    marginBottom: '20px',
  },
  bannerText: {
    fontSize: '13px',
    color: '#94a3b8',
    marginTop: '4px',
    lineHeight: '1.5',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '10px',
    padding: '10px 16px',
    marginBottom: '24px',
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
  emptyText: { fontSize: '13px', color: '#475569', maxWidth: '380px', textAlign: 'center', lineHeight: '1.5' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  card: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardFormatBadge: {
    fontSize: '12px',
    fontWeight: '700',
    border: '1px solid',
    borderRadius: '6px',
    padding: '2px 8px',
    letterSpacing: '0.05em',
  },
  cardIconWrap: {
    display: 'flex',
    justifyContent: 'center',
    padding: '8px 0',
  },
  cardIcon3d: {
    width: '64px',
    height: '64px',
    background: 'rgba(124,58,237,0.08)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(124,58,237,0.15)',
  },
  cardName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#f1f5f9',
    margin: 0,
    marginBottom: '4px',
  },
  cardVersion: {
    fontSize: '11px',
    color: '#475569',
    fontWeight: '500',
  },
  cardMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    background: 'rgba(15,23,42,0.4)',
    borderRadius: '8px',
    padding: '10px 12px',
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: '12px',
    color: '#475569',
  },
  metaValue: {
    fontSize: '12px',
    color: '#cbd5e1',
    fontWeight: '500',
  },
  exportedBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(16,185,129,0.1)',
    border: '1px solid rgba(16,185,129,0.25)',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '12px',
    color: '#10b981',
    fontWeight: '500',
  },
  tradelayerLink: {
    marginLeft: 'auto',
    color: '#10b981',
    fontSize: '12px',
    fontWeight: '600',
  },
}
