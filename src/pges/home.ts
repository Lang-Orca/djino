import { component } from "../component";
import heroImg from "../assets/hero.png";
import { storageKeys, StorageService } from "../services/storage";
import { SoundService } from "../services/sound";

export class home extends component {

    private weather = StorageService.get(storageKeys.weather)

    constructor(private onplay : ( name : string) => void,private onLeadboard : () => void) {
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
                <div class="flex" style="gap: 10px; align-items: center;" id="player_name_container">
                    <span class="player_name" id="player_name">${StorageService.get(storageKeys.playerName) || 'Guest'}</span>
                    <button id="change_player_name" class="btn btn-outline" style="padding: 0.5rem 1rem; font-size: 0.8rem;">Changer le nom</button>
                    <div class="sound-controls" style="display: flex; gap: 10px; align-items: center;">
                        <button id="sound-toggle" class="btn btn-outline" style="padding: 0.5rem 0.8rem; font-size: 0.8rem;">${SoundService.isSoundMuted() ? '🔇' : '🔊'}</button>
                        <input type="range" id="volume-control" min="0" max="100" value="${Math.round(SoundService.getVolume() * 100)}" class="volume-slider">
                    </div>
                </div>
                <div class="" id="change_name-section" style="display: none;">
                    <input type="text" id="player_name_input" placeholder="Entrer votre nom">
                    <button id="save_player_name" class="btn btn-outline" style="padding: 0.5rem 1rem; font-size: 0.8rem;">Enregistrer</button>
                    <button id="cancel_player_name" class="btn btn-outline" style="padding: 0.5rem 1rem; font-size: 0.8rem;">Annuler</button>
                </div>

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
        // ouvrir la page pour le jeux
        this.element.querySelector('#start-game')!.addEventListener('click', () => {
            this.onplay('Djino');
        });

        // changer le nom du joueur
        this.element.querySelector('#change_player_name')!.addEventListener('click', () => {
            this.element.querySelector<HTMLElement>('#change_name-section')!.style.display = 'flex';
            this.element.querySelector<HTMLElement>('#player_name_container')!.style.display = 'none';
        });

        this.element.querySelector('#save_player_name')!.addEventListener('click', () => {
            const name = this.element.querySelector<HTMLInputElement>('#player_name_input')!.value;
            StorageService.save(storageKeys.playerName, name);
            this.element.querySelector<HTMLElement>('#player_name')!.textContent = name;
            this.element.querySelector<HTMLElement>('#change_name-section')!.style.display = 'none';
            this.element.querySelector<HTMLElement>('#player_name_container')!.style.display = 'flex';
        });

        this.element.querySelector('#cancel_player_name')!.addEventListener('click', () => {
            this.element.querySelector<HTMLElement>('#change_name-section')!.style.display = 'none';
            this.element.querySelector<HTMLElement>('#player_name_container')!.style.display = 'flex';
        });

        // afficher  le classement

        this.element.querySelector('#view-leaderboard')!.addEventListener('click', () => {
            this.onLeadboard();
        });

        this.element.querySelector('#sound-toggle')!.addEventListener('click', () => {
            const isMuted = SoundService.isSoundMuted();
            SoundService.setMuted(!isMuted);
            const btn = this.element.querySelector('#sound-toggle') as HTMLButtonElement;
            btn.textContent = isMuted ? '🔊' : '🔇';
        });

        this.element.querySelector('#volume-control')!.addEventListener('input', (e) => {
            const value = (e.target as HTMLInputElement).value;
            SoundService.setVolume(parseInt(value, 10) / 100);
        });

        return this.element;
    }
}