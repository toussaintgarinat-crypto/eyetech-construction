# ConstructOptimize Android

Application mobile Android pour le comparateur de prix de matériaux BTP dans l'écosystème BTP SmartView+.

## Description

ConstructOptimize Android est une application native qui permet aux professionnels du BTP de comparer instantanément les prix des matériaux et services auprès de différents fournisseurs. L'application fait partie de l'écosystème BTP SmartView+ et s'intègre avec les autres modules (AR Perce-Mur, BuildingScan Solutions, TradeLayer Intelligence).

## Fonctionnalités principales

### 🔍 Recherche et Comparaison
- Recherche de produits par mots-clés, catégories ou codes articles
- Comparaison de prix en temps réel auprès de multiples fournisseurs
- Filtrage par prix, disponibilité, localisation, délais de livraison
- Tri par différents critères (prix, qualité, proximité)

### 📱 Interface Utilisateur
- Interface native Android avec Material Design 3
- Design moderne et intuitif optimisé pour Android
- Affichage des résultats sous forme de listes et graphiques
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
- **Langage** : Kotlin
- **Framework UI** : Jetpack Compose
- **Architecture** : MVVM avec Clean Architecture
- **Injection de dépendances** : Hilt
- **Networking** : Retrofit + OkHttp
- **Persistance** : Room Database
- **Géolocalisation** : Google Play Services Location
- **Images** : Coil
- **Navigation** : Navigation Compose

### Structure du projet
```
app/
├── src/main/java/com/constructoptimize/
│   ├── data/
│   │   ├── local/              # Base de données locale (Room)
│   │   ├── remote/             # API et services réseau
│   │   └── repository/         # Repositories (Clean Architecture)
│   ├── domain/
│   │   ├── model/              # Modèles métier
│   │   ├── repository/         # Interfaces repositories
│   │   └── usecase/            # Cas d'usage métier
│   ├── presentation/
│   │   ├── ui/
│   │   │   ├── auth/           # Écrans d'authentification
│   │   │   ├── search/         # Écrans de recherche
│   │   │   ├── comparison/     # Écrans de comparaison
│   │   │   ├── products/       # Catalogue produits
│   │   │   ├── suppliers/      # Annuaire fournisseurs
│   │   │   └── profile/        # Profil utilisateur
│   │   ├── viewmodel/          # ViewModels
│   │   └── navigation/         # Navigation Compose
│   ├── di/                     # Injection de dépendances (Hilt)
│   └── util/                   # Utilitaires et extensions
└── build.gradle.kts
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
- Android Studio Hedgehog (2023.1.1) ou plus récent
- Android SDK 34
- Kotlin 1.9.0+
- Gradle 8.0+

### Installation
1. Cloner le repository
2. Ouvrir le projet dans Android Studio
3. Synchroniser les dépendances Gradle
4. Configurer les clés API dans `local.properties`
5. Compiler et lancer sur émulateur ou appareil

### Configuration API
Ajouter dans `local.properties` :
```properties
API_BASE_URL="http://10.0.2.2:8000/api/"
GOOGLE_MAPS_API_KEY="your_google_maps_api_key"
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
./gradlew testDebugUnitTest
```

### Tests d'instrumentation
```bash
./gradlew connectedDebugAndroidTest
```

### Tests d'interface
- Tests Compose avec ComposeTestRule
- Tests d'accessibilité
- Tests de performance

## Déploiement

### Google Play Store
1. Générer un APK signé
2. Uploader sur Google Play Console
3. Configurer les métadonnées
4. Publier en production

### Distribution interne
1. Générer un APK de debug
2. Distribuer via Firebase App Distribution
3. Tester avec les équipes internes

## Contribution

### Standards de code
- Suivre les conventions Kotlin officielles
- Utiliser ktlint pour la cohérence du code
- Documenter les fonctions publiques avec KDoc

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
**Compatibilité** : Android 7.0+ (API 24+)
