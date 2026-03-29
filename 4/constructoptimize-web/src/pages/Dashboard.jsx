import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

function StatCard({ label, value, icon, color, sub }) {
  return (
    <div
      style={{
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: 12,
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: color + '22',
          border: `1px solid ${color}44`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 22 }}>{icon}</span>
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 700, color: '#e2e8f0', lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: color, marginTop: 3 }}>{sub}</div>}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState({ produits: 0, fournisseurs: 0, recherches: 0 })
  const [recherches, setRecherches] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchData() {
      try {
        const [prodRes, fourRes, rechRes] = await Promise.all([
          api.get('/api/produits/produits/'),
          api.get('/api/fournisseurs/fournisseurs/'),
          api.get('/api/comparateur/recherches/'),
        ])
        const produits = Array.isArray(prodRes.data) ? prodRes.data : (prodRes.data.results || [])
        const fournisseurs = Array.isArray(fourRes.data) ? fourRes.data : (fourRes.data.results || [])
        const rechList = Array.isArray(rechRes.data) ? rechRes.data : (rechRes.data.results || [])
        setStats({
          produits: produits.length,
          fournisseurs: fournisseurs.length,
          recherches: rechList.length,
        })
        setRecherches(rechList.slice(0, 8))
      } catch (err) {
        console.error('Erreur chargement dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  function handleSearch(e) {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/recherche?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>
          Tableau de bord
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          Comparez les prix materiaux en tenant compte de la distance fournisseur
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', maxWidth: 600 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <svg
              width="16" height="16" fill="none" stroke="#64748b" strokeWidth="2" viewBox="0 0 24 24"
              style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
            >
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher un materiau... ex: placo BA13, cable 2.5mm²"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.5rem',
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 10,
                color: '#e2e8f0',
                fontSize: 14,
                outline: 'none',
              }}
              onFocus={e => (e.target.style.borderColor = '#10b981')}
              onBlur={e => (e.target.style.borderColor = '#334155')}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: '0.75rem 1.5rem',
              background: '#10b981',
              border: 'none',
              borderRadius: 10,
              color: '#fff',
              fontWeight: 600,
              fontSize: 14,
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#059669')}
            onMouseLeave={e => (e.currentTarget.style.background = '#10b981')}
          >
            Comparer
          </button>
        </div>
      </form>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <StatCard
          label="Produits compares"
          value={loading ? '...' : stats.produits}
          icon="📦"
          color="#10b981"
          sub="dans le catalogue"
        />
        <StatCard
          label="Fournisseurs actifs"
          value={loading ? '...' : stats.fournisseurs}
          icon="🏭"
          color="#3b82f6"
          sub="references"
        />
        <StatCard
          label="Economies realisees"
          value="12-35%"
          icon="💰"
          color="#f59e0b"
          sub="vs. prix marche moyen"
        />
        <StatCard
          label="Recherches effectuees"
          value={loading ? '...' : stats.recherches}
          icon="🕐"
          color="#8b5cf6"
          sub={
            recherches.length > 0
              ? `Derniere : "${recherches[0].terme_recherche || 'N/A'}"`
              : 'Aucune recherche'
          }
        />
      </div>

      {/* Raccourcis materiaux courants */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
          Matériaux fréquents
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {['Placo BA13', 'Câble électrique 2.5mm²', 'Tube PER plomberie', 'Laine de verre isolation', 'Mortier colle', 'Rail montant 70mm', 'Béton prêt emploi'].map(mat => (
            <button
              key={mat}
              onClick={() => navigate(`/recherche?q=${encodeURIComponent(mat)}`)}
              style={{
                padding: '0.4rem 0.9rem',
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 20,
                color: '#94a3b8',
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.color = '#10b981' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.color = '#94a3b8' }}
            >
              {mat}
            </button>
          ))}
        </div>
      </div>

      {/* Recherches recentes */}
      <div
        style={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid #334155',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#e2e8f0' }}>Recherches recentes</h2>
          <button
            onClick={() => navigate('/recherche')}
            style={{
              background: 'rgba(16,185,129,0.12)',
              border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: 8,
              color: '#10b981',
              fontSize: 13,
              fontWeight: 500,
              padding: '0.4rem 0.9rem',
            }}
          >
            + Nouvelle recherche
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Chargement...</div>
        ) : recherches.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontSize: 40, marginBottom: '0.75rem' }}>🔍</div>
            <div style={{ fontSize: 15, fontWeight: 500, color: '#94a3b8', marginBottom: 4 }}>
              Aucune recherche effectuee
            </div>
            <div style={{ fontSize: 13 }}>
              Lancez votre premiere comparaison de prix depuis la page Recherche
            </div>
          </div>
        ) : (
          <div>
            {recherches.map((r, i) => (
              <div
                key={r.id || i}
                onClick={() => r.id && navigate(`/resultats/${r.id}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1.25rem',
                  borderBottom: i < recherches.length - 1 ? '1px solid #1a2844' : 'none',
                  cursor: r.id ? 'pointer' : 'default',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#253347')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      background: 'rgba(16,185,129,0.12)',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 15,
                    }}
                  >
                    🔍
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#e2e8f0' }}>
                      {r.terme_recherche || `Recherche #${String(r.id).slice(0, 8)}`}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                      {r.nombre_resultats != null ? `${r.nombre_resultats} résultat(s)` : ''}
                      {r.rayon_recherche ? ` — rayon ${r.rayon_recherche}km` : ''}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {r.statut && (
                    <div
                      style={{
                        fontSize: 11,
                        background: r.statut === 'terminee' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                        color: r.statut === 'terminee' ? '#10b981' : '#f59e0b',
                        padding: '0.2rem 0.6rem',
                        borderRadius: 6,
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        letterSpacing: '0.05em',
                      }}
                    >
                      {r.statut === 'terminee' ? 'Terminée' : r.statut}
                    </div>
                  )}
                  {r.date_creation && (
                    <div style={{ fontSize: 11, color: '#475569', marginTop: 3 }}>
                      {new Date(r.date_creation).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
