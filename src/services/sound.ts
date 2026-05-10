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
        // Le fichier de musique de fond est un .aac à la racine des assets
        this.bgMusic = this.createAudioElement('src/assets/bg-sound', {
            loop: true,
            volume: this.masterVolume * 0.5,
            formats: ['aac', 'mp3']
        });
    }

    private static preloadEffects(): void {
        const effects: SoundEffect[] = ['jump', 'collision', 'score', 'gameOver'];
        effects.forEach(effect => {
            const audio = this.createAudioElement(`src/assets/sounds/effects/${effect}`, {
                volume: this.masterVolume,
                formats: ['mp3', 'ogg']
            });
            this.effectsAudio.set(effect, audio);
        });
    }

    private static createAudioElement(basePath: string, config: { volume?: number; loop?: boolean, formats?: string[] } = {}): HTMLAudioElement {
        const audio = new Audio();
        const formats = config.formats || ['mp3', 'ogg'];

        formats.forEach(ext => {
            const source = document.createElement('source');
            source.src = `${basePath}.${ext}`;
            
            // Mapping des types MIME
            let type = `audio/${ext}`;
            if (ext === 'mp3') type = 'audio/mpeg';
            if (ext === 'aac') type = 'audio/aac';
            
            source.type = type;
            audio.appendChild(source);
        });

        audio.volume = config.volume ?? this.masterVolume;
        audio.loop = config.loop ?? false;
        audio.muted = this.isMuted;
        audio.preload = 'auto';
        
        // Charger explicitement pour prendre en compte les sources
        audio.load();

        return audio;
    }

    /**
     * Tente de débloquer l'audio après une interaction utilisateur.
     * Utile pour contourner les politiques d'autoplay des navigateurs.
     */
    public static async resumeContext(): Promise<void> {
        if (this.isMuted) return;
        
        if (this.bgMusic && this.bgMusic.paused) {
            try {
                await this.bgMusic.play();
            } catch (err) {
                console.warn("Échec de reprise de la musique de fond:", err);
            }
        }
    }

    public static playEffect(effect: SoundEffect): void {
        if (this.isMuted) return;
        const audio = this.effectsAudio.get(effect);
        if (!audio) return;
        
        // Cloner le nœud pour permettre de jouer le même son plusieurs fois en simultané
        const playInstance = audio.cloneNode(true) as HTMLAudioElement;
        playInstance.volume = audio.volume;
        playInstance.muted = audio.muted;
        playInstance.play().catch(() => {
            // Ignorer les erreurs d'autoplay
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