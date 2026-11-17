import { test } from 'node:test';
import assert from 'node:assert/strict';
import { articleRedirect, loginUrlFor } from './loginRedirect.js';

const article = { pathname: '/posts/7', search: '', hash: '' };
test('manual logout returns home after login', () => {
  const url = loginUrlFor(article, true);
  assert.equal(url, '/login');
  assert.equal(articleRedirect(new URL(url, 'http://localhost').searchParams.get('redirect')), '/');
});
test('shared links and expired sessions preserve article destination', () => {
  const url = loginUrlFor(article);
  assert.equal(articleRedirect(new URL(url, 'http://localhost').searchParams.get('redirect')), '/posts/7');
  assert.equal(articleRedirect('https://example.com'), '/');
});
