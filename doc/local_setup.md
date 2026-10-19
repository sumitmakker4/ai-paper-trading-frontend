# Frontend local setup

Run all commands from the frontend repository root. Phases 1 and 2 (F0/F1) are implemented; market data, replay and trading remain unavailable.

## Install and run

Use Node 20.19+ (or a compatible newer release). The exact dependency graph is in package-lock.json.

```powershell
npm ci
npm run dev
```

Open http://localhost:5173/. The root redirects to /login; unauthenticated /app/* routes return to login. The API defaults to http://localhost:8000/api/v1. Public configuration is documented in .env.example; never put secrets in VITE_* variables.

Start the backend separately using its [setup instructions](../../backend/doc/local_setup.md). Use localhost for both browser and API so the readable CSRF cookie works. Separate repositories do not change the [backend auth contract](../../backend/doc/auth_contract.md).

## Checks

```powershell
npm run lint
npm run format:check
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

Unit/component tests use MSW and do not require a backend. The login browser suite uses port 5173. It checks desktop/mobile routing, themes, keyboard access and protected routes.

For integrated authentication tests, install the backend dependencies and migrate its dedicated trademind_test database first. The suite starts its own API on 8001 and frontend on 5174, using the existing local PostgreSQL test database on 127.0.0.1:55432. Synthetic browser users remain only in that test database.

```powershell
# Default backend checkout: ../backend. Override if cloned elsewhere.
$env:TRADEMIND_BACKEND_DIR='C:/path/to/trademind-backend'
# Optional absolute Python path; defaults to the backend .venv.
$env:TRADEMIND_TEST_PYTHON='C:/path/to/trademind-backend/.venv/Scripts/python.exe'
npm run test:auth-browser
```

Unset these variables when using the default sibling checkout. The existing workspace-local Python under ../.tools/backend-auth-venv is supported as a fallback. Auth browser output stays inside this repository at .tools/auth-browser-results. On Windows output-lock failures, use a fresh --output=.tools/auth-browser-next path.

## Dependency and attribution notes

Versions were verified during foundation setup and remain locked: React 19, React Router 7, Vite 8, Vitest 4, ESLint 9, React Hook Form and Zod 4. This restructuring does not update dependencies.

Lightweight Charts 5.2.1 is installed but not rendered yet. Preserve public/licenses/lightweight-charts/LICENSE.txt and NOTICE.txt. Chart integration in phase 4 must render the notice and visible TradingView attribution/link with attributionLogo enabled.

See [repository setup](repository_setup.md) for GitHub commands and document ownership.
