import { DinoAction } from "../dino_actions";
import { DinoEngine } from "./DinoEngine";
import { ObstacleType, type Obstacle } from "./Obstacle";

/**
 * Gère le rendu visuel du jeu (Dino, Obstacles, Décors).
 * Sépare la logique du moteur de l'affichage Canvas.
 */
export class DinoAnimator {
    private ctx: CanvasRenderingContext2D;
    private sprites: Map<string, HTMLImageElement> = new Map();
    private isLoaded: boolean = false;

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.loadAssets();
    }

    /**
     * Charge toutes les images nécessaires au jeu.
     */
    private async loadAssets() {
        const promises: Promise<void>[] = [];

        // 1. Sprites du Dino (Run, Jump, Dead, etc.)
        const actions = Object.values(DinoAction);
        const frameCounts: Record<string, number> = {
            'Idle': 10, 'Run': 8, 'Jump': 12, 'Walk': 10, 'Dead': 8
        };

        actions.forEach(action => {
            for (let i = 1; i <= frameCounts[action]; i++) {
                promises.push(this.loadImage(`dino_${action}_${i}`, `src/assets/png/${action} (${i}).png`));
            }
        });

        // 2. Obstacles (SVG ou PNG)
        // Note: Dans ce projet, on semble utiliser des rectangles ou des images spécifiques
        // Pour l'instant on va charger des placeholders ou des formes géométriques si images manquantes

        await Promise.all(promises);
        this.isLoaded = true;
    }

    private loadImage(key: string, src: string): Promise<void> {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                this.sprites.set(key, img);
                resolve();
            };
            img.onerror = () => {
                console.warn(`Échec chargement asset: ${src}`);
                resolve(); // On continue même si un asset manque
            };
        });
    }

    /**
     * Dessine une frame complète du jeu.
     */
    public render(engine: DinoEngine, groundX: number, groundImage: HTMLImageElement | null) {
        if (!this.isLoaded) return;

        this.clear();
        this.drawBackground();
        
        if (groundImage) {
            this.drawGround(groundX, groundImage);
        }

        this.drawObstacles(engine.obstacles.getObstacles());
        this.drawDino(engine.dino);
    }

    private drawGround(groundX: number, groundImage: HTMLImageElement) {
        const groundHeight = 200;
        const groundWidth = 200;
        const groundY = this.ctx.canvas.height - 120; // Correspond au 15% de PhysicsEngine (800 * 0.15 = 120)
        
        // On dessine le sol à partir de groundY
        // Note: Si groundHeight est 200, il dépassera vers le bas
        for (let i = 0; i <= (this.ctx.canvas.width / groundWidth) + 1; i++) {
            this.ctx.drawImage(
                groundImage, 
                groundX + (i * groundWidth), 
                groundY, 
                groundWidth, 
                groundHeight
            );
        }
    }

    private clear() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    private drawBackground() {
        // Fond ciel (dégradé ou couleur)
        this.ctx.fillStyle = 'rgba(168, 85, 247, 0.05)';
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    private drawDino(dino: any) {
        const spriteKey = `dino_${dino.action}_${dino.frame}`;
        const img = this.sprites.get(spriteKey);

        if (img) {
            // Dessiner le sprite (on ajuste la taille visuelle car les PNG sont souvent grands)
            const displayWidth = 100;
            const displayHeight = 100;
            
            // On centre le sprite par rapport à la position logique (hitbox)
            this.ctx.drawImage(
                img, 
                dino.x - 25, 
                dino.y - 40, 
                displayWidth, 
                displayHeight
            );
        } else {
            // Fallback: rectangle coloré
            this.ctx.fillStyle = '#4f46e5';
            this.ctx.fillRect(dino.x, dino.y, 50, 60);
        }
    }

    private drawObstacles(obstacles: Obstacle[]) {
        obstacles.forEach(obs => {
            this.ctx.fillStyle = this.getObstacleColor(obs.type);
            this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            
            // Bordure stylisée
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
        });
    }

    private getObstacleColor(type: ObstacleType): string {
        switch (type) {
            case ObstacleType.CACTUS_SMALL: return '#10b981';
            case ObstacleType.CACTUS_LARGE: return '#059669';
            case ObstacleType.CACTUS_GROUP: return '#064e3b';
            case ObstacleType.BIRD:         return '#f59e0b';
            default:                        return '#374151';
        }
    }
}
