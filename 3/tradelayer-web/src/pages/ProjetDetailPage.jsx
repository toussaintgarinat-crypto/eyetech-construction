import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api'
import CorpsMetierBadge from '../components/CorpsMetierBadge'

const CORPS_METIER_COLORS = {
  plomberie: '#3b82f6',
  electricite: '#eab308',
  placo: '#94a3b8',
  charpente: '#92400e',
  cvc: '#ef4444',
  peinture: '#22c55e',
  maconnerie: '#d97706',
  menuiserie: '#a78bfa',
  default: '#64748b',
}

function getCorpsColor(nomCorps) {
  if (!nomCorps) return CORPS_METIER_COLORS.default
  const key = nomCorps.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '')
  for (const [k, v] of Object.entries(CORPS_METIER_COLORS)) {
    if (key.includes(k)) return v
  }
  return CORPS_METIER_COLORS.default
}

const STATUTS_CALQUE = {
  brouillon: { label: 'Brouillon', color: '#f59e0b' },
  actif: { label: 'Actif', color: '#10b981' },
  archivé: { label: 'Archivé', color: '#64748b' },
  archive: { label: 'Archivé', color: '#64748b' },
}

function StatutCalqueBadge({ statut }) {
  const s = STATUTS_CALQUE[statut] || { label: statut || 'Inconnu', color: '#64748b' }
  return (
    <span style={{
      fontSize: '11px',
      fontWeight: '600',
      color: s.color,
      background: s.color + '22',
      border: `1px solid ${s.color}44`,
      borderRadius: '20px',
      padding: '3px 10px',
    }}>
      {s.label}
    </span>
  )
}

function ModalAjouterCalque({ projetId, corpsMetiers, onClose, onCreated }) {
  const [form, setForm] = useState({ nom: '', description: '', corps_metier: '', statut: 'brouillon' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = { ...form, projet: projetId }
      if (!form.corps_metier) delete payload.corps_metier
      await api.post('/api/calques-metiers/api/calques/', payload)
      onCreated()
      onClose()
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        const msgs = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ')
        setError(msgs)
      } else {
        setError('Erreur lors de la création du calque.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modal}>
        <div style={modalHeader}>
          <h2 style={modalTitle}>Ajouter un calque</h2>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        {error && <div style={errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={form_}>
          <div style={fg}>
            <label style={lbl}>Nom du calque *</label>
            <input name="nom" value={form.nom} onChange={handleChange} style={inp} placeholder="Ex: Réseau eau froide RDC" required />
          </div>
          <div style={fg}>
            <label style={lbl}>Corps de métier</label>
            <select name="corps_metier" value={form.corps_metier} onChange={handleChange} style={inp}>
              <option value="">— Sélectionner —</option>
              {corpsMetiers.map(cm => (
                <option key={cm.id} value={cm.id}>{cm.nom || cm.name}</option>
              ))}
            </select>
          </div>
          <div style={fg}>
            <label style={lbl}>Statut</label>
            <select name="statut" value={form.statut} onChange={handleChange} style={inp}>
              <option value="brouillon">Brouillon</option>
              <option value="actif">Actif</option>
              <option value="archive">Archivé</option>
            </select>
          </div>
          <div style={fg}>
            <label style={lbl}>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} style={{ ...inp, minHeight: '70px', resize: 'vertical' }} placeholder="Description du calque..." />
          </div>
          <div style={actions}>
            <button type="button" onClick={onClose} style={btnSec}>Annuler</button>
            <button type="submit" style={btnPrim} disabled={loading}>
              {loading ? 'Création...' : 'Créer le calque'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000, backdropFilter: 'blur(4px)',
}
const modal = {
  background: '#1e293b', border: '1px solid #334155', borderRadius: '14px',
  padding: '28px', width: '480px', maxWidth: '95vw', boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
}
const modalHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }
const modalTitle = { fontSize: '18px', fontWeight: '600', color: '#f1f5f9', margin: 0 }
const closeBtn = { background: 'transparent', border: 'none', color: '#64748b', fontSize: '18px', cursor: 'pointer', padding: '4px 8px' }
const form_ = { display: 'flex', flexDirection: 'column', gap: '14px' }
const fg = { display: 'flex', flexDirection: 'column', gap: '6px' }
const lbl = { fontSize: '13px', fontWeight: '500', color: '#94a3b8' }
const inp = { background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '10px 14px', color: '#f1f5f9', fontSize: '14px', outline: 'none', width: '100%' }
const errorBox = { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 14px', color: '#fca5a5', fontSize: '13px', marginBottom: '12px' }
const actions = { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '4px' }
const btnSec = { background: 'transparent', border: '1px solid #334155', borderRadius: '8px', padding: '10px 20px', color: '#94a3b8', fontSize: '14px', cursor: 'pointer' }
const btnPrim = { background: '#3b82f6', border: 'none', borderRadius: '8px', padding: '10px 20px', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }

export default function ProjetDetailPage() {
  const { id } = useParams()
  const [projet, setProjet] = useState(null)
  const [calques, setCalques] = useState([])
  const [corpsMetiers, setCorpsMetiers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filtre, setFiltre] = useState('tous')

  const fetchData = async () => {
    setLoading(true)
    try {
      const [projetRes, calquesRes, cmRes] = await Promise.allSettled([
        api.get(`/api/calques-metiers/api/projets/${id}/`),
        api.get(`/api/calques-metiers/api/calques/?projet=${id}`),
        api.get('/api/calques-metiers/api/corps-metiers/'),
      ])

      if (projetRes.status === 'fulfilled') setProjet(projetRes.value.data)
      if (calquesRes.status === 'fulfilled') {
        const d = calquesRes.value.data
        setCalques(Array.isArray(d) ? d : (d.results || []))
      }
      if (cmRes.status === 'fulfilled') {
        const d = cmRes.value.data
        setCorpsMetiers(Array.isArray(d) ? d : (d.results || []))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [id])

  // Group calques by corps metier
  const grouped = calques.reduce((acc, cal) => {
    const cmId = cal.corps_metier || 'sans'
    if (!acc[cmId]) acc[cmId] = []
    acc[cmId].push(cal)
    return acc
  }, {})

  const getCorpsMetierNom = (cmId) => {
    const cm = corpsMetiers.find(c => String(c.id) === String(cmId))
    return cm ? (cm.nom || cm.name) : null
  }

  const filteredCalques = filtre === 'tous' ? calques : calques.filter(c => c.statut === filtre)

  if (loading) return <div style={styles.loading}>Chargement du projet...</div>
  if (!projet) return <div style={styles.loading}>Projet introuvable.</div>

  return (
    <div style={styles.root}>
      {showModal && (
        <ModalAjouterCalque
          projetId={id}
          corpsMetiers={corpsMetiers}
          onClose={() => setShowModal(false)}
          onCreated={fetchData}
        />
      )}

      {/* Breadcrumb */}
      <div style={styles.breadcrumb}>
        <Link to="/projets" style={styles.breadLink}>Projets</Link>
        <span style={styles.breadSep}>/</span>
        <span style={styles.breadCurrent}>{projet.nom}</span>
      </div>

      {/* Header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.title}>{projet.nom}</h1>
          {projet.client && <p style={styles.client}>Client : <strong style={{ color: '#f1f5f9' }}>{projet.client}</strong></p>}
          {projet.description && <p style={styles.desc}>{projet.description}</p>}
        </div>
        <button onClick={() => setShowModal(true)} style={styles.btnAdd}>
          + Ajouter calque
        </button>
      </div>

      {/* Stats bar */}
      <div style={styles.statsBar}>
        <div style={styles.stat}>
          <span style={styles.statNum}>{calques.length}</span>
          <span style={styles.statLabel}>Calques total</span>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.stat}>
          <span style={{ ...styles.statNum, color: '#10b981' }}>{calques.filter(c => c.statut === 'actif').length}</span>
          <span style={styles.statLabel}>Actifs (AR)</span>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.stat}>
          <span style={{ ...styles.statNum, color: '#f59e0b' }}>{calques.filter(c => c.statut === 'brouillon').length}</span>
          <span style={styles.statLabel}>Brouillons</span>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.stat}>
          <span style={{ ...styles.statNum, color: '#64748b' }}>{calques.filter(c => c.statut === 'archivé' || c.statut === 'archive').length}</span>
          <span style={styles.statLabel}>Archivés</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={styles.tabs}>
        {['tous', 'actif', 'brouillon', 'archive'].map(f => (
          <button
            key={f}
            onClick={() => setFiltre(f)}
            style={{
              ...styles.tab,
              ...(filtre === f ? styles.tabActive : {}),
            }}
          >
            {f === 'tous' ? 'Tous' : f === 'actif' ? 'Actifs' : f === 'brouillon' ? 'Brouillons' : 'Archivés'}
          </button>
        ))}
      </div>

      {/* Calques list grouped by corps de métier */}
      {filteredCalques.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>🗂</div>
          <div style={styles.emptyTitle}>Aucun calque</div>
          <div style={styles.emptyText}>Créez votre premier calque métier pour ce projet.</div>
          <button onClick={() => setShowModal(true)} style={{ ...styles.btnAdd, marginTop: '16px' }}>+ Ajouter calque</button>
        </div>
      ) : (
        <div style={styles.calquesList}>
          {filteredCalques.map(calque => {
            const cmNom = getCorpsMetierNom(calque.corps_metier)
            const color = getCorpsColor(cmNom)
            return (
              <Link
                key={calque.id}
                to={`/calques/${calque.id}`}
                style={{ ...styles.calqueCard, borderLeftColor: color }}
                onMouseEnter={e => (e.currentTarget.style.background = '#253347')}
                onMouseLeave={e => (e.currentTarget.style.background = '#1e293b')}
              >
                <div style={styles.calqueTop}>
                  <div style={styles.calqueLeft}>
                    <div style={{ ...styles.calqueColorDot, background: color }} />
                    <div>
                      <div style={styles.calqueNom}>{calque.nom}</div>
                      {cmNom && <CorpsMetierBadge nom={cmNom} />}
                    </div>
                  </div>
                  <div style={styles.calqueRight}>
                    <StatutCalqueBadge statut={calque.statut} />
                    {calque.elements_count !== undefined && (
                      <span style={styles.calqueMeta}>{calque.elements_count} élément{calque.elements_count !== 1 ? 's' : ''}</span>
                    )}
                    <span style={styles.calqueArrow}>→</span>
                  </div>
                </div>
                {calque.description && (
                  <p style={styles.calqueDesc}>{calque.description}</p>
                )}
              </Link>
            )
          })}
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
  pageHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px',
  },
  title: { fontSize: '26px', fontWeight: '700', color: '#f1f5f9', marginBottom: '6px' },
  client: { fontSize: '13px', color: '#64748b', marginBottom: '4px' },
  desc: { fontSize: '13px', color: '#94a3b8', maxWidth: '600px', lineHeight: '1.5' },
  btnAdd: {
    background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px',
    padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', flexShrink: 0,
  },
  statsBar: {
    display: 'flex', alignItems: 'center',
    background: '#1e293b', border: '1px solid #334155', borderRadius: '12px',
    padding: '16px 24px', marginBottom: '20px', gap: '0',
  },
  stat: { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, alignItems: 'center' },
  statNum: { fontSize: '24px', fontWeight: '700', color: '#f1f5f9' },
  statLabel: { fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' },
  statDivider: { width: '1px', height: '40px', background: '#334155', margin: '0 8px' },
  tabs: { display: 'flex', gap: '4px', marginBottom: '20px' },
  tab: {
    background: 'transparent', border: '1px solid #334155', borderRadius: '8px',
    padding: '7px 16px', color: '#64748b', fontSize: '13px', cursor: 'pointer',
  },
  tabActive: { background: '#1e293b', borderColor: '#3b82f6', color: '#3b82f6' },
  empty: { textAlign: 'center', padding: '80px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  emptyTitle: { fontSize: '17px', fontWeight: '600', color: '#94a3b8' },
  emptyText: { fontSize: '13px', color: '#475569' },
  calquesList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  calqueCard: {
    background: '#1e293b', borderRadius: '10px', border: '1px solid #334155',
    borderLeft: '4px solid', padding: '16px 20px', textDecoration: 'none', display: 'block',
    transition: 'background 0.15s',
  },
  calqueTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' },
  calqueLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  calqueColorDot: { width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0 },
  calqueNom: { fontSize: '15px', fontWeight: '600', color: '#f1f5f9', marginBottom: '4px' },
  calqueRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  calqueMeta: { fontSize: '12px', color: '#475569' },
  calqueArrow: { color: '#3b82f6', fontSize: '16px' },
  calqueDesc: { fontSize: '12px', color: '#64748b', marginTop: '8px', paddingLeft: '24px', lineHeight: '1.5' },
}
