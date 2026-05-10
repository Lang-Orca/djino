import { component } from "../component";
import { storageKeys, StorageService } from "../services/storage";
import { SoundService } from "../services/sound";
import { DinoEngine } from "../services/game/DinoEngine";
import { DinoAnimator } from "../services/game/DinoAnimator";


export class Game extends component{
    private name : string = StorageService.get(storageKeys.playerName) || "Guest";
    private engine: DinoEngine;
    private animator: DinoAnimator | null = null;

    private groundX : number = 0;
    private canvasWidth : number = 800;
    private canvasHeight : number = 800;
    private groundImage : HTMLImageElement = new Image();

    constructor(name : string, private onHome : ()=> void){
        super("div", "game-page-wrapper");
        this.name = name;
        this.engine = new DinoEngine(this.canvasWidth, this.canvasHeight);
        this.groundImage.src = "src/assets/decor/ground.svg";
        
        // Démarrer le jeu immédiatement
        this.engine.gsm.startGame();
    }

    private updateGround(): void {
        if (!this.engine.gsm.isPlaying()) return;

        const speed = this.engine.obstacles.getCurrentSpeed();
        const groundTileWidth = 200; // Largeur d'une tuile de sol
        
        this.groundX -= speed;
        if (this.groundX <= -groundTileWidth) {
            this.groundX = 0;
        }
    }


    public render(): HTMLElement {
        this.setContent(`
            <div class="game-page">
                <div class="game-ui" style="display: flex; justify-content: space-between; padding: 20px; align-items: center;">
                    <button id="return_to_home" class="btn btn-outline">RETOUR</button>
                    <div class="game-stats" style="font-weight: bold; font-size: 1.2rem;">
                        <span style="margin-right: 20px;">Joueur : ${this.name}</span>
                        <span id="game-score">Score : 0</span>
                    </div>
                </div>
                <div class="flex game-container" style="display: flex; justify-content: center; align-items: center; ">
                  <canvas id="game-canvas"></canvas>
                </div>
            </div>
        `)

        const scoreEl = this.element.querySelector('#game-score');

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === ' ' || event.key === 'ArrowUp' || event.key === 'Spacebar') {
                this.engine.jump();
            }
        };

        document.addEventListener('keydown', onKeyDown);

        this.element.querySelector('#return_to_home')!.addEventListener('click', () => {
            SoundService.stopBackground();
            document.removeEventListener('keydown', onKeyDown);
            this.onHome();
        })

        const canvas = this.element.querySelector('#game-canvas') as HTMLCanvasElement;
        
        if (canvas) {
            const ctx = canvas.getContext('2d');
            canvas.width = this.canvasWidth;
            canvas.height = this.canvasHeight;

            if (ctx) {
                this.animator = new DinoAnimator(ctx);
                let animationId: number;
                let lastTime = 0;

                const animate = (time: number) => {
                    const deltaTime = time - lastTime;
                    lastTime = time;

                    // Mise à jour logique
                    this.engine.update();
                    this.updateGround();
                    
                    // Rendu
                    if (this.animator) {
                        this.animator.render(this.engine, this.groundX, this.groundImage);
                    }
                    
                    if (scoreEl) scoreEl.textContent = `Score : ${this.engine.score}`;
                    
                    animationId = requestAnimationFrame(animate);
                };

                // Attendre un peu pour le chargement des assets ou démarrer direct
                requestAnimationFrame(animate);

                this.element.querySelector('#return_to_home')!.addEventListener('click', () => {
                    cancelAnimationFrame(animationId);
                });
            }
        }

        return this.element
    }
}
