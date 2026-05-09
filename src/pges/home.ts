import { component } from "../component";
import heroImg from "../assets/hero.png";
import { storageKeys, StorageService } from "../services/storage";

export class home extends component {

    private weather = StorageService.get(storageKeys.weather) 



    constructor() {
        super("div", "game-menu-container");
    }

    render(): HTMLElement {
        this.setContent(`
        <header class="game-header">
            <nav class="navbar container">
                <a href="#" class="navbar-brand">DJINO</a>

                <div class="weather-info">
                ${this.weather ? `${this.weather.temp}°C ${this.weather.isRaining ? '🌧️' : '☀️'}` : 'Météo indisponible'}
                </div>
                <button class="btn btn-outline" style="padding: 0.5rem 1rem; font-size: 0.8rem;">CONNEXION</button>
            </nav>
        </header>
        
        <main class="game-hero container">
            <div class="hero-character-container">
                <div class="character-glow"></div>
                <img src="${heroImg}" alt="Djino" class="hero-character">
            </div>
            
            <div class="menu-content">
                <span class="hero-tag">Saison 1 : tu vas trop wanda petit frere</span>
                <h1 class="game-logo">DJINO<span>ADVENTURE</span></h1>
                <p class="text-p">
                    Embarquez dans une course infinie à travers des paysages changeants. 
                    Maîtrisez les éléments, défiez vos amis et grimpez au sommet du classement 
                    dans ce jeu synchronisé avec votre climat réel.
                </p>
                
                <div class="menu-actions">
                    <button class="btn btn-primary btn-glow" id="start-game">COMMENCER L'AVENTURE</button>
                    <button class="btn btn-outline" id="view-leaderboard">CLASSEMENT</button>
                </div>
            </div>
        </main>

        <footer class="game-footer">
            <div class="footer-stats container">
                <div class="stat-item">
                    <span class="stat-label">METEO LOCALE</span>
                    <span class="stat-value" id="current-weather">
                        ${this.weather ? `${this.weather.temp}°C ${this.weather.isRaining ? 'Pluie' : 'Dégagé'}` : 'Chargement...'}
                    </span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">plus haut score </span>
                    <span class="stat-value">998,420</span>
                </div>
            </div>
        </footer>
        `);
        


        return this.element;
    }
}
