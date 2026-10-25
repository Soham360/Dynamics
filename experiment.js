import {models, validate} from './physics.js';

// Import into fresh objects; never install arbitrary file properties as app state.
export function parseExperiment(raw) {
  const data = JSON.parse(raw);
  if (!data || data.version !== 1 || typeof data.model !== 'string' ||
      !Object.hasOwn(models, data.model)) throw Error('Unknown experiment model or version.');
  const model = models[data.model];
  if (!['metric', 'imperial'].includes(data.units) || !Object.hasOwn(model.targets, data.target) ||
      !Array.isArray(data.parts) || data.parts.length > model.allowed.length) {
    throw Error('Invalid experiment format.');
  }
  const params = {};
  for (const key of Object.keys(model.defaults)) {
    if (typeof data.params?.[key] !== 'number') throw Error('Invalid parameter: ' + key);
    params[key] = data.params[key];
  }
  validate(data.model, params);
  const seen = new Set();
  const parts = data.parts.map(element => {
    if (!element || !model.allowed.includes(element.kind) || seen.has(element.kind) ||
        !Number.isFinite(element.x) || !Number.isFinite(element.y)) throw Error('Invalid or duplicate element.');
    seen.add(element.kind);
    return {kind: element.kind, x: Math.max(60, Math.min(700, element.x)), y: Math.max(80, Math.min(350, element.y))};
  });
  return {version: 1, model: data.model, units: data.units, target: data.target, params, parts};
}

// Snapshots are detached, bounded, and preserve invalid numeric edits for undo.
export class History {
  constructor(limit = 80) { this.limit = limit; this.entries = []; this.index = -1; }
  get canUndo() { return this.index > 0; }
  get canRedo() { return this.index < this.entries.length - 1; }
  record(state) {
    const key = JSON.stringify(state, (_, value) => Number.isNaN(value) ? '__NaN__' : value);
    if (this.entries[this.index]?.key === key) return;
    this.entries.splice(this.index + 1);
    this.entries.push({key, state: structuredClone(state)});
    if (this.entries.length > this.limit) this.entries.shift();
    this.index = this.entries.length - 1;
  }
  undo() { if (!this.canUndo) return null; return structuredClone(this.entries[--this.index].state); }
  redo() { if (!this.canRedo) return null; return structuredClone(this.entries[++this.index].state); }
}
