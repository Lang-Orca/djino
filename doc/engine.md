# Documentation du Moteur de Jeu (Djino Engine)

Ce document détaille le fonctionnement technique du moteur de jeu développé pour Djino Adventure.

## 1. Architecture des Fichiers

### 📄 [dino_actions.ts](file:///home/sharker/Téléchargements/mobile/makup/base%20jump/djino/src/services/dino_actions.ts)
Gère l'entité principale du joueur.
- **Actions (Enum DinoAction)** : Définit les états possibles (`IDLE`, `RUN`, `JUMP`, `WALK`, `DEAD`).
- **Physique** : Gère la vélocité verticale et la gravité pour le saut.
- **Animation** : Système de cycle de frames basé sur le temps (ms) pour changer de sprite dynamiquement.
- **Preloading** : Charge toutes les variantes d'images au démarrage pour éviter les lags.

### 📄 [engine.ts](file:///home/sharker/Téléchargements/mobile/makup/base%20jump/djino/src/services/engine.ts)
Cœur logique coordonnant le monde du jeu.
- **Classe Enemy** :
    - Sélectionne un type aléatoire (abeille, slime, etc.).
    - Définit si l'ennemi vole ou rampe.
    - Gère son propre mouvement vers la gauche.
- **Classe GameEngine** :
    - **Spawn Logic** : Utilise un timer pour créer des ennemis à intervalles irréguliers.
    - **Update** : Met à jour la position de toutes les entités en fonction du `deltaTime`.
    - **Draw** : Centralise le rendu sur le canvas.

### 📄 [mecanic.ts](file:///home/sharker/Téléchargements/mobile/makup/base%20jump/djino/src/services/mecanic.ts)
Gère la progression et le score.
- **Accélération** : Augmente la vitesse globale du jeu tous les 200 points.
- **Score** : Calcule le score basé sur la survie temporelle.

---

## 2. Mécaniques de Jeu (Actions)

### 🏃‍♂️ Animation du Dinosaure
L'animation est pilotée par la méthode `update(deltaTime)`.
1. Le timer accumule le temps écoulé.
2. Si le timer dépasse `frameInterval`, on passe à l'image suivante (`Run (1).png` -> `Run (2).png`).
3. Les images sont récupérées depuis le cache `sprites` pré-chargé.

### 🦘 Logique de Saut
Le saut utilise une simulation physique simplifiée :
- **Impulsion** : `jump()` applique une vélocité négative (vers le haut).
- **Gravité** : À chaque update, on ajoute une force de gravité à la vélocité.
- **Collision Sol** : Si `y` dépasse le niveau du sol, on réinitialise la position et on arrête la vélocité.

### 🐝 Spawning des Ennemis
Le spawn est pseudo-aléatoire :
- Un timer vérifie si `spawnInterval` est atteint.
- L'intervalle de spawn se réduit à mesure que la vitesse globale augmente (plus on va vite, plus les ennemis sont proches).
- Le type d'ennemi est choisi au hasard via `Math.random()`.

---

## 3. Intégration dans le Canvas

Le fichier `game.ts` fait le lien entre le DOM et le moteur :
- **DeltaTime** : On calcule la différence de temps entre deux images pour que le jeu tourne à la même vitesse sur tous les écrans.
- **Input** : Écoute les clics souris et la touche `Espace` pour déclencher `engine.dino.jump()`.
- **Z-Index** : Le canvas de jeu est placé sous le `RainManager` pour que la pluie tombe par-dessus les ennemis.

## 4. Maintenance
Pour ajouter un nouvel ennemi :
1. Ajouter son image dans `src/assets/Double/`.
2. Ajouter son nom dans la liste `types` du constructeur de la classe `Enemy` dans `engine.ts`.
