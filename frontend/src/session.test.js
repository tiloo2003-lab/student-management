import { test } from 'node:test';
import assert from 'node:assert/strict';
import { IDLE_MS, MAX_MS, isExpired, startSession, readSession, checkSession, clearSession, recordActivity } from './session.js';

const values = new Map();
globalThis.localStorage = {
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value),
  removeItem: (key) => values.delete(key),
};
globalThis.window = new EventTarget();

test('idle and absolute expiry boundaries', () => {
  assert.equal(isExpired({ startedAt: 0, activeAt: 0 }, IDLE_MS - 1), false);
  assert.equal(isExpired({ startedAt: 0, activeAt: 0 }, IDLE_MS), true);
  assert.equal(isExpired({ startedAt: 0, activeAt: MAX_MS - 1 }, MAX_MS), true);
  assert.equal(isExpired(null), true);
  assert.equal(isExpired({}), true);
});

test('session recovery, activity, legacy sessions and stale responses', () => {
  const realNow = Date.now;
  let now = 100000;
  Date.now = () => now;
  try {
    startSession('first');
    assert.equal(checkSession(), 'first');
    now += IDLE_MS - 1000;
    recordActivity();
    assert.equal(readSession().activeAt, now);
    now += 2000;
    assert.equal(checkSession(), 'first');
    startSession('second');
    clearSession('first');
    assert.equal(checkSession(), 'second');
    now += IDLE_MS;
    assert.equal(checkSession(), null);
    assert.equal(localStorage.getItem('token'), null);
    localStorage.setItem('token', 'legacy');
    assert.equal(checkSession(), null);
    startSession('third');
    clearSession('third');
    assert.equal(readSession(), null);
  } finally { Date.now = realNow; }
});
