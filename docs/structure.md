# Structure du Projet Djino

Ce document présente l'organisation technique du projet **Djino**, une version revisitée du jeu *Jolly Jumper*. Le projet suit une architecture modulaire en TypeScript pour faciliter la maintenance et l'évolution des fonctionnalités.

## Arborescence du Projet

```text
djino/
├── public/                 # Assets statiques accessibles via l'URL racine
│   ├── favicon.svg         # Icône du site
│   └── icons.svg           # Icônes SVG globales
├── src/                    # Code source de l'application
│   ├── assets/             # Ressources multimédias (images, sprites)
│   │   └── hero.png        # Sprite du personnage principal (Dino)
│   ├── pges/               # Vues et composants de pages (UI)
│   │   ├── home.ts         # Écran d'accueil
│   │   ├── game.ts         # Écran principal du jeu
│   │   ├── leadboard.ts    # Affichage des meilleurs scores
│   │   └── router.ts       # Logique de navigation entre les pages
│   ├── services/           # Logique métier et utilitaires
│   │   ├── dino_actions.ts # Contrôles et animations du personnage
│   │   ├── enemies.ts      # Gestion des obstacles et ennemis
│   │   ├── mecanic.ts      # Boucle de jeu et physique
│   │   ├── sound.ts        # Gestion des effets sonores
│   │   ├── storage.ts      # Persistance des données (LocalStorage)
│   │   └── weather_time.ts # Intégration API météo et cycle jour/nuit
│   ├── main.ts             # Point d'entrée TypeScript
│   └── style.css           # Styles CSS globaux (Design Premium)
├── index.html              # Fichier HTML principal
├── package.json            # Dépendances et scripts npm
├── tsconfig.json           # Configuration TypeScript
└── structure.md            # Présente documentation
```

## Détails des Dossiers Clés

### `src/pges/` (Pages)
Ce dossier contient la structure des différentes interfaces utilisateur. Chaque fichier est responsable de la génération et de la gestion de l'état d'un écran spécifique (Accueil, Jeu, Classement).

### `src/services/` (Services)
Contient le "cerveau" du jeu. C'est ici que sont isolées les fonctionnalités complexes :
- **Mecanic**: Gère le défilement, la détection de collision et le score.
- **Weather & Time**: Responsable de la synchronisation du jeu avec le monde réel (météo dynamique et éclairage).
- **Storage**: Gère l'enregistrement et la récupération des scores.

### `src/assets/`
Stocke les ressources graphiques locales utilisées par l'application pour garantir des performances optimales.
