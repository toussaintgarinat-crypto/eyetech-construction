export default function PrixComparateurCard({ fournisseur, prix, distance, score, unite }) {
  const scorePercent = Math.round(score * 100)

  const scoreColor =
    scorePercent >= 70 ? '#10b981' : scorePercent >= 45 ? '#f59e0b' : '#ef4444'

  return (
    <div
      style={{
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: 12,
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        transition: 'border-color 0.15s, transform 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#10b981'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#334155'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#e2e8f0' }}>{fournisseur}</div>
          {distance !== null && distance !== undefined && (
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              {distance} km du chantier
            </div>
          )}
        </div>
        <div
          style={{
            background: 'rgba(16,185,129,0.12)',
            border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: 8,
            padding: '0.3rem 0.75rem',
            color: '#10b981',
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          {typeof prix === 'number' ? prix.toFixed(2) : prix} €{unite ? `/${unite}` : ''}
        </div>
      </div>

      {/* Score composite */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>Score global</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: scoreColor }}>{scorePercent}%</span>
        </div>
        <div
          style={{
            height: 6,
            background: '#334155',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${scorePercent}%`,
              background: scoreColor,
              borderRadius: 3,
              transition: 'width 0.5s ease',
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: '#64748b' }}>
          <span>Prix 60% + Distance 40%</span>
          <span>{scorePercent >= 70 ? 'Excellent' : scorePercent >= 45 ? 'Correct' : 'Mediocre'}</span>
        </div>
      </div>
    </div>
  )
}
