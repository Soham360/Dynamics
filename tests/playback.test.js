import {test} from 'node:test';
import assert from 'node:assert/strict';
import {advanceTime,pageIndex} from '../playback.js';

test('playback speeds scale simulated time and stop at the duration',()=>{
  assert.equal(advanceTime(1,0.08,4,0.25),1.02);
  assert.equal(advanceTime(1,0.08,4,2),1.16);
  assert.equal(advanceTime(3.95,0.1,4,2),4);
});
test('stalled or negative frame clocks cannot jump or reverse the simulation',()=>{
  assert.equal(advanceTime(1,10,4,1),1.1);
  assert.equal(advanceTime(1,-1,4,1),1);
  assert.throws(()=>advanceTime(1,NaN,4,1));
  assert.throws(()=>advanceTime(1,0.1,4,0));
});
test('solution pagination stays within the available steps',()=>{
  assert.equal(pageIndex(0,-1,6),0);
  assert.equal(pageIndex(5,1,6),5);
  assert.equal(pageIndex(5,0,3),2);
  assert.equal(pageIndex(0,1,0),0);
});
