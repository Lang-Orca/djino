import { component } from "../component";
import { storageKeys, StorageService } from "../services/storage";
import { GameMecanic } from "../services/mecanic";
import { SoundService } from "../services/sound";


export class Game extends component{
    private name : string = StorageService.get(storageKeys.playerName) || "Guest";
    private mecanic: GameMecanic;

    private groundX : number = 0;
    private canvasWidth : number = 800
    private groundImage : HTMLImageElement = new Image()

    constructor(name : string, private onHome : ()=> void){
        super("div", "game-page-wrapper");
        this.name = name;
        this.mecanic = new GameMecanic(4);
        this.groundImage.src = "src/assets/decor/ground.svg"
    }

    private update(): void {
        const speed = this.mecanic.updateScore(0.1);
        const groundTileWidth = this.canvasWidth / 4; // 200px
        
        // Défilement du sol
        this.groundX -= speed;
        // On reset dès qu'on a parcouru une seule tuile
        if (this.groundX <= -groundTileWidth) {
            this.groundX = 0;
        }
    }

    private renderGround(ctx: CanvasRenderingContext2D): void {
        const groundHeight = 200;
        const repeatCount = 4;
        const groundWidth = this.canvasWidth / repeatCount; // 200px
        
        for (let y = 800 - groundHeight; y >= 0; y -= groundHeight) {
            if (y - groundHeight < 400) continue;

            // On dessine 5 fois (4 + 1 de sécurité) pour le défilement
            for (let i = 0; i <= repeatCount; i++) {
                ctx.drawImage(
                    this.groundImage, 
                    this.groundX + (i * groundWidth), 
                    y, 
                    groundWidth, 
                    groundHeight
                );
            }
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
                SoundService.playEffect('jump');
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
            canvas.width = 800;
            canvas.height = 800;

            if (ctx) {
                let animationId: number;

                const animate = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    
                    // Fond gris léger pour le ciel
                    ctx.fillStyle = 'rgba(168, 85, 247, 0.05)';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    this.update();
                    this.renderGround(ctx);
                    
                    if (scoreEl) scoreEl.textContent = `Score : ${this.mecanic.score}`;
                    
                    animationId = requestAnimationFrame(animate);
                };

                // On s'assure que l'image est chargée
                if (this.groundImage.complete) {
                    animate();
                } else {
                    this.groundImage.onload = () => animate();
                }

                // Nettoyage de l'animation si on quitte la page (via le bouton retour par exemple)
                this.element.querySelector('#return_to_home')!.addEventListener('click', () => {
                    cancelAnimationFrame(animationId);
                });
            }
        }

        return this.element
    }
}