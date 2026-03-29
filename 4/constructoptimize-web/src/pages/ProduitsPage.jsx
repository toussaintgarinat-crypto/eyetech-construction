import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function ProduitsPage() {
  const [produits, setProduits] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCat, setSelectedCat] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/api/produits/produits/'),
          api.get('/api/produits/categories/'),
        ])
        const prods = Array.isArray(prodRes.data) ? prodRes.data : (prodRes.data.results || [])
        const cats = Array.isArray(catRes.data) ? catRes.data : (catRes.data.results || [])
        setProduits(prods)
        setCategories(cats)
      } catch (err) {
        console.error(err)
        setError('Impossible de charger les produits. Verifiez que le backend est en ligne.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filtered = produits.filter(p => {
    const matchCat =
      selectedCat === 'all' || String(p.categorie) === String(selectedCat) || p.categorie_nom === selectedCat
    const matchSearch =
      !search || (p.nom || '').toLowerCase().includes(search.toLowerCase()) || (p.marque || '').toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  function handleCompare(produit) {
    navigate(`/recherche?q=${encodeURIComponent(produit.nom || produit.name || '')}`)
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>
          Catalogue produits
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          {produits.length} produit{produits.length !== 1 ? 's' : ''} references — Cliquez sur "Comparer" pour lancer une comparaison
        </p>
      </div>

      {/* Filtres */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
          <svg
            width="15" height="15" fill="none" stroke="#64748b" strokeWidth="2" viewBox="0 0 24 24"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
          >
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher un produit ou une marque..."
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

        {/* Filtre categories */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedCat('all')}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              border: `1px solid ${selectedCat === 'all' ? '#10b981' : '#334155'}`,
              background: selectedCat === 'all' ? 'rgba(16,185,129,0.15)' : 'transparent',
              color: selectedCat === 'all' ? '#10b981' : '#94a3b8',
              cursor: 'pointer',
            }}
          >
            Toutes
          </button>
          {categories.map(cat => (
            <button
              key={cat.id || cat.nom}
              onClick={() => setSelectedCat(String(cat.id) || cat.nom)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                border: `1px solid ${selectedCat === String(cat.id) || selectedCat === cat.nom ? '#10b981' : '#334155'}`,
                background:
                  selectedCat === String(cat.id) || selectedCat === cat.nom
                    ? 'rgba(16,185,129,0.15)'
                    : 'transparent',
                color:
                  selectedCat === String(cat.id) || selectedCat === cat.nom ? '#10b981' : '#94a3b8',
                cursor: 'pointer',
              }}
            >
              {cat.nom || cat.name || cat.label}
            </button>
          ))}
        </div>
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
            marginBottom: '1rem',
          }}
        >
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          Chargement du catalogue...
        </div>
      )}

      {/* Grille produits */}
      {!loading && filtered.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          <div style={{ fontSize: 40, marginBottom: '0.75rem' }}>📦</div>
          <div style={{ fontSize: 15, color: '#94a3b8' }}>Aucun produit trouve</div>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem',
          }}
        >
          {filtered.map((p, i) => (
            <div
              key={p.id || i}
              style={{
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 12,
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.background = '#253347' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.background = '#1e293b' }}
            >
              {/* Icone + categorie */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    background: 'rgba(16,185,129,0.1)',
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                  }}
                >
                  📦
                </div>
                {(p.categorie_nom || p.categorie) && (
                  <span
                    style={{
                      fontSize: 11,
                      padding: '0.2rem 0.6rem',
                      background: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: 6,
                      color: '#94a3b8',
                    }}
                  >
                    {p.categorie_nom || p.categorie}
                  </span>
                )}
              </div>

              {/* Nom */}
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#e2e8f0', marginBottom: 3 }}>
                  {p.nom || p.name || 'Produit sans nom'}
                </div>
                {p.marque && (
                  <div style={{ fontSize: 12, color: '#64748b' }}>Marque : {p.marque}</div>
                )}
                {p.description && (
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, lineHeight: 1.4 }}>
                    {p.description.length > 80 ? p.description.slice(0, 80) + '...' : p.description}
                  </div>
                )}
              </div>

              {/* Prix */}
              {p.prix || p.meilleur_prix ? (
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: '#10b981',
                  }}
                >
                  A partir de {parseFloat(p.prix || p.meilleur_prix).toFixed(2)} €
                  {p.unite && <span style={{ fontSize: 12, color: '#64748b', fontWeight: 400 }}>/{p.unite}</span>}
                </div>
              ) : (
                <div style={{ fontSize: 13, color: '#475569' }}>Prix a determiner</div>
              )}

              {/* Bouton comparer */}
              <button
                onClick={() => handleCompare(p)}
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  background: 'rgba(16,185,129,0.12)',
                  border: '1px solid rgba(16,185,129,0.3)',
                  borderRadius: 8,
                  color: '#10b981',
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  marginTop: 'auto',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(16,185,129,0.25)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(16,185,129,0.12)')}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Comparer les prix
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
