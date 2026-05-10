/**
 * @file ObstacleManager.ts
 * @description Gestionnaire des obstacles dans DJINO.
 *
 * Ce module est responsable de :
 *   - Générer les obstacles (cactus, oiseaux...) aléatoirement
 *   - Les faire défiler de droite à gauche
 *   - Augmenter la difficulté progressivement (vitesse + fréquence)
 *   - Supprimer les obstacles sortis de l'écran
 *
 * ⚠️ Ce module ne dessine RIEN. Il gère uniquement les données
 * de position des obstacles. Le renderer s'occupe de les afficher.
 *
 * @author Joel
 * @version 1.0.0
 */

// ─────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────

/** Vitesse initiale de défilement des obstacles (pixels/frame) */
const INITIAL_SPEED = 5;

/** Vitesse maximale autorisée (plafond de difficulté) */
const MAX_SPEED = 18;

/** Augmentation de vitesse toutes les N frames */
const SPEED_INCREMENT = 0.0015;

/** Distance minimale entre deux obstacles (en pixels) */
const MIN_GAP = 300;

/** Distance maximale entre deux obstacles (en pixels) */
const MAX_GAP = 600;

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

/**
 * Types d'obstacles disponibles dans le jeu.
 */
export enum ObstacleType {
    CACTUS_SMALL  = 'CACTUS_SMALL',   // Petit cactus (facile à éviter)
    CACTUS_LARGE  = 'CACTUS_LARGE',   // Grand cactus (plus difficile)
    CACTUS_GROUP  = 'CACTUS_GROUP',   // Groupe de cactus (très difficile)
    BIRD          = 'BIRD',           // Oiseau volant (éviter en baissant)
}

/**
 * Représente un obstacle avec sa position et ses dimensions.
 * Utilisé par CollisionDetector pour les calculs de collision.
 */
export interface Obstacle {
    id: number;               // Identifiant unique de l'obstacle
    type: ObstacleType;       // Type d'obstacle
    x: number;                // Position horizontale (coin gauche)
    y: number;                // Position verticale (coin haut)
    width: number;            // Largeur en pixels
    height: number;           // Hauteur en pixels
}

// ─────────────────────────────────────────────────────────────
// CLASSE PRINCIPALE
// ─────────────────────────────────────────────────────────────

/**
 * @class ObstacleManager
 * @description Génère et gère le cycle de vie de tous les obstacles.
 *
 * @example
 * const obstacles = new ObstacleManager(800, 400);
 *
 * // Dans la boucle de jeu, à chaque frame :
 * obstacles.update();
 *
 * // Pour dessiner les obstacles :
 * const liste = obstacles.getObstacles();
 * liste.forEach(obs => ctx.fillRect(obs.x, obs.y, obs.width, obs.height));
 */
export class ObstacleManager {

    // ── Données des obstacles ────────────────────────────────

    /** Liste de tous les obstacles actuellement actifs */
    private obstacles: Obstacle[] = [];

    /** Compteur pour générer des IDs uniques */
    private nextId: number = 0;

    // ── Dimensions du canvas ─────────────────────────────────

    /** Largeur du canvas (pour spawner les obstacles hors écran à droite) */
    private canvasWidth: number;

    

    /** Niveau Y du sol (calculé depuis canvasHeight) */
    private groundY: number;

    // ── Gestion de la difficulté ─────────────────────────────

    /** Vitesse actuelle de défilement (augmente progressivement) */
    private currentSpeed: number = INITIAL_SPEED;

    /** Distance avant le prochain spawn d'obstacle */
    private distanceToNextObstacle: number = 100;

    // ── Constructeur ─────────────────────────────────────────

    /**
     * Initialise le gestionnaire d'obstacles.
     *
     * @param canvasWidth  - Largeur du canvas de jeu
     * @param canvasHeight - Hauteur du canvas de jeu
     */
    constructor(canvasWidth: number, canvasHeight: number) {
        this.canvasWidth  = canvasWidth;

        // Le sol est à 15% depuis le bas (cohérent avec PhysicsEngine)
        this.groundY = canvasHeight - canvasHeight * 0.15;
    }

    // ── Méthode principale (appelée chaque frame) ─────────────

    /**
     * Met à jour tous les obstacles pour la frame courante.
     * Doit être appelé UNE FOIS par frame dans GameEngine.
     *
     * Ordre des opérations :
     * 1. Augmenter progressivement la vitesse
     * 2. Déplacer tous les obstacles vers la gauche
     * 3. Supprimer les obstacles sortis de l'écran
     * 4. Vérifier si un nouvel obstacle doit être généré
     */
    public update(): void {
        // 1. Augmenter la vitesse progressivement (difficulté croissante)
        this.increaseSpeed();

        // 2. Déplacer chaque obstacle vers la gauche
        this.obstacles.forEach(obstacle => {
            obstacle.x -= this.currentSpeed;
        });

        // 3. Supprimer les obstacles complètement sortis de l'écran
        this.removeOffscreenObstacles();

        // 4. Vérifier si on doit spawner un nouvel obstacle
        this.distanceToNextObstacle -= this.currentSpeed;
        if (this.distanceToNextObstacle <= 0) {
            this.spawnObstacle();
            this.scheduleNextObstacle();
        }
    }

    // ── Getters ──────────────────────────────────────────────

    /**
     * Retourne la liste de tous les obstacles actifs.
     * Utilisé par CollisionDetector et le renderer.
     */
    public getObstacles(): Obstacle[] {
        return this.obstacles;
    }

    /**
     * Retourne la vitesse actuelle du jeu.
     * Utilisé par ScoreManager pour calculer la difficulté.
     */
    public getCurrentSpeed(): number {
        return this.currentSpeed;
    }

    // ── Réinitialisation ─────────────────────────────────────

    /**
     * Remet le gestionnaire dans son état initial.
     * Appelé par GameEngine lors d'un restart.
     */
    public reset(): void {
        this.obstacles              = [];
        this.nextId                 = 0;
        this.currentSpeed           = INITIAL_SPEED;
        this.distanceToNextObstacle = 100;
    }

    /**
     * Recalcule les dimensions si le canvas est redimensionné.
     * @param canvasWidth  - Nouvelle largeur du canvas
     * @param canvasHeight - Nouvelle hauteur du canvas
     */
    public resize(canvasWidth: number, canvasHeight: number): void {
        this.canvasWidth  = canvasWidth;
        this.groundY      = canvasHeight - canvasHeight * 0.15;
    }

    // ── Méthodes privées ─────────────────────────────────────

    /**
     * Augmente progressivement la vitesse jusqu'au maximum autorisé.
     */
    private increaseSpeed(): void {
        if (this.currentSpeed < MAX_SPEED) {
            this.currentSpeed += SPEED_INCREMENT;
        }
    }

    /**
     * Choisit un type d'obstacle aléatoire et le crée.
     * Les oiseaux n'apparaissent qu'à partir d'une certaine vitesse.
     */
    private spawnObstacle(): void {
        const type = this.pickRandomType();
        const dims = this.getDimensions(type);

        // Calculer la position Y selon le type d'obstacle
        const y = type === ObstacleType.BIRD
            ? this.getBirdY()           // Les oiseaux volent en hauteur
            : this.groundY - dims.height; // Les cactus sont au sol

        const obstacle: Obstacle = {
            id    : this.nextId++,
            type,
            x     : this.canvasWidth + 10, // Apparaît juste hors écran à droite
            y,
            width : dims.width,
            height: dims.height,
        };

        this.obstacles.push(obstacle);
    }

    /**
     * Choisit aléatoirement un type d'obstacle.
     * Les oiseaux ne peuvent apparaître qu'à vitesse élevée (jeu avancé).
     */
    private pickRandomType(): ObstacleType {
        const canSpawnBird = this.currentSpeed > 9;
        const rand = Math.random();

        if (canSpawnBird && rand < 0.2) return ObstacleType.BIRD;
        if (rand < 0.4)                 return ObstacleType.CACTUS_SMALL;
        if (rand < 0.7)                 return ObstacleType.CACTUS_LARGE;
        return ObstacleType.CACTUS_GROUP;
    }

    /**
     * Retourne les dimensions (largeur x hauteur) selon le type d'obstacle.
     * @param type - Le type d'obstacle
     */
    private getDimensions(type: ObstacleType): { width: number; height: number } {
        switch (type) {
            case ObstacleType.CACTUS_SMALL : return { width: 30,  height: 50  };
            case ObstacleType.CACTUS_LARGE : return { width: 40,  height: 70  };
            case ObstacleType.CACTUS_GROUP : return { width: 80,  height: 55  };
            case ObstacleType.BIRD         : return { width: 60,  height: 35  };
        }
    }

    /**
     * Calcule une hauteur aléatoire pour les oiseaux.
     * Ils peuvent voler haut (dino doit baisser) ou bas (dino doit sauter).
     */
    private getBirdY(): number {
        const rand = Math.random();
        if (rand < 0.33) {
            // Vol bas : au niveau de la tête du dino → doit sauter
            return this.groundY - 80;
        } else if (rand < 0.66) {
            // Vol moyen : au niveau du corps → doit sauter ou baisser
            return this.groundY - 130;
        } else {
            // Vol haut : le dino peut passer dessous sans rien faire
            return this.groundY - 180;
        }
    }

    /**
     * Planifie la distance avant l'apparition du prochain obstacle.
     * La distance diminue avec la vitesse pour augmenter la difficulté.
     */
    private scheduleNextObstacle(): void {
        // Réduire l'écart max progressivement avec la vitesse
        const adjustedMax = Math.max(MIN_GAP, MAX_GAP - this.currentSpeed * 10);
        this.distanceToNextObstacle =
            MIN_GAP + Math.random() * (adjustedMax - MIN_GAP);
    }

    /**
     * Supprime les obstacles qui sont complètement sortis de l'écran à gauche.
     */
    private removeOffscreenObstacles(): void {
        this.obstacles = this.obstacles.filter(
            obstacle => obstacle.x + obstacle.width > 0
        );
    }
}