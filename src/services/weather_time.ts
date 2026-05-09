/**
 * ici ce sont les services qui retournent la metheo  et l'heure pour definir le climat dans le jeux et le temp
 */

import { storageKeys, StorageService } from "./storage";

/**
 * Service pour récupérer les données météo via l'API Fetch.
 */
export interface WeatherData {
    isRaining: boolean;
    temp: number;
    weatherCode: number;
}

export class WeatherService {



    

    private static getUserCoordinates(): Promise<{ lat: number; lon: number }> {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("La géolocalisation n'est pas supportée par ce navigateur."));
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                },
                (error) => {
                    reject(error);
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        });
    }



    static async getCurrentWeather(): Promise<WeatherData> {
        try {
            // Utilisation de Open-Meteo (Gratuit, pas besoin de clé API)
            // Coordonnées pour Paris (48.8566, 2.3522)
            const {lat, lon} = await this.getUserCoordinates();
            const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
            const data = await response.json();

            const weatherCode = data.current_weather.weathercode;
            // Codes météo Open-Meteo : 51, 53, 55 (bruine), 61, 63, 65 (pluie), 80, 81, 82 (averses)
            const isRaining = [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode);

            const weather:WeatherData = {
                isRaining: isRaining,
                temp: data.current_weather.temperature,
                weatherCode: weatherCode
            };

            StorageService.save( storageKeys.weather, weather);
            return weather;
        } catch (error) {
            console.error("Erreur météo:", error);
            const weather:WeatherData = {
                isRaining: true,
                temp: 20,
                weatherCode: 63
            };

            StorageService.save( storageKeys.weather, weather);
            return weather;
        }
    }

}

