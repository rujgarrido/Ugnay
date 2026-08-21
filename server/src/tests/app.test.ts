import request from 'supertest';
import { createApp } from '../app';

/**
 * A minimal smoke test proving the Jest + Supertest setup works end-to-end.
 * Real feature tests will follow this same pattern: spin up the app,
 * hit an endpoint, assert on status + body shape.
 */

// Integration tests for the health check and 404 error handling
describe('GET /health', () => {
  it('returns 200 and status ok', async () => {
    const app = createApp();
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('GET /unknown-route', () => {
  it('returns 404 with a structured error body', async () => {
    const app = createApp();
    const res = await request(app).get('/unknown-route');

    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });
});
