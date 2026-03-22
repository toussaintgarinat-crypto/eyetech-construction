import { useState } from 'react'

const ACCENT = '#7c3aed'

const etapes = [
  {
    numero: 1,
    titre: 'Uploader un scan',
    icone: (
      <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
        <rect x="6" y="6" width="36" height="36" rx="4" stroke={ACCENT} strokeWidth="2.5" />
        <path d="M24 32V20M18 26l6-6 6 6" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 36h16" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    texte: 'Depuis l\'app iOS BuildingScan, lancez une session de scan LiDAR ou photogrammétriques. Le fichier est uploadé automatiquement vers le serveur (formats : PLY, LAS, OBJ, GLB, IFC, E57).',
    astuce: 'Pour une qualité optimale, effectuez le scan dans de bonnes conditions lumineuses. Le LiDAR d\'iPhone Pro offre une précision de ±1 cm à 5 mètres. Superposez plusieurs sessions pour couvrir tout le bâtiment.',
    bouton: { label: 'Voir les scans', to: '/scans' },
  },
  {
    numero: 2,
    titre: 'Visualiser en 3D',
    icone: (
      <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
        <path d="M24 6L6 16v16l18 10 18-10V16L24 6z" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 16l18 10M24 42V26M42 16L24 26" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    texte: 'Après upload, le nuage de points 3D est traité et disponible dans l\'onglet Scan → Visualiseur 3D. Naviguez librement dans le modèle pour inspecter le bâtiment sous tous les angles.',
    astuce: 'Le rendu 3D complet est disponible dans l\'application iOS. Sur l\'interface web, vous accédez aux métadonnées, sessions et fichiers. Les formats GLB et OBJ sont optimisés pour la visualisation temps réel.',
    bouton: null,
  },
  {
    numero: 3,
    titre: 'Prendre des mesures',
    icone: (
      <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
        <line x1="6" y1="24" x2="42" y2="24" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="24" y1="6" x2="24" y2="42" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="12" cy="24" r="3" fill="#8b5cf6" />
        <circle cx="36" cy="24" r="3" fill="#8b5cf6" />
        <path d="M8 20v8M16 18v12M32 18v12M40 20v8" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    texte: 'Depuis l\'app iOS, touchez deux points du nuage de points pour mesurer une distance. Les mesures (distance, surface, volume, angle, hauteur) sont enregistrées et accessibles depuis la page Mesures.',
    astuce: 'Les mesures 3D sont précises au centimètre. Définissez des zones de mesure (pièce, couloir, façade) pour organiser vos relevés. Ces données alimentent directement les plans de chantier dans TradeLayer.',
    bouton: { label: 'Voir les mesures', to: '/mesures' },
  },
  {
    numero: 4,
    titre: 'Créer un jumeau numérique',
    icone: (
      <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
        <path d="M24 4L4 14v20l20 10 20-10V14L24 4z" stroke={ACCENT} strokeWidth="2" />
        <path d="M14 19l10 5 10-5M24 38V29M4 14l20 10M44 14L24 24" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="36" cy="36" r="8" fill="rgba(124,58,237,0.2)" stroke={ACCENT} strokeWidth="2" />
        <path d="M33 36h6M36 33v6" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    texte: 'Depuis un chantier scanné, lancez la génération du jumeau numérique. Le système fusionne les sessions de scan pour créer un modèle 3D complet au format GLB, OBJ ou IFC.',
    astuce: 'La génération d\'un jumeau numérique peut prendre plusieurs minutes selon la taille du nuage de points. Le statut "En génération" indique que le traitement est en cours. Un modèle IFC est compatible avec tous les logiciels BIM (Revit, ArchiCAD, BIM 360).',
    bouton: { label: 'Jumeaux numériques', to: '/jumeaux' },
  },
  {
    numero: 5,
    titre: 'Exporter vers TradeLayer',
    icone: (
      <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
        <rect x="6" y="6" width="16" height="16" rx="3" stroke={ACCENT} strokeWidth="2" />
        <rect x="26" y="6" width="16" height="16" rx="3" stroke="#3b82f6" strokeWidth="2" />
        <rect x="6" y="26" width="16" height="16" rx="3" stroke="#10b981" strokeWidth="2" />
        <rect x="26" y="26" width="16" height="16" rx="3" stroke="#f59e0b" strokeWidth="2" />
        <path d="M22 14h4M14 22v4" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M30 22v4M34 22v4M38 22v4" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    texte: 'Une fois le jumeau numérique prêt, exportez-le vers TradeLayer (App 3). Les équipes de planification pourront alors créer des calques métiers (plomberie, électricité, CVC) visualisés en AR sur le terrain.',
    astuce: 'L\'export vers TradeLayer crée automatiquement un projet associé avec les métadonnées du chantier. Les mesures et zones de mesure sont importées pour positionner précisément les calques métiers. Cette intégration est le cœur du workflow Eyetech Construction.',
    bouton: null,
  },
]

export default function TutorielPage() {
  const [etapeActive, setEtapeActive] = useState(0)

  const etape = etapes[etapeActive]
  const progression = ((etapeActive + 1) / etapes.length) * 100

  return (
    <div style={styles.page}>
      {/* En-tête */}
      <div style={styles.header}>
        <h1 style={styles.titre}>Tutoriel BuildingScan</h1>
        <p style={styles.sousTitre}>Apprenez à scanner des bâtiments et générer des jumeaux numériques 3D</p>
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
        {/* Points d'étape */}
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

      {/* Carte de l'étape */}
      <div style={styles.card}>
        <div style={styles.cardTop}>
          <div style={styles.etapeNumBadge}>Étape {etape.numero}</div>
          <div style={styles.iconeBox}>{etape.icone}</div>
          <h2 style={styles.etapeTitre}>{etape.titre}</h2>
          <p style={styles.etapeTexte}>{etape.texte}</p>
        </div>

        {/* Astuce */}
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

        {/* Bouton action */}
        {etape.bouton && (
          <a href={etape.bouton.to} style={styles.actionBtn}>
            {etape.bouton.label}
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" style={{ marginLeft: 8 }}>
              <path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        )}
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
        <button
          onClick={() => setEtapeActive(i => Math.min(etapes.length - 1, i + 1))}
          disabled={etapeActive === etapes.length - 1}
          style={{ ...styles.navBtn, ...styles.navBtnNext, ...(etapeActive === etapes.length - 1 ? styles.navBtnDisabled : {}) }}
        >
          Suivant
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" style={{ marginLeft: 8 }}>
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Message de fin */}
      {etapeActive === etapes.length - 1 && (
        <div style={styles.finMessage}>
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" style={{ marginRight: 10, flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" fill="rgba(16,185,129,0.2)" stroke="#10b981" strokeWidth="2" />
            <path d="M8 12l3 3 5-5" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Vous maîtrisez le workflow complet BuildingScan ! Consultez les{' '}
          <a href="/scans" style={{ color: '#10b981', marginLeft: 4 }}>Scans</a>
          {' '}pour commencer.
        </div>
      )}
    </div>
  )
}

const styles = {
  page: {
    maxWidth: 800,
    margin: '0 auto',
    padding: '2rem',
    color: '#e2e8f0',
  },
  header: {
    marginBottom: '2rem',
    textAlign: 'center',
  },
  titre: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: '#f1f5f9',
    marginBottom: '0.5rem',
  },
  sousTitre: {
    color: '#64748b',
    fontSize: '0.95rem',
  },
  progressContainer: {
    marginBottom: '2rem',
  },
  progressMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
    fontSize: '0.8rem',
    color: '#64748b',
  },
  progressLabel: {},
  progressPct: { fontWeight: 600, color: ACCENT },
  progressTrack: {
    height: 6,
    background: '#1e293b',
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: '1rem',
  },
  progressBar: {
    height: '100%',
    background: `linear-gradient(90deg, ${ACCENT}, #8b5cf6)`,
    borderRadius: 999,
    transition: 'width 0.4s ease',
  },
  stepsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '4px',
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
    flex: 1,
    maxWidth: 28,
    transition: 'all 0.2s',
  },
  stepDotActive: {
    background: ACCENT,
    borderColor: ACCENT,
  },
  stepDotDone: {
    background: '#10b981',
    borderColor: '#10b981',
  },
  card: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 12,
    padding: '2rem',
    marginBottom: '1.5rem',
  },
  cardTop: {
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  etapeNumBadge: {
    display: 'inline-block',
    background: `rgba(124,58,237,0.15)`,
    border: `1px solid rgba(124,58,237,0.3)`,
    color: ACCENT,
    fontSize: '0.75rem',
    fontWeight: 600,
    borderRadius: 999,
    padding: '0.25rem 0.75rem',
    marginBottom: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  iconeBox: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1rem',
  },
  etapeTitre: {
    fontSize: '1.35rem',
    fontWeight: 700,
    color: '#f1f5f9',
    marginBottom: '0.75rem',
  },
  etapeTexte: {
    color: '#94a3b8',
    lineHeight: 1.7,
    fontSize: '0.95rem',
  },
  astuce: {
    background: 'rgba(16,185,129,0.08)',
    border: '1px solid rgba(16,185,129,0.25)',
    borderRadius: 8,
    padding: '1rem 1.25rem',
    marginBottom: '1.25rem',
  },
  astuceHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  astuceLabel: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: '#10b981',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  astuceTexte: {
    color: '#94a3b8',
    fontSize: '0.875rem',
    lineHeight: 1.65,
    margin: 0,
  },
  actionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    background: ACCENT,
    color: 'white',
    borderRadius: 8,
    padding: '0.75rem 1.5rem',
    fontWeight: 600,
    fontSize: '0.875rem',
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  navBtns: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    background: '#1e293b',
    border: '1px solid #334155',
    color: '#94a3b8',
    borderRadius: 8,
    padding: '0.75rem 1.5rem',
    fontWeight: 500,
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  navBtnNext: {
    background: ACCENT,
    borderColor: ACCENT,
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
  finMessage: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(16,185,129,0.08)',
    border: '1px solid rgba(16,185,129,0.25)',
    borderRadius: 10,
    padding: '1rem 1.25rem',
    color: '#94a3b8',
    fontSize: '0.875rem',
    lineHeight: 1.6,
  },
}
