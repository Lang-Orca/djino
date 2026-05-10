/**
 * Types d'obstacles disponibles dans le jeu.
 */
export enum ObstacleType {
    CACTUS_SMALL  = 'CACTUS_SMALL',
    CACTUS_LARGE  = 'CACTUS_LARGE',
    CACTUS_GROUP  = 'CACTUS_GROUP',
    BIRD          = 'BIRD',
}

/**
 * Représente un obstacle avec sa position et ses dimensions.
 */
export interface Obstacle {
    id: number;
    type: ObstacleType;
    x: number;
    y: number;
    width: number;
    height: number;
}
