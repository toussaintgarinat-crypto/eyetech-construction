const ACCENT = '#7c3aed'

const SECTIONS = [
  {
    titre: 'Premiers pas',
    icon: '🚀',
    items: [
      {
        q: 'Comment créer mon premier chantier ?',
        a: 'Dans la section "Scans", cliquez sur "Nouveau chantier scan". Renseignez le nom, l\'adresse et une description. Le chantier apparaît immédiatement dans votre liste.',
      },
      {
        q: 'Quels appareils sont compatibles avec BuildingScan ?',
        a: 'L\'application mobile requiert un iPhone 12 Pro ou supérieur (capteur LiDAR). Pour la photogrammétrie, tout iPhone depuis l\'iPhone 12 est compatible. L\'interface web fonctionne sur tous les navigateurs modernes.',
      },
      {
        q: 'Quelle est la précision du scan LiDAR ?',
        a: 'Le LiDAR de l\'iPhone Pro offre une précision de 5 à 15mm à courte portée (< 5m) et de 15 à 30mm jusqu\'à 10m. Pour des relevés architecturaux professionnels, une session de recalage avec points d\'appui permet d\'atteindre 5mm.',
      },
    ],
  },
  {
    titre: 'Scans et sessions',
    icon: '📡',
    items: [
      {
        q: 'Quelle est la différence entre LiDAR et photogrammétrie ?',
        a: 'Le LiDAR (iPhone Pro uniquement) émet des impulsions laser pour mesurer les distances avec précision. Rapide et fiable en intérieur. La photogrammétrie reconstruit le modèle 3D à partir de photos — plus lente mais exploitable sur tous iPhone. Le mode Mixte combine les deux pour un résultat optimal.',
      },
      {
        q: 'Comment lancer une session de scan depuis l\'application ?',
        a: 'Ouvrez l\'app BuildingScan sur votre iPhone, sélectionnez votre chantier, puis appuyez sur "Nouvelle session". Choisissez la méthode (LiDAR / Photo / Mixte), puis déplacez-vous lentement dans l\'espace en maintenant le téléphone stable.',
      },
      {
        q: 'Le scan peut-il être interrompu et repris ?',
        a: 'Oui. Une session peut être mise en pause à tout moment. Le nuage de points partiel est sauvegardé localement. À la reprise, le système tente de recaler automatiquement la nouvelle capture avec les données existantes.',
      },
      {
        q: 'Quelle surface puis-je scanner en une session ?',
        a: 'En LiDAR, une session typique couvre 100 à 500 m² selon la complexité (couloirs, obstacles). Dépassez 500 m² en créant plusieurs sessions — elles seront fusionnées lors de la génération du jumeau numérique.',
      },
    ],
  },
  {
    titre: 'Mesures',
    icon: '📏',
    items: [
      {
        q: 'Comment prendre une mesure de distance ?',
        a: 'Dans l\'app mobile, appuyez sur l\'icône règle, puis sur deux points de la surface scannée. La mesure s\'affiche en temps réel et est sauvegardée avec la session. Dans l\'interface web, les mesures importées depuis l\'app apparaissent dans la section Mesures.',
      },
      {
        q: 'Peut-on calculer des surfaces et volumes automatiquement ?',
        a: 'Oui. En mode "Zone", délimitez un contour sur le sol ou un mur — la surface est calculée automatiquement. Pour les volumes, délimitez une pièce complète (sol + plafond). Les résultats sont exportables au format CSV ou intégrés au jumeau numérique.',
      },
      {
        q: 'Les mesures sont-elles synchronisées en temps réel ?',
        a: 'Oui, dès que l\'iPhone est connecté au réseau (Wi-Fi ou 4G/5G), les mesures sont envoyées au serveur en quelques secondes. En mode hors-ligne, elles sont stockées localement et synchronisées à la reconnexion.',
      },
    ],
  },
  {
    titre: 'Jumeaux numériques',
    icon: '🏗',
    items: [
      {
        q: 'Comment est généré le jumeau numérique ?',
        a: 'Après la fin d\'un scan (statut "Terminé"), cliquez sur "Générer jumeau numérique" dans la page du chantier. Le serveur fusionne toutes les sessions, applique un recalage global et exporte le modèle 3D (GLB, IFC ou OBJ selon le choix).',
      },
      {
        q: 'Quels formats d\'export sont disponibles ?',
        a: 'GLB (3D temps réel, compatible AR), IFC (BIM standard — AutoCAD, Revit, ArchiCAD), OBJ (modélisation 3D générique). Le format PLY (nuage de points brut) est disponible pour les logiciels spécialisés comme CloudCompare.',
      },
      {
        q: 'Comment exporter vers TradeLayer ?',
        a: 'Dans la page d\'un jumeau numérique au statut "Prêt", cliquez sur "Exporter vers TradeLayer". Le modèle est transmis à l\'App 3 qui peut alors y créer des calques métiers (plomberie, électricité, etc.).',
      },
      {
        q: 'Quelle est la précision globale du jumeau numérique ?',
        a: 'La précision est indiquée en cm dans la fiche du jumeau. Elle dépend de la méthode de scan (LiDAR : ~1cm, Photo : ~2-3cm) et du nombre de sessions fusionnées. Une précision < 2cm est nécessaire pour les usages BIM professionnels.',
      },
    ],
  },
  {
    titre: 'Intégration Eyetech',
    icon: '🔗',
    items: [
      {
        q: 'Comment BuildingScan s\'intègre aux autres apps Eyetech ?',
        a: 'BuildingScan est la source de données spatiales de toute la suite. Les mesures alimentent TradeLayer (App 3) pour le positionnement des calques métiers en AR. Les volumes et surfaces alimentent ConstructOptimize (App 4) pour estimer les quantités de matériaux.',
      },
      {
        q: 'Peut-on utiliser BuildingScan sans les autres apps ?',
        a: 'Oui, BuildingScan fonctionne de manière autonome comme outil de relevé et de gestion de nuages de points. Les fonctionnalités d\'export vers TradeLayer sont optionnelles.',
      },
    ],
  },
]

export default function AidePage() {
  return (
    <div style={styles.root}>
      <div style={styles.header}>
        <h1 style={styles.title}>Centre d'aide</h1>
        <p style={styles.subtitle}>BuildingScan — Scan LiDAR et jumeaux numériques</p>
      </div>

      {/* Bannière d'introduction */}
      <div style={styles.intro}>
        <div style={{ fontSize: '28px', flexShrink: 0 }}>📡</div>
        <div>
          <div style={styles.introTitle}>BuildingScan — Comment ça marche ?</div>
          <div style={styles.introText}>
            BuildingScan transforme votre iPhone Pro en scanner 3D professionnel.
            Scannez vos chantiers en LiDAR ou photogrammétrie, mesurez avec précision,
            puis générez un jumeau numérique exploitable par toute la suite Eyetech.
          </div>
        </div>
      </div>

      {/* Workflow visuel */}
      <div style={styles.workflow}>
        {[
          { num: '1', label: 'Créer un chantier', sub: 'Nom + adresse', color: ACCENT },
          { num: '2', label: 'Scanner avec iPhone', sub: 'LiDAR ou photo', color: '#8b5cf6' },
          { num: '3', label: 'Mesures auto', sub: 'Distance / surface / volume', color: '#a78bfa' },
          { num: '4', label: 'Jumeau numérique', sub: 'GLB / IFC / OBJ', color: '#c4b5fd' },
          { num: '5', label: 'Export TradeLayer', sub: 'Calques AR sur chantier', color: '#3b82f6' },
        ].map((step, i) => (
          <div key={i} style={styles.step}>
            <div style={{ ...styles.stepNum, background: step.color }}>{step.num}</div>
            <div style={styles.stepLabel}>{step.label}</div>
            <div style={styles.stepSub}>{step.sub}</div>
          </div>
        ))}
      </div>

      {/* FAQ par section */}
      {SECTIONS.map((section, si) => (
        <div key={si} style={styles.section}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionIcon}>{section.icon}</span>
            <h2 style={styles.sectionTitle}>{section.titre}</h2>
          </div>
          <div style={styles.faqList}>
            {section.items.map((item, ii) => (
              <div key={ii} style={styles.faqItem}>
                <div style={styles.question}>{item.q}</div>
                <div style={styles.answer}>{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Contact */}
      <div style={styles.contact}>
        <div style={{ fontSize: '22px' }}>💬</div>
        <div>
          <div style={styles.contactTitle}>Besoin d'aide supplémentaire ?</div>
          <div style={styles.contactText}>
            Contactez l'équipe Eyetech Construction à{' '}
            <span style={{ color: ACCENT }}>admin@eyetech.fr</span>
            {' '}ou consultez la documentation technique complète sur le portail développeur.
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  root: { maxWidth: '900px' },
  header: { marginBottom: '28px' },
  title: { fontSize: '28px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' },
  subtitle: { fontSize: '14px', color: '#64748b' },

  intro: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    background: `linear-gradient(135deg, rgba(124,58,237,0.12), rgba(124,58,237,0.05))`,
    border: `1px solid rgba(124,58,237,0.25)`,
    borderRadius: '12px',
    padding: '20px 24px',
    marginBottom: '24px',
  },
  introTitle: { fontSize: '15px', fontWeight: '600', color: '#f1f5f9', marginBottom: '6px' },
  introText: { fontSize: '13px', color: '#94a3b8', lineHeight: '1.7' },

  workflow: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '32px',
    flexWrap: 'wrap',
  },
  step: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    flex: 1,
    minWidth: '100px',
    textAlign: 'center',
  },
  stepNum: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '700',
  },
  stepLabel: { fontSize: '12px', fontWeight: '600', color: '#e2e8f0' },
  stepSub: { fontSize: '10px', color: '#64748b' },

  section: { marginBottom: '28px' },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '14px',
    paddingBottom: '10px',
    borderBottom: '1px solid #334155',
  },
  sectionIcon: { fontSize: '20px' },
  sectionTitle: { fontSize: '17px', fontWeight: '600', color: '#f1f5f9', margin: 0 },

  faqList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  faqItem: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '10px',
    padding: '16px 20px',
  },
  question: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
  },
  answer: { fontSize: '13px', color: '#94a3b8', lineHeight: '1.7' },

  contact: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '10px',
    padding: '18px 22px',
    marginTop: '8px',
  },
  contactTitle: { fontSize: '14px', fontWeight: '600', color: '#f1f5f9', marginBottom: '6px' },
  contactText: { fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' },
}
