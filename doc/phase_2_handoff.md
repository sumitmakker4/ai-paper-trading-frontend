# frontend phase 2 handoff - authentication

Historical delivery: 19 October 2026. Phase 2 implemented B1/F1 and stopped before phase 3. This repository records only its own delivery. See the [auth contract](../../backend/doc/auth_contract.md) and [local setup](local_setup.md) for current commands.

Frontend registration/login use React Hook Form and Zod, field-level errors, confirmation/acknowledgement, accessible labels and focused error feedback. Inputs remain populated on recoverable failure. A failed login after successful registration guides the user to sign in without recreating the account. Session recovery has one in-flight refresh, one retry for unauthorized reads, and an explicit retry state on network failure. Mutations are not automatically retried. Web Locks serialize cookie changes across tabs where supported. TanStack Query owns profile data; caches clear on sign-out, identity change and expired authentication. Tokens never enter local/session storage or Zustand.

All eight workspace pages remain visible in authenticated navigation: Dashboard, Markets, Terminal, Paper Trading, Orders, Portfolio, Journal and Settings. User correction: retain these pages while their features are implemented in the approved phase order; do not hide them because a later phase is incomplete. Dashboard shows the real signed-in identity and unavailable paper trading, with no dummy balances or performance cards. Settings supports read-only name/email/join date, local dark/light preference and fixed INR/en-IN/Asia-Kolkata defaults. Market/replay/order/journal pages clearly state that their features remain unavailable.

The first component run exposed password confirmation being skipped when acknowledgement validation failed; changing acknowledgement to a non-aborting refinement fixed both messages. Router loading fallbacks removed an initial hydration warning. Synthetic browser accounts are kept only in the dedicated test database; the app database was not used by automated browser flows.

Frontend additions: `src/features/auth/{session.js,useAuth.js,returnTo.js,validation.js,AuthGate.jsx,AuthLayout.jsx}`, `src/app/queryClient.js`, `src/pages/{SignIn.jsx,Register.jsx,Dashboard.jsx}`, `src/test/{auth.test.jsx,ui.test.jsx}`, `browser-tests/auth-flow.spec.js`, `playwright.auth.config.js`.

Frontend updates: `src/services/api.js`, `src/app/{Providers.jsx,routeConfig.js}`, `src/components/layout/{Shell.jsx,Shell.module.css}`, `src/pages/{Settings.jsx,Login.module.css,Workspace.module.css}`, `src/test/routing.test.jsx`, `browser-tests/login.spec.js`, `playwright.config.js`, `package.json`. Removed obsolete `src/pages/{Login.jsx,RegistrationUnavailable.jsx}` and `src/test/foundation.test.jsx`. Paths are relative to this frontend repository.

- Frontend lint, formatting, 36 Vitest/RTL/MSW tests and production build passed.
- Two login-only browser checks passed at 1366px/375px.
- Two additional real-backend Chromium flows passed at 1366px/375px: register → sign in → profile → reload/rotation → simultaneous recovery in two tabs → theme/keyboard controls → logout → blocked dashboard → invalid-password feedback → successful login → logout. Tests verified HttpOnly/SameSite cookies, absence of tokens in browser storage, responsive overflow and no page errors. Desktop/mobile screenshots were reviewed.

## Limits and next boundary

Email verification, password reset/change, profile editing and session-management UI remain deferred. Registration does not create a replay account. Financial features remain unavailable. Historical verification above was performed during phase 2, not rerun by this document split. Phase 3 is not started.

