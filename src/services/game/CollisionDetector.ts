/**
 * @file CollisionDetector.ts
 * @description Détecteur de collisions entre le dinosaure et les obstacles.
 *
 * Ce module utilise l'algorithme AABB (Axis-Aligned Bounding Box)
 * pour détecter si le dinosaure touche un obstacle.
 *
 * Principe de l'AABB :
 *   Deux rectangles A et B se touchent si ET SEULEMENT SI :
 *     - A.gauche   < B.droite
 *     - A.droite   > B.gauche
 *     - A.haut     < B.bas
 *     - A.bas      > B.haut
 *
 *   Si UNE de ces conditions est fausse → pas de collision.
 *
 *  ┌──────────┐
 *  │  Dino    │◄──── hitbox réduite (plus juste pour le joueur)
 *  └──────────┘
 *        ↓ vérifie contre chaque obstacle
 *  ┌──────────┐
 *  │ Obstacle │
 *  └──────────┘
 *
 * Quand une collision est détectée :
 *   1. PhysicsEngine.markAsDead()    → animation DEAD du dino
 *   2. GameStateManager.triggerGameOver() → état GAME_OVER
 *
 * @author Joel
 * @version 1.0.0
 */

import { GameStateManager } from "./GameStateManager";
import { PhysicsEngine }    from "./PhysicsEngine";
import { ObstacleManager }  from "./ObstacleManager";
import { SoundService }     from "../sound";

// ─────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────

/**
 * Marge de réduction du hitbox du dino (en pixels).
 *
 * On réduit le hitbox de chaque côté pour que le jeu soit
 * plus juste — une collision "visuelle" d'1 pixel ne tue pas
 * le joueur. Plus la valeur est grande, plus le jeu est indulgent.
 */
const HITBOX_MARGIN = 8;

// ─────────────────────────────────────────────────────────────
// CLASSE PRINCIPALE
// ─────────────────────────────────────────────────────────────

/**
 * @class CollisionDetector
 * @description Vérifie à chaque frame si le dino touche un obstacle.
 *
 * @example
 * const detector = new CollisionDetector(physics, obstacles, gsm);
 *
 * // Dans la boucle de jeu, à chaque frame :
 * detector.update();
 */
export class CollisionDetector {

    // ── Dépendances ──────────────────────────────────────────

    /** Moteur physique — fournit le hitbox du dino */
    private physics: PhysicsEngine;

    /** Gestionnaire d'obstacles — fournit la liste des obstacles */
    private obstacleManager: ObstacleManager;

    /** Gestionnaire d'état — pour déclencher GAME_OVER */
    private gsm: GameStateManager;

    // ── État interne ─────────────────────────────────────────

    /** Indique si une collision a déjà été détectée (évite les doublons) */
    private collisionOccurred: boolean = false;

    // ── Constructeur ─────────────────────────────────────────

    /**
     * @param physics         - Instance du moteur physique
     * @param obstacleManager - Instance du gestionnaire d'obstacles
     * @param gsm             - Instance du gestionnaire d'état (Singleton)
     */
    constructor(
        physics:         PhysicsEngine,
        obstacleManager: ObstacleManager,
        gsm:             GameStateManager
    ) {
        this.physics         = physics;
        this.obstacleManager = obstacleManager;
        this.gsm             = gsm;
    }

    // ── Méthode principale (appelée chaque frame) ─────────────

    /**
     * Vérifie les collisions entre le dino et tous les obstacles actifs.
     * Doit être appelé UNE FOIS par frame dans GameEngine,
     * APRÈS la mise à jour de PhysicsEngine et ObstacleManager.
     *
     * @returns true si une collision vient d'être détectée, false sinon
     */
    public update(): boolean {
        // Ne pas vérifier si une collision a déjà eu lieu
        if (this.collisionOccurred) return false;

        // Récupérer le hitbox réduit du dino
        const dinoBox = this.getReducedDinoHitbox();

        // Récupérer tous les obstacles actifs
        const obstacles = this.obstacleManager.getObstacles();

        // Vérifier contre chaque obstacle
        for (const obstacle of obstacles) {
            if (this.checkAABB(dinoBox, obstacle)) {
                this.handleCollision();
                return true;
            }
        }

        return false;
    }

    // ── Réinitialisation ─────────────────────────────────────

    /**
     * Remet le détecteur à zéro pour une nouvelle partie.
     * Appelé par GameEngine lors d'un restart.
     */
    public reset(): void {
        this.collisionOccurred = false;
    }

    // ── Méthodes privées ─────────────────────────────────────

    /**
     * Retourne le hitbox du dino RÉDUIT par HITBOX_MARGIN.
     *
     * On réduit le hitbox de chaque côté pour un jeu plus juste.
     * Le dino "visuel" est plus grand que son hitbox réel.
     *
     *  ┌────────────────┐  ← sprite visible
     *  │  ┌──────────┐  │  ← hitbox réel (réduit)
     *  │  │          │  │
     *  │  └──────────┘  │
     *  └────────────────┘
     */
    private getReducedDinoHitbox() {
        const raw = this.physics.getHitbox();
        return {
            x:      raw.x      + HITBOX_MARGIN,
            y:      raw.y      + HITBOX_MARGIN,
            width:  raw.width  - HITBOX_MARGIN * 2,
            height: raw.height - HITBOX_MARGIN * 2,
        };
    }

    /**
     * Algorithme AABB — vérifie si deux rectangles se superposent.
     *
     * Deux rectangles NE se touchent PAS si l'un est :
     *   → complètement à gauche de l'autre
     *   → complètement à droite de l'autre
     *   → complètement au-dessus de l'autre
     *   → complètement en-dessous de l'autre
     *
     * Dans tous les autres cas, ils se touchent.
     *
     * @param a - Premier rectangle (le dino)
     * @param b - Second rectangle (un obstacle)
     * @returns true si collision, false sinon
     */
    private checkAABB(
        a: { x: number; y: number; width: number; height: number },
        b: { x: number; y: number; width: number; height: number }
    ): boolean {
        return (
            a.x              < b.x + b.width  && // A n'est pas à droite de B
            a.x + a.width    > b.x            && // A n'est pas à gauche de B
            a.y              < b.y + b.height && // A n'est pas sous B
            a.y + a.height   > b.y               // A n'est pas au-dessus de B
        );
    }

    /**
     * Gère la collision : notifie PhysicsEngine et GameStateManager.
     *
     * Ordre important :
     *   1. Marquer le dino comme mort (animation DEAD)
     *   2. Déclencher GAME_OVER (arrêter la boucle de jeu)
     */
    private handleCollision(): void {
        console.log('[CollisionDetector] Collision détectée → GAME_OVER');

        // 1. Empêcher de détecter d'autres collisions après celle-ci
        this.collisionOccurred = true;

        // 2. Jouer les sons de collision et de fin de partie
        SoundService.playEffect('collision');
        SoundService.stopBackground();
        
        // Un petit délai avant le son de Game Over pour ne pas superposer trop violemment
        setTimeout(() => {
            SoundService.playEffect('gameOver');
        }, 300);

        // 3. Déclencher l'animation de mort sur le dino
        this.physics.markAsDead();

        // 4. Passer le jeu en état GAME_OVER
        this.gsm.triggerGameOver();
    }
}