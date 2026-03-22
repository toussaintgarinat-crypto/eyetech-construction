import { useState } from 'react'

const etapes = [
  {
    numero: 1,
    titre: 'Connexion',
    icone: (
      <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
        <circle cx="24" cy="16" r="8" stroke="#3b82f6" strokeWidth="2.5" />
        <path d="M8 44c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="30" y="28" width="12" height="10" rx="2" stroke="#10b981" strokeWidth="2" />
        <path d="M33 31v-2a3 3 0 0 1 6 0v2" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    texte: 'Connectez-vous avec vos identifiants Eyetech. Votre rôle détermine vos accès.',
    astuce: 'Votre rôle (chef de projet, ouvrier, superviseur) détermine ce que vous pouvez voir et modifier dans l\'application. Contactez votre administrateur en cas de problème de connexion.',
    bouton: null,
  },
  {
    numero: 2,
    titre: 'Créer un projet',
    icone: (
      <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
        <rect x="6" y="8" width="36" height="32" rx="3" stroke="#3b82f6" strokeWidth="2.5" />
        <path d="M6 16h36" stroke="#3b82f6" strokeWidth="2" />
        <path d="M24 24v12M18 30h12" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
    texte: 'Allez dans Projets → Nouveau projet. Renseignez le nom du chantier, l\'adresse et le type de bâtiment.',
    astuce: 'Renseignez l\'adresse précise du chantier : elle est utilisée pour géolocaliser les calques AR sur le terrain. Un bâtiment mal référencé peut décaler les superpositions de plusieurs mètres.',
    bouton: { label: 'Aller dans Projets', to: '/projets' },
  },
  {
    numero: 3,
    titre: 'Ajouter un calque métier',
    icone: (
      <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
        <rect x="8" y="30" width="32" height="6" rx="2" stroke="#94a3b8" strokeWidth="2" />
        <rect x="8" y="21" width="32" height="6" rx="2" stroke="#eab308" strokeWidth="2" />
        <rect x="8" y="12" width="32" height="6" rx="2" stroke="#3b82f6" strokeWidth="2" />
        <circle cx="38" cy="38" r="7" fill="#10b981" />
        <path d="M35 38h6M38 35v6" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    texte: 'Dans un projet, cliquez sur + Ajouter calque. Choisissez le corps de métier (plomberie, électricité...). Le calque sera visible en AR par les ouvriers.',
    astuce: 'Chaque corps de métier possède une couleur dédiée pour faciliter la lecture : bleu pour la plomberie, jaune pour l\'électricité, gris pour le placo, etc. Les ouvriers voient uniquement les calques qui leur sont assignés.',
    bouton: null,
  },
  {
    numero: 4,
    titre: 'Ajouter des éléments',
    icone: (
      <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
        <rect x="6" y="6" width="36" height="36" rx="4" stroke="#334155" strokeWidth="2" />
        <path d="M14 24h20M24 14v20" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="14" cy="14" r="3" fill="#10b981" />
        <circle cx="34" cy="14" r="3" fill="#10b981" />
        <circle cx="14" cy="34" r="3" fill="#10b981" />
        <circle cx="34" cy="34" r="3" fill="#10b981" />
      </svg>
    ),
    texte: 'Dans un calque, ajoutez les éléments à poser : rails, tuyaux, câbles. Définissez leur position en 3D. L\'ouvrier verra ces éléments superposés à la réalité.',
    astuce: 'Utilisez les coordonnées relatives au sol (X, Y en cm, Z = hauteur). Pour un résultat précis, calibrez votre position de départ avec un point d\'ancrage visible (angle de pièce, poteau). La précision AR dépend de la qualité du scan initial.',
    bouton: null,
  },
  {
    numero: 5,
    titre: 'Consulter le spécialiste IA',
    icone: (
      <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
        <rect x="6" y="10" width="36" height="28" rx="4" stroke="#3b82f6" strokeWidth="2.5" />
        <circle cx="18" cy="24" r="4" stroke="#10b981" strokeWidth="2" />
        <path d="M24 20h8M24 24h6M24 28h4" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 38l4-4" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    texte: 'Utilisez l\'IA RAG pour obtenir des réponses sur les normes DTU et NF. Chaque corps de métier a son propre assistant.',
    astuce: 'L\'assistant IA est entraîné sur les normes DTU, NF et les réglementations en vigueur. Posez vos questions en langage naturel : "Quelle est la distance minimale entre un tuyau PER et un câble électrique ?" Il cite ses sources pour que vous puissiez vérifier.',
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
        <h1 style={styles.titre}>Tutoriel TradeLayer</h1>
        <p style={styles.sousTitre}>Apprenez à créer et gérer vos calques métier en réalité augmentée</p>
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
        {/* Numéro + icône */}
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
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" style={{ marginRight: 10 }}>
            <circle cx="12" cy="12" r="10" fill="rgba(16,185,129,0.2)" stroke="#10b981" strokeWidth="2" />
            <path d="M8 12l3 3 5-5" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Vous avez parcouru toutes les étapes ! Consultez la page <a href="/aide" style={{ color: '#10b981', marginLeft: 4 }}>Aide</a> si vous avez des questions.
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
  progressPct: { fontWeight: 600, color: '#3b82f6' },
  progressTrack: {
    height: 6,
    background: '#1e293b',
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: '1rem',
  },
  progressBar: {
    height: '100%',
    background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
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
    background: '#3b82f6',
    borderColor: '#3b82f6',
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
    background: 'rgba(59,130,246,0.15)',
    border: '1px solid rgba(59,130,246,0.3)',
    color: '#3b82f6',
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
    background: '#3b82f6',
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
    background: '#3b82f6',
    borderColor: '#3b82f6',
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
