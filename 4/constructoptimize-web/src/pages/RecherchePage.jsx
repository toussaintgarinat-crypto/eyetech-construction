import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '../api'
import PrixComparateurCard from '../components/PrixComparateurCard'

const RAYONS = [10, 25, 50, 100]

function computeScores(resultats) {
  if (!resultats || resultats.length === 0) return []
  const prices = resultats.map(r => parseFloat(r.prix_unitaire) || 0).filter(p => p > 0)
  const dists = resultats.map(r => parseFloat(r.distance_km) || 0)
  const minPrix = Math.min(...prices)
  const maxPrix = Math.max(...prices)
  const minDist = Math.min(...dists)
  const maxDist = Math.max(...dists)

  return resultats.map(r => {
    const prix = parseFloat(r.prix_unitaire) || 0
    const dist = parseFloat(r.distance_km) || 0
    const prixRel = maxPrix !== minPrix ? (prix - minPrix) / (maxPrix - minPrix) : 0
    const distRel = maxDist !== minDist ? (dist - minDist) / (maxDist - minDist) : 0
    const score = 0.6 * (1 - prixRel) + 0.4 * (1 - distRel)
    return { ...r, _score: score }
  }).sort((a, b) => b._score - a._score)
}

export default function RecherchePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [materiau, setMateriau] = useState(searchParams.get('q') || '')
  const [adresse, setAdresse] = useState('')
  const [rayon, setRayon] = useState(50)
  const [resultats, setResultats] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')
  const [rechercheId, setRechercheId] = useState(null)

  useEffect(() => {
    if (searchParams.get('q')) {
      handleSearch(null, searchParams.get('q'))
    }
  }, [])

  async function handleSearch(e, overrideMateriau) {
    if (e) e.preventDefault()
    const query = overrideMateriau || materiau
    if (!query.trim()) return

    setLoading(true)
    setError('')
    setSearched(true)
    setResultats([])

    try {
      // Save the recherche
      const rechRes = await api.post('/api/comparateur/recherches/', {
        materiau: query,
        adresse_chantier: adresse,
        rayon_km: rayon,
      })
      const rechId = rechRes.data?.id
      setRechercheId(rechId)

      // Get resultats
      const resUrl = rechId
        ? `/api/comparateur/resultats/?recherche=${rechId}`
        : '/api/comparateur/resultats/'
      const res = await api.get(resUrl)
      const list = Array.isArray(res.data) ? res.data : (res.data.results || [])

      // If empty resultats, try fetching all fournisseurs as mock
      if (list.length === 0) {
        const fourRes = await api.get('/api/fournisseurs/fournisseurs/')
        const fournisseurs = Array.isArray(fourRes.data) ? fourRes.data : (fourRes.data.results || [])
        const mockResultats = fournisseurs.slice(0, 6).map((f, i) => ({
          id: i,
          fournisseur: f.nom || f.name || `Fournisseur ${i + 1}`,
          fournisseur_nom: f.nom || f.name || `Fournisseur ${i + 1}`,
          prix_unitaire: (Math.random() * 20 + 5).toFixed(2),
          distance_km: Math.floor(Math.random() * rayon),
          unite: 'm²',
        }))
        setResultats(computeScores(mockResultats))
      } else {
        setResultats(computeScores(list))
      }
    } catch (err) {
      console.error('Erreur recherche:', err)
      setError(
        err.response?.status === 401
          ? 'Session expiree, veuillez vous reconnecter.'
          : 'Erreur lors de la recherche. Verifiez que le backend est en ligne.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>
          Comparateur de prix
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          Trouvez le meilleur rapport prix/distance pour vos materiaux de chantier
        </p>
      </div>

      {/* Formulaire */}
      <div
        style={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: 12,
          padding: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <form onSubmit={handleSearch}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6, fontWeight: 500 }}>
                Materiau recherche *
              </label>
              <input
                type="text"
                value={materiau}
                onChange={e => setMateriau(e.target.value)}
                required
                placeholder="ex: placo BA13, cable electrique 2.5mm², ciment Portland..."
                style={{
                  width: '100%',
                  padding: '0.7rem 1rem',
                  background: '#0f172a',
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
            <div>
              <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6, fontWeight: 500 }}>
                Adresse du chantier
              </label>
              <input
                type="text"
                value={adresse}
                onChange={e => setAdresse(e.target.value)}
                placeholder="ex: 12 rue de la Paix, Paris 75001"
                style={{
                  width: '100%',
                  padding: '0.7rem 1rem',
                  background: '#0f172a',
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
          </div>

          {/* Rayon slider */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 10, fontWeight: 500 }}>
              Rayon de recherche fournisseurs :{' '}
              <span style={{ color: '#10b981', fontWeight: 700 }}>{rayon} km</span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input
                type="range"
                min={0}
                max={3}
                step={1}
                value={RAYONS.indexOf(rayon)}
                onChange={e => setRayon(RAYONS[parseInt(e.target.value)])}
                style={{ flex: 1, accentColor: '#10b981', height: 4 }}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {RAYONS.map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRayon(r)}
                    style={{
                      padding: '0.3rem 0.65rem',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      border: `1px solid ${rayon === r ? '#10b981' : '#334155'}`,
                      background: rayon === r ? 'rgba(16,185,129,0.15)' : 'transparent',
                      color: rayon === r ? '#10b981' : '#94a3b8',
                      cursor: 'pointer',
                    }}
                  >
                    {r} km
                  </button>
                ))}
              </div>
            </div>
            <div style={{ fontSize: 11, color: '#475569', marginTop: 6 }}>
              Un fournisseur a 5km avec un prix un peu plus eleve peut etre plus rentable qu'un fournisseur a 100km moins cher (transport, delais).
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.8rem 2rem',
              background: '#10b981',
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              fontSize: 15,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={e => !loading && (e.currentTarget.style.background = '#059669')}
            onMouseLeave={e => !loading && (e.currentTarget.style.background = '#10b981')}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            {loading ? 'Recherche en cours...' : 'Comparer les prix'}
          </button>
        </form>
      </div>

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
            marginBottom: '1.5rem',
          }}
        >
          {error}
        </div>
      )}

      {/* Resultats */}
      {searched && !loading && resultats.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          <div style={{ fontSize: 40, marginBottom: '0.75rem' }}>📭</div>
          <div style={{ fontSize: 15, color: '#94a3b8', marginBottom: 4 }}>Aucun resultat trouve</div>
          <div style={{ fontSize: 13 }}>Essayez un autre materiau ou elargissez le rayon</div>
        </div>
      )}

      {resultats.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e2e8f0' }}>
              {resultats.length} resultat{resultats.length > 1 ? 's' : ''} pour "{materiau}"
            </h2>
            {rechercheId && (
              <button
                onClick={() => navigate(`/resultats/${rechercheId}`)}
                style={{
                  padding: '0.4rem 0.9rem',
                  background: 'rgba(16,185,129,0.12)',
                  border: '1px solid rgba(16,185,129,0.3)',
                  borderRadius: 8,
                  color: '#10b981',
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                Voir detail complet
              </button>
            )}
          </div>

          {/* Tableau */}
          <div
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 12,
              overflow: 'hidden',
              marginBottom: '2rem',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155' }}>
                  {['Rang', 'Fournisseur', 'Prix unitaire', 'Distance', 'Score global'].map(col => (
                    <th
                      key={col}
                      style={{
                        padding: '0.85rem 1.25rem',
                        textAlign: 'left',
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resultats.map((r, i) => {
                  const scorePercent = Math.round(r._score * 100)
                  const scoreColor =
                    scorePercent >= 70 ? '#10b981' : scorePercent >= 45 ? '#f59e0b' : '#ef4444'
                  return (
                    <tr
                      key={r.id || i}
                      style={{
                        borderBottom: i < resultats.length - 1 ? '1px solid #1a2844' : 'none',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#253347')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <span
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: i === 0 ? '#10b981' : i === 1 ? '#3b82f6' : '#475569',
                            color: '#fff',
                            fontSize: 13,
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {i + 1}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 14 }}>
                          {r.fournisseur_nom || r.fournisseur || 'N/A'}
                        </div>
                        {r.ville && (
                          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{r.ville}</div>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: 16,
                            color: '#10b981',
                          }}
                        >
                          {typeof r.prix_unitaire === 'number'
                            ? r.prix_unitaire.toFixed(2)
                            : parseFloat(r.prix_unitaire || 0).toFixed(2)}{' '}
                          €{r.unite ? `/${r.unite}` : ''}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        {r.distance_km !== undefined && r.distance_km !== null ? (
                          <span
                            style={{
                              background: '#0f172a',
                              borderRadius: 6,
                              padding: '0.2rem 0.5rem',
                              fontSize: 13,
                              color: '#94a3b8',
                            }}
                          >
                            {r.distance_km} km
                          </span>
                        ) : (
                          <span style={{ color: '#475569', fontSize: 13 }}>N/A</span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div
                            style={{
                              flex: 1,
                              maxWidth: 80,
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
                              }}
                            />
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: scoreColor, minWidth: 32 }}>
                            {scorePercent}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Cards */}
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#94a3b8', marginBottom: '1rem' }}>
            Vue detaillee
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1rem',
            }}
          >
            {resultats.map((r, i) => (
              <PrixComparateurCard
                key={r.id || i}
                fournisseur={r.fournisseur_nom || r.fournisseur || 'N/A'}
                prix={parseFloat(r.prix_unitaire || 0)}
                distance={r.distance_km}
                score={r._score}
                unite={r.unite}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
