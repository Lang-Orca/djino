/**
 * c'est ici la page meme dedié au jeux et ses etats
 */

import { component } from "../component";
import { storageKeys, StorageService } from "../services/storage";


export class Game extends component{
    private name : string = StorageService.get(storageKeys.playerName) || "Guest";

    constructor(name : string){
        super("div", "game page");
        this.name = name;

    }

    public render(): HTMLElement {
        this.setContent(`
            <div>
                <h1> ${this.name}</h1>
            </div>
            
            `)

            return this.element
    }
    
}