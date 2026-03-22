import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import RecherchePage from './pages/RecherchePage'
import ProduitsPage from './pages/ProduitsPage'
import FournisseursPage from './pages/FournisseursPage'
import ResultatsPage from './pages/ResultatsPage'
import TutorielPage from './pages/TutorielPage'
import AidePage from './pages/AidePage'
import NavBar from './components/NavBar'
import './index.css'

function RequireAuth({ children }) {
  const token = localStorage.getItem('access_token')
  if (!token) return <Navigate to="/login" replace />
  return children
}

function Layout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f172a' }}>
      <NavBar />
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <Layout><Dashboard /></Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/recherche"
          element={
            <RequireAuth>
              <Layout><RecherchePage /></Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/produits"
          element={
            <RequireAuth>
              <Layout><ProduitsPage /></Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/fournisseurs"
          element={
            <RequireAuth>
              <Layout><FournisseursPage /></Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/resultats/:id"
          element={
            <RequireAuth>
              <Layout><ResultatsPage /></Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/tutoriel"
          element={
            <RequireAuth>
              <Layout><TutorielPage /></Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/aide"
          element={
            <RequireAuth>
              <Layout><AidePage /></Layout>
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
