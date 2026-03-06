import { CONFIG } from "./config.js";

export class TargetBoard {
  constructor(getCanvasSize) {
    this.getCanvasSize = getCanvasSize;
  }

  get center() {
    const { width, height } = this.getCanvasSize();
    return {
      x: width - CONFIG.arenaPadding.right,
      y: height * 0.45
    };
  }

  get radius() {
    return CONFIG.target.radius;
  }

  scoreAtPoint(point) {
    const c = this.center;
    const dx = point.x - c.x;
    const dy = point.y - c.y;
    const dist = Math.hypot(dx, dy);

    if (dist > this.radius) {
      return 0;
    }

    const ringWidth = this.radius / CONFIG.target.rings.length;
    const ringIndex = Math.min(
      CONFIG.target.rings.length - 1,
      Math.floor(dist / ringWidth)
    );

    return CONFIG.target.rings[ringIndex];
  }

  intersectsArrow(arrow) {
    const c = this.center;
    const xDelta = Math.abs(arrow.position.x - c.x);
    if (xDelta > CONFIG.target.boardThickness * 0.5) {
      return false;
    }

    const yDelta = arrow.position.y - c.y;
    return Math.abs(yDelta) <= this.radius;
  }
}