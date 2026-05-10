import { component } from "../component";
import { LeaderboardService } from "../services/leaderboard";
import "../style.css"; // <--- TRÈS IMPORTANT : Ajoute l'import du CSS ici

export class leadboard extends component {

    private parsedLeadBoard: {name : string, score : number}[] = []

    constructor(private onHome : () => void) {
        // On garde "div" mais on peut ajouter une classe de base si nécessaire
        super("div", "leaderboard-page"); 
        this.parsedLeadBoard = LeaderboardService.getLeaderboard();
    }

    render(): HTMLElement {
        // On utilise ici les classes CSS (leaderboard-container, leaderboard-title, etc.)
        this.setContent(`
            <div class="leaderboard-container">
                <h1 class="leaderboard-title">CLASSEMENT</h1>
                
                <div class="score-list">
                    ${this.parsedLeadBoard.length > 0 ? 
                        this.parsedLeadBoard.map((player, index) => `
                            <div class="score-item">
                                <span class="score-rank">#${index + 1}</span>
                                <span class="score-name">${player.name}</span>
                                <span class="score-value">${player.score.toLocaleString()}</span>
                            </div>
                        `).join('') : 
                        '<p class="no-score">Aucun score enregistré</p>'
                    }
                </div>

                <div class="leaderboard-actions">
                    <button id="home_btn" class="btn btn-outline">Page d'accueil</button>
                    <button id="reset_btn" class="btn btn-primary">Réinitialiser</button>
                </div>
            </div>
        `);

        this.element.querySelector('#home_btn')?.addEventListener('click', () => {
            this.onHome();
        });

        this.element.querySelector('#reset_btn')?.addEventListener('click', () => {
            if (confirm('Êtes-vous sûr de vouloir réinitialiser le leaderboard ?')) {
                LeaderboardService.resetLeaderboard();
                this.parsedLeadBoard = [];
                // Attention : si render() recrée l'élément, assure-toi que l'affichage se met à jour
                this.render(); 
            }
        });

        return this.element;
    }
}