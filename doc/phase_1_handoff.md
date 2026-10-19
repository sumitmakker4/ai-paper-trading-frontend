# Frontend phase 1 handoff

Historical delivery: 19 October 2026, F0 foundation. Phase 2 authentication has since superseded the initial preview and disabled-login state; see [phase 2](phase_2_handoff.md). This document records frontend work only.

## Delivered

React JavaScript/JSX, Vite, lazy routes, TanStack Query provider, Zustand theme-only state, CSS tokens and CSS Modules. The responsive shell retained all eight workspace pages with explicit unavailable-data states. Shared controls include labeled inputs, dialogs with focus wrapping, keyboard tabs, toasts and skeletons. API boundaries preserve decimal strings, canonical errors, request IDs and abort signals; mutations are not automatically retried.

The user-approved correction made / redirect to /login and closed all /app/* routes until real authentication arrived. Landing and guest dashboard access were removed. No quotes, balances or fills were fabricated.

Configuration includes package.json/package-lock.json, index.html, .env.example, Vite/ESLint/Prettier/Playwright configuration and public/licenses/lightweight-charts assets. Source is under src/{app,components,pages,services,stores,styles,test}; browser checks are under browser-tests.

## Historical checks

Initial foundation: lint, formatting, 9 Vitest/RTL/MSW tests, 2 Chromium checks at 1366px/375px, production build and npm audit (zero reported vulnerabilities) passed.

Login-first correction: lint, formatting, 22 component/API tests, 2 login-routing Chromium checks and production build passed. Browser output used fresh paths after Windows denied removing previous output. A dialog focus escape found by the first browser run was fixed before passing.

## Review now

Use [local setup](local_setup.md) and the phase 2 instructions for the current authenticated application. Original phase 1 preview URLs are historical, not public-access instructions. Backend delivery and migrations belong to the [backend handoff](../../backend/doc/phase_1_handoff.md).
