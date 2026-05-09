/**
 * c'est ici que l'affichage conditionnels des pages seras geré
 */

import type { component } from "../component";
import { storageKeys, StorageService } from "../services/storage";


export class Router {

    private container: HTMLElement;

    constructor(containerId: string) {
        this.container = document.getElementById(containerId) || document.body;

        console.log(this.container);
        
    }

    public navigate(page: component): void{
        this.container.innerHTML = '';
        this.container.appendChild(page.render());
        StorageService.save(storageKeys.current_page, page.constructor.name);
    }

    
}
