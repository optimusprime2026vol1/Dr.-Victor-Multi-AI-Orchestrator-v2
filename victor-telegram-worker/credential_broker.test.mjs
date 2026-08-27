import test from 'node:test';
import assert from 'node:assert/strict';
import { brokerCapabilities, brokerConfigured, handleCredentialBroker, verifyBrokerSignature } from './credential_broker.mjs';

async function sign(secret, timestamp, body) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${body}`));
  return [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, '0')).join('');
}

test('broker requires both department auth secrets and runtime credentials', () => {
  assert.equal(brokerConfigured({}), false);
  assert.equal(brokerConfigured({ BROKER_AUTH_TONY_STARK: 'a', BROKER_AUTH_HULK: 'b', API_VICTOR: 'c', GITHUB_ORCHESTRATION_TOKEN: 'd' }), true);
  assert.equal(brokerCapabilities({}).raw_secret_access, false);
});

test('HMAC verification accepts fresh authentic request and rejects stale request', async () => {
  const body = '{"request_id":"hulk-12345678"}';
  const timestamp = '1000000';
  const signature = await sign('secret', timestamp, body);
  assert.equal((await verifyBrokerSignature('secret', timestamp, body, signature, 1000000)).ok, true);
  assert.equal((await verifyBrokerSignature('secret', timestamp, body, signature, 2000000)).ok, false);
});

test('broker executes allowed GitHub read without returning secret', async () => {
  const now = 1000000;
  const payload = { request_id: 'tony-12345678', department: 'tony_stark', action: 'github.repository.read', purpose: 'Verify current repository health', resource: { repository: 'vickykenin-lang/tony-stark-engineering' } };
  const body = JSON.stringify(payload);
  const signature = await sign('tony-auth', String(now), body);
  const request = new Request('https://victor.test/credential-broker', { method: 'POST', headers: { 'X-Victor-Timestamp': String(now), 'X-Victor-Signature': signature }, body });
  const fetchFn = async () => new Response(JSON.stringify({ full_name: 'vickykenin-lang/tony-stark-engineering', private: false, default_branch: 'main', pushed_at: 'now', archived: false, html_url: 'https://github.com/example' }), { status: 200 });
  const response = await handleCredentialBroker(request, { BROKER_AUTH_TONY_STARK: 'tony-auth', GITHUB_ORCHESTRATION_TOKEN: 'github-secret' }, { fetchFn, nowMs: now });
  const result = await response.json();
  assert.equal(response.status, 200);
  assert.equal(result.status, 'EXECUTED_VERIFIED');
  assert.equal(result.raw_secret_returned, false);
  assert.doesNotMatch(JSON.stringify(result), /github-secret/);
});

test('broker rejects cross-scope repository and consequential action', async () => {
  const now = 1000000;
  for (const payload of [
    { request_id: 'hulk-12345678', department: 'hulk', action: 'github.repository.read', purpose: 'Read an unauthorized repository safely', resource: { repository: 'vickykenin-lang/tony-stark-engineering' } },
    { request_id: 'hulk-87654321', department: 'hulk', action: 'ai.reason', purpose: 'Perform a forbidden production operation', production_action: true, parameters: { prompt: 'test' } },
  ]) {
    const body = JSON.stringify(payload);
    const signature = await sign('hulk-auth', String(now), body);
    const request = new Request('https://victor.test/credential-broker', { method: 'POST', headers: { 'X-Victor-Timestamp': String(now), 'X-Victor-Signature': signature }, body });
    const response = await handleCredentialBroker(request, { BROKER_AUTH_HULK: 'hulk-auth', API_VICTOR: 'secret', GITHUB_ORCHESTRATION_TOKEN: 'secret' }, { fetchFn: async () => { throw new Error('must not fetch'); }, nowMs: now });
    assert.notEqual(response.status, 200);
  }
});
