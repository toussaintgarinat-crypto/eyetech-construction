import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8004'

export default function LoginPage() {
  const navigate = useNavigate()
  const [isRegistering, setIsRegistering] = useState(false)
  const [form, setForm] = useState({ username: '', email: '', password: '', password2: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loginSuccess, setLoginSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('verified') === 'true') {
      setLoginSuccess('✓ Email vérifié ! Vous pouvez maintenant vous connecter.')
      window.history.replaceState({}, '', window.location.pathname)
    } else if (params.get('verified') === 'false') {
      setError("Lien de vérification invalide ou expiré. Réinscrivez-vous.")
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleLogin = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await axios.post(`${API_BASE}/api/token/`, { username: form.username, password: form.password })
      localStorage.setItem('access_token', res.data.access)
      localStorage.setItem('refresh_token', res.data.refresh)
      navigate('/')
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Identifiants incorrects. Vérifiez votre nom d\'utilisateur et mot de passe.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async e => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (form.password !== form.password2) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (form.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    setLoading(true)
    try {
      await axios.post(`${API_BASE}/api/auth/register/`, {
        username: form.username,
        email: form.email,
        password: form.password,
        password2: form.password2,
      })
      setSuccess(`Un email de confirmation a été envoyé à ${form.email}. Cliquez sur le lien pour activer votre compte.`)
      setForm({ username: '', email: '', password: '', password2: '' })
    } catch (err) {
      const data = err.response?.data
      if (data) {
        const msgs = Object.values(data).flat().join(' ')
        setError(msgs)
      } else {
        setError("Erreur lors de l'inscription. Veuillez réessayer.")
      }
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setIsRegistering(!isRegistering)
    setError('')
    setSuccess('')
    setForm({ username: '', email: '', password: '', password2: '' })
  }

  const accentColor = '#10b981'
  const inputStyle = {
    width: '100%', padding: '0.7rem 1rem', background: '#0f172a',
    border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0',
    fontSize: 14, outline: 'none', transition: 'border-color 0.15s', boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 60, height: 60, background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 auto 1rem' }}>C</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>ConstructOptimize</h1>
          <p style={{ color: '#64748b', fontSize: 13 }}>Eyetech Construction — Comparateur de prix BTP</p>
        </div>

        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: '2rem' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e2e8f0', marginBottom: '0.5rem' }}>
            {isRegistering ? 'Créer un compte' : 'Connexion'}
          </h2>
          <p style={{ color: '#64748b', fontSize: 13, marginBottom: '1.5rem' }}>
            {isRegistering ? 'Rejoignez ConstructOptimize' : 'Accédez au comparateur de prix BTP'}
          </p>

          {loginSuccess && !isRegistering && (
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, color: '#86efac', fontSize: 13, marginBottom: '1rem' }}>
              {loginSuccess}
            </div>
          )}
          {error && (
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#ef4444', fontSize: 13, marginBottom: '1rem' }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, color: '#86efac', fontSize: 13, marginBottom: '1rem' }}>
              ✓ {success}
            </div>
          )}

          {!success && (
            <form onSubmit={isRegistering ? handleRegister : handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6, fontWeight: 500 }}>Nom d'utilisateur</label>
                <input name="username" type="text" value={form.username} onChange={handleChange} required placeholder="votre_identifiant"
                  style={inputStyle} onFocus={e => (e.target.style.borderColor = accentColor)} onBlur={e => (e.target.style.borderColor = '#334155')} />
              </div>

              {isRegistering && (
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6, fontWeight: 500 }}>Adresse email</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="vous@exemple.com"
                    style={inputStyle} onFocus={e => (e.target.style.borderColor = accentColor)} onBlur={e => (e.target.style.borderColor = '#334155')} />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6, fontWeight: 500 }}>Mot de passe</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} required placeholder="••••••••"
                  style={inputStyle} onFocus={e => (e.target.style.borderColor = accentColor)} onBlur={e => (e.target.style.borderColor = '#334155')} />
              </div>

              {isRegistering && (
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6, fontWeight: 500 }}>Confirmer le mot de passe</label>
                  <input name="password2" type="password" value={form.password2} onChange={handleChange} required placeholder="••••••••"
                    style={inputStyle} onFocus={e => (e.target.style.borderColor = accentColor)} onBlur={e => (e.target.style.borderColor = '#334155')} />
                </div>
              )}

              <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.8rem', background: loading ? '#059669' : accentColor, border: 'none', borderRadius: 8, color: '#fff', fontSize: 15, fontWeight: 600, marginTop: '0.5rem', opacity: loading ? 0.7 : 1, cursor: 'pointer', transition: 'background 0.15s' }}>
                {loading ? (isRegistering ? 'Inscription...' : 'Connexion...') : (isRegistering ? "S'inscrire" : 'Se connecter')}
              </button>
            </form>
          )}

          <button onClick={switchMode} style={{ display: 'block', width: '100%', background: 'none', border: 'none', color: accentColor, fontSize: 13, cursor: 'pointer', marginTop: '16px', padding: '8px', textAlign: 'center', textDecoration: 'underline' }}>
            {isRegistering ? 'Déjà un compte ? Connectez-vous' : 'Pas de compte ? Inscrivez-vous'}
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 12, color: '#475569' }}>
          Plateforme réservée aux équipes Eyetech Construction
        </p>
      </div>
    </div>
  )
}
