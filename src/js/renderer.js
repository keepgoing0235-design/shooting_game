import { arrowLength } from "./arrow.js";
import { CONFIG } from "./config.js";

export function drawScene(ctx, state) {
  const { width, height } = state.canvasSize;
  drawBackground(ctx, width, height);
  drawGround(ctx, width, height);
  drawBow(ctx, state.bow, state.mouse, state.isCharging, state.currentPower);
  drawTarget(ctx, state.target);

  for (const arrow of state.arrows) {
    drawTrail(ctx, arrow.trail);
  }

  for (const arrow of state.arrows) {
    drawArrow(ctx, arrow.position, arrow.rotation);
  }
}

function drawBackground(ctx, width, height) {
  const g = ctx.createLinearGradient(0, 0, 0, height);
  g.addColorStop(0, "#0f172a");
  g.addColorStop(1, "#020617");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);
}

function drawGround(ctx, width, height) {
  ctx.fillStyle = "#14532d";
  ctx.fillRect(0, height - CONFIG.arenaPadding.bottom + 30, width, height);
}

function drawBow(ctx, bow, mouse, isCharging, power) {
  const angle = Math.atan2(mouse.y - bow.y, mouse.x - bow.x);
  const bowRadius = 56;

  ctx.save();
  ctx.translate(bow.x, bow.y);

  ctx.strokeStyle = "#f59e0b";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(0, 0, bowRadius, -1.25, 1.25);
  ctx.stroke();

  const stringPull = isCharging ? 14 + power * 32 : 10;
  const pullX = Math.cos(angle) * stringPull;
  const pullY = Math.sin(angle) * stringPull;

  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(Math.cos(-1.25) * bowRadius, Math.sin(-1.25) * bowRadius);
  ctx.lineTo(pullX, pullY);
  ctx.lineTo(Math.cos(1.25) * bowRadius, Math.sin(1.25) * bowRadius);
  ctx.stroke();

  ctx.restore();
}

function drawTarget(ctx, target) {
  const center = target.center;
  const rings = ["#f8fafc", "#ef4444", "#f8fafc", "#2563eb", "#fbbf24"];
  const ringWidth = target.radius / rings.length;

  for (let i = rings.length - 1; i >= 0; i -= 1) {
    ctx.beginPath();
    ctx.fillStyle = rings[i];
    ctx.arc(center.x, center.y, ringWidth * (i + 1), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = "#713f12";
  ctx.lineWidth = 8;
  ctx.strokeRect(
    center.x - CONFIG.target.boardThickness * 0.5,
    center.y - target.radius,
    CONFIG.target.boardThickness,
    target.radius * 2
  );
}

function drawArrow(ctx, position, angle) {
  const length = arrowLength();

  ctx.save();
  ctx.translate(position.x, position.y);
  ctx.rotate(angle);

  ctx.strokeStyle = "#f8fafc";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-length * 0.45, 0);
  ctx.lineTo(length * 0.5, 0);
  ctx.stroke();

  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.moveTo(length * 0.5, 0);
  ctx.lineTo(length * 0.36, -4);
  ctx.lineTo(length * 0.36, 4);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#22d3ee";
  ctx.beginPath();
  ctx.moveTo(-length * 0.45, 0);
  ctx.lineTo(-length * 0.56, -6);
  ctx.lineTo(-length * 0.56, 6);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawTrail(ctx, trail) {
  for (const p of trail) {
    const alpha = 1 - p.age / CONFIG.trailDurationSeconds;
    ctx.fillStyle = `rgba(125, 211, 252, ${Math.max(0, alpha * 0.35)})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}