import { CONFIG } from "./config.js";
import { randomRange } from "./utils.js";

export class WindSystem {
  constructor() {
    this.currentAccel = 0;
    this.timeUntilShift = 0;
    this.shiftNow();
  }

  update(dt) {
    this.timeUntilShift -= dt;
    if (this.timeUntilShift <= 0) {
      this.shiftNow();
    }
  }

  shiftNow() {
    this.currentAccel = randomRange(CONFIG.wind.minAccel, CONFIG.wind.maxAccel);
    this.timeUntilShift = randomRange(CONFIG.wind.minDuration, CONFIG.wind.maxDuration);
  }
}