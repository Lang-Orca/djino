import type { component } from "./component";
import { home } from "./pges/home";
import { Router } from "./pges/router";
import { WeatherService } from "./services/weather_time";
import { RainManager } from "./rain";
import { storageKeys, StorageService } from "./services/storage";
import { Game } from "./pges/game";
import { leadboard } from "./pges/leadboard";





class App {

    private router: Router
    private rain: RainManager
    private currentPage: string = StorageService.get(storageKeys.current_page) || "";
    
    constructor() {
      this.rain = new RainManager();
      this.init()
    }

    private async init() {
      this.router = new Router('app')
      this.applyTheme()
      
      // Assurer que le container app est en dessous de la pluie
      const appEl = document.getElementById('app');
      if(appEl) {
          appEl.style.position = 'relative';
          appEl.style.zIndex = '1';
      }

      await WeatherService.getCurrentWeather();
      const weather = StorageService.get(storageKeys.weather);
      if(weather) {
          this.rain.update(weather);
      }
  
      this.restore_page()

    }

    private restore_page(){
      console.log("restauration des donnes ");
      
      if(this.currentPage === "Game"){
        const savedName = StorageService.get(storageKeys.playerName)
        if(savedName){
          this.setGamePage(savedName)
        }else{
          this.setpageHome()
        }
      }else{
        this.setpageHome()
      }
    }

    private applyTheme() {
      const hour = new Date().getHours();
      const isDaytime = hour >= 6 && hour < 18;
      const theme = isDaytime ? 'light' : 'dark';
      // storing the  theme of the application
      StorageService.save(storageKeys.theme, theme);
      document.documentElement.setAttribute('data-theme', theme);
      console.log(`Theme appliqué : ${theme} (Heure: ${hour}h)`);
    }

    private setpageHome():void{
      console.log("affichage de la page d'accueil");
      
      const homepage = new home((name : string) => this.setGamePage(name), () => this.setLeadboardPage())
      this.router.navigate(homepage)
    }

    /**
     * la page du jeu 
     * ici on va charger les elements du jeux
     */
    private setGamePage(nom : string){
        this.router.navigate(new Game(nom, () => this.setpageHome()))
    }

    private setLeadboardPage(){
        this.router.navigate(new leadboard(() => this.setpageHome()))
    }
      
}

new App();