import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import ScansPage from './pages/ScansPage'
import ScanDetailPage from './pages/ScanDetailPage'
import MesuresPage from './pages/MesuresPage'
import JumeauxPage from './pages/JumeauxPage'
import TutorielPage from './pages/TutorielPage'
import NavBar from './components/NavBar'

function PrivateLayout({ children }) {
  const token = localStorage.getItem('access_token')
  if (!token) return <Navigate to="/login" replace />
  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100vh' }}>
      <NavBar />
      <main style={{ flex: 1, marginLeft: '240px', padding: '32px', background: '#0f172a', minHeight: '100vh' }}>
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
        <Route path="/" element={<PrivateLayout><Dashboard /></PrivateLayout>} />
        <Route path="/scans" element={<PrivateLayout><ScansPage /></PrivateLayout>} />
        <Route path="/scans/:id" element={<PrivateLayout><ScanDetailPage /></PrivateLayout>} />
        <Route path="/mesures" element={<PrivateLayout><MesuresPage /></PrivateLayout>} />
        <Route path="/jumeaux" element={<PrivateLayout><JumeauxPage /></PrivateLayout>} />
        <Route path="/tutoriel" element={<PrivateLayout><TutorielPage /></PrivateLayout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
