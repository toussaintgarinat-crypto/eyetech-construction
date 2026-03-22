import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await axios.post('http://localhost:8004/api/token/', { username, password })
      localStorage.setItem('access_token', res.data.access)
      localStorage.setItem('refresh_token', res.data.refresh)
      navigate('/')
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          'Identifiants incorrects. Verifiez votre nom d\'utilisateur et mot de passe.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: 60,
              height: 60,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 800,
              color: '#fff',
              margin: '0 auto 1rem',
            }}
          >
            C
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>
            ConstructOptimize
          </h1>
          <p style={{ color: '#64748b', fontSize: 13 }}>Eyetech Construction — Comparateur de prix BTP</p>
        </div>

        {/* Card */}
        <div
          style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 16,
            padding: '2rem',
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e2e8f0', marginBottom: '1.5rem' }}>
            Connexion
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6, fontWeight: 500 }}>
                Nom d'utilisateur
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                placeholder="admin"
                style={{
                  width: '100%',
                  padding: '0.7rem 1rem',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: 8,
                  color: '#e2e8f0',
                  fontSize: 14,
                  outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => (e.target.style.borderColor = '#10b981')}
                onBlur={e => (e.target.style.borderColor = '#334155')}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6, fontWeight: 500 }}>
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.7rem 1rem',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: 8,
                  color: '#e2e8f0',
                  fontSize: 14,
                  outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => (e.target.style.borderColor = '#10b981')}
                onBlur={e => (e.target.style.borderColor = '#334155')}
              />
            </div>

            {error && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 8,
                  color: '#ef4444',
                  fontSize: 13,
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.8rem',
                background: loading ? '#059669' : '#10b981',
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                fontSize: 15,
                fontWeight: 600,
                marginTop: '0.5rem',
                opacity: loading ? 0.7 : 1,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => !loading && (e.currentTarget.style.background = '#059669')}
              onMouseLeave={e => !loading && (e.currentTarget.style.background = '#10b981')}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 12, color: '#475569' }}>
          Plateforme reservee aux equipes Eyetech Construction
        </p>
      </div>
    </div>
  )
}
