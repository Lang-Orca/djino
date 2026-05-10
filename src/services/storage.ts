/**
 * c'est ici que le local storage seras configuré pour enregistrer tout ce qui se feras dans le site et toutes les donnes des differents services 
 */



export const storageKeys = Object.freeze({
    weather: 'weather',
    theme : "theme",
    playerName : 'player_name',
    current_page : 'current_page',
    leadBoard : 'leadBoard',
    sound_muted: 'sound_muted',
    sound_volume: 'sound_volume',
})



export class StorageService{
    
    public static save(key: string, data: any): void {
        localStorage.setItem(key, JSON.stringify(data));
    }


    public static get(key: string): any | null {
        return JSON.parse(localStorage.getItem(key) || 'null');
    }


    public static remove(key: string): void {
        localStorage.removeItem(key);
    }


    public static clear(): void {
        localStorage.clear();
    }
}