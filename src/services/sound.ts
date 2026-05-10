/**
 * Service gérant les sons et la musique de fond.
 * Supports MP3 + OGG pour la compatibilité navigateur.
 */

import { storageKeys, StorageService } from "./storage";

export type SoundEffect = 'jump' | 'collision' | 'score' | 'gameOver';

export class SoundService {
    private static bgMusic: HTMLAudioElement | null = null;
    private static effectsAudio: Map<SoundEffect, HTMLAudioElement> = new Map();
    private static isMuted: boolean = StorageService.get(storageKeys.sound_muted) || false;
    private static masterVolume: number = StorageService.get(storageKeys.sound_volume) || 0.7;

    public static init(): void {
        this.loadBackgroundMusic();
        this.preloadEffects();
    }

    private static loadBackgroundMusic(): void {
        this.bgMusic = this.createAudioElement('src/assets/sounds/music/background', {
            loop: true,
            volume: this.masterVolume * 0.5,
        });
    }

    private static preloadEffects(): void {
        const effects: SoundEffect[] = ['jump', 'collision', 'score', 'gameOver'];
        effects.forEach(effect => {
            const audio = this.createAudioElement(`src/assets/sounds/effects/${effect}`, {
                volume: this.masterVolume,
            });
            this.effectsAudio.set(effect, audio);
        });
    }

    private static createAudioElement(basePath: string, config: { volume?: number; loop?: boolean } = {}): HTMLAudioElement {
        const audio = new Audio();

        const sourceMp3 = document.createElement('source');
        sourceMp3.src = `${basePath}.mp3`;
        sourceMp3.type = 'audio/mpeg';
        audio.appendChild(sourceMp3);

        const sourceOgg = document.createElement('source');
        sourceOgg.src = `${basePath}.ogg`;
        sourceOgg.type = 'audio/ogg';
        audio.appendChild(sourceOgg);

        audio.volume = config.volume ?? this.masterVolume;
        audio.loop = config.loop ?? false;
        audio.muted = this.isMuted;
        audio.preload = 'auto';

        return audio;
    }

    public static playEffect(effect: SoundEffect): void {
        if (this.isMuted) return;
        const audio = this.effectsAudio.get(effect);
        if (!audio) return;
        audio.currentTime = 0;
        audio.play().catch(() => {
            // Le son peut être bloqué automatiquement avant une interaction utilisateur
        });
    }

    public static playBackground(): void {
        if (this.isMuted || !this.bgMusic) return;
        this.bgMusic.play().catch(() => {
            // Ignore les erreurs de lecture automatique avant interaction
        });
    }

    public static pauseBackground(): void {
        if (this.bgMusic) {
            this.bgMusic.pause();
        }
    }

    public static stopBackground(): void {
        if (this.bgMusic) {
            this.bgMusic.pause();
            this.bgMusic.currentTime = 0;
        }
    }

    public static setMuted(muted: boolean): void {
        this.isMuted = muted;
        StorageService.save(storageKeys.sound_muted, muted);
        if (this.bgMusic) this.bgMusic.muted = muted;
        this.effectsAudio.forEach(audio => (audio.muted = muted));
        if (!muted) this.playBackground();
    }

    public static setVolume(volume: number): void {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        StorageService.save(storageKeys.sound_volume, this.masterVolume);
        if (this.bgMusic) this.bgMusic.volume = this.masterVolume * 0.5;
        this.effectsAudio.forEach(audio => {
            audio.volume = this.masterVolume;
        });
    }

    public static isSoundMuted(): boolean {
        return this.isMuted;
    }

    public static getVolume(): number {
        return this.masterVolume;
    }
}