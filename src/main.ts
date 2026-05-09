import type { component } from "./component";
import { home } from "./pges/home";
import { Router } from "./pges/router";
import { WeatherService } from "./services/weather_time";
import { RainManager } from "./rain";
import { storageKeys, StorageService } from "./services/storage";
import { Game } from "./pges/game";

class App {

    private router!: Router
    private rain: RainManager
    
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
      
      this.setpage(new home((name : string) => this.setGamePage(name)))
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

    private setpage(page : component):void{
      this.router.navigate(page)
    }

    /**
     * la page du jeu 
     * ici on va charger les elements du jeux
     */
    private setGamePage(nom : string){
        this.router.navigate(new Game(nom))
    }
      
}

new App();