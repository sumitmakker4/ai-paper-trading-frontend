# TradeMind AI frontend implementation plan

Status: project phases 1 and 2 (F0 foundation and F1 authentication) implemented at the user's request. Phase 3 and later phases are not started. See [phase 2 handoff](phase_2_handoff.md), [auth contract](../../backend/doc/auth_contract.md) and [local setup](local_setup.md).

User correction, 19 October 2026: login is the entry page; there is no marketing landing page or public mock dashboard. All `/app/*` routes require successful server-verified authentication. F1/B1 now supplies real registration, sign-in, session recovery, logout, identity and read-only profile settings. Financial features remain gated by their later phases.

Navigation requirement: retain all eight workspace pages after login throughout implementation. Unfinished features may show clear unavailable states; do not remove or hide their navigation entries unless the user explicitly requests it.

Source: [frontend specification](trademind_frontend_spec.md), read together with the [backend specification](../../backend/doc/trademind_backend_spec.md).
Companion: [backend implementation plan](../../backend/doc/backend_implementation_plan.md).

This plan does not amend either specification. Backend rules govern identity, replay, eligibility, accounting and execution. Proposed contract changes require agreement before implementation; specification edits require explicit approval.

## 1. Product and scope

Build a desktop-first, mobile-usable educational research and historical paper-trading application. The primary workflow is register, start replay, search, research, preview, confirm a virtual order, advance candles, review results and journal decisions.

MVP includes authentication, dark/light themes, instrument discovery, watchlists, daily candles/volume, backend indicators, manual replay, MARKET/LIMIT orders, portfolio, ledger, session history and journal. Every trade-capable screen displays `PAPER TRADING · VIRTUAL MONEY`; prices display demo source and as-of time.

Starting capital is server-controlled INR 100000 per fresh session. Trading is long-only, whole-share, without partial fills or executable stops/targets. Stops and targets are hypothetical risk inputs. AI, forecasts, backtests, alerts, additional timeframes and replay speed controls belong to later releases. Real brokerage integration is excluded from MVP.

## 2. Stack and module boundaries

- React with JavaScript/JSX and Vite; no TypeScript.
- React Router for navigation and lazy route loading.
- TanStack Query for all server-owned state; Zustand for small UI state only.
- React Hook Form and Zod for forms; backend validation remains authoritative.
- CSS Modules and shared CSS custom properties for dark/light themes.
- TradingView Lightweight Charts for candles, volume and supported overlays, after compatible-version and attribution checks.
- Vitest, React Testing Library, MSW and Playwright for appropriate tests.
- JSDoc for useful API descriptions; a decimal library only where exact client-side input/display operations require it.

Keep `src/app`, shared `components`, feature modules, composing `pages`, API `services`, UI `stores`, `styles` and test utilities separate. Do not create empty AI/backtest modules in MVP. Do not introduce a second financial ledger in the browser.

## 3. Shared delivery sequence

| Project phase | Frontend scope | Required backend readiness |
|---|---|---|
| 1 | F0 foundation | B0 foundation |
| 2 | F1 authentication | B1 authentication |
| 3 | Initial F2 discovery/watchlist | B2 datasets and discovery |
| 4 | Complete F2 candles/volume; minimum session controls | B3 replay and scoped market reads |
| 5 | No executable order UI yet | B4 engine passes domain/concurrency tests |
| 6 | F3 complete replay terminal and indicators | B5 research, risk and history contracts |
| 7 | F4 order workflow | B4 plus finalized B5 contracts |
| 8 | F5 portfolio, account review and journal | B5 complete |
| 9 | F6 hardening | B6 hardening |
| Later | F7 research features | Corresponding B7 endpoints and evaluation gates |

F2 cannot complete session-scoped charts before B3. F3 cannot complete indicators before B5. Introducing minimum session controls in project phase 4 is a dependency accommodation; full F3 follows before F4. Stop and report at every project phase boundary.

## 4. Step-by-step frontend slices

### F0: Foundation — project phase 1

1. Initialize Vite React JavaScript and local dependency lockfile after version verification.
2. Configure router, providers, lazy loading, ESLint, formatting and test tooling.
3. Build theme tokens, accessible buttons/inputs/dialogs/tabs/toasts/skeletons.
4. Build responsive shell, navigation, status line and clearly empty route screens.
5. Establish API client boundaries, canonical errors, request IDs and query-key conventions.
6. Add `.env.example` with public frontend variables only and startup documentation.

Acceptance: lint, appropriate component tests and build pass; shell works at 1366px and 375px; dark/light themes and keyboard navigation work. No invented balances or quotes.

### F1: Authentication — project phase 2

1. Implement registration/login forms, validation and field-level API errors.
2. Integrate login, refresh, logout and `/users/me`.
3. Keep access tokens in memory; use HttpOnly refresh cookies and readable CSRF cookie/header per backend contract.
4. Implement one in-flight refresh operation, one retry, then controlled login recovery.
5. Add protected routes with allowed internal return paths.
6. Clear private query caches when logging out or changing users.
7. Add read-only profile and the agreed MVP settings subset.

Acceptance: auth recovery, refresh failure, CSRF errors, invalid redirects and private-cache clearing are tested; no tokens enter localStorage or logs.

### F2: Discovery and charts — project phases 3 and 4

1. Build 250–350ms debounced, keyboard-accessible instrument search using instrument IDs.
2. Build paginated Markets and persistent watchlists with rollback if optimistic toggles are used.
3. Show dataset provenance and explicit absent-price states.
4. After B3, add session creation/current-session access needed for replay-scoped candles.
5. Integrate candles, volume, OHLC crosshair and source/as-of labels.
6. Handle chart resize, subscription cleanup, instrument switching and aborted stale requests.
7. Add empty/missing-data views and required chart attribution.

Acceptance: chart reads never exceed replay time; rapid instrument switching cannot show mismatched data; no duplicate chart instances; watchlists persist across refresh.

### F3: Replay terminal — project phase 6

1. Complete terminal layout, session selection and current simulation clock.
2. Integrate Next candle with in-flight disabling and retained request IDs for retries.
3. Add backend EMA20/EMA50 overlays and RSI/MACD/ATR presentation with warmup nulls.
4. Coordinate candles, indicators, quotes, orders, positions, performance and portfolio invalidation after confirmed advancement.
5. Support no-next-bar, completed-session, missing-data and stale-state conflicts.

Acceptance: every panel reflects the selected session; new clocks do not retain future candles from prior sessions; duplicate advance retries move once; unsupported timeframes are omitted or disabled.

### F4: Paper orders — project phase 7

1. Build BUY/SELL, MARKET/LIMIT, quantity and exact decimal price inputs.
2. Add optional planned stop/target risk preview without creating executable orders.
3. Integrate server order preview, affordability, reservations, warnings and explicit confirmation.
4. Generate one client-order ID per confirmed intent; reuse it for uncertain-outcome retries.
5. Build order lists, pagination, status filters and detail drawer using finalized contracts.
6. Add cancel confirmation, conflict handling and authoritative reconciliation.
7. Add pending limit lines, fill markers and informational planning lines.

Acceptance: no optimistic fills/cancels; MARKET remains PENDING before an eligible bar; preview failure preserves inputs; cancellation races and timeout retries are tested.

### F5: Portfolio and journal — project phase 8

1. Complete dashboard and first-session onboarding.
2. Build server-sourced account summaries, holdings, ledger and equity history.
3. Handle partial valuation with null aggregates and missing-mark explanations.
4. Add historical session review without trade actions.
5. Build owner-only journal CRUD, safe plain-text content, associations and agreed filters.
6. Implement double-confirmed RESET: finish first, then create a new session; recover explicitly if creation fails.

Acceptance: never sum paginated positions into account totals; completed sessions remain view-only; old audit history survives reset; reload preserves authoritative state.

### F6: Hardening — project phase 9

1. Complete MSW integration and backend-connected Playwright flows.
2. Verify keyboard access, dialog focus, contrast, status announcements and responsive layouts.
3. Test 401/403/409/422/429/network/5xx behavior and retained form values.
4. Measure route loading, chart lifecycle and representative interactions rather than claiming unmeasured performance.
5. Verify license notices, source labels, environment safety and offline seeded operation.

Acceptance: new user → replay → pending BUY → advance → FILLED → SELL → advance → realized P&L → reload works against PostgreSQL-backed FastAPI.

## 5. Contract decisions to resolve before affected work

| Gap | Proposed treatment | Deadline |
|---|---|---|
| Account initialization wording | Login shows onboarding; session creation creates the account and funds. | F1/F2 |
| Archive chart without session | Show Start replay until a dedicated archive contract is agreed. | F2 |
| Settings/profile/session management APIs absent | Local theme, fixed en-IN/Asia/Kolkata, read-only profile, replay history; defer account/device editing. | F1 |
| Running/paused wording | ACTIVE manual replay means awaiting user advancement; no invented PAUSED server state. | F3 |
| Final bar and excessive multi-step request behavior | Follow explicit backend decision; UI must not infer automatic completion. | F3 |
| Missing/stale mark semantics | Use backend usability rules; historical age is not automatically feed staleness. | F3/F4 |
| Order details, audit, execution fields incomplete | Finalize schemas and filters; do not expose internal audit payloads by assumption. | F4 |
| Risk exposure/concentration warnings | Define backend fields and thresholds. | F4 |
| Journal filters/session-time associations incomplete | Finalize create/read/filter contracts. | F5 |
| Historical review contradiction in backend prose | Use explicit session history and session-scoped read contracts after clarification. | F5 |

No active session is `200 null` on `/paper/sessions/active`, but `404 NO_ACTIVE_PAPER_SESSION` on default portfolio lookup. Preview business ineligibility is `200 eligible:false`; schema errors are 422. Successful order placement is 201, duplicate same-body placement is 200, mismatched idempotency bodies are 409.

## 6. State, precision and security rules

- Query keys include session, instrument, timeframe, filters and relevant pagination parameters. Clock changes must invalidate replay-dependent reads and prevent old in-flight responses from mixing snapshots.
- Cache clearing must prevent a second user from seeing the first user's private data.
- Money/price values remain strings across API boundaries; quantities remain integers. Frontend estimates never authorize orders.
- Use `en-IN`/INR formatting and explicit Asia/Kolkata timestamps; API instants remain UTC.
- Never render raw journal/AI HTML or put secrets in `VITE_*` variables.
- Preserve user intent across recoverable failures, but never retry an uncertain mutation with a fresh ID automatically.

## 7. Risks and later releases

Primary risks are stale mixed snapshots, duplicate mutations, refresh races, chart lifecycle leaks, floating-point input changes, incomplete DTOs and accidental live-data claims. Address them with scoped queries, stable IDs, single-flight refresh, explicit cleanup, exact inputs, contract fixtures and visible provenance.

Later features must use genuinely implemented backend contracts: evidence-grounded AI with independent outage handling; backtests with assumptions and baselines; forecasts only with evaluated horizons/calibration; alerts and extra timeframes after separate design. AI never submits orders.

## 8. Phase handoff and user input

Each phase report includes changed files, API usage, tests/lint/build, manual steps, assumptions, known gaps and relevant backend migrations. Update specs only with explicit approval. Do not automatically continue into the next phase.

Nothing external is required to begin foundations after the user requests it. Use the specified TradeMind identity, dark-mode default and INR/Asia/Kolkata defaults unless the user supplies preferences. Optional branding assets or deployment preferences can arrive later; no broker credentials, market-data subscription or AI key is needed for MVP.
