/**
 * c'est cette pge qui va afficher le leadboard et ses donnes 
 */

import { component } from "../component";
import { LeaderboardService } from "../services/leaderboard";


export class leadboard extends component{

    private parsedLeadBoard: {name : string, score : number}[] = []


    constructor(private onHome : () => void) {
        super("div", "leadboard");
        this.parsedLeadBoard = LeaderboardService.getLeaderboard();
    }

    render(): HTMLElement {
        
        this.setContent(`
            <button id="home_btn">page d'accueil</button>
            <button id="reset_btn">Réinitialiser le leaderboard</button>
            ${this.parsedLeadBoard.length > 0 ? 
                this.parsedLeadBoard.map((player, index) => `
                    <div class="leaderboard-entry">
                        <span class="rank">#${index + 1}</span>
                        <span class="name">${player.name}</span>
                        <span class="score">${player.score}</span>
                    </div>
                `).join('') : 
                '<p>Aucun score enregistré</p>'
            }
        `);

        this.element.querySelector('#home_btn')?.addEventListener('click', () => {
            this.onHome();
        });

        this.element.querySelector('#reset_btn')?.addEventListener('click', () => {
            if (confirm('Êtes-vous sûr de vouloir réinitialiser le leaderboard ?')) {
                LeaderboardService.resetLeaderboard();
                this.parsedLeadBoard = [];
                this.render(); // Re-render
            }
        });

        return this.element;
    }
}