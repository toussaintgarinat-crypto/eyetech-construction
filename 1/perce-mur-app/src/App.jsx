import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Progress } from '@/components/ui/progress.jsx';
import {
  Target,
  Grid3X3,
  Wrench,
  Mic,
  Settings,
  FolderOpen,
  Plus,
  Camera,
  Crosshair,
  Ruler,
  Volume2,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Zap,
  Eye,
  Box,
  Printer,
  Download,
  RotateCcw,
  Gauge,
  LogOut,
  LogIn
} from 'lucide-react';
import './App.css';
import api, { login, registerUser, getProjects, createProject, setAuthToken, createDrillingPoint, createARMeasurement, uploadPhoto, uploadPrintPlan, getDrillingPoints, getARMeasurements } from './api';
import TutorielPage from './TutorielPage';
import AidePage from './AidePage';

function App() {
  const [showTutorial, setShowTutorial] = useState(false);
  const [showAide, setShowAide] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [isARActive, setIsARActive] = useState(false);
  const [precision, setPrecision] = useState(1.2);
  const [anchorStatus, setAnchorStatus] = useState('stable');
  const [deviceCapabilities, setDeviceCapabilities] = useState({
    hasLiDAR: false, // Simulation d'un appareil sans LiDAR
    hasDepthAPI: true,
    cameraResolution: 'high',
    processingPower: 'medium'
  });
  const [trackingMode, setTrackingMode] = useState('visual');
  const [voiceCommand, setVoiceCommand] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showPhotoMode, setShowPhotoMode] = useState(false);
  const [showLevelBubble, setShowLevelBubble] = useState(false);
  const [levelAngle, setLevelAngle] = useState(0);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [printFormat, setPrintFormat] = useState('A4');
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [objectToMount, setObjectToMount] = useState(null);
  const [mountingPoints, setMountingPoints] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [drillingPoints, setDrillingPoints] = useState([]);
  const [arMeasurements, setARMeasurements] = useState([]);
  const photoInputRef = useRef(null);
  const printPlanInputRef = useRef(null);

  const canvasRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('verified') === 'true') {
      setLoginSuccess('✓ Email vérifié ! Vous pouvez maintenant vous connecter.');
      window.history.replaceState({}, '', '/');
    } else if (params.get('verified') === 'false') {
      setLoginError("Lien de vérification invalide ou expiré. Réinscrivez-vous.");
      window.history.replaceState({}, '', '/');
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setAuthToken(token);
      setIsAuthenticated(true);
      fetchProjects();
    }
  }, []);

  useEffect(() => {
    if (activeProject) {
      fetchDrillingPoints(activeProject.id);
      fetchARMeasurements(activeProject.id);
    }
  }, [activeProject]);

  const fetchProjects = async () => {
    try {
      const response = await getProjects();
      setProjects(Array.isArray(response.data) ? response.data : (response.data.results || []));
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error);
      if (error.response && error.response.status === 401) {
        setIsAuthenticated(false);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    }
  };

  const fetchDrillingPoints = async (projectId) => {
    try {
      const response = await getDrillingPoints(projectId);
      setDrillingPoints(Array.isArray(response.data) ? response.data : (response.data.results || []));
    } catch (error) {
      console.error('Erreur lors du chargement des points de perçage:', error);
    }
  };

  const fetchARMeasurements = async (projectId) => {
    try {
      const response = await getARMeasurements(projectId);
      setARMeasurements(Array.isArray(response.data) ? response.data : (response.data.results || []));
    } catch (error) {
      console.error('Erreur lors du chargement des mesures AR:', error);
    }
  };

  const handleLogin = async () => {
    try {
      setLoginError('');
      const response = await login(email, password);
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      setAuthToken(response.data.access);
      setIsAuthenticated(true);
      fetchProjects();
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setLoginError(error.response?.data?.detail || "Nom d'utilisateur ou mot de passe incorrect.");
    }
  };
  const handleRegister = async () => {
    setRegisterError('');
    setRegisterSuccess('');
    if (!email || !password || !confirmPassword) {
      setRegisterError('Tous les champs sont obligatoires.');
      return;
    }
    if (password !== confirmPassword) {
      setRegisterError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (password.length < 8) {
      setRegisterError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    try {
      await registerUser({ username: email, email, password });
      setRegisterSuccess(`Compte créé avec succès ! Vous pouvez maintenant vous connecter.`);
      setIsRegistering(false);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      if (error.response && error.response.data) {
        const errorMessages = Object.values(error.response.data).flat().join(' ');
        setRegisterError(`Erreur : ${errorMessages}`);
      } else {
        setRegisterError("Erreur lors de l'inscription. Veuillez réessayer.");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setAuthToken(null);
    setIsAuthenticated(false);
    setActiveProject(null);
    setProjects([]);
    setDrillingPoints([]);
    setARMeasurements([]);
  };

  const handleCreateProject = async (projectName) => {
    try {
      const response = await createProject({ name: projectName });
      setProjects([...projects, response.data]);
      setActiveProject(response.data);
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error);
    }
  };

  const handleAddDrillingPoint = async () => {
    if (!activeProject) return;
    try {
      const newPoint = {
        project: activeProject.id,
        x_coordinate: Math.random() * 100,
        y_coordinate: Math.random() * 100,
        z_coordinate: Math.random() * 100,
        material: 'Béton',
        support_type: 'Support A',
      };
      const response = await createDrillingPoint(newPoint);
      setDrillingPoints([...drillingPoints, response.data]);
    } catch (error) {
      console.error("Erreur lors de l'ajout du point de perçage:", error);
    }
  };

  const handleAddARMeasurement = async () => {
    if (!activeProject) return;
    try {
      const newMeasurement = {
        project: activeProject.id,
        start_x: Math.random() * 100,
        start_y: Math.random() * 100,
        start_z: Math.random() * 100,
        end_x: Math.random() * 100,
        end_y: Math.random() * 100,
        end_z: Math.random() * 100,
        distance: Math.random() * 50,
      };
      const response = await createARMeasurement(newMeasurement);
      setARMeasurements([...arMeasurements, response.data]);
    } catch (error) {
      console.error("Erreur lors de l'ajout de la mesure AR:", error);
    }
  };

  const handleUploadPhoto = async (file) => {
    if (!activeProject) return;
    try {
      const photoData = {
        project: activeProject.id,
        image: file,
        metadata: JSON.stringify({ device: 'iPhone', location: 'Chantier X' }),
        captured_at: new Date().toISOString(),
      };
      await uploadPhoto(photoData);
      alert('Photo téléchargée avec succès!');
    } catch (error) {
      console.error('Erreur lors du téléchargement de la photo:', error);
    }
  };

  const handleUploadPrintPlan = async (file) => {
    if (!activeProject) return;
    try {
      const printPlanData = {
        project: activeProject.id,
        file: file,
        file_type: 'PDF',
        generated_at: new Date().toISOString(),
      };
      await uploadPrintPlan(printPlanData);
      alert("Plan d'impression téléchargé avec succès!");
    } catch (error) {
      console.error("Erreur lors du téléchargement du plan d'impression:", error);
    }
  };

  // Simulation de la précision AR selon les capacités de l'appareil
  useEffect(() => {
    const interval = setInterval(() => {
      if (deviceCapabilities.hasLiDAR) {
        setPrecision(prev => Math.max(0.8, Math.min(2.0, prev + (Math.random() - 0.5) * 0.2)));
      } else if (deviceCapabilities.hasDepthAPI) {
        setPrecision(prev => Math.max(3.0, Math.min(8.0, prev + (Math.random() - 0.5) * 0.5)));
      } else {
        setPrecision(prev => Math.max(8.0, Math.min(15.0, prev + (Math.random() - 0.5) * 1.0)));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [deviceCapabilities]);

  // Simulation du niveau à bulle
  useEffect(() => {
    if (showLevelBubble) {
      const interval = setInterval(() => {
        setLevelAngle(prev => {
          const newAngle = prev + (Math.random() - 0.5) * 2;
          return Math.max(-10, Math.min(10, newAngle));
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [showLevelBubble]);

  const getPrecisionColor = () => {
    if (precision <= 2) return 'text-green-500';
    if (precision <= 5) return 'text-yellow-500';
    if (precision <= 10) return 'text-orange-500';
    return 'text-red-500';
  };

  const getPrecisionBadgeColor = () => {
    if (precision <= 2) return 'bg-green-500';
    if (precision <= 5) return 'bg-yellow-500';
    if (precision <= 10) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getDeviceTypeLabel = () => {
    if (deviceCapabilities.hasLiDAR) return 'iPhone Pro (LiDAR)';
    if (deviceCapabilities.hasDepthAPI) return 'Android/iPhone (Visuel+)';
    return 'Appareil Standard';
  };

  const handleVoiceCommand = () => {
    setIsListening(true);
    setTimeout(() => {
      const commands = [
        'Commencer le marquage',
        'Diviser en 3 colonnes',
        'Centrer le support',
        'Mesurer la distance',
        'Prendre une photo'
      ];
      setVoiceCommand(commands[Math.floor(Math.random() * commands.length)]);
      setIsListening(false);
    }, 2000);
  };

  const capturePhotoWithLevel = () => {
    setShowPhotoMode(true);
    setShowLevelBubble(true);

    // Simulation de la capture après 3 secondes
    setTimeout(() => {
      const photoData = {
        timestamp: new Date().toISOString(),
        levelAngle: levelAngle,
        precision: precision,
        deviceType: getDeviceTypeLabel(),
        mountingPoints: mountingPoints,
        objectType: objectToMount || 'Support générique'
      };
      setCapturedPhoto(photoData);
      setShowPhotoMode(false);
      setShowLevelBubble(false);
      // TODO: Envoyer la photo au backend via handleUploadPhoto
    }, 3000);
  };

  const generatePrintLayout = () => {
    setShowPrintPreview(true);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');

      const dimensions = printFormat === 'A4' ? { width: 595, height: 842 } : { width: 842, height: 1191 };
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;

      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = 'black';
      ctx.font = 'bold 24px Arial';
      ctx.fillText('PERCE-MUR - Plan de Montage', 50, 50);

      ctx.font = '16px Arial';
      ctx.fillText(`Format: ${printFormat}`, 50, 100);
      ctx.fillText(`Précision: ±${precision.toFixed(1)}mm`, 50, 130);
      ctx.fillText(`Appareil: ${getDeviceTypeLabel()}`, 50, 160);
      ctx.fillText(`Date: ${new Date().toLocaleDateString()}`, 50, 190);

      if (capturedPhoto) {
        ctx.fillText(`Angle niveau: ${capturedPhoto.levelAngle.toFixed(1)}°`, 50, 220);
        ctx.fillText(`Objet: ${capturedPhoto.objectType}`, 50, 250);
      }

      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.strokeRect(100, 300, 400, 300);

      const points = [
        { x: 150, y: 350 },
        { x: 450, y: 350 },
        { x: 150, y: 550 },
        { x: 450, y: 550 }
      ];

      points.forEach((point, index) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.font = '12px Arial';
        ctx.fillText(`P${index + 1}`, point.x + 15, point.y + 5);
        ctx.fillStyle = 'red';
      });

      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);

      ctx.beginPath();
      ctx.moveTo(150, 280);
      ctx.lineTo(450, 280);
      ctx.stroke();
      ctx.fillStyle = 'blue';
      ctx.font = '12px Arial';
      ctx.fillText('300mm', 280, 275);

      ctx.beginPath();
      ctx.moveTo(80, 350);
      ctx.lineTo(80, 550);
      ctx.stroke();
      ctx.fillText('200mm', 85, 450);

      ctx.setLineDash([]);
    }
  };

  const downloadPrint = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `perce-mur-plan-${printFormat}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL();
      link.click();
      // TODO: Envoyer le plan d'impression au backend via handleUploadPrintPlan
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={loginStyles.root}>
        <div style={loginStyles.card}>
          <div style={loginStyles.brandBlock}>
            <div style={loginStyles.logoCircle}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#f97316" />
                <circle cx="16" cy="16" r="7" stroke="white" strokeWidth="2" fill="none" />
                <line x1="16" y1="4" x2="16" y2="9" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <line x1="16" y1="23" x2="16" y2="28" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <line x1="4" y1="16" x2="9" y2="16" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <line x1="23" y1="16" x2="28" y2="16" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <circle cx="16" cy="16" r="2.5" fill="white" />
              </svg>
            </div>
            <div>
              <h1 style={loginStyles.brandName}>Perce-Mur AR</h1>
              <p style={loginStyles.brandSub}>Eyetech Construction — Perçage guidé par AR</p>
            </div>
          </div>

          <div style={loginStyles.formBlock}>
            <h2 style={loginStyles.title}>{isRegistering ? 'Créer un compte' : 'Connexion'}</h2>
            <p style={loginStyles.subtitle}>
              {isRegistering ? 'Rejoignez la plateforme Perce-Mur' : 'Accédez à votre espace opérateur AR'}
            </p>

            {loginSuccess && !isRegistering && (
              <div style={loginStyles.successBox}>{loginSuccess}</div>
            )}
            {(loginError || registerError) && (
              <div style={loginStyles.errorBox}>
                <span style={{ marginRight: 8 }}>⚠</span>
                {loginError || registerError}
              </div>
            )}
            {registerSuccess && <div style={loginStyles.successBox}>✓ {registerSuccess}</div>}

            {!registerSuccess && (
              <form
                onSubmit={e => { e.preventDefault(); isRegistering ? handleRegister() : handleLogin(); }}
                style={loginStyles.form}
              >
                <div style={loginStyles.fieldGroup}>
                  <label style={loginStyles.label}>Adresse email</label>
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="vous@exemple.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={loginStyles.input}
                    required
                  />
                </div>
                <div style={loginStyles.fieldGroup}>
                  <label style={loginStyles.label}>Mot de passe</label>
                  <input
                    type="password"
                    autoComplete={isRegistering ? 'new-password' : 'current-password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={loginStyles.input}
                    required
                  />
                </div>
                {isRegistering && (
                  <div style={loginStyles.fieldGroup}>
                    <label style={loginStyles.label}>Confirmer le mot de passe</label>
                    <input
                      type="password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      style={loginStyles.input}
                      required
                    />
                  </div>
                )}
                <button type="submit" style={loginStyles.btn}>
                  {isRegistering ? "S'inscrire" : 'Se connecter'}
                </button>
              </form>
            )}

            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setLoginError('');
                setLoginSuccess('');
                setRegisterError('');
                setRegisterSuccess('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
              }}
              style={loginStyles.switchBtn}
            >
              {isRegistering ? 'Déjà un compte ? Connectez-vous' : 'Pas de compte ? Inscrivez-vous'}
            </button>
          </div>

          <p style={loginStyles.footer}>Eyetech Construction © 2026 — Système interne BTP</p>
        </div>

        <div style={loginStyles.bgDot1} />
        <div style={loginStyles.bgDot2} />
      </div>
    );
  }

  if (!activeProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Target className="w-12 h-12 text-blue-400" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                PERCE-MUR
              </h1>
            </div>
            <p className="text-xl text-slate-300 mb-2">Solution de Réalité Augmentée pour le BTP</p>
            <p className="text-sm text-slate-400">Précision millimétrique • Guidage interactif • Compatible multi-appareils</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all cursor-pointer"
                  onClick={() => handleCreateProject("Projet Test Frontend")}>            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Plus className="w-5 h-5 text-green-400" />
                  Nouveau Projet
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Créer un nouveau projet de perçage
                </CardDescription>
              </CardHeader>
            </Card>

            {projects.map(project => (
              <Card key={project.id} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all cursor-pointer"
                    onClick={() => setActiveProject(project)}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <FolderOpen className="w-5 h-5 text-blue-400" />
                    {project.name}
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    {project.description || 'Aucune description'}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Settings className="w-5 h-5 text-purple-400" />
                  Configuration
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Paramètres et calibration
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <Card className="bg-slate-800/50 border-slate-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Compatibilité Appareil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                  <Zap className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <h3 className="font-semibold text-green-400">iPhone Pro (LiDAR)</h3>
                  <p className="text-sm text-slate-300">Précision ±1-2mm</p>
                </div>
                <div className="text-center p-4 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                  <Eye className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <h3 className="font-semibold text-yellow-400">Android/iPhone (Visuel+)</h3>
                  <p className="text-sm text-slate-300">Précision ±5-8mm</p>
                </div>
                <div className="text-center p-4 bg-red-500/20 rounded-lg border border-red-500/30">
                  <Box className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <h3 className="font-semibold text-red-400">Appareil Standard</h3>
                  <p className="text-sm text-slate-300">Précision ±10-15mm</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center gap-3">
            <Button onClick={() => setShowTutorial(true)} variant="ghost" className="text-blue-400 hover:text-white">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: 8 }}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
              Tutoriel
            </Button>
            <Button onClick={() => setShowAide(true)} variant="ghost" className="text-slate-400 hover:text-white text-sm">
              Aide
            </Button>
            <Button onClick={handleLogout} variant="ghost" className="text-slate-400 hover:text-white">
              <LogOut className="w-4 h-4 mr-2" /> Déconnexion
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {showTutorial && <TutorielPage onClose={() => setShowTutorial(false)} />}
      {showAide && <AidePage onClose={() => setShowAide(false)} />}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              PERCE-MUR
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge className={`${getPrecisionBadgeColor()} text-white`}>Précision: ±{precision.toFixed(1)}mm</Badge>
            <Button onClick={() => setShowTutorial(true)} variant="ghost" className="text-blue-400 hover:text-white text-sm">
              Tutoriel
            </Button>
            <Button onClick={handleLogout} variant="ghost" className="text-slate-400 hover:text-white">
              <LogOut className="w-4 h-4 mr-2" /> Déconnexion
            </Button>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-slate-200 mb-6">Projet Actif: {activeProject.name}</h2>

        <Tabs defaultValue="ar-mode" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border-slate-700">
            <TabsTrigger value="ar-mode">Mode AR</TabsTrigger>
            <TabsTrigger value="drilling-points">Points de Perçage</TabsTrigger>
            <TabsTrigger value="ar-measurements">Mesures AR</TabsTrigger>
            <TabsTrigger value="photos-plans">Photos & Plans</TabsTrigger>
          </TabsList>

          <TabsContent value="ar-mode" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <CardHeader>
                <CardTitle className="text-white">Contrôles AR</CardTitle>
                <CardDescription className="text-slate-400">Interagissez avec l'environnement de réalité augmentée.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Statut de l'ancrage:</span>
                  <Badge className={anchorStatus === 'stable' ? 'bg-green-500' : 'bg-red-500'}>
                    {anchorStatus === 'stable' ? 'Stable' : 'Instable'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Mode de suivi:</span>
                  <Badge className="bg-blue-500">{trackingMode}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Précision actuelle:</span>
                  <span className={`${getPrecisionColor()} font-bold`}>±{precision.toFixed(1)}mm</span>
                </div>
                <Button className="w-full" onClick={() => setIsARActive(!isARActive)}>
                  {isARActive ? 'Désactiver le Mode AR' : 'Activer le Mode AR'}
                </Button>
                <Button className="w-full" variant="outline" onClick={handleVoiceCommand} disabled={isListening}>
                  {isListening ? 'Écoute...' : 'Commande Vocale'}
                </Button>
                {voiceCommand && <p className="text-center text-slate-300">Dernière commande: {voiceCommand}</p>}
                <Button className="w-full" onClick={handleAddDrillingPoint}>
                  <Crosshair className="w-4 h-4 mr-2" /> Ajouter Point de Perçage
                </Button>
                <Button className="w-full" onClick={handleAddARMeasurement}>
                  <Ruler className="w-4 h-4 mr-2" /> Ajouter Mesure AR
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="drilling-points" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <CardHeader>
                <CardTitle className="text-white">Points de Perçage</CardTitle>
                <CardDescription className="text-slate-400">Gérez les points de perçage pour ce projet.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" onClick={handleAddDrillingPoint}>
                  <Plus className="w-4 h-4 mr-2" /> Ajouter un nouveau point de perçage
                </Button>
                {drillingPoints.length === 0 ? (
                  <p className="text-slate-400 text-center">Aucun point de perçage pour ce projet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {drillingPoints.map(point => (
                      <Card key={point.id} className="bg-slate-700/50 border-slate-600 p-4">
                        <CardTitle className="text-white text-lg">Point #{point.id}</CardTitle>
                        <CardDescription className="text-slate-400">
                          X: {point.x_coordinate.toFixed(2)}, Y: {point.y_coordinate.toFixed(2)}, Z: {point.z_coordinate.toFixed(2)}
                        </CardDescription>
                        <p className="text-sm text-slate-300">Matériau: {point.material}</p>
                        <p className="text-sm text-slate-300">Support: {point.support_type}</p>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ar-measurements" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <CardHeader>
                <CardTitle className="text-white">Mesures AR</CardTitle>
                <CardDescription className="text-slate-400">Gérez les mesures de réalité augmentée pour ce projet.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" onClick={handleAddARMeasurement}>
                  <Plus className="w-4 h-4 mr-2" /> Ajouter une nouvelle mesure AR
                </Button>
                {arMeasurements.length === 0 ? (
                  <p className="text-slate-400 text-center">Aucune mesure AR pour ce projet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {arMeasurements.map(measurement => (
                      <Card key={measurement.id} className="bg-slate-700/50 border-slate-600 p-4">
                        <CardTitle className="text-white text-lg">Mesure #{measurement.id}</CardTitle>
                        <CardDescription className="text-slate-400">
                          Début: ({measurement.start_x.toFixed(2)}, {measurement.start_y.toFixed(2)}, {measurement.start_z.toFixed(2)})
                        </CardDescription>
                        <CardDescription className="text-slate-400">
                          Fin: ({measurement.end_x.toFixed(2)}, {measurement.end_y.toFixed(2)}, {measurement.end_z.toFixed(2)})
                        </CardDescription>
                        <p className="text-sm text-slate-300">Distance: {measurement.distance.toFixed(2)}m</p>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="photos-plans" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <CardHeader>
                <CardTitle className="text-white">Photos & Plans</CardTitle>
                <CardDescription className="text-slate-400">Gérez les photos et les plans d'impression.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="photo-upload" className="w-full inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer text-center">
                    <Camera className="w-4 h-4 mr-2 inline-block" />
                    Télécharger une photo
                  </label>
                  <input id="photo-upload" type="file" onChange={(e) => handleUploadPhoto(e.target.files[0])} accept="image/*" className="hidden" />
                </div>
                <div>
                  <label htmlFor="plan-upload" className="w-full inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer text-center">
                    <Printer className="w-4 h-4 mr-2 inline-block" />
                    Télécharger un plan
                  </label>
                  <input id="plan-upload" type="file" onChange={(e) => handleUploadPrintPlan(e.target.files[0])} accept=".pdf" className="hidden" />
                </div>
                <Button className="w-full" onClick={capturePhotoWithLevel}>
                  <Camera className="w-4 h-4 mr-2" /> Prendre une Photo
                </Button>
                <Button className="w-full" onClick={generatePrintLayout}>
                  <Printer className="w-4 h-4 mr-2" /> Générer Plan d'Impression
                </Button>
                {showPrintPreview && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-slate-200">Aperçu du Plan d'Impression</h3>
                    <canvas ref={canvasRef} className="border border-slate-600 rounded-lg w-full h-auto"></canvas>
                    <Button className="w-full" onClick={downloadPrint}>
                      <Download className="w-4 h-4 mr-2" /> Télécharger le Plan
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;

const loginStyles = {
  root: { minHeight: '100vh', width: '100%', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', fontFamily: "'Inter', system-ui, sans-serif" },
  bgDot1: { position: 'absolute', top: '-200px', right: '-200px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)', pointerEvents: 'none' },
  bgDot2: { position: 'absolute', bottom: '-150px', left: '-150px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 70%)', pointerEvents: 'none' },
  card: { width: '460px', background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '40px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', position: 'relative', zIndex: 1 },
  brandBlock: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #334155' },
  logoCircle: { flexShrink: 0 },
  brandName: { fontSize: '18px', fontWeight: '700', color: '#f1f5f9', margin: 0, lineHeight: '1.2' },
  brandSub: { fontSize: '12px', color: '#64748b', marginTop: '3px', margin: '3px 0 0 0' },
  formBlock: { marginBottom: '24px' },
  title: { fontSize: '22px', fontWeight: '600', color: '#f1f5f9', marginBottom: '6px', marginTop: 0 },
  subtitle: { fontSize: '13px', color: '#64748b', marginBottom: '24px', marginTop: 0 },
  errorBox: { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '12px 16px', color: '#fca5a5', fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'flex-start' },
  successBox: { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '8px', padding: '12px 16px', color: '#86efac', fontSize: '13px', marginBottom: '20px' },
  form: { display: 'flex', flexDirection: 'column', gap: '18px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '500', color: '#94a3b8' },
  input: { background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '10px 14px', color: '#f1f5f9', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' },
  btn: { marginTop: '8px', background: '#f97316', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', width: '100%' },
  switchBtn: { display: 'block', width: '100%', background: 'none', border: 'none', color: '#f97316', fontSize: '13px', cursor: 'pointer', marginTop: '16px', padding: '8px', textAlign: 'center', textDecoration: 'underline' },
  footer: { textAlign: 'center', fontSize: '11px', color: '#475569', marginTop: '8px', marginBottom: 0 },
};

