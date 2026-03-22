# Tradelayer Intelligence Android App

Cette application Android fait partie de l'écosystème BTP SmartView+ et fournit des fonctionnalités de réalité augmentée pour la gestion des calques métiers, les commandes vocales et l'analyse spatiale dans le secteur de la construction.

## Technologies Utilisées

L'application Android utilise les technologies suivantes pour offrir une expérience immersive et professionnelle :

- **Kotlin** : Langage de programmation principal pour le développement Android moderne
- **Android SDK** : Framework de développement natif Android
- **ARCore** : Plateforme de réalité augmentée de Google pour Android
- **Sceneform** : Bibliothèque pour le rendu 3D et AR sur Android
- **Retrofit** : Client HTTP pour les appels API REST vers le backend Django
- **Room** : Base de données locale pour la persistance des données
- **Jetpack Compose** : Toolkit moderne pour l'interface utilisateur Android

## Architecture du Projet

Le projet suit une architecture MVVM (Model-View-ViewModel) avec les composants suivants :

### Structure des Répertoires

- `app/src/main/java/com/tradelayer/intelligence/` : Code source principal
  - `ui/` : Composants d'interface utilisateur (Activities, Fragments, Composables)
  - `data/` : Couche de données (API, base de données locale, repositories)
  - `domain/` : Logique métier et modèles de données
  - `ar/` : Composants spécifiques à la réalité augmentée
  - `auth/` : Gestion de l'authentification utilisateur
  - `voice/` : Traitement des commandes vocales
  - `spatial/` : Analyse spatiale et géolocalisation

### Modules Principaux

**Module Calques Métiers** : Gestion et visualisation des calques professionnels en réalité augmentée, permettant aux utilisateurs de visualiser et d'interagir avec les éléments de construction spécifiques à chaque corps de métier.

**Module Commandes Vocales** : Interface vocale pour l'interaction mains-libres avec l'application, utilisant la reconnaissance vocale Android et l'envoi des commandes au backend pour traitement.

**Module Analyse Spatiale** : Outils d'analyse et de mesure dans l'espace 3D, incluant la détection de zones d'intérêt, les points de mesure et l'analyse géométrique des éléments.

## Fonctionnalités Clés

L'application offre une suite complète de fonctionnalités pour les professionnels du BTP. La visualisation en réalité augmentée permet d'afficher les calques métiers directement dans l'environnement réel, avec une précision millimétrique grâce à ARCore. L'interface de commandes vocales facilite l'utilisation sur le terrain, permettant aux utilisateurs de naviguer et de contrôler l'application sans utiliser leurs mains. L'analyse spatiale fournit des outils de mesure et d'annotation avancés pour l'évaluation des projets de construction.

## Intégration Backend

L'application communique avec le backend Django via des API REST sécurisées, utilisant l'authentification JWT pour la sécurité. Toutes les données des calques, commandes vocales et analyses spatiales sont synchronisées en temps réel avec le serveur.

## Prérequis de Développement

Pour développer et compiler cette application, vous aurez besoin d'Android Studio Arctic Fox ou plus récent, du SDK Android API niveau 24 ou supérieur (Android 7.0), et d'un appareil Android compatible ARCore pour les tests de réalité augmentée.
