import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import PrixComparateurCard from '../components/PrixComparateurCard'

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

export default function ResultatsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [recherche, setRecherche] = useState(null)
  const [resultats, setResultats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const [rechRes, resRes] = await Promise.all([
          api.get(`/api/comparateur/recherches/${id}/`),
          api.get(`/api/comparateur/resultats/?recherche=${id}`),
        ])
        setRecherche(rechRes.data)
        const list = Array.isArray(resRes.data) ? resRes.data : (resRes.data.results || [])
        setResultats(computeScores(list))
      } catch (err) {
        console.error(err)
        setError('Impossible de charger les resultats de cette recherche.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
        Chargement des resultats...
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'transparent',
            border: '1px solid #334155',
            borderRadius: 8,
            color: '#94a3b8',
            padding: '0.5rem 1rem',
            marginBottom: '1rem',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          &larr; Retour
        </button>
        <div
          style={{
            padding: '0.75rem 1rem',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 8,
            color: '#ef4444',
          }}
        >
          {error}
        </div>
      </div>
    )
  }

  const bestResult = resultats[0]

  return (
    <div>
      {/* Retour */}
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'transparent',
          border: '1px solid #334155',
          borderRadius: 8,
          color: '#94a3b8',
          padding: '0.5rem 1rem',
          marginBottom: '1.5rem',
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          cursor: 'pointer',
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = '#10b981')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = '#334155')}
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Retour
      </button>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#e2e8f0', marginBottom: 6 }}>
          Resultats : "{recherche?.materiau || recherche?.terme || `Recherche #${id}`}"
        </h1>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {recherche?.adresse_chantier && (
            <span style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              {recherche.adresse_chantier}
            </span>
          )}
          {recherche?.rayon_km && (
            <span style={{ fontSize: 13, color: '#64748b' }}>
              Rayon : {recherche.rayon_km} km
            </span>
          )}
          <span style={{ fontSize: 13, color: '#64748b' }}>
            {resultats.length} resultat{resultats.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Meilleur resultat highlight */}
      {bestResult && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))',
            border: '1px solid rgba(16,185,129,0.4)',
            borderRadius: 12,
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ fontSize: 32 }}>🏆</div>
          <div>
            <div style={{ fontSize: 12, color: '#10b981', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              Meilleur rapport prix/distance
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0' }}>
              {bestResult.fournisseur_nom || bestResult.fournisseur}
            </div>
            <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 2 }}>
              {parseFloat(bestResult.prix_unitaire || 0).toFixed(2)} €
              {bestResult.unite ? `/${bestResult.unite}` : ''}
              {bestResult.distance_km !== undefined && ` — ${bestResult.distance_km} km`}
              {' '}— Score : {Math.round(bestResult._score * 100)}%
            </div>
          </div>
        </div>
      )}

      {resultats.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          <div style={{ fontSize: 40, marginBottom: '0.75rem' }}>📭</div>
          <div style={{ fontSize: 15, color: '#94a3b8' }}>Aucun resultat pour cette recherche</div>
        </div>
      )}

      {resultats.length > 0 && (
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
      )}

      {/* Methodologie */}
      <div
        style={{
          marginTop: '2rem',
          padding: '1rem 1.25rem',
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: 10,
          fontSize: 12,
          color: '#64748b',
        }}
      >
        <strong style={{ color: '#94a3b8' }}>Methodologie du score composite :</strong> Score = 0.6 × (1 − prix_relatif) + 0.4 × (1 − distance_relative).
        Un fournisseur proche avec un prix raisonnable obtient un meilleur score qu'un fournisseur tres eloigne, meme si ce dernier est legerement moins cher.
      </div>
    </div>
  )
}
