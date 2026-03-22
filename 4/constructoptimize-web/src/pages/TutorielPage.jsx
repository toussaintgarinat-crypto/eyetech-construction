import { useState } from 'react'

const etapes = [
  {
    numero: 1,
    titre: 'Connexion',
    icone: (
      <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
        <circle cx="24" cy="16" r="8" stroke="#10b981" strokeWidth="2.5" />
        <path d="M8 44c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="30" y="28" width="12" height="10" rx="2" stroke="#059669" strokeWidth="2" />
        <path d="M33 31v-2a3 3 0 0 1 6 0v2" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    texte: 'Connectez-vous pour accéder au comparateur.',
    astuce: 'Vos identifiants sont ceux fournis par Eyetech Construction. Si vous n\'avez pas encore de compte, contactez votre chef de projet ou l\'administrateur Eyetech pour l\'obtenir.',
    bouton: null,
  },
  {
    numero: 2,
    titre: 'Rechercher un matériau',
    icone: (
      <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
        <circle cx="22" cy="22" r="12" stroke="#10b981" strokeWidth="2.5" />
        <path d="M31 31l8 8" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M17 22h10M22 17v10" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    texte: "Dans Recherche, tapez le matériau (ex: 'placo BA13 2.5m'). Définissez l'adresse du chantier et le rayon de livraison acceptable.",
    astuce: 'Plus votre recherche est précise (marque, référence, dimensions), meilleurs seront les résultats. Vous pouvez aussi chercher par catégorie générique ("placo", "béton cellulaire") pour comparer plusieurs produits similaires.',
    bouton: { label: 'Aller dans Recherche', to: '/recherche' },
  },
  {
    numero: 3,
    titre: 'Lire les résultats',
    icone: (
      <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
        <rect x="6" y="10" width="36" height="6" rx="3" fill="rgba(16,185,129,0.3)" stroke="#10b981" strokeWidth="2" />
        <rect x="6" y="22" width="28" height="6" rx="3" fill="rgba(16,185,129,0.15)" stroke="#334155" strokeWidth="2" />
        <rect x="6" y="34" width="20" height="6" rx="3" fill="rgba(16,185,129,0.08)" stroke="#334155" strokeWidth="2" />
        <path d="M40 20l3-3-3-3" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    texte: 'Les résultats sont classés par score composite : 60% prix, 40% distance. Le meilleur rapport qualité/prix/proximité est en premier.',
    astuce: 'Le score composite tient compte du prix HT livré ET de la distance de transport. Un fournisseur à 50km peut scorer mieux qu\'un fournisseur à 5km si son prix est nettement inférieur. Vous pouvez ajuster les pondérations dans vos préférences.',
    bouton: null,
  },
  {
    numero: 4,
    titre: 'Consulter un fournisseur',
    icone: (
      <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
        <path d="M6 38V18l18-10 18 10v20" stroke="#10b981" strokeWidth="2.5" strokeLinejoin="round" />
        <rect x="18" y="28" width="12" height="10" rx="1" stroke="#059669" strokeWidth="2" />
        <path d="M22 38v-6M26 38v-6" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="24" cy="18" r="3" stroke="#10b981" strokeWidth="2" />
      </svg>
    ),
    texte: 'Cliquez sur un fournisseur pour voir ses coordonnées, ses délais et ses autres produits disponibles.',
    astuce: 'La fiche fournisseur indique les délais moyens de livraison, le minimum de commande et les modes de paiement acceptés. Notez qu\'un fournisseur peut proposer plusieurs matériaux : consultez son catalogue complet pour regrouper vos commandes.',
    bouton: { label: 'Voir les fournisseurs', to: '/fournisseurs' },
  },
  {
    numero: 5,
    titre: 'Activer la géolocalisation',
    icone: (
      <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
        <circle cx="24" cy="22" r="10" stroke="#10b981" strokeWidth="2.5" />
        <circle cx="24" cy="22" r="3" fill="#10b981" />
        <path d="M24 6v4M24 38v4M6 22h4M38 22h4" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
        <path d="M24 22l6 14" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    texte: "Dans Fournisseurs, cliquez 'Ma position' pour voir les fournisseurs proches de vous, triés par distance.",
    astuce: 'La géolocalisation utilise le GPS de votre appareil. Autorisez l\'accès à votre position dans votre navigateur pour bénéficier de cette fonctionnalité. Votre position n\'est jamais stockée sur nos serveurs.',
    bouton: { label: 'Activer sur Fournisseurs', to: '/fournisseurs' },
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
        <h1 style={styles.titre}>Tutoriel ConstructOptimize</h1>
        <p style={styles.sousTitre}>Apprenez à comparer les prix et trouver les meilleurs fournisseurs pour votre chantier</p>
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

      {/* Carte de l'étape */}
      <div style={styles.card}>
        <div style={styles.cardTop}>
          <div style={styles.etapeNumBadge}>Étape {etape.numero}</div>
          <div style={styles.iconeBox}>{etape.icone}</div>
          <h2 style={styles.etapeTitre}>{etape.titre}</h2>
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

      {etapeActive === etapes.length - 1 && (
        <div style={styles.finMessage}>
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" style={{ marginRight: 10, flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" fill="rgba(16,185,129,0.2)" stroke="#10b981" strokeWidth="2" />
            <path d="M8 12l3 3 5-5" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Tutoriel terminé ! Consultez la page <a href="/aide" style={{ color: '#10b981', marginLeft: 4 }}>Aide</a> si vous avez des questions.
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
  progressPct: { fontWeight: 600, color: '#10b981' },
  progressTrack: {
    height: 6,
    background: '#1e293b',
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: '1rem',
  },
  progressBar: {
    height: '100%',
    background: 'linear-gradient(90deg, #10b981, #34d399)',
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
    background: '#10b981',
    borderColor: '#10b981',
  },
  stepDotDone: {
    background: '#059669',
    borderColor: '#059669',
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
    background: 'rgba(16,185,129,0.12)',
    border: '1px solid rgba(16,185,129,0.3)',
    color: '#10b981',
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
    background: '#10b981',
    color: 'white',
    borderRadius: 8,
    padding: '0.75rem 1.5rem',
    fontWeight: 600,
    fontSize: '0.875rem',
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer',
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
  },
  navBtnNext: {
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
