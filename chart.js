import {models, unit} from './physics.js';
import {sampleExperiment, experimentCSV, plotDomain} from './analysis.js';

const $ = id => document.getElementById(id);
const format = value => Number(value.toPrecision(4)).toLocaleString('en-US');
let cacheKey = '', samples = [], domain = null;

export function renderAnalysis(state, error) {
  $('csv').disabled = Boolean(error);
  const key = JSON.stringify(state) + error;
  if (key === cacheKey) return;
  cacheKey = key;
  const [label, dimension] = models[state.model].targets[state.target];
  $('plot-title').textContent = `${label} over time`;
  $('plot-unit').textContent = unit(dimension, state.units);
  $('plot-note').textContent = state.model === 'collision'
    ? 'Collision values are post-impact results and do not depend on observation time.'
    : state.model === 'surface' && ['a', 'friction'].includes(state.target)
    ? 'This quantity describes the initial state. Choose velocity or displacement to explore motion.'
    : 'Quantities independent of time appear flat. Scrub the simulation timeline to inspect a sample.';
  if (error) { $('plot-readout').textContent = ''; samples = []; domain = null; $('plot').innerHTML = ''; $('plot-status').textContent = error; return; }
  samples = sampleExperiment(state);
  domain = plotDomain(samples, state.target);
  if (!domain) {
    $('plot').innerHTML = ''; $('plot-status').textContent = 'No finite values to plot. A stationary orbit has an infinite period.';
    return;
  }
  $('plot-status').textContent = '';
  const width = 800, height = 220, left = 75, right = 24, top = 22, bottom = 38;
  const x = time => left + time / state.params.duration * (width - left - right);
  const y = value => top + (domain.max - value) / (domain.max - domain.min) * (height - top - bottom);
  let path = '', connected = false;
  for (const sample of samples) {
    const value = sample.values[state.target];
    if (!Number.isFinite(value)) { connected = false; continue; }
    path += `${connected ? 'L' : 'M'}${x(sample.time)},${y(value)} `;
    connected = true;
  }
  const ticks = Array.from({length: 5}, (_, i) => {
    const t = state.params.duration * i / 4, value = domain.min + (domain.max - domain.min) * i / 4;
    return `<line x1="${left}" x2="${width - right}" y1="${y(value)}" y2="${y(value)}" stroke="#e2e9dd"/><text x="${left - 10}" y="${y(value) + 4}" text-anchor="end">${format(value)}</text><text x="${x(t)}" y="${height - 15}" text-anchor="middle">${format(t)} s</text>`;
  }).join('');
  $('plot').innerHTML = `${ticks}<path d="${path}" fill="none" stroke="#355e4b" stroke-width="2.5"/><line id="plot-cursor" y1="${top}" y2="${height - bottom}" stroke="#d58463" stroke-width="1.5" stroke-dasharray="4 4"/><circle id="plot-point" r="5" fill="#d58463" stroke="white" stroke-width="2"/>`;
}

export function updatePlayhead(state, time, value) {
  const cursor = $('plot-cursor'), point = $('plot-point');
  const [label, dimension] = models[state.model].targets[state.target];
  $('plot-readout').textContent = `t = ${time.toFixed(2)} s · ${label}: ${Number.isFinite(value) ? format(value) : '∞'} ${unit(dimension, state.units)}`;
  if (!cursor || !domain) return;
  const x = 75 + time / state.params.duration * 701;
  cursor.setAttribute('x1', x); cursor.setAttribute('x2', x);
  point.style.display = Number.isFinite(value) ? '' : 'none';
  if (Number.isFinite(value)) {
    point.setAttribute('cx', x);
    point.setAttribute('cy', 22 + (domain.max - value) / (domain.max - domain.min) * 160);
  }
}

export function currentCSV(state) { return experimentCSV(state); }
