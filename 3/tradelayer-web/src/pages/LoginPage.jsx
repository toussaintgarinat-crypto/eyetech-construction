import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function LoginPage() {
  const navigate = useNavigate()
  const [isRegistering, setIsRegistering] = useState(false)
  const [form, setForm] = useState({ username: '', email: '', first_name: '', last_name: '', password: '', password2: '' })
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
      const res = await api.post('/api/auth/token/', { username: form.username, password: form.password })
      const { access, refresh, user } = res.data
      localStorage.setItem('access_token', access)
      if (refresh) localStorage.setItem('refresh_token', refresh)
      if (user) localStorage.setItem('user', JSON.stringify(user))
      navigate('/')
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
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
      await api.post('/api/auth/register/', {
        username: form.username,
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        password: form.password,
        password2: form.password2,
      })
      setSuccess(`Un email de confirmation a été envoyé à ${form.email}. Cliquez sur le lien pour activer votre compte.`)
      setForm({ username: '', email: '', first_name: '', last_name: '', password: '', password2: '' })
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
    setForm({ username: '', email: '', first_name: '', last_name: '', password: '', password2: '' })
  }

  return (
    <div style={styles.root}>
      <div style={styles.card}>
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

        <div style={styles.formBlock}>
          <h2 style={styles.title}>{isRegistering ? 'Créer un compte' : 'Connexion'}</h2>
          <p style={styles.subtitle}>
            {isRegistering ? 'Rejoignez la plateforme TradeLayer' : 'Accédez à votre espace chef de projet'}
          </p>

          {loginSuccess && !isRegistering && (
            <div style={styles.successBox}>{loginSuccess}</div>
          )}
          {error && <div style={styles.errorBox}><span style={{ marginRight: 8 }}>⚠</span>{error}</div>}
          {success && <div style={styles.successBox}>✓ {success}</div>}

          {!success && (
            <form onSubmit={isRegistering ? handleRegister : handleLogin} style={styles.form}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Nom d'utilisateur</label>
                <input name="username" type="text" autoComplete="username" placeholder="votre_identifiant"
                  value={form.username} onChange={handleChange} style={styles.input} required />
              </div>

              {isRegistering && (
                <>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Adresse email</label>
                    <input name="email" type="email" autoComplete="email" placeholder="vous@exemple.com"
                      value={form.email} onChange={handleChange} style={styles.input} required />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Prénom</label>
                      <input name="first_name" type="text" placeholder="Prénom"
                        value={form.first_name} onChange={handleChange} style={styles.input} required />
                    </div>
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Nom</label>
                      <input name="last_name" type="text" placeholder="Nom"
                        value={form.last_name} onChange={handleChange} style={styles.input} required />
                    </div>
                  </div>
                </>
              )}

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Mot de passe</label>
                <input name="password" type="password" autoComplete={isRegistering ? 'new-password' : 'current-password'}
                  placeholder="••••••••" value={form.password} onChange={handleChange} style={styles.input} required />
              </div>

              {isRegistering && (
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Confirmer le mot de passe</label>
                  <input name="password2" type="password" autoComplete="new-password" placeholder="••••••••"
                    value={form.password2} onChange={handleChange} style={styles.input} required />
                </div>
              )}

              <button type="submit" style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
                {loading ? (isRegistering ? 'Inscription...' : 'Connexion...') : (isRegistering ? "S'inscrire" : 'Se connecter')}
              </button>
            </form>
          )}

          <button onClick={switchMode} style={styles.switchBtn}>
            {isRegistering ? 'Déjà un compte ? Connectez-vous' : 'Pas de compte ? Inscrivez-vous'}
          </button>
        </div>

        <p style={styles.footer}>Eyetech Construction © 2026 — Système interne BTP</p>
      </div>

      <div style={styles.bgDot1} />
      <div style={styles.bgDot2} />
    </div>
  )
}

const styles = {
  root: { minHeight: '100vh', width: '100%', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
  bgDot1: { position: 'absolute', top: '-200px', right: '-200px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)', pointerEvents: 'none' },
  bgDot2: { position: 'absolute', bottom: '-150px', left: '-150px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', pointerEvents: 'none' },
  card: { width: '460px', background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '40px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', position: 'relative', zIndex: 1 },
  brandBlock: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #334155' },
  logoCircle: { flexShrink: 0 },
  brandName: { fontSize: '18px', fontWeight: '700', color: '#f1f5f9', margin: 0, lineHeight: '1.2' },
  brandSub: { fontSize: '12px', color: '#64748b', marginTop: '3px' },
  formBlock: { marginBottom: '24px' },
  title: { fontSize: '22px', fontWeight: '600', color: '#f1f5f9', marginBottom: '6px' },
  subtitle: { fontSize: '13px', color: '#64748b', marginBottom: '24px' },
  errorBox: { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '12px 16px', color: '#fca5a5', fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'flex-start' },
  successBox: { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '8px', padding: '12px 16px', color: '#86efac', fontSize: '13px', marginBottom: '20px' },
  form: { display: 'flex', flexDirection: 'column', gap: '18px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '500', color: '#94a3b8' },
  input: { background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '10px 14px', color: '#f1f5f9', fontSize: '14px', outline: 'none', transition: 'border-color 0.15s', width: '100%', boxSizing: 'border-box' },
  btn: { marginTop: '8px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.15s', width: '100%' },
  switchBtn: { display: 'block', width: '100%', background: 'none', border: 'none', color: '#3b82f6', fontSize: '13px', cursor: 'pointer', marginTop: '16px', padding: '8px', textAlign: 'center', textDecoration: 'underline' },
  footer: { textAlign: 'center', fontSize: '11px', color: '#475569', marginTop: '8px' },
}
