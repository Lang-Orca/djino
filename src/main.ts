import type { component } from "./component";
import { home } from "./pges/home";
import { Router } from "./pges/router";
import { WeatherService } from "./services/weather_time";
import { RainManager } from "./rain";
import { storageKeys, StorageService } from "./services/storage";
import { SoundService } from "./services/sound";
class App {

    private router!: Router
    private rain: RainManager
    
    constructor() {
      this.rain = new RainManager();
      this.init()
    }

    private async init() {
      SoundService.init();
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
      
      this.setpage(new home())
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
      
}

new App();