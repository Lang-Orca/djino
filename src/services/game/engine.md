# Documentation du Moteur de Jeu (Djino Engine)

Ce document décrit les services situés dans `src/services/game`, qui constituent le cœur logique du jeu Djino. Ces services gèrent l'état, la physique, les obstacles et les collisions de manière découplée du rendu visuel.

---

## 1. GameStateManager
**Fichier** : `GameStateManager.ts`  
**Description** : Gère l'état global du jeu (Accueil, En cours, Pause, Game Over) et notifie les abonnés lors des changements d'état via le pattern Observer.

### Fonctions principales
- `getInstance()` : Récupère l'instance unique (Singleton).
- `onStateChange(listener)` : S'abonne aux changements d'état.
- `startGame()`, `pauseGame()`, `resumeGame()`, `triggerGameOver()` : Déclenche les transitions d'état.

### Exemple d'utilisation
```typescript
import { GameStateManager, GameState } from './services/game/GameStateManager';

const gsm = GameStateManager.getInstance();

// S'abonner aux changements d'état
const unsubscribe = gsm.onStateChange((newState, prevState) => {
    console.log(`Transition de ${prevState} vers ${newState}`);
    if (newState === GameState.GAME_OVER) {
        // Afficher l'écran de fin
    }
});

// Démarrer le jeu
gsm.startGame();
```

---

## 2. PhysicsEngine
**Fichier** : `PhysicsEngine.ts`  
**Description** : Gère la gravité et les sauts du dinosaure. Il synchronise automatiquement la position Y et l'état d'animation avec une instance de la classe `Dinosaure`.

### Fonctions principales
- `update()` : Applique la gravité et met à jour la position Y à chaque frame.
- `jump()` : Déclenche un saut ou un double saut.
- `markAsDead()` : Gèle la physique et active l'animation de mort.
- `getHitbox()` : Retourne les coordonnées du rectangle de collision.

### Exemple d'utilisation
```typescript
import { PhysicsEngine } from './services/game/PhysicsEngine';
import { Dinosaure } from './services/dino_actions';

const dino = new Dinosaure();
const physics = new PhysicsEngine(800, 600, dino);

// Dans la boucle de jeu (requestAnimationFrame)
function loop() {
    physics.update();
    // Dessiner le dino à dino.x, dino.y
}

// Sur appui d'une touche
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') physics.jump();
});
```

---

## 3. ObstacleManager
**Fichier** : `ObstacleManager.ts`  
**Description** : Gère le cycle de vie des obstacles (cactus et oiseaux). Il s'occupe de leur génération aléatoire, de leur déplacement vers la gauche et de leur suppression lorsqu'ils sortent de l'écran.

### Fonctions principales
- `update()` : Déplace les obstacles et gère le timing de génération du prochain.
- `getObstacles()` : Retourne la liste des obstacles actifs pour le rendu et les collisions.
- `reset()` : Vide la liste des obstacles pour une nouvelle partie.

### Exemple d'utilisation
```typescript
import { ObstacleManager } from './services/game/ObstacleManager';

const obstacles = new ObstacleManager(800, 600);

// Dans la boucle de jeu
function loop() {
    obstacles.update();
    
    // Rendu
    const activeObstacles = obstacles.getObstacles();
    activeObstacles.forEach(obs => {
        // ctx.drawImage(img, obs.x, obs.y, obs.width, obs.height);
    });
}
```

---

## 4. CollisionDetector
**Fichier** : `CollisionDetector.ts`  
**Description** : Utilise l'algorithme AABB (Axis-Aligned Bounding Box) pour détecter si le dinosaure touche un obstacle. Il utilise une marge de réduction (`HITBOX_MARGIN`) pour rendre le jeu plus juste.

### Fonctions principales
- `update()` : Vérifie les collisions entre le dino et tous les obstacles actifs.
- `reset()` : Réinitialise l'état de collision.

### Exemple d'utilisation
```typescript
import { CollisionDetector } from './services/game/CollisionDetector';

// Initialisé avec ses dépendances
const detector = new CollisionDetector(physics, obstacleManager, gsm);

// Dans la boucle de jeu, après les updates de physique et d'obstacles
function loop() {
    physics.update();
    obstacles.update();
    
    const collided = detector.update();
    if (collided) {
        console.log("Aïe !");
        // Le GameStateManager passera automatiquement en GAME_OVER
    }
}
```

---

## Exemple d'intégration globale

Voici comment combiner tous ces services pour créer la structure de base du jeu :

```typescript
import { Dinosaure } from '../dino_actions';
import { GameStateManager } from './GameStateManager';
import { PhysicsEngine } from './PhysicsEngine';
import { ObstacleManager } from './ObstacleManager';
import { CollisionDetector } from './CollisionDetector';

class DjinoEngine {
    private gsm = GameStateManager.getInstance();
    private dino = new Dinosaure();
    private physics: PhysicsEngine;
    private obstacles: ObstacleManager;
    private detector: CollisionDetector;

    constructor(width: number, height: number) {
        this.physics = new PhysicsEngine(width, height, this.dino);
        this.obstacles = new ObstacleManager(width, height);
        this.detector = new CollisionDetector(this.physics, this.obstacles, this.gsm);
    }

    public update() {
        if (!this.gsm.isPlaying()) return;

        this.physics.update();
        this.obstacles.update();
        this.detector.update();
    }

    public jump() {
        this.physics.jump();
    }
}
```

---

## Ce qu'il manque par rapport à un moteur complet

Bien que robuste, l'architecture actuelle présente quelques lacunes pour être un véritable "Engine" complet :

1. **GameEngine Orchestrator** : Le fichier `GameEngine.ts` est actuellement une copie du `CollisionDetector`. Il manque une classe centrale qui orchestre tous les services (comme l'exemple d'intégration ci-dessus).
2. **ScoreManager** : Le fichier est vide. Bien qu'un service `mecanic.ts` existe à l'extérieur, un gestionnaire intégré permettrait de lier le score à la distance parcourue ou aux obstacles évités.
3. **InputManager** : La gestion des touches (Espace, Flèches) est actuellement faite dans la page Vue (`game.ts`). Un service dédié permettrait de gérer le tactile et le clavier de manière uniforme.
4. **Renderer** : Le moteur est purement logique. Il manque une couche d'abstraction pour le dessin (Canvas2D ou WebGL) qui s'abonne aux positions fournies par le moteur.
5. **AssetLoader** : Un système centralisé pour précharger les images et les sons avant le début de la partie.
6. **Pool d'objets** : Pour optimiser les performances, recycler les objets obstacles au lieu d'en créer/supprimer constamment (Garbage Collection).
