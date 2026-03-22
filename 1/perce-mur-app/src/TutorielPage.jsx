import { useState } from 'react'

const etapes = [
  {
    numero: 1,
    titre: 'Connexion',
    icone: (
      <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
        <circle cx="24" cy="16" r="8" stroke="#60a5fa" strokeWidth="2.5" />
        <path d="M8 44c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="30" y="28" width="12" height="10" rx="2" stroke="#3b82f6" strokeWidth="2" />
        <path d="M33 31v-2a3 3 0 0 1 6 0v2" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    texte: 'Connectez-vous avec vos identifiants Eyetech.',
    astuce: 'Vos identifiants vous sont fournis par votre chef de projet Eyetech Construction. En cas de perte, contactez l\'administrateur pour réinitialiser votre mot de passe.',
    bouton: null,
  },
  {
    numero: 2,
    titre: 'Créer un projet',
    icone: (
      <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
        <rect x="6" y="8" width="36" height="32" rx="3" stroke="#60a5fa" strokeWidth="2.5" />
        <path d="M6 16h36" stroke="#60a5fa" strokeWidth="2" />
        <path d="M24 24v12M18 30h12" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
    texte: 'Créez un projet de perçage avec l\'adresse et les infos du chantier.',
    astuce: 'Donnez un nom clair à votre projet (ex: "Chantier Dupont - Salle de bain étage 2"). Renseignez l\'adresse précise : elle sera utilisée pour les rapports et pour retrouver le projet rapidement.',
    bouton: null,
  },
  {
    numero: 3,
    titre: 'Définir les points de perçage',
    icone: (
      <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
        <rect x="6" y="6" width="36" height="36" rx="2" stroke="#334155" strokeWidth="2" />
        <circle cx="16" cy="16" r="4" stroke="#60a5fa" strokeWidth="2" />
        <circle cx="32" cy="16" r="4" stroke="#60a5fa" strokeWidth="2" />
        <circle cx="16" cy="32" r="4" stroke="#60a5fa" strokeWidth="2" />
        <circle cx="32" cy="32" r="4" stroke="#60a5fa" strokeWidth="2" />
        <path d="M16 16l16 16M32 16L16 32" stroke="rgba(96,165,250,0.3)" strokeWidth="1" />
      </svg>
    ),
    texte: 'Dans le projet, ajoutez les points de perçage avec coordonnées et profondeur.',
    astuce: 'Les coordonnées X, Y correspondent à la position horizontale et verticale sur le mur (en cm depuis le coin inférieur gauche). La coordonnée Z correspond à la profondeur de perçage souhaitée. Une profondeur incorrecte peut endommager les installations derrière le mur.',
    bouton: null,
  },
  {
    numero: 4,
    titre: 'Utiliser l\'app iOS',
    icone: (
      <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
        <rect x="14" y="4" width="20" height="40" rx="4" stroke="#60a5fa" strokeWidth="2.5" />
        <rect x="17" y="8" width="14" height="26" rx="1" fill="rgba(59,130,246,0.15)" />
        <circle cx="24" cy="38" r="2" fill="#60a5fa" />
        <path d="M22 20l4 4-4 4" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M30 14l6-4M30 34l6 4" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />
      </svg>
    ),
    texte: 'Ouvrez l\'app Perce-Mur sur iPhone Pro. Pointez vers le mur : les lignes de guidage AR apparaissent en superposition.',
    astuce: 'L\'app iOS fonctionne mieux avec un iPhone Pro (LiDAR) qui offre une précision de ±1-2mm. Avec un iPhone standard, la précision est de ±5-8mm. Assurez-vous d\'avoir un bon éclairage : la caméra AR a besoin de contraste pour identifier les surfaces.',
    bouton: null,
  },
  {
    numero: 5,
    titre: 'Vérifier les obstacles',
    icone: (
      <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
        <rect x="4" y="10" width="40" height="28" rx="3" stroke="#334155" strokeWidth="2" />
        <path d="M14 24h20" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 3" />
        <path d="M14 30h20" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 3" />
        <circle cx="36" cy="14" r="7" fill="#0f172a" stroke="#ef4444" strokeWidth="2" />
        <path d="M33 14h6M36 11v6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    texte: 'L\'app détecte automatiquement les obstacles (tuyaux, câbles) via le LiDAR avant de percer.',
    astuce: 'La détection d\'obstacles fonctionne via le LiDAR et une base de données des plans du bâtiment. Si aucun plan n\'est disponible, l\'app analyse la densité du mur pour estimer la présence d\'installations. En cas de doute, utilisez toujours un détecteur de câbles physique.',
    bouton: null,
  },
]

export default function TutorielPage({ onClose }) {
  const [etapeActive, setEtapeActive] = useState(0)

  const etape = etapes[etapeActive]
  const progression = ((etapeActive + 1) / etapes.length) * 100

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.modalHeader}>
          <div>
            <h2 style={styles.modalTitre}>Tutoriel Perce-Mur</h2>
            <p style={styles.modalSousTitre}>Guide d'utilisation de l'application AR</p>
          </div>
          {onClose && (
            <button onClick={onClose} style={styles.closeBtn} title="Fermer">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        {/* Barre de progression */}
        <div style={styles.progressContainer}>
          <div style={styles.progressMeta}>
            <span style={styles.progressLabel}>Étape {etapeActive + 1} sur {etapes.length}</span>
            <span style={styles.progressPct}>{Math.round(progression)}%</span>
          </div>
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressBar, width: `${progression}%` }} />
          </div>
          <div style={styles.stepsRow}>
            {etapes.map((e, i) => (
              <button
                key={i}
                onClick={() => setEtapeActive(i)}
                style={{
                  ...styles.stepDot,
                  ...(i === etapeActive ? styles.stepDotActive : {}),
                  ...(i < etapeActive ? styles.stepDotDone : {}),
                }}
                title={e.titre}
              >
                {i < etapeActive ? (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span style={{ fontSize: 10, fontWeight: 700, color: i === etapeActive ? 'white' : '#475569' }}>{i + 1}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Carte étape */}
        <div style={styles.card}>
          <div style={styles.cardTop}>
            <div style={styles.etapeNumBadge}>Étape {etape.numero}</div>
            <div style={styles.iconeBox}>{etape.icone}</div>
            <h3 style={styles.etapeTitre}>{etape.titre}</h3>
            <p style={styles.etapeTexte}>{etape.texte}</p>
          </div>
          <div style={styles.astuce}>
            <div style={styles.astuceHeader}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="#10b981" strokeWidth="2" />
                <path d="M12 8v4M12 16h.01" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span style={styles.astuceLabel}>Astuce</span>
            </div>
            <p style={styles.astuceTexte}>{etape.astuce}</p>
          </div>
        </div>

        {/* Navigation */}
        <div style={styles.navBtns}>
          <button
            onClick={() => setEtapeActive(i => Math.max(0, i - 1))}
            disabled={etapeActive === 0}
            style={{ ...styles.navBtn, ...(etapeActive === 0 ? styles.navBtnDisabled : {}) }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
              <path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Précédent
          </button>
          <span style={styles.etapeIndicator}>{etapeActive + 1} / {etapes.length}</span>
          {etapeActive < etapes.length - 1 ? (
            <button
              onClick={() => setEtapeActive(i => i + 1)}
              style={{ ...styles.navBtn, ...styles.navBtnNext }}
            >
              Suivant
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" style={{ marginLeft: 8 }}>
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : (
            <button
              onClick={onClose}
              style={{ ...styles.navBtn, ...styles.navBtnDone }}
            >
              Terminer
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" style={{ marginLeft: 8 }}>
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modal: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: 16,
    width: '100%',
    maxWidth: 640,
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '1.5rem',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
  },
  modalTitre: {
    fontSize: '1.35rem',
    fontWeight: 700,
    color: '#f1f5f9',
    marginBottom: '0.25rem',
  },
  modalSousTitre: {
    color: '#64748b',
    fontSize: '0.875rem',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: 6,
    color: '#64748b',
    flexShrink: 0,
  },
  progressContainer: {
    marginBottom: '1.5rem',
  },
  progressMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.4rem',
    fontSize: '0.8rem',
    color: '#64748b',
  },
  progressLabel: {},
  progressPct: { fontWeight: 600, color: '#3b82f6' },
  progressTrack: {
    height: 6,
    background: '#1e293b',
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: '0.75rem',
  },
  progressBar: {
    height: '100%',
    background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
    borderRadius: 999,
    transition: 'width 0.4s ease',
  },
  stepsRow: {
    display: 'flex',
    gap: '6px',
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: '#1e293b',
    border: '2px solid #334155',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    flexShrink: 0,
  },
  stepDotActive: { background: '#3b82f6', borderColor: '#3b82f6' },
  stepDotDone: { background: '#10b981', borderColor: '#10b981' },
  card: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 12,
    padding: '1.5rem',
    marginBottom: '1.25rem',
  },
  cardTop: {
    textAlign: 'center',
    marginBottom: '1.25rem',
  },
  etapeNumBadge: {
    display: 'inline-block',
    background: 'rgba(59,130,246,0.15)',
    border: '1px solid rgba(59,130,246,0.3)',
    color: '#3b82f6',
    fontSize: '0.7rem',
    fontWeight: 600,
    borderRadius: 999,
    padding: '0.2rem 0.65rem',
    marginBottom: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  iconeBox: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '0.75rem',
  },
  etapeTitre: {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: '#f1f5f9',
    marginBottom: '0.6rem',
  },
  etapeTexte: {
    color: '#94a3b8',
    lineHeight: 1.7,
    fontSize: '0.9rem',
    margin: 0,
  },
  astuce: {
    background: 'rgba(16,185,129,0.08)',
    border: '1px solid rgba(16,185,129,0.25)',
    borderRadius: 8,
    padding: '0.875rem 1rem',
  },
  astuceHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.4rem',
  },
  astuceLabel: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#10b981',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  astuceTexte: {
    color: '#94a3b8',
    fontSize: '0.825rem',
    lineHeight: 1.65,
    margin: 0,
  },
  navBtns: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    background: '#1e293b',
    border: '1px solid #334155',
    color: '#94a3b8',
    borderRadius: 8,
    padding: '0.65rem 1.25rem',
    fontWeight: 500,
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
  navBtnNext: {
    background: '#3b82f6',
    borderColor: '#3b82f6',
    color: 'white',
  },
  navBtnDone: {
    background: '#10b981',
    borderColor: '#10b981',
    color: 'white',
  },
  navBtnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  etapeIndicator: {
    color: '#475569',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
}
