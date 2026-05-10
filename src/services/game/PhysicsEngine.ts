/**
 * @file PhysicsEngine.ts
 * @description Moteur physique du dinosaure dans DJINO.
 *
 * Ce module gère la physique du personnage (gravité, saut)
 * et synchronise les résultats directement avec l'instance
 * Dinosaure du coéquipier (position Y + état d'animation).
 *
 * Intégration avec la classe Dinosaure :
 *   - Met à jour dino.y à chaque frame
 *   - Appelle dino.setAction() selon l'état physique :
 *       → En l'air  : DinoAction.JUMP
 *       → Au sol    : DinoAction.RUN
 *       → Mort      : DinoAction.DEAD (via markAsDead())
 *
 * @author Joel
 * @version 2.0.0
 */

// LIGNE CORRECTE
import { Dinosaure, DinoAction } from "../dino_actions";

// ─────────────────────────────────────────────────────────────
// CONSTANTES PHYSIQUES
// ─────────────────────────────────────────────────────────────

/** Gravité appliquée à chaque frame (pixels/frame²) */
const GRAVITY = 0.6;

/** Force du saut principal (négatif = vers le haut) */
const JUMP_FORCE = -14;

/** Force du double saut (légèrement moins puissante) */
const DOUBLE_JUMP_FORCE = -11;

/**
 * Largeur du hitbox du dino en pixels.
 * Légèrement réduite par rapport au sprite pour un jeu plus juste.
 */
export const DINO_WIDTH = 50;

/**
 * Hauteur du hitbox du dino en pixels.
 * Légèrement réduite par rapport au sprite pour un jeu plus juste.
 */
export const DINO_HEIGHT = 60;

// ─────────────────────────────────────────────────────────────
// TYPE
// ─────────────────────────────────────────────────────────────

/**
 * Rectangle de collision du dinosaure.
 * Transmis à CollisionDetector à chaque frame.
 */
export interface DinoHitbox {
    x: number;
    y: number;
    width: number;
    height: number;
}

// ─────────────────────────────────────────────────────────────
// CLASSE PRINCIPALE
// ─────────────────────────────────────────────────────────────

/**
 * @class PhysicsEngine
 * @description Gère la physique du dino et synchronise avec la classe Dinosaure.
 *
 * @example
 * const dino    = new Dinosaure();
 * const physics = new PhysicsEngine(800, 400, dino);
 *
 * // Chaque frame :
 * physics.update();
 *
 * // Saut (touche Espace) :
 * physics.jump();
 */
export class PhysicsEngine {

    // ── Référence vers le Dinosaure du coéquipier ────────────
    private dino: Dinosaure;

    // ── Physique ─────────────────────────────────────────────
    private y:           number  = 0;
    private groundY:     number;
    private velocityY:   number  = 0;
    private isOnGround:  boolean = true;
    private jumpCount:   number  = 0;
    private isDead:      boolean = false;

    /** Nombre maximum de sauts autorisés (2 = double saut) */
    private readonly MAX_JUMPS = 2;

    // ── Constructeur ─────────────────────────────────────────

    /**
     * @param canvasWidth  - Largeur du canvas
     * @param canvasHeight - Hauteur du canvas
     * @param dino         - Instance Dinosaure à synchroniser
     */
    constructor(canvasWidth: number, canvasHeight: number, dino: Dinosaure) {
        this.dino    = dino;

        // Le sol est à 15% depuis le bas du canvas
        this.groundY = canvasHeight - canvasHeight * 0.15 - DINO_HEIGHT;
        this.y       = this.groundY;

       // APRÈS — on utilise canvasWidth pour calculer la position X
        this.dino.y = this.y;
this.dino.x = canvasWidth * 0.1; // 10% depuis la gauche, cohérent avec le canvas }
    }
    // ── Méthode principale ───────────────────────────────────

    /**
     * Met à jour la physique et synchronise avec le Dinosaure.
     * Appelé UNE FOIS par frame dans GameEngine.
     */
    public update(): void {
        if (this.isDead) return; // Ne plus bouger si mort

        // 1. Appliquer la gravité
        this.velocityY += GRAVITY;

        // 2. Déplacer verticalement
        this.y += this.velocityY;

        // 3. Vérifier contact avec le sol
        this.checkGroundCollision();

        // 4. Synchroniser la position Y sur le Dinosaure du coéquipier
        this.dino.y = this.y;

        // 5. Mettre à jour l'animation du Dinosaure selon l'état physique
        this.syncDinoAction();
    }

    // ── Contrôles joueur ─────────────────────────────────────

    /**
     * Fait sauter le dinosaure (simple ou double saut).
     * @returns true si le saut est effectué, false si ignoré
     */
    public jump(): boolean {
        if (this.isDead || this.jumpCount >= this.MAX_JUMPS) return false;

        this.velocityY = this.jumpCount === 0 ? JUMP_FORCE : DOUBLE_JUMP_FORCE;
        this.jumpCount++;
        this.isOnGround = false;

        // Déclencher immédiatement l'animation de saut
        this.dino.setAction(DinoAction.JUMP);

        return true;
    }

    /**
     * Accélère la descente (touche bas pendant le saut).
     */
    public fastFall(): void {
        if (!this.isOnGround && !this.isDead) {
            this.velocityY += GRAVITY * 2;
        }
    }

    /**
     * Marque le dino comme mort (appelé par CollisionDetector).
     * Déclenche l'animation DEAD et gèle la physique.
     */
    public markAsDead(): void {
        this.isDead    = true;
        this.velocityY = 0;
        this.dino.setAction(DinoAction.DEAD);
    }

    // ── Getters ──────────────────────────────────────────────

    /**
     * Retourne le hitbox du dino pour CollisionDetector.
     * Utilise la position du Dinosaure directement.
     */
    public getHitbox(): DinoHitbox {
        return {
            x:      this.dino.x,
            y:      this.dino.y,
            width:  DINO_WIDTH,
            height: DINO_HEIGHT,
        };
    }

    public getGroundY():    number  { return this.groundY;    }
    public getIsOnGround(): boolean { return this.isOnGround; }

    // ── Réinitialisation ─────────────────────────────────────

    /**
     * Remet la physique à zéro pour un nouveau jeu.
     */
    public reset(): void {
        this.y          = this.groundY;
        this.velocityY  = 0;
        this.isOnGround = true;
        this.jumpCount  = 0;
        this.isDead     = false;

        this.dino.y = this.y;
        this.dino.setAction(DinoAction.IDLE);
    }

    /**
     * Recalcule le sol si le canvas change de taille.
     */
    public resize(canvasHeight: number): void {
        this.groundY = canvasHeight - canvasHeight * 0.15 - DINO_HEIGHT;
        if (this.isOnGround) {
            this.y      = this.groundY;
            this.dino.y = this.y;
        }
    }

    // ── Méthodes privées ─────────────────────────────────────

    /** Vérifie et corrige la position du sol. */
    private checkGroundCollision(): void {
        if (this.y >= this.groundY) {
            this.y          = this.groundY;
            this.velocityY  = 0;
            this.isOnGround = true;
            this.jumpCount  = 0;
        } else {
            this.isOnGround = false;
        }
    }

    /**
     * Synchronise l'animation du Dinosaure avec l'état physique.
     * Appelé après chaque update().
     */
    private syncDinoAction(): void {
        if (!this.isOnGround) {
            this.dino.setAction(DinoAction.JUMP);
        } else {
            this.dino.setAction(DinoAction.RUN);
        }
    }
}