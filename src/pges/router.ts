/**
 * c'est ici que l'affichage conditionnels des pages seras geré
 */

import type { component } from "../component";


export class Router {

    private container: HTMLElement;

    constructor(containerId: string) {
        this.container = document.getElementById(containerId) || document.body;

        console.log(this.container);
        
    }

    public navigate(page: component): void{
        this.container.innerHTML = '';
        this.container.appendChild(page.render());
    }

    
}
