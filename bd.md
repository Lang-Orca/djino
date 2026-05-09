# Documentation de la Base de Données (LocalStorage)

Ce document détaille la structure des données persistantes utilisées par le projet **Djino**. Étant une application web front-end, nous utilisons le `LocalStorage` du navigateur pour assurer la persistance des scores, des préférences utilisateur et de la progression.

## 1. Clés de Stockage

Toutes les données sont stockées sous forme de chaînes JSON associées aux clés suivantes :

| Clé | Description | Type de Donnée |
| :--- | :--- | :--- |
| `djino_leaderboard` | Liste des meilleurs scores mondiaux/locaux. | `Array<LeaderboardEntry>` |
| `djino_settings` | Préférences de l'utilisateur (son, thème, etc.). | `UserSettings` |
| `djino_profile` | Informations sur le joueur actuel. | `PlayerProfile` |

## 2. Schémas des Données (Interfaces)

### LeaderboardEntry
Représente une entrée dans le tableau des scores.
```typescript
interface LeaderboardEntry {
    playerName: string; // Nom du joueur
    score: number;      // Score atteint
    date: string;       // Date de la partie (ISO string)
    weather: string;    // Condition météo lors de la partie (ex: "Sunny")
}
```

### UserSettings
Gère les préférences globales de l'application.
```typescript
interface UserSettings {
    isSoundEnabled: boolean;  // Effets sonores activés/désactivés
    isMusicEnabled: boolean;  // Musique de fond activée/désactivée
    theme: 'light' | 'dark' | 'auto'; // Thème visuel
    language: 'fr' | 'en';    // Langue de l'interface
}
```

### PlayerProfile
Données persistantes spécifiques au joueur.
```typescript
interface PlayerProfile {
    lastUsedName: string; // Dernier nom saisi pour le leaderboard
    bestScore: number;    // Record personnel
}
```

## 3. Flux d'Échanges et Interactivité

### Enregistrement des données (Write)
L'enregistrement s'effectue principalement dans les cas suivants :
- **Fin de partie (Game Over)** : Le service `Mecanic` envoie le score final au service `Storage`. Celui-ci met à jour le `djino_leaderboard` (si le score est dans le top 10) et incrémente les statistiques dans `djino_profile`.
- **Modification des Paramètres** : À chaque changement dans le menu options, l'objet `UserSettings` est mis à jour et sauvegardé immédiatement.

### Lecture des données (Read)
- **Initialisation (App Load)** : Le `main.ts` charge les `UserSettings` pour appliquer le bon thème et configurer le service `Sound`.
- **Affichage du Leaderboard** : La page `leadboard.ts` récupère la clé `djino_leaderboard`, trie les scores et les affiche dynamiquement.
- **Pré-remplissage** : Lors de la saisie du nom après une partie, le système récupère `lastUsedName` dans `djino_profile` pour faciliter la saisie.

## 4. Mécanisme Technique

Les données sont converties via `JSON.stringify()` avant d'être envoyées au `localStorage`. À la lecture, elles sont parsées via `JSON.parse()`.

**Exemple de sauvegarde :**
```javascript
const saveScore = (entry) => {
    const scores = JSON.parse(localStorage.getItem('djino_leaderboard')) || [];
    scores.push(entry);
    scores.sort((a, b) => b.score - a.score);
    localStorage.setItem('djino_leaderboard', JSON.stringify(scores.slice(0, 10)));
};
```
