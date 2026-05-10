/**
 * @file CollisionDetector.ts
 * @description Détection des collisions entre
 * le dinosaure et les obstacles.
 */

import type { DinoHitbox } from "./PhysicsEngine";
import type { Obstacle } from "./ObstacleManager";

export class CollisionDetector {

  /**
   * Vérifie si le dino touche un obstacle.
   */
  public checkCollision(
    dino: DinoHitbox,
    obstacles: Obstacle[]
  ): boolean {

    for (const obstacle of obstacles) {

      const isColliding =
        dino.x < obstacle.x + obstacle.width &&
        dino.x + dino.width > obstacle.x &&
        dino.y < obstacle.y + obstacle.height &&
        dino.y + dino.height > obstacle.y;

      if (isColliding) {

        console.log(
          `[CollisionDetector] Collision avec ${obstacle.type}`
        );

        return true;
      }
    }

    return false;
  }
}