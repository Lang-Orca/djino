/**
 * c'ets ici que le service de sons seras definis et ses etats
 */

/**
 * sound.ts
 * Gère la musique de fond et la musique de game over.
 * - La musique de fond démarre automatiquement au lancement
 * - L'utilisateur peut la mettre en pause / la relancer
 * - La préférence est sauvegardée dans le localStorage
 */

import { storageKeys, StorageService } from "./storage";
import bgMusic from "../assets/bg-music.aac";
import gameoverMusic from "../assets/gameover.aac";

export class SoundService {

    private static bgAudio: HTMLAudioElement = new Audio(bgMusic);
    private static gameoverAudio: HTMLAudioElement = new Audio(gameoverMusic);
    private static isMusicEnabled: boolean = true;

    /**
     * Initialise le service son.
     * Récupère la préférence sauvegardée et démarre la musique si activée.
     */
    public static init(): void {
        // Récupérer la préférence sauvegardée
        const saved = StorageService.get(storageKeys.music);
        this.isMusicEnabled = saved !== null ? saved : true;

        // Configurer la musique de fond
        this.bgAudio.loop = true;
        this.bgAudio.volume = 0.5;

        // Configurer la musique de game over
        this.gameoverAudio.loop = false;
        this.gameoverAudio.volume = 0.7;

        // Démarrer la musique si activée
        if (this.isMusicEnabled) {
            this.playBgMusic();
        }
    }

    /**
     * Lance la musique de fond.
     */
    public static playBgMusic(): void {
        this.bgAudio.play().catch(() => {
            // Le navigateur bloque l'autoplay — on attend un clic utilisateur
            document.addEventListener('click', () => {
                if (this.isMusicEnabled) {
                    this.bgAudio.play().catch(() => {});
                }
            }, { once: true });
        });
    }

    /**
     * Met en pause la musique de fond.
     */
    public static pauseBgMusic(): void {
        this.bgAudio.pause();
    }

    /**
     * Active ou désactive la musique de fond.
     * Sauvegarde la préférence dans le localStorage.
     */
    public static toggle(): void {
        this.isMusicEnabled = !this.isMusicEnabled;
        StorageService.save(storageKeys.music, this.isMusicEnabled);

        if (this.isMusicEnabled) {
            this.playBgMusic();
        } else {
            this.pauseBgMusic();
        }
    }

    /**
     * Retourne l'état actuel de la musique.
     */
    public static isEnabled(): boolean {
        return this.isMusicEnabled;
    }

    /**
     * Joue la musique de game over.
     * La musique de fond continue de jouer.
     */
    public static playGameOver(): void {
        this.gameoverAudio.currentTime = 0;
        this.gameoverAudio.play().catch(() => {});
    }

    /**
     * Arrête la musique de game over.
     */
    public static stopGameOver(): void {
        this.gameoverAudio.pause();
        this.gameoverAudio.currentTime = 0;
    }
}