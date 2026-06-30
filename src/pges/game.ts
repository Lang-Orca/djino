import { component } from "../component";
import { SoundService } from "../services/sound";
import { DinoEngine } from "../services/game/DinoEngine";
import { DinoAnimator } from "../services/game/DinoAnimator";
import { GameState } from "../services/game/GameStateManager";
import { LeaderboardService } from "../services/leaderboard";


export class Game extends component{
    private name : string;
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

                <!-- Game Over Modal -->
                <div id="game-over-modal" class="modal-overlay">
                    <div class="modal-content">
                        <h2 class="modal-title">Partie Terminée</h2>
                        <div class="modal-score-container">
                            <span class="modal-score-label">Votre Score</span>
                            <span id="final-score" class="modal-score-value">0</span>
                        </div>
                        <div class="modal-actions">
                            <button id="restart-btn" class="btn btn-primary modal-btn">RECOMMENCER</button>
                            <button id="modal-home-btn" class="btn btn-outline modal-btn">MENU PRINCIPAL</button>
                        </div>
                    </div>
                </div>
            </div>
        `)

        const scoreEl = this.element.querySelector('#game-score');
        const modal = this.element.querySelector('#game-over-modal') as HTMLElement;
        const finalScoreEl = this.element.querySelector('#final-score');
        const restartBtn = this.element.querySelector('#restart-btn');
        const modalHomeBtn = this.element.querySelector('#modal-home-btn');

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === ' ' || event.key === 'ArrowUp' || event.key === 'Spacebar') {
                this.engine.jump();
            }
        };

        document.addEventListener('keydown', onKeyDown);

        const cleanup = () => {
            SoundService.stopBackground();
            document.removeEventListener('keydown', onKeyDown);
            unsubscribe();
        };

        this.element.querySelector('#return_to_home')!.addEventListener('click', () => {
            cleanup();
            this.onHome();
        });

        modalHomeBtn?.addEventListener('click', () => {
            cleanup();
            this.onHome();
        });

        restartBtn?.addEventListener('click', () => {
            modal.classList.remove('active');
            this.engine.restart();
        });

        // Écouter les changements d'état du jeu
        const unsubscribe = this.engine.gsm.onStateChange((newState) => {
            if (newState === GameState.GAME_OVER) {
                const score = this.engine.score;
                
                // Sauvegarder le score dans le leaderboard
                LeaderboardService.addScore(this.name, score);
                
                // Afficher le modal
                if (finalScoreEl) finalScoreEl.textContent = score.toString();
                modal.classList.add('active');
            }
        });

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

                modalHomeBtn?.addEventListener('click', () => {
                    cancelAnimationFrame(animationId);
                });
            }
        }

        return this.element
    }
}
