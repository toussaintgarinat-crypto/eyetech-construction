# Building Scan VR

Application de visualisation immersive en réalité virtuelle pour l'écosystème BTP SmartView+.

## Description

Building Scan VR est une extension immersive de l'application Building Scan qui permet aux professionnels du BTP de visualiser et d'interagir avec les modèles 3D générés par les scans de bâtiments dans un environnement de réalité virtuelle. L'application offre une expérience immersive à l'échelle 1:1, des visites virtuelles guidées, des outils d'analyse et d'annotation, ainsi que des fonctionnalités de collaboration multi-utilisateurs.

## Fonctionnalités principales

### 🥽 Visualisation Immersive
- Chargement et affichage des modèles 3D générés par Building Scan
- Visualisation à l'échelle 1:1 pour une perception réaliste des volumes et espaces
- Support des formats GLB, USDZ et OBJ avec textures haute résolution
- Optimisation du rendu pour une expérience VR fluide (90+ FPS)

### 🚶 Visites Virtuelles
- **Mode Guidé** : Parcours prédéfinis avec points d'intérêt et narration
- **Mode Libre** : Navigation libre dans l'environnement scanné
- Téléportation et déplacement continu selon les préférences utilisateur
- Système de waypoints pour marquer les zones importantes

### 🔧 Outils d'Analyse et d'Annotation
- Outils de mesure virtuels (distance, surface, volume)
- Annotations textuelles et vocales persistantes
- Marqueurs 3D pour identifier les éléments importants
- Simulation d'aménagement avec placement d'objets virtuels

### 👥 Collaboration Multi-utilisateurs
- Sessions VR partagées en temps réel
- Avatars représentant les utilisateurs connectés
- Chat vocal intégré pour la communication
- Synchronisation des interactions et annotations

### 📱 Compatibilité Multi-plateforme
- **iOS** : Support des casques VR compatibles via ARKit/RealityKit
- **Android** : Support des casques VR via ARCore/OpenXR
- Intégration avec les casques Meta Quest, Pico, HTC Vive, etc.

## Architecture Technique

### Technologies Utilisées
- **Moteur** : Unity 3D (LTS 2023.3+)
- **VR/AR SDK** : 
  - iOS : ARKit, RealityKit, OpenXR
  - Android : ARCore, OpenXR
- **Networking** : Photon Unity Networking (PUN) pour la collaboration
- **Backend** : Réutilisation du backend Django de Building Scan
- **Formats 3D** : GLB, USDZ, OBJ avec support des textures

### Structure du Projet
```
BuildingScanVR/
├── Assets/
│   ├── Scripts/
│   │   ├── Core/              # Logique principale de l'application
│   │   ├── VR/                # Composants VR spécifiques
│   │   ├── Networking/        # Gestion réseau et API
│   │   ├── UI/                # Interface utilisateur VR
│   │   └── Utils/             # Utilitaires et helpers
│   ├── Scenes/
│   │   ├── MainMenu.unity     # Menu principal
│   │   ├── VREnvironment.unity # Environnement VR principal
│   │   └── Calibration.unity  # Calibration VR
│   ├── Prefabs/               # Prefabs Unity réutilisables
│   ├── Materials/             # Matériaux et shaders
│   ├── Models/                # Modèles 3D de base
│   └── Plugins/               # Plugins tiers
├── ProjectSettings/           # Configuration Unity
└── Packages/                  # Packages Unity
```

## Intégration avec l'Écosystème BTP SmartView+

### Building Scan
- Utilisation du même backend Django pour la gestion des projets
- Chargement direct des modèles 3D générés par Building Scan
- Synchronisation des métadonnées de scan (qualité, couverture, etc.)

### AR Perce-Mur
- Partage des données de localisation précises
- Intégration des informations de structure détectées

### TradeLayer Intelligence
- Support des commandes vocales pour la navigation VR
- Intégration des données d'analyse spatiale

### ConstructOptimize
- Visualisation des matériaux et équipements dans l'environnement VR
- Simulation de placement pour l'optimisation des achats

## Installation et Configuration

### Prérequis
- Unity 3D 2023.3 LTS ou plus récent
- Casque VR compatible (Meta Quest 2/3, Pico 4, HTC Vive, etc.)
- Smartphone iOS 15+ ou Android 8+ pour le développement mobile VR

### Configuration du Projet
1. Cloner le repository
2. Ouvrir le projet dans Unity
3. Installer les packages requis via Package Manager
4. Configurer les SDK VR selon la plateforme cible
5. Configurer l'URL du backend Building Scan

### Build et Déploiement
```bash
# Build pour Android (APK)
Unity -batchmode -quit -projectPath . -buildTarget Android -executeMethod BuildScript.BuildAndroid

# Build pour iOS (Xcode Project)
Unity -batchmode -quit -projectPath . -buildTarget iOS -executeMethod BuildScript.BuildiOS
```

## Utilisation

### Démarrage d'une Session VR
1. Lancer l'application Building Scan VR
2. Se connecter avec les identifiants Building Scan
3. Sélectionner un projet et un modèle 3D
4. Calibrer l'espace VR selon les instructions
5. Commencer l'exploration immersive

### Navigation VR
- **Téléportation** : Pointer avec le contrôleur et appuyer sur le trigger
- **Rotation** : Utiliser le joystick droit pour tourner
- **Interaction** : Pointer et presser le bouton grip pour sélectionner
- **Menu** : Appuyer sur le bouton menu pour accéder aux outils

### Outils d'Annotation
- **Mesure** : Sélectionner l'outil mesure et pointer deux points
- **Annotation** : Placer un marqueur et enregistrer une note vocale
- **Capture** : Prendre des captures d'écran VR pour documentation

### Collaboration
- **Créer une Session** : Inviter d'autres utilisateurs via leur email
- **Rejoindre une Session** : Entrer le code de session partagé
- **Communication** : Utiliser le chat vocal ou les gestes d'avatar

## API et Intégration

### Endpoints Backend
L'application utilise les endpoints existants de Building Scan :
- `GET /api/projects/` - Liste des projets
- `GET /api/scan-sessions/` - Sessions de scan
- `GET /api/models-3d/` - Modèles 3D disponibles
- `GET /api/models-3d/{id}/download/` - Téléchargement des modèles

### Nouveaux Endpoints VR
Endpoints spécifiques ajoutés pour Building Scan VR :
- `POST /api/vr-sessions/` - Créer une session VR collaborative
- `GET /api/vr-sessions/{id}/` - Rejoindre une session VR
- `POST /api/annotations/` - Sauvegarder les annotations VR
- `GET /api/annotations/` - Récupérer les annotations d'un modèle

## Performance et Optimisation

### Optimisations VR
- **LOD (Level of Detail)** : Réduction automatique de la complexité selon la distance
- **Occlusion Culling** : Masquage des objets non visibles
- **Texture Streaming** : Chargement progressif des textures haute résolution
- **Foveated Rendering** : Rendu optimisé selon le regard (si supporté)

### Métriques de Performance
- **Framerate** : Maintien de 90+ FPS pour éviter le motion sickness
- **Latence** : < 20ms entre mouvement de tête et affichage
- **Résolution** : Adaptation automatique selon les capacités du casque

## Tests et Qualité

### Tests VR
- Tests de performance sur différents casques VR
- Tests d'ergonomie et de confort utilisateur
- Tests de stabilité pour les sessions longues
- Tests de collaboration multi-utilisateurs

### Métriques Qualité
- Absence de motion sickness
- Précision du tracking de position
- Qualité visuelle des modèles 3D
- Fluidité des interactions

## Déploiement

### Stores d'Applications
- **Meta Store** : Distribution pour casques Meta Quest
- **SteamVR** : Distribution pour casques PC VR
- **Pico Store** : Distribution pour casques Pico
- **App Store** : Distribution iOS (si applicable)
- **Google Play** : Distribution Android

### Distribution Entreprise
- APK/IPA signés pour distribution interne
- Système de mise à jour automatique
- Gestion des licences entreprise

## Roadmap et Évolutions

### Version 1.0 (Q1 2026)
- Visualisation immersive de base
- Visites virtuelles guidées et libres
- Outils de mesure et d'annotation
- Collaboration multi-utilisateurs (jusqu'à 8 personnes)

### Version 1.1 (Q2 2026)
- Support des casques VR supplémentaires
- Amélioration des performances et optimisations
- Nouvelles fonctionnalités d'annotation (dessins 3D)
- Intégration avancée avec les autres modules BTP SmartView+

### Version 2.0 (Q4 2026)
- Streaming de modèles 3D très volumineux
- Simulation physique avancée
- Intégration IA pour l'analyse prédictive
- Support des formats BIM (IFC, Revit)

## Support et Documentation

### Documentation Technique
- [Guide de Développement Unity VR](docs/unity-vr-development.md)
- [API Reference](docs/api-reference.md)
- [Guide d'Optimisation Performance](docs/performance-optimization.md)

### Support Utilisateur
- [Guide d'Utilisation VR](docs/user-guide-vr.md)
- [FAQ Building Scan VR](docs/faq.md)
- [Résolution des Problèmes](docs/troubleshooting.md)

### Contact
- Équipe de développement : dev@buildingscanvr.com
- Support technique : support@buildingscanvr.com
- Documentation : docs@buildingscanvr.com

## Licence

Ce projet est sous licence propriétaire. Tous droits réservés.

---

**Version** : 1.0.0-alpha  
**Dernière mise à jour** : Septembre 2025  
**Compatibilité** : Unity 2023.3 LTS+, iOS 15+, Android 8+
