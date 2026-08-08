import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import express from 'express';
import apiRouter from '../src/routes/index.js';
import { clerkAuth } from '../src/middleware/auth.js';
import { errorHandler } from '../src/middleware/errorHandler.js';

describe('API Route Integration Tests', () => {
  let server;
  let baseUrl;

  before(async () => {
    const app = express();
    app.use(express.json());
    app.use(clerkAuth);
    app.use('/api', apiRouter);
    app.use(errorHandler);

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}/api`;
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it('GET /api/health should return healthy status', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'healthy');
  });

  it('GET /api/auth/me should return authenticated user context', async () => {
    const res = await fetch(`${baseUrl}/auth/me`, {
      headers: {
        'x-clerk-user-id': 'test_user_999',
        'x-user-email': 'admin@hireflow.dev',
        'x-user-name': 'Test Admin',
      }
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.authenticated, true);
  });

  it('GET /api/candidates should return list and pagination schema', async () => {
    const res = await fetch(`${baseUrl}/candidates`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
  });

  it('GET /api/email-templates should return template list', async () => {
    const res = await fetch(`${baseUrl}/email-templates`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
  });

  it('GET /api/analytics/dashboard should return metrics schema', async () => {
    const res = await fetch(`${baseUrl}/analytics/dashboard`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.metrics);
  });

  it('GET /api/settings should return settings object', async () => {
    const res = await fetch(`${baseUrl}/settings`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.companyName);
  });
});
