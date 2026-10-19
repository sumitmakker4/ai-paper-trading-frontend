import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendRoot = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(frontendRoot, process.env.TRADEMIND_BACKEND_DIR || '../backend');
const backendPython = path.join(
  backendRoot,
  '.venv',
  process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python',
);
const legacyPython = path.resolve(frontendRoot, '../.tools/backend-auth-venv/Scripts/python.exe');
const python = process.env.TRADEMIND_TEST_PYTHON
  ? path.resolve(frontendRoot, process.env.TRADEMIND_TEST_PYTHON)
  : existsSync(backendPython)
    ? backendPython
    : legacyPython;

// The browser suite always uses a separate API/database and frontend port.
const databaseUrl = 'postgresql+asyncpg://trademind@127.0.0.1:55432/trademind_test';
if (!new URL(databaseUrl).pathname.endsWith('_test'))
  throw new Error('A dedicated test database is required.');

export default defineConfig({
  testDir: './browser-tests',
  testMatch: 'auth-flow.spec.js',
  workers: 1,
  outputDir: '.tools/auth-browser-results',
  use: { baseURL: 'http://localhost:5174', browserName: 'chromium', screenshot: 'only-on-failure' },
  webServer: [
    {
      command: `"${python}" -m uvicorn app.main:app --host localhost --port 8001 --no-access-log`,
      cwd: backendRoot,
      env: {
        DATABASE_URL: databaseUrl,
        APP_ENV: 'test',
        CORS_ORIGINS: '["http://localhost:5174"]',
        JWT_SECRET: 'isolated-browser-tests-signing-key-only-2026',
      },
      url: 'http://localhost:8001/health/ready',
      reuseExistingServer: false,
    },
    {
      command: 'npm run dev -- --port 5174',
      env: { VITE_API_BASE_URL: 'http://localhost:8001/api/v1' },
      url: 'http://localhost:5174',
      reuseExistingServer: false,
    },
  ],
});
