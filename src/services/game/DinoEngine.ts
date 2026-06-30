import { Dinosaure } from "../dino_actions";
import { GameStateManager } from "./GameStateManager";
import { PhysicsEngine } from "./PhysicsEngine";
import { ObstacleManager } from "./ObstacleManager";
import { CollisionDetector } from "./CollisionDetector";
import { SoundService } from "../sound";

/**
 * Orchestrateur principal du jeu Djino.
 * Lie tous les services du moteur (Physique, Obstacles, Collisions, État).
 */
export class DinoEngine {
    public readonly gsm: GameStateManager;
    public readonly dino: Dinosaure;
    public readonly physics: PhysicsEngine;
    public readonly obstacles: ObstacleManager;
    private readonly detector: CollisionDetector;

    private _score: number = 0;
    private _highScore: number = 0;

    constructor(canvasWidth: number, canvasHeight: number) {
        this.gsm = GameStateManager.getInstance();
        this.dino = new Dinosaure();
        
        this.physics = new PhysicsEngine(canvasWidth, canvasHeight, this.dino);
        this.obstacles = new ObstacleManager(canvasWidth, canvasHeight);
        this.detector = new CollisionDetector(this.physics, this.obstacles, this.gsm);
    }

    /**
     * Boucle de mise à jour logique (appelée chaque frame).
     */
    public update(): void {
        if (!this.gsm.isPlaying() && !this.gsm.isGameOver()) return;

        // Mise à jour de l'animation du dino (frames)
        this.dino.update(16); // Environ 16ms pour 60fps

        if (this.gsm.isGameOver()) return;

        // Mise à jour de la physique (gravité, position dino)
        this.physics.update();
        
        // Mise à jour des obstacles (mouvement, spawn)
        this.obstacles.update();
        
        // Détection des collisions
        this.detector.update();

        // Mise à jour du score (basé sur la vitesse)
        if (this.gsm.isPlaying()) {
            this._score += this.obstacles.getCurrentSpeed() / 60; // Environ 1 point par seconde à vitesse de base
            if (this._score > this._highScore) {
                this._highScore = this._score;
            }
        }
    }

    /**
     * Fait sauter le dinosaure.
     */
    public jump(): void {
        if (this.gsm.isPlaying()) {
            if (this.physics.jump()) {
                SoundService.playEffect('jump');
            }
        } else if (this.gsm.isGameOver()) {
            this.restart();
        }
    }

    /**
     * Redémarre une partie.
     */
    public restart(): void {
        this.physics.reset();
        this.obstacles.reset();
        this.detector.reset();
        this._score = 0;
        this.gsm.startGame();
    }

    public get score(): number {
        return Math.floor(this._score);
    }

    public get highScore(): number {
        return Math.floor(this._highScore);
    }
}
