/**
 * @file GameStateManager.ts
 * @description Gestionnaire des états du jeu DJINO.
 *
 * Ce module centralise TOUS les états possibles du jeu et notifie
 * les autres modules à chaque changement d'état via un système
 * d'écouteurs (pattern Observer).
 *
 * États possibles :
 *   IDLE       → Le jeu est sur l'écran d'accueil, pas encore démarré
 *   PLAYING    → Le jeu est en cours, le dino court
 *   PAUSED     → Le jeu est mis en pause
 *   GAME_OVER  → Le joueur a perdu (collision détectée)
 *
 * @author Joel
 * @version 1.0.0
 */

// ─────────────────────────────────────────────────────────────
// TYPES & ÉNUMÉRATIONS
// ─────────────────────────────────────────────────────────────

/**
 * Tous les états possibles du jeu.
 * On utilise une enum pour éviter les erreurs de frappe
 * et rendre le code lisible ("GameState.PLAYING" plutôt que "playing").
 */
export enum GameState {
    IDLE      = 'IDLE',       // Écran d'accueil / menu
    PLAYING   = 'PLAYING',    // Partie en cours
    PAUSED    = 'PAUSED',     // Partie en pause
    GAME_OVER = 'GAME_OVER',  // Partie terminée (défaite)
}

/**
 * Type d'une fonction écouteur appelée lors d'un changement d'état.
 * @param newState  - Le nouvel état qui vient d'être appliqué
 * @param prevState - L'état qui était actif juste avant
 */
export type StateChangeListener = (
    newState: GameState,
    prevState: GameState
) => void;

// ─────────────────────────────────────────────────────────────
// CLASSE PRINCIPALE
// ─────────────────────────────────────────────────────────────

/**
 * @class GameStateManager
 * @description Gère l'état global du jeu et notifie les abonnés.
 *
 * Utilise le pattern Singleton : une seule instance existe dans
 * toute l'application, accessible via GameStateManager.getInstance().
 *
 * @example
 * const gsm = GameStateManager.getInstance();
 * gsm.onStateChange((newState) => console.log('Nouvel état :', newState));
 * gsm.startGame();
 */
export class GameStateManager {

    // Instance unique (pattern Singleton)
    private static instance: GameStateManager;

    // L'état actuel du jeu
    private currentState: GameState = GameState.IDLE;

    // Liste de tous les écouteurs enregistrés
    private listeners: StateChangeListener[] = [];

    // ── Constructeur privé (Singleton) ──────────────────────
    private constructor() {
        // Rien à initialiser ici, l'état IDLE est la valeur par défaut
    }

    // ── Accès à l'instance unique ────────────────────────────

    /**
     * Retourne l'unique instance de GameStateManager.
     * La crée si elle n'existe pas encore.
     */
    public static getInstance(): GameStateManager {
        if (!GameStateManager.instance) {
            GameStateManager.instance = new GameStateManager();
        }
        return GameStateManager.instance;
    }

    // ── Lecture de l'état ────────────────────────────────────

    /**
     * Retourne l'état actuel du jeu.
     */
    public getState(): GameState {
        return this.currentState;
    }

    /**
     * Vérifie si le jeu est actuellement en cours.
     */
    public isPlaying(): boolean {
        return this.currentState === GameState.PLAYING;
    }

    /**
     * Vérifie si le jeu est terminé (défaite).
     */
    public isGameOver(): boolean {
        return this.currentState === GameState.GAME_OVER;
    }

    // ── Changements d'état ───────────────────────────────────

    /**
     * Démarre une nouvelle partie.
     * Transition valide : IDLE → PLAYING ou GAME_OVER → PLAYING
     */
    public startGame(): void {
        if (
            this.currentState === GameState.IDLE ||
            this.currentState === GameState.GAME_OVER
        ) {
            this.transitionTo(GameState.PLAYING);
        }
    }

    /**
     * Met le jeu en pause.
     * Transition valide : PLAYING → PAUSED uniquement
     */
    public pauseGame(): void {
        if (this.currentState === GameState.PLAYING) {
            this.transitionTo(GameState.PAUSED);
        }
    }

    /**
     * Reprend le jeu depuis la pause.
     * Transition valide : PAUSED → PLAYING uniquement
     */
    public resumeGame(): void {
        if (this.currentState === GameState.PAUSED) {
            this.transitionTo(GameState.PLAYING);
        }
    }

    /**
     * Déclenche la fin de partie (le joueur a perdu).
     * Peut être appelé depuis CollisionDetector uniquement en PLAYING.
     */
    public triggerGameOver(): void {
        if (this.currentState === GameState.PLAYING) {
            this.transitionTo(GameState.GAME_OVER);
        }
    }

    /**
     * Remet le jeu dans son état initial (retour au menu).
     */
    public resetToIdle(): void {
        this.transitionTo(GameState.IDLE);
    }

    // ── Système d'abonnement (Observer pattern) ──────────────

    /**
     * Enregistre un écouteur qui sera appelé à chaque changement d'état.
     *
     * @param listener - Fonction à appeler lors d'un changement d'état
     * @returns Une fonction pour se désabonner (supprimer cet écouteur)
     *
     * @example
     * const unsubscribe = gsm.onStateChange((newState, prevState) => {
     *     if (newState === GameState.GAME_OVER) {
     *         afficherEcranDefaite();
     *     }
     * });
     * // Plus tard, pour arrêter d'écouter :
     * unsubscribe();
     */
    public onStateChange(listener: StateChangeListener): () => void {
        this.listeners.push(listener);

        // Retourne une fonction de désabonnement
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    // ── Méthode privée de transition ─────────────────────────

    /**
     * Effectue la transition vers un nouvel état et notifie tous les écouteurs.
     * @param newState - Le nouvel état à appliquer
     */
    private transitionTo(newState: GameState): void {
        const prevState = this.currentState;
        this.currentState = newState;

        console.log(`[GameStateManager] ${prevState} → ${newState}`);

        // Notifier tous les écouteurs enregistrés
        this.listeners.forEach(listener => listener(newState, prevState));
    }
}