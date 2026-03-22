import { useState } from 'react'

const faqs = [
  {
    question: "Comment est calculé le score ?",
    reponse: "Le score composite est calculé selon la formule : 60% prix + 40% distance. Le prix est normalisé par rapport au prix médian des résultats (un produit 20% moins cher que la médiane booste le score de 12 points). La distance est normalisée par rapport au rayon de livraison que vous avez défini. Plus vous êtes proche de 100, meilleur est le rapport prix/proximité.",
  },
  {
    question: "Puis-je filtrer par distance uniquement ?",
    reponse: "Oui, dans la page Recherche, cliquez sur Filtres avancés. Vous pouvez y choisir le critère de tri : Score composite (défaut), Prix croissant, Prix décroissant, Distance croissante ou Distance décroissante. Vous pouvez aussi définir un rayon maximum de livraison pour exclure les fournisseurs trop éloignés.",
  },
  {
    question: "Comment ajouter un fournisseur ?",
    reponse: "L'ajout de fournisseurs est réservé aux administrateurs Eyetech Construction. Si vous souhaitez référencer un nouveau fournisseur, envoyez ses coordonnées et son catalogue à support@eyetech-construction.fr. L'équipe Eyetech vérifiera ses informations et l'ajoutera à la base de données sous 48h.",
  },
  {
    question: "Les prix sont-ils en temps réel ?",
    reponse: "Les prix sont mis à jour quotidiennement via les tarifs transmis par les fournisseurs partenaires. Ils ne sont pas mis à jour en temps réel au sens strict, mais reflètent les prix du jour. La date de la dernière mise à jour est visible sur chaque fiche produit. Pour les gros volumes, il est recommandé de confirmer le prix directement avec le fournisseur avant de passer commande.",
  },
  {
    question: "Comment sauvegarder une recherche ?",
    reponse: "Depuis les résultats d'une recherche, cliquez sur l'icône Favoris (étoile) en haut à droite. La recherche est sauvegardée avec tous ses paramètres (matériau, adresse, rayon). Vous pouvez retrouver vos recherches sauvegardées dans le tableau de bord → Mes recherches. Vous pouvez aussi activer les alertes prix pour être notifié si un prix baisse.",
  },
  {
    question: "La géolocalisation ne fonctionne pas ?",
    reponse: "Vérifiez que votre navigateur a l'autorisation d'accéder à votre position : dans Chrome, cliquez sur l'icône cadenas à gauche de l'URL → Localisation → Autoriser. Si vous êtes sur un réseau d'entreprise avec proxy, la géolocalisation peut être bloquée. Dans ce cas, entrez manuellement l'adresse du chantier dans le champ prévu à cet effet.",
  },
  {
    question: "Comment comparer plusieurs matériaux en même temps ?",
    reponse: "Dans la page Recherche, effectuez votre première recherche puis cliquez sur Ajouter à la comparaison pour les produits qui vous intéressent (jusqu'à 4 produits). Ensuite, cliquez sur le bouton Comparer en bas de la page. Le tableau de comparaison affiche côte à côte les prix, distances, délais et scores de chaque produit sélectionné.",
  },
  {
    question: "Comment contacter le support ?",
    reponse: "Le support ConstructOptimize est joignable par email à support@eyetech-construction.fr (réponse sous 24h en semaine). Vous pouvez aussi utiliser le chat intégré à l'application (icône message en bas à droite). Pour les urgences concernant un chantier en cours, un numéro de hotline est disponible dans votre contrat de service Eyetech.",
  },
]

export default function AidePage() {
  const [ouverts, setOuverts] = useState([])

  const toggle = (index) => {
    setOuverts(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  return (
    <div style={styles.page}>
      {/* En-tête */}
      <div style={styles.header}>
        <div style={styles.headerIcon}>
          <svg width="32" height="32" fill="none" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="14" stroke="#10b981" strokeWidth="2" />
            <path d="M12 12.5c0-2.21 1.79-4 4-4s4 1.79 4 4c0 2-1.5 3-3 3.5V18" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
            <circle cx="16" cy="22" r="1" fill="#10b981" />
          </svg>
        </div>
        <h1 style={styles.titre}>Centre d'aide ConstructOptimize</h1>
        <p style={styles.sousTitre}>Réponses aux questions fréquentes sur le comparateur de prix</p>
      </div>

      {/* Compteur */}
      <div style={styles.compteur}>
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" style={{ marginRight: 6 }}>
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
        </svg>
        {faqs.length} questions disponibles
      </div>

      {/* Accordéon */}
      <div style={styles.accordeon}>
        {faqs.map((faq, index) => {
          const estOuvert = ouverts.includes(index)
          return (
            <div key={index} style={{ ...styles.item, ...(estOuvert ? styles.itemOuvert : {}) }}>
              <button
                onClick={() => toggle(index)}
                style={styles.question}
                aria-expanded={estOuvert}
              >
                <div style={styles.questionGauche}>
                  <div style={{ ...styles.numBadge, ...(estOuvert ? styles.numBadgeActif : {}) }}>
                    {index + 1}
                  </div>
                  <span style={{ ...styles.questionTexte, ...(estOuvert ? styles.questionTexteActif : {}) }}>
                    {faq.question}
                  </span>
                </div>
                <div style={{ ...styles.chevron, ...(estOuvert ? styles.chevronOuvert : {}) }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </button>
              {estOuvert && (
                <div style={styles.reponse}>
                  <div style={styles.reponseDivider} />
                  <p style={styles.reponseTexte}>{faq.reponse}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Bloc support */}
      <div style={styles.supportBloc}>
        <div style={styles.supportIcon}>
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <div style={styles.supportTitre}>Vous n'avez pas trouvé votre réponse ?</div>
          <div style={styles.supportTexte}>Contactez le support Eyetech à <strong>support@eyetech-construction.fr</strong></div>
        </div>
      </div>
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
    textAlign: 'center',
    marginBottom: '2rem',
  },
  headerIcon: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '0.75rem',
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
  compteur: {
    display: 'flex',
    alignItems: 'center',
    color: '#64748b',
    fontSize: '0.8rem',
    marginBottom: '1.25rem',
  },
  accordeon: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '2rem',
  },
  item: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 10,
    overflow: 'hidden',
    transition: 'border-color 0.2s',
  },
  itemOuvert: {
    borderColor: 'rgba(16,185,129,0.4)',
  },
  question: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    padding: '1rem 1.25rem',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
  },
  questionGauche: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flex: 1,
    minWidth: 0,
  },
  numBadge: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    background: '#0f172a',
    border: '1px solid #334155',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 700,
    color: '#475569',
    flexShrink: 0,
    transition: 'all 0.2s',
  },
  numBadgeActif: {
    background: 'rgba(16,185,129,0.2)',
    borderColor: '#10b981',
    color: '#10b981',
  },
  questionTexte: {
    fontSize: '0.9rem',
    fontWeight: 500,
    color: '#94a3b8',
    lineHeight: 1.4,
    transition: 'color 0.2s',
  },
  questionTexteActif: {
    color: '#f1f5f9',
  },
  chevron: {
    color: '#475569',
    flexShrink: 0,
    transition: 'transform 0.25s ease, color 0.2s',
  },
  chevronOuvert: {
    transform: 'rotate(180deg)',
    color: '#10b981',
  },
  reponse: {
    padding: '0 1.25rem 1.25rem',
  },
  reponseDivider: {
    height: 1,
    background: '#334155',
    marginBottom: '1rem',
  },
  reponseTexte: {
    color: '#94a3b8',
    fontSize: '0.875rem',
    lineHeight: 1.7,
    margin: 0,
  },
  supportBloc: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    background: 'rgba(16,185,129,0.08)',
    border: '1px solid rgba(16,185,129,0.25)',
    borderRadius: 10,
    padding: '1.25rem',
  },
  supportIcon: {
    width: 44,
    height: 44,
    background: 'rgba(16,185,129,0.15)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  supportTitre: {
    fontWeight: 600,
    color: '#e2e8f0',
    fontSize: '0.9rem',
    marginBottom: '0.25rem',
  },
  supportTexte: {
    color: '#64748b',
    fontSize: '0.825rem',
  },
}
