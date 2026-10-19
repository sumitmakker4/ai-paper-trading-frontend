# TradeMind AI agent instructions

## Read before working

Read these documents completely before implementing or changing application code:

1. [Frontend specification](doc/trademind_frontend_spec.md)
2. [Backend specification](../backend/doc/trademind_backend_spec.md)
3. [Frontend implementation plan](doc/frontend_implementation_plan.md)
4. [Backend implementation plan](../backend/doc/backend_implementation_plan.md)

Backend specification is authoritative for domain rules, storage, API behavior, ownership, replay, execution and accounting. Frontend specification is authoritative for screens, UX and client implementation. Report conflicts and settle affected contracts before implementation; do not silently invent behavior. Plans contain proposals, not approved specification amendments.

## Scope and delivery

- Implement only the phase requested by the user. Complete its checks and report results, then stop before the next phase.
- Phases 1 and 2 are implemented. Do not start phase 3 or later until the user requests that phase.
- Maintain the shared project-phase sequence in both repositories' plans, including backend prerequisites for frontend features. Coordinate companion-plan changes in its own repository.
- Keep all project documentation in `doc/`. This root `AGENTS.md` is the agent-instruction exception. Put future setup, API and operational documentation under `doc/` too.
- This is the standalone frontend repository. Paths are relative to this repository root; do not introduce a nested frontend directory. Do not create empty future modules or unnecessary infrastructure.
- Do not edit the original specifications without explicit user approval. Necessary documentation relocation and link maintenance do not authorize business-rule changes.
- Do not spawn sub-agents unless the user or an applicable instruction explicitly requests delegation.

## Required stack and structure

- Frontend: React with JavaScript/JSX, Vite, React Router, TanStack Query, small Zustand UI stores, CSS Modules and shared theme tokens. No TypeScript.
- Use React Hook Form/Zod and Lightweight Charts as specified; verify compatible dependency versions and chart licensing/attribution during setup.
- Backend: Python 3.12+, FastAPI, Pydantic v2, SQLAlchemy 2 async, asyncpg, PostgreSQL and Alembic.
- Keep API routers thin, domain services explicit, repository queries ownership-aware and calculation functions independently testable.
- Use a modular monolith. Redis/workers, AI, backtests and ML belong to later approved phases, not MVP foundations.
- Verify current official documentation where needed and lock installed dependency versions.

## Product and financial invariants

- Educational historical paper trading only. Display `PAPER TRADING · VIRTUAL MONEY`, demo provenance and accurate as-of timestamps.
- No real broker integration, real orders, leverage, shorting, derivatives or partial fills in MVP.
- Fresh replay accounts receive server-controlled INR 100000. Daily completed candles only; long-only, whole-share MARKET/LIMIT orders.
- Backend owns all balances, reservations, execution, indicators and P&L. Never fabricate quotes, fills, ledger totals or performance.
- Orders start PENDING and can execute only against eligible future replay bars. MARKET attempts, LIMIT touch rules, rounding and fees follow the backend specification.
- Stop/target inputs are hypothetical risk planning, not executable orders. AI cannot submit orders.
- Use Python Decimal and PostgreSQL NUMERIC for financial calculations; API money/prices are decimal strings. Quantities are integers; timestamps are UTC, displayed in Asia/Kolkata.
- Enforce replay cutoff on candles, quotes, indicators, pagination and caches. Do not leak future bars.
- Submit/cancel/advance/finish must use consistent transaction locks, durable idempotency and database constraints.
- Execution, ledger, position and cash changes commit atomically. Reservations cannot exceed available cash or shares.
- Missing usable marks produce explicit partial valuation and null invalid aggregates. Do not substitute zero.
- Reset creates a new session/account and preserves old history; require the specified user confirmation in the application.

## API, state and security

- Follow `/api/v1`, snake_case fields, plain resource bodies, `items`/`next_cursor` lists and canonical error envelopes.
- Finalize missing DTO/filter/edge-case contracts before their affected phase. Distinguish no-active-session, preview ineligibility, schema failure and mutation conflicts correctly.
- TanStack Query owns server state; Zustand must not duplicate financial truth. Scope queries by user/session/instrument/timeframe and reconcile after mutations.
- Keep access tokens in memory; use HttpOnly refresh cookies, CSRF header/cookie and allowed Origin checks. Never put secrets in browser storage or public Vite variables.
- Enforce ownership in database queries. A UUID alone grants no access.
- Redact passwords, tokens, cookies, provider secrets and private journal content from logs. Never commit `.env`, credentials or user database dumps.
- Preserve mutation IDs for retries after uncertain outcomes; never create duplicate orders or replay steps.

## Verification and handoff

- Write failing-then-passing tests for trading domain rules. Use real PostgreSQL integration tests for locking, NUMERIC, constraints and rollback; do not substitute SQLite.
- Frontend checks: lint, relevant Vitest/React Testing Library/MSW tests and production build. Add Playwright for critical integrated flows in the planned phases.
- Backend checks: Ruff, relevant Pytest unit/integration/API tests and migration validation as appropriate to the phase.
- Verify accessible keyboard interactions, dark/light themes, responsive layouts and loading/empty/error/partial-data states.
- Report changed files, migrations, implemented routes, checks actually run, manual reproduction steps, assumptions and known gaps. Never claim checks passed if unavailable or not executed.
- Ask only for missing information or permissions that genuinely block the current authorized work. No paid service, broker credential or AI key is required for the demo MVP.

## Separate repository documentation

Read [repository setup](doc/repository_setup.md). Keep only frontend documentation here. Companion document links assume sibling frontend/backend checkouts; if checked out elsewhere, locate the companion repository before changing affected contracts. Do not create duplicate specifications or plans.
