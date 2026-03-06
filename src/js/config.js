export const CONFIG = {
  gravity: 280,
  minLaunchSpeed: 260,
  maxLaunchSpeed: 720,
  maxChargeSeconds: 1.4,
  trailDurationSeconds: 0.35,
  target: {
    radius: 90,
    boardThickness: 18,
    rings: [10, 8, 6, 4, 2]
  },
  wind: {
    minAccel: -90,
    maxAccel: 90,
    minDuration: 5,
    maxDuration: 10
  },
  arenaPadding: {
    left: 90,
    right: 160,
    top: 70,
    bottom: 80
  }
};