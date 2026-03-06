export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

export function formatSigned(value, decimals = 1) {
  const fixed = value.toFixed(decimals);
  return value >= 0 ? `+${fixed}` : fixed;
}