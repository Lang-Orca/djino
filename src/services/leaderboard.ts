/**
 * Service pour gérer le leaderboard du jeu Djino
 */

import { storageKeys, StorageService } from "./storage";

export interface LeaderboardEntry {
    name: string;
    score: number;
}

export class LeaderboardService {
    /**
     * Récupère le leaderboard actuel depuis le stockage
     */
    public static getLeaderboard(): LeaderboardEntry[] {
        const data = StorageService.get(storageKeys.leadBoard);
        return Array.isArray(data) ? data : [];
    }

    /**
     * Ajoute un nouveau score au leaderboard
     * @param name Nom du joueur
     * @param score Score obtenu
     */
    public static addScore(name: string, score: number): void {
        const leaderboard = this.getLeaderboard();

        // Ajouter la nouvelle entrée
        leaderboard.push({ name, score });

        // Trier par score décroissant
        leaderboard.sort((a, b) => b.score - a.score);

        // Garder seulement les 10 meilleurs scores (optionnel)
        const topScores = leaderboard.slice(0, 10);

        // Sauvegarder
        StorageService.save(storageKeys.leadBoard, topScores);
    }

    /**
     * Réinitialise le leaderboard
     */
    public static resetLeaderboard(): void {
        StorageService.save(storageKeys.leadBoard, []);
    }
}