import {models, solve, toDisplay, unit} from './physics.js';

// Uniform samples plus physically meaningful event times prevent plots from
// bridging a projectile impact or a surface stopping event inaccurately.
export function sampleExperiment(state, count = 201) {
  if (!Number.isInteger(count) || count < 2 || count > 2001) throw Error('Invalid sample count.');
  const end = state.params.duration;
  const initial = solve(state.model, state.params, state.parts, 0);
  const times = Array.from({length: count}, (_, i) => end * i / (count - 1));
  for (const event of [initial.values.flight, initial.values.stop]) {
    if (Number.isFinite(event) && event > 0 && event < end) times.push(event);
  }
  times.sort((a, b) => a - b);
  return [...new Set(times)].map(time => {
    const values = solve(state.model, state.params, state.parts, time).values;
    return {time, values: Object.fromEntries(Object.entries(models[state.model].targets).map(([key, [, dimension]]) =>
      [key, toDisplay(values[key], dimension, state.units)]))};
  });
}

export function experimentCSV(state, samples = sampleExperiment(state)) {
  const targets = Object.entries(models[state.model].targets);
  const quote = text => '"' + String(text).replaceAll('"', '""') + '"';
  const header = ['Time (s)', ...targets.map(([, [label, dimension]]) => `${label} (${unit(dimension, state.units)})`)];
  const rows = samples.map(sample => [sample.time, ...targets.map(([key]) => sample.values[key])]
    .map(value => Number.isFinite(value) ? value.toPrecision(12) : '').join(','));
  return [header.map(quote).join(','), ...rows].join('\r\n') + '\r\n';
}

export function plotDomain(samples, target) {
  const values = samples.map(sample => sample.values[target]).filter(Number.isFinite);
  if (!values.length) return null;
  const low = Math.min(...values), high = Math.max(...values);
  const padding = low === high ? Math.max(Math.abs(low) * 0.1, 1) : (high - low) * 0.08;
  return {min: low - padding, max: high + padding};
}
