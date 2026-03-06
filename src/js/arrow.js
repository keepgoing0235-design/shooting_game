import { CONFIG } from "./config.js";

const ARROW_LENGTH = 30;

export class Arrow {
  constructor(position, velocity) {
    this.position = { ...position };
    this.velocity = { ...velocity };
    this.rotation = Math.atan2(velocity.y, velocity.x);
    this.isActive = true;
    this.timeAlive = 0;
    this.trail = [];
    this.hitScore = 0;
  }

  update(dt, windAccel) {
    if (!this.isActive) {
      return;
    }

    this.timeAlive += dt;
    this.velocity.x += windAccel * dt;
    this.velocity.y += CONFIG.gravity * dt;

    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
    this.rotation = Math.atan2(this.velocity.y, this.velocity.x);

    this.trail.push({ x: this.position.x, y: this.position.y, age: 0 });
    for (const p of this.trail) {
      p.age += dt;
    }
    this.trail = this.trail.filter((p) => p.age <= CONFIG.trailDurationSeconds);
  }

  get tipPosition() {
    return {
      x: this.position.x + Math.cos(this.rotation) * (ARROW_LENGTH * 0.5),
      y: this.position.y + Math.sin(this.rotation) * (ARROW_LENGTH * 0.5)
    };
  }
}

export function arrowLength() {
  return ARROW_LENGTH;
}