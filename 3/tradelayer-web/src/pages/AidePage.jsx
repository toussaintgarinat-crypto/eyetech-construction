import { useState } from 'react'

const faqs = [
  {
    question: "Comment créer un calque pour un ouvrier spécifique ?",
    reponse: "Dans votre projet, allez dans l'onglet Calques et cliquez sur + Ajouter calque. Après avoir choisi le corps de métier, allez dans l'onglet Accès du calque. Vous pouvez y sélectionner les ouvriers autorisés à voir et modifier ce calque. Un ouvrier ne verra dans ses lunettes AR que les calques qui lui ont été assignés.",
  },
  {
    question: "L'ouvrier ne voit pas le calque dans ses lunettes AR, que faire ?",
    reponse: "Vérifiez d'abord que l'ouvrier est bien dans la liste d'accès du calque (onglet Accès). Ensuite, assurez-vous que le calque est bien en statut 'Publié' et non en brouillon. Si le problème persiste, l'ouvrier doit se déconnecter et se reconnecter à l'app AR pour forcer la synchronisation des données.",
  },
  {
    question: "Comment savoir quelles normes s'appliquent ?",
    reponse: "Utilisez l'assistant IA RAG intégré à chaque corps de métier. Il est entraîné sur les normes DTU (Documents Techniques Unifiés) et les normes NF applicables au BTP en France. Posez votre question en langage naturel et l'IA vous répondra en citant les références réglementaires. Vous pouvez accéder à l'assistant depuis le menu Corps de métier → IA Spécialiste.",
  },
  {
    question: "Peut-on modifier un calque une fois que l'ouvrier travaille dessus ?",
    reponse: "Oui, les modifications sont possibles en temps réel. Cependant, toute modification d'un calque en cours de travail sera signalée à l'ouvrier par une notification dans ses lunettes AR. Pour les modifications majeures (déplacement de plus de 5cm, suppression d'éléments), il est recommandé de mettre le calque en pause avant de modifier, pour éviter toute confusion sur le chantier.",
  },
  {
    question: "Comment exporter les données vers BuildingScan ?",
    reponse: "Dans les paramètres de votre projet, allez dans Exporter → BuildingScan VR. Sélectionnez les calques à inclure dans l'export et choisissez le format (IFC ou JSON Eyetech). L'export sera disponible dans l'application BuildingScan sous le même nom de projet. Notez que les éléments doivent avoir des coordonnées 3D complètes pour être exportables.",
  },
  {
    question: "Quels corps de métier sont supportés ?",
    reponse: "TradeLayer supporte actuellement : Plomberie (tuyaux, robinetterie, évacuations), Électricité (câbles, prises, tableaux), Plâtrerie/Placo (rails, plaques, doublages), Charpente (poutres, chevrons, ossatures), CVC - Chauffage Ventilation Climatisation (gaines, bouches, équipements) et Peinture (préparation, délimitations). D'autres corps de métier peuvent être ajoutés sur demande auprès d'Eyetech.",
  },
  {
    question: "Comment contacter le support Eyetech ?",
    reponse: "Le support Eyetech est disponible par email à support@eyetech-construction.fr (réponse sous 24h en semaine) ou par téléphone au +33 1 XX XX XX XX du lundi au vendredi de 8h à 18h. Pour les urgences chantier (impossibilité d'utiliser l'app sur site), un numéro d'astreinte est disponible dans votre contrat de service.",
  },
  {
    question: "L'app IA ne répond pas, que faire ?",
    reponse: "Si l'assistant IA ne répond plus, vérifiez d'abord votre connexion internet (l'IA nécessite une connexion active). Si la connexion est bonne, le service est peut-être temporairement en maintenance : attendez quelques minutes et réessayez. Vérifiez la page de statut des services sur status.eyetech-construction.fr. Si le problème dure plus d'1 heure, contactez le support.",
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
            <circle cx="16" cy="16" r="14" stroke="#3b82f6" strokeWidth="2" />
            <path d="M12 12.5c0-2.21 1.79-4 4-4s4 1.79 4 4c0 2-1.5 3-3 3.5V18" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
            <circle cx="16" cy="22" r="1" fill="#3b82f6" />
          </svg>
        </div>
        <h1 style={styles.titre}>Centre d'aide TradeLayer</h1>
        <p style={styles.sousTitre}>Réponses aux questions fréquentes sur l'utilisation de l'application</p>
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
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
    borderColor: 'rgba(59,130,246,0.4)',
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
    background: 'rgba(59,130,246,0.2)',
    borderColor: '#3b82f6',
    color: '#3b82f6',
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
    color: '#3b82f6',
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
    background: 'rgba(59,130,246,0.08)',
    border: '1px solid rgba(59,130,246,0.25)',
    borderRadius: 10,
    padding: '1.25rem',
  },
  supportIcon: {
    width: 44,
    height: 44,
    background: 'rgba(59,130,246,0.15)',
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
