/**
 * Service gérant les mécaniques de jeu : score, vitesse et difficulté
 */
export class GameMecanic {
    private _score: number = 0;
    private _baseSpeed: number = 4;
    private _speedIncrement: number = 1;
    private _milestone: number = 200;
    private _lastSpeedUpdateScore: number = 0;

    constructor(initialSpeed: number = 4) {
        this._baseSpeed = initialSpeed;
    }

    /**
     * Met à jour le score et augmente la vitesse si nécessaire
     * @param points Points à ajouter
     * @returns La nouvelle vitesse
     */
    public updateScore(points: number): number {
        this._score += points;

        // Calcul du nombre de paliers de 200 franchis
        const currentMilestones = Math.floor(this._score / this._milestone);
        const lastMilestones = Math.floor(this._lastSpeedUpdateScore / this._milestone);

        if (currentMilestones > lastMilestones) {
            this._baseSpeed += this._speedIncrement;
            this._lastSpeedUpdateScore = this._score;
            console.log(`Difficulté augmentée ! Nouvelle vitesse : ${this._baseSpeed}`);
        }

        return this._baseSpeed;
    }

    public get score(): number {
        return Math.floor(this._score);
    }

    public get currentSpeed(): number {
        return this._baseSpeed;
    }

    public reset(): void {
        this._score = 0;
        this._baseSpeed = 4;
        this._lastSpeedUpdateScore = 0;
    }
}