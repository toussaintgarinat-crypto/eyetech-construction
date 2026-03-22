import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/api/auth/login/', {
        username: form.username,
        password: form.password
      })
      const { access, refresh, user } = res.data
      localStorage.setItem('access_token', access)
      if (refresh) localStorage.setItem('refresh_token', refresh)
      if (user) localStorage.setItem('user', JSON.stringify(user))
      navigate('/')
    } catch (err) {
      const msg = err.response?.data?.detail
        || err.response?.data?.non_field_errors?.[0]
        || 'Identifiants incorrects. Vérifiez votre nom d\'utilisateur et mot de passe.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.root}>
      <div style={styles.card}>
        {/* Logo / Brand */}
        <div style={styles.brandBlock}>
          <div style={styles.logoCircle}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#3b82f6" />
              <path d="M8 20 L16 8 L24 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M11 16 L21 16" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h1 style={styles.brandName}>TradeLayer Intelligence</h1>
            <p style={styles.brandSub}>Eyetech Construction — Plateforme de calques métiers</p>
          </div>
        </div>

        {/* Form */}
        <div style={styles.formBlock}>
          <h2 style={styles.title}>Connexion</h2>
          <p style={styles.subtitle}>Accédez à votre espace chef de projet</p>

          {error && (
            <div style={styles.errorBox}>
              <span style={{ marginRight: 8 }}>⚠</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.fieldGroup}>
              <label style={styles.label} htmlFor="username">Nom d'utilisateur</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="votre_identifiant"
                value={form.username}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label} htmlFor="password">Mot de passe</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <button type="submit" style={styles.btn} disabled={loading}>
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>
        </div>

        <p style={styles.footer}>
          Eyetech Construction © 2026 — Système interne BTP
        </p>
      </div>

      {/* Decorative background elements */}
      <div style={styles.bgDot1} />
      <div style={styles.bgDot2} />
    </div>
  )
}

const styles = {
  root: {
    minHeight: '100vh',
    width: '100%',
    background: '#0f172a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  bgDot1: {
    position: 'absolute',
    top: '-200px',
    right: '-200px',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgDot2: {
    position: 'absolute',
    bottom: '-150px',
    left: '-150px',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    width: '460px',
    background: '#1e293b',
    borderRadius: '16px',
    border: '1px solid #334155',
    padding: '40px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
    position: 'relative',
    zIndex: 1,
  },
  brandBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '32px',
    paddingBottom: '24px',
    borderBottom: '1px solid #334155',
  },
  logoCircle: {
    flexShrink: 0,
  },
  brandName: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#f1f5f9',
    margin: 0,
    lineHeight: '1.2',
  },
  brandSub: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '3px',
  },
  formBlock: {
    marginBottom: '24px',
  },
  title: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: '6px',
  },
  subtitle: {
    fontSize: '13px',
    color: '#64748b',
    marginBottom: '24px',
  },
  errorBox: {
    background: 'rgba(239,68,68,0.12)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#fca5a5',
    fontSize: '13px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'flex-start',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#94a3b8',
  },
  input: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#f1f5f9',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.15s',
  },
  btn: {
    marginTop: '8px',
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  footer: {
    textAlign: 'center',
    fontSize: '11px',
    color: '#475569',
    marginTop: '8px',
  },
}
