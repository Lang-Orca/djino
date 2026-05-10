/**ici on doit definir les actions du dinosaure et les assets qui seront retourné au fur et à mesure .  */


export enum DinoAction {
    IDLE = 'Idle',
    RUN = 'Run',
    JUMP = 'Jump',
    WALK = 'Walk',
    DEAD = 'Dead'
}

export class Dinosaure {
    private currentAction: DinoAction = DinoAction.IDLE;

    public get action(): DinoAction {
        return this.currentAction;
    }
    public x : number = 100;
    public y : number = 0;

    public frame :  number = 1;

    private  frameCount : Record<DinoAction, number> = {
        [DinoAction.IDLE]: 10,
        [DinoAction.RUN]: 8,
        [DinoAction.JUMP]: 12,
        [DinoAction.WALK]: 10,
        [DinoAction.DEAD]: 8
    };

    private frameTimer : number = 0;
    private frameInterval : number = 100;

    constructor(){
    }

    public update(deltaTime : number){
        this.frameTimer += deltaTime;
        if(this.frameTimer >= this.frameInterval){
            const maxFrames = this.frameCount[this.currentAction];
            
            // Si c'est l'animation de mort, on s'arrête à la dernière frame
            if (this.currentAction === DinoAction.DEAD && this.frame >= maxFrames) {
                return;
            }

            this.frame = (this.frame % maxFrames) + 1;
            this.frameTimer = 0;
        }
    }

    public setAction(action : DinoAction){
        if(this.currentAction !== action){
            this.currentAction = action;
            this.frame = 1;
            this.frameTimer = 0;
        }
    }

}