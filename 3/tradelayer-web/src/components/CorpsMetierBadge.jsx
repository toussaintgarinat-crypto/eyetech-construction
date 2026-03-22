const CORPS_METIER_MAP = [
  { keys: ['plomberie', 'plomb', 'sanitaire', 'eau'], color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', label: 'Plomberie' },
  { keys: ['electr', 'elec', 'courant', 'câblage', 'cablage'], color: '#eab308', bg: 'rgba(234,179,8,0.12)', label: 'Électricité' },
  { keys: ['placo', 'cloison', 'plaque', 'doublage'], color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', label: 'Placo' },
  { keys: ['charpen', 'bois', 'ossature', 'toiture'], color: '#b45309', bg: 'rgba(180,83,9,0.12)', label: 'Charpente' },
  { keys: ['cvc', 'climati', 'ventil', 'chauffage', 'hvac'], color: '#ef4444', bg: 'rgba(239,68,68,0.12)', label: 'CVC' },
  { keys: ['peinture', 'revêtement', 'revetement', 'enduit', 'décor', 'decor'], color: '#22c55e', bg: 'rgba(34,197,94,0.12)', label: 'Peinture' },
  { keys: ['maçon', 'macon', 'béton', 'beton', 'parpaing', 'brique'], color: '#d97706', bg: 'rgba(217,119,6,0.12)', label: 'Maçonnerie' },
  { keys: ['menuis', 'fenêtre', 'fenetre', 'porte', 'vitr'], color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', label: 'Menuiserie' },
  { keys: ['metal', 'métall', 'acier', 'serrur'], color: '#64748b', bg: 'rgba(100,116,139,0.12)', label: 'Métallerie' },
  { keys: ['carrel', 'faïence', 'faience', 'sol'], color: '#fb923c', bg: 'rgba(251,146,60,0.12)', label: 'Carrelage' },
]

function getCorpsMetierStyle(nom) {
  if (!nom) return { color: '#64748b', bg: 'rgba(100,116,139,0.12)', label: nom || 'Inconnu' }

  const normalized = nom.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  for (const entry of CORPS_METIER_MAP) {
    if (entry.keys.some(k => normalized.includes(k))) {
      return { color: entry.color, bg: entry.bg, label: nom }
    }
  }

  return { color: '#64748b', bg: 'rgba(100,116,139,0.12)', label: nom }
}

export default function CorpsMetierBadge({ nom, size = 'sm' }) {
  const { color, bg, label } = getCorpsMetierStyle(nom)

  const fontSize = size === 'sm' ? '11px' : '13px'
  const padding = size === 'sm' ? '3px 10px' : '5px 14px'

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      fontSize,
      fontWeight: '600',
      color,
      background: bg,
      border: `1px solid ${color}44`,
      borderRadius: '20px',
      padding,
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: color,
        flexShrink: 0,
        display: 'inline-block',
      }} />
      {label}
    </span>
  )
}

// Export the helper function as well for use in other components
export { getCorpsMetierStyle }
