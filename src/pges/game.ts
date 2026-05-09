/**
 * c'est ici la page meme dedié au jeux et ses etats
 */

import { component } from "../component";
import { storageKeys, StorageService } from "../services/storage";


export class Game extends component{
    private name : string = StorageService.get(storageKeys.playerName) || "Guest";


    constructor(name : string, private onHome : ()=> void){
        super("div", "game page");
        this.name = name;
    }

    public render(): HTMLElement {
        this.setContent(`
           
            <div class="game-page">
                <button id="return_to_home">BACK </button>
                <h1> ${this.name}</h1>
                
            </div>
            
            `)

        this.element.querySelector('#return_to_home')!.addEventListener('click', () => {
            this.onHome()
        })

            return this.element
    }
    
}