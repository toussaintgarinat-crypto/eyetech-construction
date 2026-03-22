import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

const ACCENT = '#7c3aed'

const STATUTS = {
  en_cours: { label: 'En cours', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  termine: { label: 'Terminé', color: '#64748b', bg: 'rgba(100,116,139,0.12)' },
  archive: { label: 'Archivé', color: '#475569', bg: 'rgba(71,85,105,0.12)' },
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
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
    }}>
      {s.label}
    </span>
  )
}

function ModalNouveauScan({ onClose, onCreated }) {
  const [form, setForm] = useState({ nom: '', adresse: '', description: '', statut: 'en_cours' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/api/scans/chantiers/', form)
      onCreated()
      onClose()
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        const msgs = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ')
        setError(msgs)
      } else {
        setError('Erreur lors de la création du chantier.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Nouveau chantier scan</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Nom du chantier *</label>
            <input name="nom" value={form.nom} onChange={handleChange} style={styles.input} placeholder="Ex: Résidence Les Pins — Bât. A" required />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Adresse *</label>
            <input name="adresse" value={form.adresse} onChange={handleChange} style={styles.input} placeholder="12 rue de la Paix, 75001 Paris" required />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }} placeholder="Description du chantier à scanner..." />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Statut</label>
            <select name="statut" value={form.statut} onChange={handleChange} style={styles.input}>
              {Object.entries(STATUTS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div style={styles.modalActions}>
            <button type="button" onClick={onClose} style={styles.btnSecondary}>Annuler</button>
            <button type="submit" style={styles.btnPrimary} disabled={loading}>
              {loading ? 'Création...' : 'Créer le chantier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ScansPage() {
  const [scans, setScans] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')

  const fetchScans = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/scans/chantiers/')
      const data = res.data
      setScans(Array.isArray(data) ? data : (data.results || []))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchScans() }, [])

  const filtered = scans.filter(s =>
    s.nom?.toLowerCase().includes(search.toLowerCase()) ||
    s.adresse?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={styles.root}>
      {showModal && <ModalNouveauScan onClose={() => setShowModal(false)} onCreated={fetchScans} />}

      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.title}>Scans chantier</h1>
          <p style={styles.subtitle}>{scans.length} chantier{scans.length !== 1 ? 's' : ''} au total</p>
        </div>
        <button onClick={() => setShowModal(true)} style={styles.btnCreate}>
          + Nouveau chantier
        </button>
      </div>

      {/* Search bar */}
      <div style={styles.searchBar}>
        <span style={styles.searchIcon}>🔍</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un chantier ou une adresse..."
          style={styles.searchInput}
        />
      </div>

      {loading ? (
        <div style={styles.loading}>Chargement des chantiers...</div>
      ) : filtered.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>🏗</div>
          <div style={styles.emptyTitle}>{search ? 'Aucun chantier trouvé' : 'Aucun chantier'}</div>
          <div style={styles.emptyText}>
            {search ? 'Modifiez votre recherche.' : 'Créez votre premier chantier pour commencer à scanner.'}
          </div>
          {!search && (
            <button onClick={() => setShowModal(true)} style={{ ...styles.btnCreate, marginTop: '16px' }}>
              + Nouveau chantier
            </button>
          )}
        </div>
      ) : (
        <div style={styles.grid}>
          {filtered.map(scan => (
            <Link key={scan.id} to={`/scans/${scan.id}`} style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.cardIcon}>🏗</div>
                <StatutBadge statut={scan.statut} />
              </div>
              <h3 style={styles.cardTitle}>{scan.nom}</h3>
              <p style={styles.cardAddr}>{scan.adresse}</p>
              {scan.description && (
                <p style={styles.cardDesc}>{scan.description.slice(0, 100)}{scan.description.length > 100 ? '...' : ''}</p>
              )}
              <div style={styles.cardFooter}>
                <span style={styles.cardMeta}>
                  {scan.fichiers?.length !== undefined
                    ? `${scan.fichiers.length} fichier${scan.fichiers.length !== 1 ? 's' : ''}`
                    : 'Voir les détails'}
                </span>
                <span style={styles.cardArrow}>→</span>
              </div>
            </Link>
          ))}
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
  btnCreate: {
    background: ACCENT,
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    flexShrink: 0,
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
  searchIcon: { fontSize: '16px' },
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
  emptyIcon: { fontSize: '48px', marginBottom: '8px' },
  emptyTitle: { fontSize: '18px', fontWeight: '600', color: '#94a3b8' },
  emptyText: { fontSize: '13px', color: '#475569' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px',
  },
  card: {
    background: '#1e293b',
    borderRadius: '12px',
    border: '1px solid #334155',
    padding: '20px',
    textDecoration: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    transition: 'border-color 0.15s, background 0.15s',
    cursor: 'pointer',
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardIcon: { fontSize: '24px' },
  cardTitle: { fontSize: '16px', fontWeight: '600', color: '#f1f5f9', margin: 0 },
  cardAddr: { fontSize: '13px', color: ACCENT, fontWeight: '500', margin: 0 },
  cardDesc: { fontSize: '12px', color: '#64748b', lineHeight: '1.5', margin: 0, flex: 1 },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '10px',
    borderTop: '1px solid #1e293b',
    marginTop: 'auto',
  },
  cardMeta: { fontSize: '12px', color: '#475569' },
  cardArrow: { color: ACCENT, fontSize: '16px' },
  // Modal styles
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  modal: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '14px',
    padding: '28px',
    width: '480px',
    maxWidth: '95vw',
    boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
  },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  modalTitle: { fontSize: '18px', fontWeight: '600', color: '#f1f5f9', margin: 0 },
  closeBtn: { background: 'transparent', border: 'none', color: '#64748b', fontSize: '18px', cursor: 'pointer', padding: '4px 8px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '500', color: '#94a3b8' },
  input: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#f1f5f9',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
  },
  errorBox: {
    background: 'rgba(239,68,68,0.12)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#fca5a5',
    fontSize: '13px',
    marginBottom: '12px',
  },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' },
  btnSecondary: {
    background: 'transparent',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '10px 20px',
    color: '#94a3b8',
    fontSize: '14px',
    cursor: 'pointer',
  },
  btnPrimary: {
    background: ACCENT,
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
}
