# Sprint 1 : Fondations & Immersion Dynamique

## Objectifs du Sprint
L'objectif de ce premier sprint était de mettre en place l'architecture de base du projet **Djino Adventure**, de créer une interface utilisateur premium et d'intégrer des systèmes dynamiques liés au climat réel.

## Réalisations Techniques

### 1. Architecture & Core
- **Modularité** : Mise en place d'une structure basée sur des composants et des services (`src/pges`, `src/services`).
- **Routage** : Implémentation d'un routeur simple pour la navigation entre les pages.
- **Persistance** : Création du `StorageService` pour la gestion des données locales (`LocalStorage`).

### 2. Système Météo & Temps
- **WeatherService** : Intégration de l'API *Open-Meteo* pour récupérer la température et le code météo (WMO) en temps réel via géolocalisation.
- **Thématisation Automatique** : Système de switch entre **Light Mode** (Jour : 06h-18h) et **Dark Mode** (Nuit : 18h-06h) géré via l'attribut `data-theme` et des variables CSS centralisées.

### 3. Interface Utilisateur (UI/UX)
- **Thème "Cyberpunk Forest"** : Palette de couleurs basée sur des violets vibrants et des verts forêt profonds.
- **Home Page Premium** : 
    - Design immersif avec logo "Dinosaur" personnalisé.
    - Animations fluides (flottement du personnage, effets de lueur).
    - Footer dynamique affichant les statistiques et la météo locale.
- **Refonte des Composants** : Boutons "Glow", navigation transparente et typographie moderne (Inter).

### 4. Effets Immersifs (Météo Dynamique)
- **Moteur de Pluie (Canvas)** : Création d'un système de pluie global utilisant HTML5 Canvas.
- **Intensité Variable** : Les gouttes (vitesse, densité) et l'assombrissement du ciel s'adaptent automatiquement au code WMO reçu de l'API.
- **Superposition** : La pluie est affichée au premier plan (`z-index: 100`) avec support du `pointer-events: none` pour ne pas bloquer les interactions.

## Documentation Créée
- `doc/structure.md` : Détail de l'arborescence et des responsabilités.
- `doc/bd.md` : Schéma de données du LocalStorage.
- `doc/sprint 1.md` : Journal de bord du premier sprint.

## État Actuel
Le projet dispose d'une base front-end solide et immersive. L'environnement est prêt pour l'intégration de la logique de jeu (Game Loop, Obstacles, Scores).
