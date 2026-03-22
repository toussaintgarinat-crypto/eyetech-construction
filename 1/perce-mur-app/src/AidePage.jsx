import { useState } from 'react'

const faqs = [
  {
    question: "Comment obtenir mes identifiants de connexion ?",
    reponse: "Vos identifiants (email + mot de passe) sont créés par votre chef de projet Eyetech. Contactez-le directement ou adressez-vous à votre responsable de chantier. Pour les entreprises disposant d'un compte Eyetech Construction, l'administrateur peut créer des accès depuis le portail admin.",
  },
  {
    question: "L'app nécessite-t-elle un iPhone Pro avec LiDAR ?",
    reponse: "Non, l'app fonctionne sur tous les iPhones, mais la précision varie selon le matériel. iPhone Pro avec LiDAR : précision ±1-2mm (recommandé pour le perçage de précision). iPhone standard : précision ±5-8mm. Android via le navigateur : précision ±10-15mm. Pour les travaux nécessitant une précision millimétrique, l'iPhone Pro est fortement recommandé.",
  },
  {
    question: "Que faire si la calibration AR ne se stabilise pas ?",
    reponse: "Si le point 'Calibration OK' n'apparaît pas, essayez ces étapes : 1) Assurez-vous d'avoir un bon éclairage (évitez les zones très sombres ou surexposées). 2) Déplacez lentement l'iPhone pour que le LiDAR scanne les surfaces. 3) Évitez les surfaces transparentes ou réfléchissantes (miroirs, vitres). 4) Si ça persiste, fermez l'app complètement et relancez-la. Le temps de calibration est habituellement de 3 à 5 secondes.",
  },
  {
    question: "Comment interpréter les zones ROUGE dans l'app ?",
    reponse: "Une zone ROUGE indique la présence détectée d'un obstacle caché (tuyaux, câbles électriques, conduites de gaz). NE PERCEZ JAMAIS dans une zone rouge sans avoir vérifié physiquement avec un détecteur de câbles/tuyaux homologué. La détection AR est un outil d'aide et ne remplace pas les instruments de mesure certifiés. En cas de doute, consultez les plans du bâtiment ou faites appel à un technicien qualifié.",
  },
  {
    question: "Les points de perçage sont-ils sauvegardés automatiquement ?",
    reponse: "Oui, chaque point de perçage ajouté est synchronisé en temps réel avec le serveur Eyetech dès que vous avez une connexion réseau. Si vous êtes sans connexion sur le chantier, les données sont stockées localement et synchronisées automatiquement dès que la connexion est rétablie. Vous pouvez vérifier le statut de synchronisation dans l'onglet Projet → Synchronisation.",
  },
  {
    question: "Comment partager un projet avec un collègue ou le bureau ?",
    reponse: "Les projets sont liés à votre compte Eyetech. Pour partager un projet, votre administrateur doit ajouter l'autre utilisateur au projet depuis le portail web (http://localhost:5173 ou l'URL de votre installation). Les utilisateurs ajoutés verront le projet dans leur liste au prochain chargement de l'app.",
  },
  {
    question: "Puis-je utiliser l'app sans connexion internet ?",
    reponse: "Partiellement. Sans connexion, vous pouvez consulter les projets et points de perçage déjà téléchargés. La vue AR fonctionne hors-ligne (elle n'utilise que la caméra et le LiDAR). En revanche, l'ajout de nouveaux points, la synchronisation et le chargement de nouveaux projets nécessitent une connexion. Un mode hors-ligne complet est prévu dans une prochaine mise à jour.",
  },
  {
    question: "Comment générer et imprimer un plan de montage ?",
    reponse: "Dans un projet actif, allez dans l'onglet Photos & Plans → Générer Plan d'Impression. L'app génère un plan PDF avec les points de perçage et leurs coordonnées exactes. Choisissez le format (A4 ou A3) et téléchargez le fichier. Ce plan peut être imprimé et remis à l'équipe chantier pour référence physique.",
  },
]

const supportLinks = [
  { label: "Email support", value: "support@eyetech-construction.fr", icon: "envelope" },
  { label: "Documentation", value: "docs.eyetech-construction.fr", icon: "doc" },
  { label: "Portail web", value: "http://localhost:5173", icon: "globe" },
]

export default function AidePage({ onClose }) {
  const [ouvert, setOuvert] = useState(null)

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.titre}>Centre d'aide Perce-Mur</h2>
            <p style={styles.sousTitre}>Questions fréquentes et support</p>
          </div>
          {onClose && (
            <button onClick={onClose} style={styles.closeBtn} title="Fermer">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        {/* Barre de recherche décorative */}
        <div style={styles.searchBar}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" stroke="#475569" strokeWidth="2" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span style={{ color: '#475569', fontSize: '0.875rem' }}>Trouvez une réponse ci-dessous...</span>
        </div>

        {/* FAQ Accordéon */}
        <div style={styles.faqList}>
          {faqs.map((faq, i) => (
            <div key={i} style={styles.faqItem}>
              <button
                onClick={() => setOuvert(ouvert === i ? null : i)}
                style={styles.faqQuestion}
              >
                <span style={{ flex: 1, textAlign: 'left' }}>{faq.question}</span>
                <svg
                  width="16" height="16" fill="none" viewBox="0 0 24 24"
                  style={{ transform: ouvert === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}
                >
                  <path d="M6 9l6 6 6-6" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {ouvert === i && (
                <div style={styles.faqReponse}>
                  {faq.reponse}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bloc support */}
        <div style={styles.supportBloc}>
          <div style={styles.supportTitre}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
              <circle cx="12" cy="12" r="10" stroke="#3b82f6" strokeWidth="2" />
              <path d="M12 8v4M12 16h.01" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Vous n'avez pas trouvé votre réponse ?
          </div>
          <p style={styles.supportTexte}>
            Contactez le support Eyetech Construction. Notre équipe technique répond sous 24h en semaine.
          </p>
          <div style={styles.supportLinks}>
            <a href="mailto:support@eyetech-construction.fr" style={styles.supportLink}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              support@eyetech-construction.fr
            </a>
          </div>
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.25rem',
  },
  titre: {
    fontSize: '1.35rem',
    fontWeight: 700,
    color: '#f1f5f9',
    marginBottom: '0.25rem',
  },
  sousTitre: {
    color: '#64748b',
    fontSize: '0.875rem',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: 6,
    flexShrink: 0,
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 8,
    padding: '0.75rem 1rem',
    marginBottom: '1.25rem',
  },
  faqList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '1.5rem',
  },
  faqItem: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 10,
    overflow: 'hidden',
  },
  faqQuestion: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    width: '100%',
    padding: '1rem 1.25rem',
    background: 'transparent',
    border: 'none',
    color: '#e2e8f0',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    textAlign: 'left',
  },
  faqReponse: {
    padding: '0 1.25rem 1rem',
    color: '#94a3b8',
    fontSize: '0.875rem',
    lineHeight: 1.7,
    borderTop: '1px solid #334155',
    paddingTop: '0.875rem',
  },
  supportBloc: {
    background: 'rgba(59,130,246,0.06)',
    border: '1px solid rgba(59,130,246,0.25)',
    borderRadius: 12,
    padding: '1.25rem',
  },
  supportTitre: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#e2e8f0',
    marginBottom: '0.5rem',
  },
  supportTexte: {
    color: '#94a3b8',
    fontSize: '0.875rem',
    lineHeight: 1.6,
    marginBottom: '1rem',
  },
  supportLinks: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  supportLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#3b82f6',
    fontSize: '0.875rem',
    textDecoration: 'none',
    fontWeight: 500,
  },
}
