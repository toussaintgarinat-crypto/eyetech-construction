# ConstructOptimize iOS

Application mobile iOS pour le comparateur de prix de matériaux BTP dans l'écosystème BTP SmartView+.

## Description

ConstructOptimize est une application iOS native qui permet aux professionnels du BTP de comparer instantanément les prix des matériaux et services auprès de différents fournisseurs. L'application fait partie de l'écosystème BTP SmartView+ et s'intègre avec les autres modules (AR Perce-Mur, BuildingScan Solutions, TradeLayer Intelligence).

## Fonctionnalités principales

### 🔍 Recherche et Comparaison
- Recherche de produits par mots-clés, catégories ou codes articles
- Comparaison de prix en temps réel auprès de multiples fournisseurs
- Filtrage par prix, disponibilité, localisation, délais de livraison
- Tri par différents critères (prix, qualité, proximité)

### 📱 Interface Utilisateur
- Interface native iOS optimisée pour iPhone
- Design moderne et intuitif
- Affichage des résultats sous forme de tableaux et graphiques
- Fiches détaillées des produits et fournisseurs

### 🎯 Recommandations Intelligentes
- Recommandations d'achat basées sur l'IA
- Analyse du meilleur rapport qualité/prix
- Suggestions de produits alternatifs
- Optimisation des achats groupés

### 📍 Géolocalisation
- Recherche de fournisseurs à proximité
- Calcul des distances et frais de livraison
- Optimisation logistique

### 🔔 Alertes et Notifications
- Alertes de prix personnalisables
- Notifications de retour en stock
- Suivi des variations de prix

### 💾 Sauvegarde et Partage
- Sauvegarde des recherches favorites
- Partage de comparaisons avec l'équipe
- Historique des recherches

## Architecture Technique

### Technologies utilisées
- **Langage** : Swift 5.9+
- **Framework UI** : SwiftUI
- **Architecture** : MVVM (Model-View-ViewModel)
- **Networking** : URLSession avec Combine
- **Persistance** : Core Data
- **Géolocalisation** : Core Location
- **Notifications** : User Notifications Framework

### Structure du projet
```
ConstructOptimize/
├── App/
│   ├── ConstructOptimizeApp.swift
│   └── ContentView.swift
├── Models/
│   ├── Produit.swift
│   ├── Fournisseur.swift
│   ├── RechercheComparaison.swift
│   └── ResultatComparaison.swift
├── Views/
│   ├── Recherche/
│   ├── Comparaison/
│   ├── Produits/
│   └── Fournisseurs/
├── ViewModels/
│   ├── RechercheViewModel.swift
│   ├── ComparaisonViewModel.swift
│   └── ProduitsViewModel.swift
├── Services/
│   ├── APIClient.swift
│   ├── LocationService.swift
│   └── NotificationService.swift
└── Utils/
    ├── Extensions/
    └── Constants/
```

## Intégration avec l'écosystème BTP SmartView+

### CoreAR Technologies (AR Perce-Mur)
- Utilisation des données de localisation précises pour filtrer les fournisseurs par proximité
- Intégration des informations de chantier pour des recommandations contextuelles

### BuildingScan Solutions
- Récupération des quantités de matériaux nécessaires depuis les modèles 3D
- Estimation automatique des coûts basée sur les plans générés

### TradeLayer Intelligence
- Support des commandes vocales pour la recherche de produits
- Utilisation de l'analyse spatiale pour des recommandations pertinentes

## Configuration et Installation

### Prérequis
- Xcode 15.0+
- iOS 17.0+
- Compte développeur Apple

### Installation
1. Cloner le repository
2. Ouvrir `ConstructOptimize.xcodeproj` dans Xcode
3. Configurer les certificats de développement
4. Modifier les URLs d'API dans `APIClient.swift`
5. Compiler et lancer sur simulateur ou appareil

### Configuration API
Modifier les constantes dans `APIClient.swift` :
```swift
struct APIConstants {
    static let baseURL = "http://localhost:8000/api/"
    static let timeout: TimeInterval = 30.0
}
```

## Utilisation

### Recherche de produits
1. Ouvrir l'application
2. Saisir le nom du produit ou scanner un code-barres
3. Appliquer les filtres souhaités (prix, localisation, etc.)
4. Consulter les résultats de comparaison

### Comparaison de prix
1. Sélectionner les produits à comparer
2. Choisir les critères de comparaison
3. Analyser les recommandations
4. Contacter directement les fournisseurs

### Gestion des alertes
1. Créer une alerte de prix pour un produit
2. Définir le seuil de prix souhaité
3. Recevoir des notifications automatiques

## Tests

### Tests unitaires
```bash
# Lancer les tests unitaires
xcodebuild test -scheme ConstructOptimize -destination 'platform=iOS Simulator,name=iPhone 15'
```

### Tests d'interface
- Tests d'accessibilité
- Tests de performance
- Tests de régression

## Déploiement

### App Store
1. Archiver l'application dans Xcode
2. Valider avec App Store Connect
3. Soumettre pour révision Apple

### TestFlight (Beta)
1. Uploader la build vers App Store Connect
2. Configurer les groupes de testeurs
3. Distribuer aux testeurs internes/externes

## Contribution

### Standards de code
- Suivre les conventions Swift officielles
- Utiliser SwiftLint pour la cohérence du code
- Documenter les fonctions publiques

### Workflow Git
1. Créer une branche feature
2. Développer et tester
3. Créer une pull request
4. Code review et merge

## Support et Documentation

### Documentation API
- [API Backend ConstructOptimize](../constructoptimize_backend/README.md)
- [Documentation BTP SmartView+](../docs/api.md)

### Contact
- Équipe de développement : dev@constructoptimize.com
- Support technique : support@constructoptimize.com

## Licence

Ce projet est sous licence propriétaire. Tous droits réservés.

---

**Version** : 1.0.0  
**Dernière mise à jour** : Septembre 2025  
**Compatibilité** : iOS 17.0+
