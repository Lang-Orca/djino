/**
 * @file PhysicsEngine.ts
 * @description Moteur physique du dinosaure dans DJINO.
 *
 * Ce module est responsable de TOUT ce qui concerne la physique
 * du personnage jouable (le dino) :
 *   - Sa position (x, y) sur le canvas
 *   - Sa vélocité verticale (chute, saut)
 *   - L'application de la gravité à chaque frame
 *   - La détection du sol (empêcher le dino de tomber infiniment)
 *   - Le saut simple et le double saut
 *
 * ⚠️ Ce module ne dessine RIEN. Il calcule uniquement les données
 * de position que le renderer utilisera pour afficher le dino.
 *
 * @author Joel
 * @version 1.0.0
 */

// ─────────────────────────────────────────────────────────────
// CONSTANTES PHYSIQUES
// ─────────────────────────────────────────────────────────────

/**
 * Force de gravité appliquée à chaque frame (pixels/frame²).
 * Plus cette valeur est grande, plus le dino tombe vite.
 */
const GRAVITY = 0.6;

/**
 * Force initiale du saut (valeur négative = vers le haut).
 * En canvas, Y augmente vers le bas, donc sauter = Y négatif.
 */
const JUMP_FORCE = -14;

/**
 * Force du second saut (légèrement moins puissante que le premier).
 */
const DOUBLE_JUMP_FORCE = -11;

/**
 * Largeur du dinosaure en pixels (utilisée pour le hitbox).
 */
export const DINO_WIDTH = 60;

/**
 * Hauteur du dinosaure en pixels (utilisée pour le hitbox).
 */
export const DINO_HEIGHT = 70;

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

/**
 * Représente la position et la taille du dinosaure.
 * Utilisé par CollisionDetector pour les calculs de collision.
 */
export interface DinoHitbox {
    x: number;       // Position horizontale du coin supérieur gauche
    y: number;       // Position verticale du coin supérieur gauche
    width: number;   // Largeur du dino
    height: number;  // Hauteur du dino
}

// ─────────────────────────────────────────────────────────────
// CLASSE PRINCIPALE
// ─────────────────────────────────────────────────────────────

/**
 * @class PhysicsEngine
 * @description Gère la physique du dinosaure (position, gravité, saut).
 *
 * @example
 * const physics = new PhysicsEngine(800, 400);
 *
 * // Dans la boucle de jeu, à chaque frame :
 * physics.update();
 *
 * // Quand le joueur appuie sur Espace :
 * physics.jump();
 *
 * // Pour dessiner le dino :
 * const hitbox = physics.getHitbox();
 * ctx.fillRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
 */
export class PhysicsEngine {

    // ── Position du dinosaure ────────────────────────────────

    /** Position horizontale du dino (fixe, le dino ne bouge pas en X) */
    private x: number;

    /** Position verticale actuelle du dino */
    private y: number;

    /** Niveau du sol en Y (calculé depuis la hauteur du canvas) */
    private groundY: number;

    // ── Physique ─────────────────────────────────────────────

    /** Vitesse verticale actuelle (positive = descend, négatif = monte) */
    private velocityY: number = 0;

    /** Indique si le dino est actuellement au sol */
    private isOnGround: boolean = true;

    /** Nombre de sauts effectués depuis le dernier contact avec le sol */
    private jumpCount: number = 0;

    /** Nombre maximum de sauts autorisés (2 = double saut activé) */
    private readonly MAX_JUMPS: number = 2;

    // ── Constructeur ─────────────────────────────────────────

    /**
     * Crée le moteur physique et positionne le dino sur le sol.
     *
     * @param canvasWidth  - Largeur du canvas de jeu (pour positionner le dino en X)
     * @param canvasHeight - Hauteur du canvas de jeu (pour calculer le niveau du sol)
     */
    constructor(canvasWidth: number, canvasHeight: number) {
        // Le dino est positionné à 10% depuis la gauche (comme le jeu Google)
        this.x = canvasWidth * 0.1;

        // Le sol est à 15% depuis le bas du canvas
        this.groundY = canvasHeight - canvasHeight * 0.15 - DINO_HEIGHT;

        // Le dino démarre au niveau du sol
        this.y = this.groundY;
    }

    // ── Méthode principale (appelée chaque frame) ─────────────

    /**
     * Met à jour la physique du dino pour la frame courante.
     * Doit être appelé UNE FOIS par frame dans la boucle de jeu (GameEngine).
     *
     * Ordre des opérations :
     * 1. Appliquer la gravité (augmenter velocityY)
     * 2. Déplacer le dino (y += velocityY)
     * 3. Vérifier si le dino touche le sol
     */
    public update(): void {
        // 1. Appliquer la gravité — accélère la chute à chaque frame
        this.velocityY += GRAVITY;

        // 2. Déplacer le dino verticalement selon sa vélocité
        this.y += this.velocityY;

        // 3. Vérifier le contact avec le sol
        this.checkGroundCollision();
    }

    // ── Contrôles joueur ─────────────────────────────────────

    /**
     * Fait sauter le dinosaure.
     * Gère automatiquement le saut simple et le double saut.
     *
     * Règles :
     * - 1er appel (au sol)    → saut normal
     * - 2ème appel (en l'air) → double saut
     * - 3ème appel et plus    → ignoré
     *
     * @returns `true` si le saut a été effectué, `false` si ignoré
     */
    public jump(): boolean {
        // Vérifier si on peut encore sauter
        if (this.jumpCount >= this.MAX_JUMPS) {
            return false; // Trop de sauts, on ignore
        }

        // Appliquer la force de saut (différente selon si c'est le 1er ou 2ème)
        if (this.jumpCount === 0) {
            this.velocityY = JUMP_FORCE;         // Saut principal
        } else {
            this.velocityY = DOUBLE_JUMP_FORCE;  // Double saut (légèrement plus faible)
        }

        this.jumpCount++;
        this.isOnGround = false;

        return true;
    }

    /**
     * Accélère la descente quand le joueur appuie vers le bas (crouch jump).
     * Utile pour retomber plus vite après un saut.
     */
    public fastFall(): void {
        if (!this.isOnGround) {
            // Augmente la vitesse de descente si le dino est en l'air
            this.velocityY += GRAVITY * 2;
        }
    }

    // ── Getters (lecture des données) ────────────────────────

    /**
     * Retourne le rectangle de collision (hitbox) du dinosaure.
     * Utilisé par CollisionDetector à chaque frame.
     */
    public getHitbox(): DinoHitbox {
        return {
            x: this.x,
            y: this.y,
            width: DINO_WIDTH,
            height: DINO_HEIGHT,
        };
    }

    /**
     * Retourne la position Y actuelle du dino.
     */
    public getY(): number {
        return this.y;
    }

    /**
     * Retourne la position X fixe du dino.
     */
    public getX(): number {
        return this.x;
    }

    /**
     * Retourne true si le dino est actuellement au sol.
     */
    public getIsOnGround(): boolean {
        return this.isOnGround;
    }

    /**
     * Retourne le niveau Y du sol (utile pour le renderer).
     */
    public getGroundY(): number {
        return this.groundY;
    }

    // ── Réinitialisation ─────────────────────────────────────

    /**
     * Remet le dino dans son état initial (au sol, immobile).
     * Appelé par GameEngine lors d'un restart.
     */
    public reset(): void {
        this.y = this.groundY;
        this.velocityY = 0;
        this.isOnGround = true;
        this.jumpCount = 0;
    }

    /**
     * Recalcule la position du sol si le canvas est redimensionné.
     * @param canvasHeight - Nouvelle hauteur du canvas
     */
    public resize(canvasHeight: number): void {
        this.groundY = canvasHeight - canvasHeight * 0.15 - DINO_HEIGHT;

        // Si le dino était au sol, l'y replacer au nouveau sol
        if (this.isOnGround) {
            this.y = this.groundY;
        }
    }

    // ── Méthodes privées ─────────────────────────────────────

    /**
     * Vérifie si le dino a atteint ou dépassé le niveau du sol.
     * Si oui, stoppe sa chute et réinitialise le compteur de sauts.
     */
    private checkGroundCollision(): void {
        if (this.y >= this.groundY) {
            // Le dino touche (ou dépasse) le sol → on le repositionne exactement
            this.y = this.groundY;
            this.velocityY = 0;
            this.isOnGround = true;
            this.jumpCount = 0; // Réinitialiser le compteur de sauts
        } else {
            this.isOnGround = false;
        }
    }
}