/**
 * c'est cette pge qui va afficher le leadboard et ses donnes 
 */

import { component } from "../component";
import { storageKeys, StorageService } from "../services/storage";


export class leadboard extends component{

    private leadBoard  = StorageService.get(storageKeys.leadBoard)

    private parsedLeadBoard: {name : string, score : number}[] = []


    constructor(private onHome : () => void) {
        super("div", "leadboard");
        this.parsedLeadBoard = this.leadBoard ? JSON.parse(this.leadBoard) : [];
    }

    render(): HTMLElement {
        
        this.setContent(`
            <button id="home_btn">page d'accueil</button>
            ${this.parsedLeadBoard.map((player) => `
                <div>
                    <span>${player.name}</span>
                    <span>${player.score}</span>
                </div>
            `).join('')}
        `);

        this.element.querySelector('#home_btn')?.addEventListener('click', () => {
            this.onHome();
        });
        return this.element;
    }
}