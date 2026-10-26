// Limit stalls to 100 ms so a resumed browser does not jump through the scene.
export function advanceTime(current, elapsed, duration, rate = 1) {
  if (![current, elapsed, duration, rate].every(Number.isFinite) || duration < 0 || rate <= 0) {
    throw Error('Invalid playback time or speed.');
  }
  return Math.min(duration, Math.max(0, current) + Math.max(0, Math.min(elapsed, 0.1)) * rate);
}

export function pageIndex(current, delta, count) {
  return Math.max(0, Math.min(Math.max(0, count - 1), current + delta));
}
