import {test} from 'node:test';
import assert from 'node:assert/strict';
import {models, solve, toDisplay} from '../physics.js';
import {parseExperiment, History} from '../experiment.js';
import {sampleExperiment, experimentCSV, plotDomain} from '../analysis.js';

const experiment = (model='kinematics') => ({version:1,model,units:'metric',target:Object.keys(models[model].targets)[0],params:{...models[model].defaults},parts:models[model].allowed.map(kind=>({kind,x:200,y:200}))});
const near = (a,b) => assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);

test('import validates physical ranges and model-specific constraints',()=>{
  const state=experiment();state.params.m=0;assert.throws(()=>parseExperiment(JSON.stringify(state)),/supported range/);
  const surface=experiment('surface');surface.params.muk=0.8;assert.throws(()=>parseExperiment(JSON.stringify(surface)),/Kinetic/);
  const collision=experiment('collision');collision.params.v0=-2;assert.throws(()=>parseExperiment(JSON.stringify(collision)),/approaching/);
});
test('import rejects malformed objects and inherited model names',()=>{
  for(const raw of ['null','{}','[]',JSON.stringify({...experiment(),model:'constructor'}),JSON.stringify({...experiment(),parts:[null]})])assert.throws(()=>parseExperiment(raw));
  const duplicate=experiment();duplicate.parts.push({...duplicate.parts[0]});assert.throws(()=>parseExperiment(JSON.stringify(duplicate)));
});
test('import permits unfinished systems, strips extra fields, and bounds drawing positions',()=>{
  const state=experiment();state.params.extra='ignored';state.parts[0].x=-1000;state.parts[0].y=1000;state.secret='ignored';
  const clean=parseExperiment(JSON.stringify(state));assert.equal(clean.parts[0].x,60);assert.equal(clean.parts[0].y,350);assert.equal(clean.secret,undefined);assert.equal(clean.params.extra,undefined);
  state.parts=[];assert.deepEqual(parseExperiment(JSON.stringify(state)).parts,[]);
});
test('history detaches snapshots and branches after undo',()=>{
  const h=new History(),state=experiment();h.record(state);state.params.v0=10;h.record(state);state.params.v0=20;
  assert.equal(h.undo().params.v0,2);const next=h.redo();assert.equal(next.params.v0,10);next.params.v0=99;
  assert.equal(h.undo().params.v0,2);h.record({...state,params:{...state.params,v0:7}});assert.equal(h.canRedo,false);assert.equal(h.undo().params.v0,2);
});
test('history bounds memory, avoids duplicate entries, and preserves invalid edits',()=>{
  const h=new History(3),state=experiment();for(let i=0;i<5;i++){state.params.v0=i;h.record(state);h.record(state);}assert.equal(h.entries.length,3);
  assert.equal(h.undo().params.v0,3);assert.equal(h.undo().params.v0,2);assert.equal(h.undo(),null);
  state.params.v0=NaN;h.record(state);assert.ok(Number.isNaN(h.entries[h.index].state.params.v0));
});
test('samples start at zero and end exactly at duration with analytical values',()=>{
  const state=experiment(),samples=sampleExperiment(state,5);assert.equal(samples.length,5);assert.equal(samples[0].time,0);assert.equal(samples.at(-1).time,4);
  near(samples.at(-1).values.s,32);near(samples[2].values.v,8);
});
test('sampling includes exact stopping and impact events',()=>{
  const state=experiment('surface');Object.assign(state.params,{angle:0,v0:2,F:0,muk:0.2,mus:0.4,duration:5});
  const stop=solve(state.model,state.params,state.parts,0).values.stop;const samples=sampleExperiment(state,5);assert.ok(samples.some(s=>s.time===stop));near(samples.at(-1).values.v,0);
  const projectile=experiment('projectile');projectile.params.duration=10;const flight=solve(projectile.model,projectile.params,projectile.parts,0).values.flight;
  const trajectory=sampleExperiment(projectile,5);assert.ok(trajectory.some(s=>s.time===flight));near(trajectory.at(-1).values.y,0);
});
test('CSV exports all outputs with coherent imperial units',()=>{
  const state=experiment();state.units='imperial';const samples=sampleExperiment(state,3);const csv=experimentCSV(state,samples),rows=csv.trim().split('\r\n');
  assert.equal(rows.length,4);assert.ok(rows[0].includes('Displacement (ft)'));assert.ok(rows[0].includes('Final velocity (ft/s)'));near(Number(rows.at(-1).split(',')[1]),toDisplay(32,'length','imperial'));
});
test('infinite periods export as empty cells and do not corrupt graph bounds',()=>{
  const state=experiment('circular');state.target='period';state.params.orbital=0;const samples=sampleExperiment(state,3);assert.equal(plotDomain(samples,'period'),null);
  assert.ok(!experimentCSV(state,samples).includes('Infinity'));assert.ok(experimentCSV(state,samples).split('\r\n')[1].endsWith(','));
});
test('plot bounds include negative values and pad constant curves',()=>{
  const samples=[{values:{v:-4}},{values:{v:4}}],bounds=plotDomain(samples,'v');assert.ok(bounds.min<-4&&bounds.max>4);
  const constant=plotDomain([{values:{v:0}}],'v');assert.ok(constant.min<0&&constant.max>0);
});
test('solver rejects impossible times and unsupported element assemblies',()=>{
  const s=experiment();for(const time of [-1,NaN,Infinity,121])assert.throws(()=>solve(s.model,s.params,s.parts,time),/Simulation time/);
  assert.throws(()=>solve(s.model,s.params,[{kind:'pulley'}]),/Unsupported/);assert.throws(()=>solve('constructor',s.params,s.parts),/Unknown model/);
});
