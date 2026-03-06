import { Arrow } from "./arrow.js";
import { CONFIG } from "./config.js";
import { LogService } from "./logService.js";
import { drawScene } from "./renderer.js";
import { TargetBoard } from "./target.js";
import { clamp, formatSigned } from "./utils.js";
import { WindSystem } from "./wind.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreValue = document.getElementById("scoreValue");
const powerFill = document.getElementById("powerFill");
const powerLabel = document.getElementById("powerLabel");
const windLabel = document.getElementById("windLabel");
const windArrow = document.getElementById("windArrow");
const windTimer = document.getElementById("windTimer");
const playerName = document.getElementById("playerName");
const playerEmail = document.getElementById("playerEmail");
const startOverlay = document.getElementById("startOverlay");
const startForm = document.getElementById("startForm");
const usernameInput = document.getElementById("usernameInput");
const emailInput = document.getElementById("emailInput");
const startError = document.getElementById("startError");
const logSyncStatus = document.getElementById("logSyncStatus");
const logSyncMeta = document.getElementById("logSyncMeta");

const state = {
  canvasSize: { width: 1280, height: 720 },
  mouse: { x: 350, y: 360 },
  bow: { x: 130, y: 560 },
  arrows: [],
  score: 0,
  isCharging: false,
  chargeStartTs: 0,
  currentPower: 0,
  wind: new WindSystem(),
  target: null,
  player: {
    username: "",
    email: ""
  },
  isSessionStarted: false
};

state.target = new TargetBoard(() => state.canvasSize);
const logService = new LogService(() => state.player);

let previousTs = performance.now();
let logIntervalId = null;

function resizeCanvas() {
  const container = canvas.parentElement;
  const width = container.clientWidth - 4;
  const height = Math.round(width * (9 / 16));

  canvas.width = width;
  canvas.height = height;

  state.canvasSize.width = width;
  state.canvasSize.height = height;
  state.bow.x = CONFIG.arenaPadding.left;
  state.bow.y = height - CONFIG.arenaPadding.bottom;
}

function canvasPointFromEvent(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) / rect.width) * canvas.width,
    y: ((e.clientY - rect.top) / rect.height) * canvas.height
  };
}

function setMousePosition(e) {
  const p = canvasPointFromEvent(e);
  state.mouse.x = clamp(p.x, 0, canvas.width);
  state.mouse.y = clamp(p.y, 0, canvas.height);
}

function updatePowerUI() {
  const percent = Math.round(state.currentPower * 100);
  powerFill.style.width = `${percent}%`;
  powerLabel.textContent = `${percent}%`;
}

function updateWindUI() {
  const windAccel = state.wind.currentAccel;
  windLabel.textContent = `${formatSigned(windAccel)} px/s²`;
  windArrow.textContent = windAccel >= 0 ? "→" : "←";
  windTimer.textContent = `Next wind shift in ${Math.max(0, state.wind.timeUntilShift).toFixed(1)}s`;
}

function updateScoreUI() {
  scoreValue.textContent = String(state.score);
}

function updatePlayerUI() {
  playerName.textContent = state.player.username || "-";
  playerEmail.textContent = state.player.email || "-";
}

function updateLogSyncUI(status, meta) {
  logSyncStatus.textContent = status;
  if (meta) {
    logSyncMeta.textContent = meta;
  }
}

function addBehaviorLog(eventName, details = "") {
  if (!state.isSessionStarted) {
    return;
  }

  logService.add(eventName, details);
  updateLogSyncUI("Pending upload", `${logService.pendingCount} log item(s) queued`);
}

function startLogUploader() {
  if (logIntervalId !== null) {
    clearInterval(logIntervalId);
  }

  logIntervalId = setInterval(() => {
    flushLogs("auto");
  }, 60000);
}

async function flushLogs(trigger) {
  if (!state.isSessionStarted) {
    return;
  }

  if (logService.pendingCount === 0) {
    const last = logService.lastSyncAt
      ? `Last sync: ${logService.lastSyncAt.toLocaleTimeString()}`
      : "No logs yet";
    updateLogSyncUI("Up to date", last);
    return;
  }

  updateLogSyncUI("Uploading...", `${logService.pendingCount} log item(s) queued`);

  try {
    const result = await logService.flush();
    if (result.ok) {
      const when = logService.lastSyncAt
        ? logService.lastSyncAt.toLocaleTimeString()
        : "just now";
      updateLogSyncUI("Upload success", `Last sync: ${when}`);
      return;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    updateLogSyncUI("Upload failed", `${message} | Trigger: ${trigger}`);
    return;
  }

  updateLogSyncUI("Upload skipped", `${logService.pendingCount} log item(s) queued`);
}

function beginCharge(ts) {
  if (!state.isSessionStarted) {
    return;
  }

  state.isCharging = true;
  state.chargeStartTs = ts;
  addBehaviorLog("charge_start");
}

function releaseShot() {
  if (!state.isSessionStarted || !state.isCharging) {
    return;
  }

  state.isCharging = false;
  const aimAngle = Math.atan2(state.mouse.y - state.bow.y, state.mouse.x - state.bow.x);
  const clampedAngle = clamp(aimAngle, -1.45, 0.3);

  const speed =
    CONFIG.minLaunchSpeed +
    state.currentPower * (CONFIG.maxLaunchSpeed - CONFIG.minLaunchSpeed);

  const velocity = {
    x: Math.cos(clampedAngle) * speed,
    y: Math.sin(clampedAngle) * speed
  };

  state.arrows.push(new Arrow({ x: state.bow.x, y: state.bow.y }, velocity));
  addBehaviorLog("shot_release", `power=${state.currentPower.toFixed(2)} speed=${speed.toFixed(1)}`);
  state.currentPower = 0;
  updatePowerUI();
}

function updateCharging(nowTs) {
  if (!state.isSessionStarted || !state.isCharging) {
    return;
  }

  const heldSeconds = (nowTs - state.chargeStartTs) / 1000;
  state.currentPower = clamp(heldSeconds / CONFIG.maxChargeSeconds, 0, 1);
  updatePowerUI();
}

function stepSimulation(dt) {
  state.wind.update(dt);

  const width = state.canvasSize.width;
  const height = state.canvasSize.height;

  for (const arrow of state.arrows) {
    arrow.update(dt, state.wind.currentAccel);

    const isOutOfBounds =
      arrow.position.x < -50 ||
      arrow.position.x > width + 80 ||
      arrow.position.y < -100 ||
      arrow.position.y > height - CONFIG.arenaPadding.bottom + 25;

    if (isOutOfBounds) {
      arrow.isActive = false;
      addBehaviorLog("shot_end", "out_of_bounds");
      continue;
    }

    if (state.target.intersectsArrow(arrow)) {
      const score = state.target.scoreAtPoint(arrow.tipPosition);
      arrow.hitScore = score;
      arrow.isActive = false;
      state.score += score;
      updateScoreUI();
      addBehaviorLog("target_hit", `score=${score} total=${state.score}`);
    }
  }

  state.arrows = state.arrows.filter((arrow) => arrow.timeAlive < 10);
}

function frame(ts) {
  const dt = Math.min((ts - previousTs) / 1000, 0.033);
  previousTs = ts;

  if (state.isSessionStarted) {
    updateCharging(ts);
    stepSimulation(dt);
    updateWindUI();
  }

  drawScene(ctx, {
    canvasSize: state.canvasSize,
    arrows: state.arrows,
    bow: state.bow,
    mouse: state.mouse,
    isCharging: state.isCharging,
    currentPower: state.currentPower,
    target: state.target
  });

  requestAnimationFrame(frame);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

startForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();

  if (username.length < 2) {
    startError.textContent = "Username must be at least 2 characters.";
    return;
  }

  if (!isValidEmail(email)) {
    startError.textContent = "Please enter a valid email address.";
    return;
  }

  state.player.username = username;
  state.player.email = email;
  state.isSessionStarted = true;
  startError.textContent = "";
  startOverlay.classList.add("hidden");
  updatePlayerUI();
  updateLogSyncUI("Logging active", "Uploads every 60 seconds");
  addBehaviorLog("session_start", "Simulation started");
  startLogUploader();
  flushLogs("session_start");
  previousTs = performance.now();
});

canvas.addEventListener("mousemove", (e) => {
  setMousePosition(e);
});

canvas.addEventListener("mousedown", (e) => {
  setMousePosition(e);
  beginCharge(performance.now());
});

window.addEventListener("mouseup", () => {
  releaseShot();
});

window.addEventListener("resize", () => {
  resizeCanvas();
});

window.addEventListener("beforeunload", () => {
  if (!state.isSessionStarted || logService.pendingCount === 0) {
    return;
  }

  const payload = {
    name: state.player.username,
    email: state.player.email,
    log: logService.queue.join("\n")
  };

  const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
  navigator.sendBeacon("/api/log", blob);
});

resizeCanvas();
updatePowerUI();
updateWindUI();
updateScoreUI();
updatePlayerUI();
updateLogSyncUI("Waiting to start", "Uploads every 60 seconds");
requestAnimationFrame(frame);
