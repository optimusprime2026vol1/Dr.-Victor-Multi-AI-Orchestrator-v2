import test from 'node:test';
import assert from 'node:assert/strict';

import { classifyProcessingError } from './worker.js';

test('classifies AI upstream HTTP errors without exposing credentials', () => {
  const error = new Error('Victor AI upstream HTTP 401');
  error.code = 'AI_UPSTREAM_HTTP_ERROR';
  error.upstreamHttpStatus = 401;

  const result = classifyProcessingError(error, 'AI_INFERENCE');

  assert.equal(result.category, 'AI_UPSTREAM_HTTP_ERROR');
  assert.equal(result.upstreamHttpStatus, 401);
  assert.match(result.founderMessage('tg-1-2'), /HTTP 401/);
  assert.match(result.founderMessage('tg-1-2'), /Trace: tg-1-2/);
});

test('classifies truth guard rejection separately from core failure', () => {
  const error = new Error('rejected');
  error.code = 'TRUTH_GUARD_REJECTED';

  const result = classifyProcessingError(error, 'AI_INFERENCE');

  assert.equal(result.category, 'TRUTH_GUARD_REJECTED');
  assert.match(result.founderMessage('tg-3-4'), /truth verification/);
});

test('uses processing stage for uncoded Telegram delivery errors', () => {
  const result = classifyProcessingError(new Error('send failed'), 'TELEGRAM_DELIVERY');

  assert.equal(result.category, 'TELEGRAM_DELIVERY_FAILED');
});
