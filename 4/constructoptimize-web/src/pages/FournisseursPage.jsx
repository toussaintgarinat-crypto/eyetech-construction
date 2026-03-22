import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

function StarRating({ note, max = 5 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: max }, (_, i) => (
        <svg
          key={i}
          width="14" height="14"
          viewBox="0 0 24 24"
          fill={i < Math.round(note) ? '#f59e0b' : 'none'}
          stroke={i < Math.round(note) ? '#f59e0b' : '#475569'}
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 4 }}>({note || 0}/5)</span>
    </div>
  )
}

export default function FournisseursPage() {
  const [fournisseurs, setFournisseurs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [userCoords, setUserCoords] = useState(null)
  const [geoLoading, setGeoLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchFournisseurs() {
      try {
        const res = await api.get('/api/fournisseurs/fournisseurs/')
        const list = Array.isArray(res.data) ? res.data : (res.data.results || [])
        setFournisseurs(list)
      } catch (err) {
        console.error(err)
        setError('Impossible de charger les fournisseurs.')
      } finally {
        setLoading(false)
      }
    }
    fetchFournisseurs()
  }, [])

  function requestGeolocation() {
    if (!navigator.geolocation) {
      alert("La geolocalisation n'est pas supportee par votre navigateur.")
      return
    }
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setGeoLoading(false)
      },
      () => {
        alert("Impossible d'obtenir votre position.")
        setGeoLoading(false)
      }
    )
  }

  function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  const enriched = fournisseurs.map(f => {
    let dist = null
    if (userCoords && f.latitude && f.longitude) {
      dist = haversineDistance(userCoords.lat, userCoords.lng, parseFloat(f.latitude), parseFloat(f.longitude))
    }
    return { ...f, _dist: dist }
  })

  const filtered = enriched
    .filter(f => {
      const name = f.nom || f.name || ''
      const ville = f.ville || f.city || ''
      const q = search.toLowerCase()
      return !search || name.toLowerCase().includes(q) || ville.toLowerCase().includes(q)
    })
    .sort((a, b) => {
      if (a._dist !== null && b._dist !== null) return a._dist - b._dist
      return 0
    })

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>
          Fournisseurs
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          {fournisseurs.length} fournisseur{fournisseurs.length !== 1 ? 's' : ''} references
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
          <svg
            width="15" height="15" fill="none" stroke="#64748b" strokeWidth="2" viewBox="0 0 24 24"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
          >
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher par nom ou ville..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 1rem 0.6rem 2.25rem',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 8,
              color: '#e2e8f0',
              fontSize: 14,
              outline: 'none',
            }}
            onFocus={e => (e.target.style.borderColor = '#10b981')}
            onBlur={e => (e.target.style.borderColor = '#334155')}
          />
        </div>

        <button
          onClick={requestGeolocation}
          disabled={geoLoading}
          style={{
            padding: '0.6rem 1.2rem',
            background: userCoords ? 'rgba(16,185,129,0.15)' : '#1e293b',
            border: `1px solid ${userCoords ? '#10b981' : '#334155'}`,
            borderRadius: 8,
            color: userCoords ? '#10b981' : '#94a3b8',
            fontSize: 13,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          {geoLoading ? 'Localisation...' : userCoords ? 'Position obtenue' : 'Ma position'}
        </button>
      </div>

      {userCoords && (
        <div
          style={{
            padding: '0.6rem 1rem',
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 8,
            fontSize: 13,
            color: '#10b981',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Geolocalisation active — distances calculees depuis votre position (
          {userCoords.lat.toFixed(4)}, {userCoords.lng.toFixed(4)})
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div
          style={{
            padding: '0.75rem 1rem',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 8,
            color: '#ef4444',
            fontSize: 14,
            marginBottom: '1rem',
          }}
        >
          {error}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          Chargement des fournisseurs...
        </div>
      )}

      {!loading && filtered.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          <div style={{ fontSize: 40, marginBottom: '0.75rem' }}>🏭</div>
          <div style={{ fontSize: 15, color: '#94a3b8' }}>Aucun fournisseur trouve</div>
        </div>
      )}

      {/* Grille fournisseurs */}
      {!loading && filtered.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem',
          }}
        >
          {filtered.map((f, i) => (
            <div
              key={f.id || i}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    background: 'rgba(59,130,246,0.1)',
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                  }}
                >
                  🏭
                </div>
                {f._dist !== null && (
                  <span
                    style={{
                      fontSize: 12,
                      padding: '0.2rem 0.6rem',
                      background: 'rgba(16,185,129,0.12)',
                      border: '1px solid rgba(16,185,129,0.3)',
                      borderRadius: 6,
                      color: '#10b981',
                      fontWeight: 600,
                    }}
                  >
                    {f._dist.toFixed(1)} km
                  </span>
                )}
              </div>

              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#e2e8f0', marginBottom: 3 }}>
                  {f.nom || f.name || 'Fournisseur inconnu'}
                </div>
                {(f.ville || f.city) && (
                  <div style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                      <circle cx="12" cy="9" r="2.5" />
                    </svg>
                    {f.ville || f.city}
                  </div>
                )}
                {f.telephone && (
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>
                    Tel : {f.telephone}
                  </div>
                )}
              </div>

              {f.note !== undefined && f.note !== null && (
                <StarRating note={f.note} />
              )}

              {f.nb_produits !== undefined && (
                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                  {f.nb_produits} produit{f.nb_produits !== 1 ? 's' : ''} disponible{f.nb_produits !== 1 ? 's' : ''}
                </div>
              )}

              <button
                onClick={() => navigate(`/recherche?fournisseur=${f.id}`)}
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  background: 'rgba(16,185,129,0.12)',
                  border: '1px solid rgba(16,185,129,0.3)',
                  borderRadius: 8,
                  color: '#10b981',
                  fontSize: 13,
                  fontWeight: 600,
                  marginTop: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(16,185,129,0.25)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(16,185,129,0.12)')}
              >
                Voir les prix
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
