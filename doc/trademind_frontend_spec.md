# TradeMind AI — Frontend Product, UX and Engineering Specification

**Document:** `trademind_frontend_spec.md`  
**Version:** 1.0 | **Prepared:** 17 October 2026 | **Status:** Build-ready specification  
**Companion:** `trademind_backend_spec.md` (authoritative for domain rules, storage, API semantics and execution)

> **Codex instruction:** Read BOTH specification files before changing code. Implement in the ordered vertical slices in §17; do not attempt every phase in one pass. When a UI requirement and an API behavior appear to conflict, backend business rules are authoritative, and the discrepancy must be reported rather than guessed.

## 1. Product vision and success criteria

Build **TradeMind AI**, a premium desktop-first, mobile-usable Indian-equity *trading research and paper-trading* website. It should feel as polished and usable as professional charting and brokerage products while having its own design identity. The key job-to-be-done is:

**Search an instrument → inspect historical candles and indicators → assess a trade with transparent risk information → place a virtual order → step through market replay → monitor simulated holdings and P&L → review trading decisions.**

This is a trading **simulation**, not a licensed broker, exchange feed, or investment adviser. Display `PAPER TRADING · VIRTUAL MONEY` prominently on every trade-capable page. Historical/demo/delayed source and as-of time must be visible near prices. Never imply that a demo price is live or a simulated fill is a real execution. AI output is educational analysis, not a guarantee or an autonomous order instruction.

### Product success criteria for MVP

1. A new user can register, create a paper account seeded with **INR 100,000**, find an instrument, and open an interactive chart.
2. The user can start a **deterministic historical replay**, place a paper MARKET or LIMIT buy/sell, and advance the simulation to execute eligible orders.
3. Order status, reserved funds, holdings, realized/unrealized P&L and transaction history stay consistent after refresh, with backend as source of truth.
4. A pending order can be canceled, and a trade cannot silently exceed available funds or owned shares.
5. Technical indicators and risk calculations use data at or before the selected simulation time; there is no future-data leakage.
6. Loading, empty, partial-data, stale-feed, validation and backend-error states are designed, not blank screens.
7. Frontend code is readable, testable and modular; keyboard controls, responsive layouts and clear feedback work.

## 2. Scope boundaries and release plan

| Feature | Release | Notes |
|---|---|---|
| Auth, settings, profile | MVP | Email/password, safe session recovery |
| Desktop trading shell, instrument search, watchlist | MVP | Demo NSE cash equities, synthetic/licensed fixtures |
| Candlestick chart and volume | MVP | 1-day candles; chart library integration |
| Indicators | MVP | EMA(20), EMA(50), RSI(14), MACD, ATR(14); backend-calculated |
| Historical replay | MVP | User-controlled virtual clock; next-bar processing |
| Long-only cash paper trading | MVP | MARKET/LIMIT, BUY/SELL, GTC within replay for LIMIT; no leverage |
| Paper wallet, orders, positions, portfolio, journal | MVP | Persistent, cross-refresh state |
| Deterministic risk preview | MVP | Position exposure and risk/reward if valid stop/target provided |
| Chart annotations for entry/limit/stop/target | MVP | Basic markers/lines; no advanced drawing suite |
| AI analysis explainer | Phase 2 | Evidence-grounded optional local/free-tier LLM |
| Rule-based backtesting | Phase 2 | Historical metrics + no-look-ahead audit |
| Forecast range / ML probability | Phase 2 | Only after out-of-sample validation and calibration |
| Alerts, export, multi-timeframe, replay speed controls | Phase 2 | With accurate feed/time labeling |
| Intraday, short selling, margin, derivatives, advanced order types | Later | Separate simulator model and rules |
| Broker linking, live portfolios, real-money execution | **Later, expressly excluded** | Do not create real broker or order-send buttons in MVP |

### Non-goals for initial implementation

Do not implement payment subscriptions, proprietary indicators, broker credentials, real-money order APIs, unlicensed quote redistribution, guaranteed trade signals, options/futures execution, push notifications or complex microservices. Do not add fake success metrics or hardcoded P&L that appears live. Avoid copying TradingView, Kite or Groww logos, protected screen layouts or branded assets.

## 3. UX reference principles

- **TradingView-like charting concepts:** large candle chart, crosshair, price/time scales, tooltips, timeframes, indicator legend, compact watchlist, chart markers.
- **Kite-like trading flow:** searchable instrument, explicit BUY/SELL order ticket, orders tab, holdings/positions, rejection reason, account summary.
- **Groww-like clarity:** first-use guidance, readable numbers, simple hierarchy and understandable terminology.
- **Own identity:** TradeMind AI brand, distinctive typography and restrained colors; no visual clone or deceptive brokerage branding.

Use **TradingView Lightweight Charts** as a candidate charting library (not Supercharts). Verify compatible installed version and comply with the project LICENSE/NOTICE and on-page TradingView attribution/link: https://github.com/tradingview/lightweight-charts ; https://tradingview.github.io/lightweight-charts/docs/ . Advanced drag trading and drawing tools are **not** assumed to be built into this library.

## 4. User personas and journeys

**Beginner learner:** wants paper capital, clear risk warnings, simple search and a guided first mock trade. **Intermediate trader:** wants speed, chart indicators, limit order ticket and order/position management. **Advanced learner:** wants replay, transparent strategy metrics and accurate audit history.

### Journey A: first successful mock BUY

1. Open the application at `/`, which routes to login; sign up/login. There is no marketing landing page or guest dashboard preview. After first login, create/initialize paper account if absent.
2. Dashboard shows `PAPER / DEMO` badge, cash `₹1,00,000.00`, data source `Historical replay`, watchlist and onboarding hints.
3. Search `RELIANCE` (illustrative symbol) via keyboard-friendly typeahead; select an instrument by **instrument ID**, not symbol alone.
4. Open Markets/Terminal, inspect `1D` candles, EMA/RSI and last completed replay bar. User selects Buy, Market, quantity 5.
5. Order ticket shows estimated notional, reserved amount/estimated costs, execution assumption `next replay bar`, available cash; warns price is not guaranteed.
6. User confirms. API returns `PENDING`; toast and Orders tab update. UI **does not** immediately claim it filled.
7. User clicks `Next candle`; backend advances bar and processes eligible orders; order becomes `FILLED` or `REJECTED` with reason; wallet and position update.
8. Chart shows fill marker; portfolio shows quantity, average acquisition cost and marked P&L. Refresh preserves all state.

### Journey B: sell all or part of owned shares

Sell order can be entered only for unreserved owned quantity. Display `Available to sell`. Submit and await next eligible bar; after fill, update quantity and realized P&L. Partial position closing is supported; **partial order fills are not supported in MVP**.

### Journey C: limit order and cancel

Place a pending limit BUY or SELL. Display limit line and `PENDING`, reserved cash/shares, and cancel affordance. The user can cancel until the execution engine fills it. Clicking cancel after fill returns a readable conflict response; no optimistic assumption of cancel success.

### Journey D: data missing or replay ended

Show exact state: no historical candles, paused replay, completed replay, stale provider, or no future bar. Disable unavailable actions with explanatory text. Never auto-fill from missing candle data.

## 5. Information architecture / routes

**Public**
- `/` — login entry point; redirects to `/login`. No separate landing page or guest dashboard preview.
- `/login`, `/register` — authentication; `/forgot-password` deferred unless backend support is added.

**Authenticated app under `/app`**
- `/app/dashboard` — virtual portfolio summary, account balances, tracked instruments, active orders, recent activity, replay status.
- `/app/markets` — searchable instruments with watchlist and selectable instrument rows.
- `/app/terminal/:instrumentId` — main trading workstation with candlesticks, watchlist, indicators, order ticket, positions/orders.
- `/app/paper` — paper account summary, replay control, virtual wallet, positions and trade activity.
- `/app/orders` — all orders, status filtering, cancel actions, rejection reason and pagination.
- `/app/portfolio` — simulated holdings, allocation and realized/unrealized P&L; never label as a real broker portfolio.
- `/app/journal` — list/create/edit notes tied to an instrument, trade or replay timestamp.
- `/app/settings` — preferences, timezone, theme, account and safe reset action.

**Phase 2**
- `/app/ai` — analysis reports, evidence, model/version, data freshness, caveats.
- `/app/backtests` — strategy run inputs, progress, metrics and equity curve.
- `/app/forecast` — forecast distribution/ranges with validation statistics.
- `/app/alerts` — explicit rules and notifications.

Protected routes must redirect unauthenticated users to `/login` with an allowed internal `returnTo` path; never allow an arbitrary external redirect.

User-approved routing correction (19 October 2026): all `/app/*` pages require successful authentication. While authentication is not implemented, keep those routes closed and show login with sign-in clearly unavailable; do not provide a mock or guest-access bypass.

## 6. Design system

### Visual direction

Professional, calm, information-dense trading console; strong dark-mode default with a complete light-mode alternative. Avoid enormous cards that bury chart space; use meaningful typographic hierarchy and fine dividers. Theme tokens, not magic hex codes scattered across components.

Suggested tokens (design guidance; refine for accessibility):

```css
:root[data-theme='dark'] {
  --bg: #0C111B;
  --panel: #131B29;
  --panel-alt: #1A2433;
  --border: #293548;
  --text: #E8EEF8;
  --muted: #9BAAC0;
  --accent: #568BFF;
  --gain: #27B58B;
  --loss: #F07272;
  --warning: #F1B85B;
  --focus: #A4BEFF;
}
:root[data-theme='light'] {
  --bg: #F5F7FA;
  --panel: #FFFFFF;
  --panel-alt: #EDF1F6;
  --border: #D7E0EB;
  --text: #182338;
  --muted: #506078;
  --accent: #285FD6;
  --gain: #078063;
  --loss: #C93E46;
  --warning: #996100;
  --focus: #285FD6;
}
```

- Fonts: Inter or a freely licensed system sans; mono/tabular digits for price, units and P&L; don't bundle paid fonts.
- Spacing: 4px base scale; desktop touch/click targets at least 36px, mobile at least 44px where practicable.
- Radius: 8–12px on panels, 6px on controls; subtle shadows only.
- Green/red are supplemental: always print `+/-`, BUY/SELL and explicit text to preserve meaning for color-vision deficiencies.
- INR display: `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`; `quantity` integers for cash equities; preserve provider tick precision in API contracts; don't round during calculations.
- Trade dates: backend UTC ISO timestamps; UI displays **Asia/Kolkata**, with tooltip exposing precise timezone/as-of.
- Density: desktop `Comfortable`/`Compact` preference may be added later; do not sacrifice accessibility.

### Responsive breakpoints

- **>=1440px:** side navigation 220–240px; optional watchlist left rail ~250px, main chart flexible (min 600px), order ticket right rail ~320px; bottom tab panel for orders/positions.
- **1024–1439px:** collapsible rail and chart with one side panel active at a time.
- **768–1023px:** navigation drawer; chart full width; order ticket as drawer; tabs below chart.
- **<768px:** stacked layout, sticky instrument header, chart occupying main viewport height, buy/sell actions opening full-screen modal/sheet; no hover-only interactions. Horizontal tables become accessible scroll regions or compact cards.

### Global shell

Header: logo, global instrument search, `PAPER / HISTORICAL` environment badge, replay clock/as-of, theme icon, user menu. Left nav: Dashboard, Markets, Terminal, Paper Trading, Orders, Portfolio, Journal, Settings. Footer/status line: data source, data freshness, simulated status, attribution and links. Do not claim `Market Open` unless exchange calendar data is valid; demo replay uses `Replay Running/Paused` instead.

## 7. Screen-by-screen requirements and example layouts

### 7.1 Dashboard `/app/dashboard`

```text
┌ TradeMind AI ─ Search instruments ─ PAPER/HISTORICAL ─ Replay: 2025-07-04 ─ User ┐
│ Sidebar       │ Cash available  │ Reserved  │ Market value │ Equity │ Total P&L   │
│ Dashboard     ├────────────────────────────────────────────────────────────────────┤
│ Markets       │ Watchlist / snapshot         │ Active replay and Next Candle       │
│ Terminal      │ AAPL? no: NSE demo symbols   │ Last bar time, source, status        │
│ Paper         ├────────────────────────────────────────────────────────────────────┤
│ Orders        │ Open orders                   │ Virtual holdings & recent activity  │
│ Portfolio     └────────────────────────────────────────────────────────────────────┘
└──────────────────────── Data is historical and trades are simulated ──────────────┘
```

All KPI values from `GET /api/v1/paper/portfolio`; never frontend-computed ledger totals. Show initial empty account with onboarding CTA. `Total P&L` needs explicit metric definition in tooltip. Cards link to relevant pages.

### 7.2 Markets `/app/markets`

- Debounced 250–350ms search; keyboard up/down, Enter to select, Esc to close; symbol, company, exchange, asset class.
- Rows: symbol, company, current *replay last completed close*, change if comparable previous bar exists, as-of and source. `N/A` instead of fabricated values.
- Favorites/watchlist using persistent API; toggle with optimistic UI only if rollback/feedback is implemented.
- Search result should never assume symbols globally unique; use instrument ID + exchange.

### 7.3 Trading terminal `/app/terminal/:instrumentId`

```text
┌ Instrument: RELIANCE (NSE_EQ) ─ Replay bar 2025-07-04 ─ [Next candle] ────────┐
│ 1D | Candles | EMA20 | EMA50 | RSI | MACD | Volume | [Data source/as-of]     │
├ Watchlist ───┬──────────────────────────────────────────────┬ Order ticket ────┤
│ Search       │ Candlesticks + volume + overlays             │ BUY | SELL       │
│ Instruments  │ Crosshair, OHLC tooltip, price/time scales   │ Market | Limit   │
│ Prices       │ Order/fill markers, optional price lines     │ Quantity        │
│              │                                              │ Limit price     │
│              │ RSI/MACD subpanel (tab if space limited)     │ Risk preview    │
│              │                                              │ Submit          │
├──────────────┴──────────────────────────────────────────────┴─────────────────┤
│ Tabs: Positions | Open Orders | Executions | Account | Journal             │
└───────────────────────────────────────────────────────────────────────────────┘
```

**Interactions:**
- Change instrument without losing unrelated session data; `instrumentId` is URL path and query key.
- Timeframe `1D` supported in MVP. Visually disable and label unsupported intraday options as `Coming later` or omit.
- Fetch ascending candles within selected replay horizon **only**; no future-bar API leakage into UI while replay is active. For data previews outside active replay, label `Historical chart – viewing completed archive`, and disable trade action unless a replay exists.
- Crosshair shows OHLC, volume and time; missing candles produce gaps rather than zero values.
- Chart uses `ResizeObserver` and stable `useEffect` cleanup to avoid duplicate instances; memoize series updates; maintain scroll position when new replay bars arrive.
- Overlay EMA20/50 on main chart; lower indicator panels can be separate synchronized charts, or tabs if implementation complexity requires. Server computes canonical values; chart formatting only on frontend.
- Order ticket toggles BUY / SELL; side never inferred from text color. Fields: order type, integer quantity, limit price when required, optional planned stop and target for *risk preview only* (not active stop orders in MVP).
- Pre-submit preview from server endpoint shows affordability/available shares, conservative reservation and warnings; user must explicitly confirm. Do not equate estimated fill with actual fill.
- Backend response drives status; order submitted toast `Pending virtual order; evaluated on next eligible replay bar`.
- Show all pending orders for account as potentially affecting available buying power, not just this instrument.
- `Next candle` advances deterministic replay. Disable while request in progress; resync orders, quotes, chart and portfolio **after server confirms** advance.
- Bottom Orders grid: ID (short), side, symbol, type, quantity, limit, status, creation timestamp, fill price/time, rejection reason, cancel action if eligible.
- Bottom Positions grid: owned quantity, average price, last replay mark, unrealized P&L, realized P&L; `Sell` opens ticket prefilled with instrument.
- Stale/no data: `Replay cannot advance; no eligible candle`, with safe no-order consequence.

### 7.4 Paper account `/app/paper`

Show account initial virtual funds, cash available, cash reserved, virtual holdings market value, equity, historical equity chart and daily/period P&L (only when metrics valid). Replay session panel: status, dataset, source, interval, current simulation time, `Next candle`, restart/reset with guarded confirmation. Restart finishes the active replay (expiring pending orders) and starts a new account/session, retaining earlier sessions in history; no silent deletion. Past sessions are view-only.

### 7.5 Orders `/app/orders`

- Filter `ALL / PENDING / FILLED / CANCELED / REJECTED / EXPIRED`; sorting and server-side cursor pagination.
- Per row full order details drawer: client order ID, placed time, replay time, source, reservation, validation feedback, fill execution(s), audit trail.
- Cancel pending orders, confirm before action. If a filled order is canceled concurrently, API 409/422 is shown and list refetched.
- Market orders **may be PENDING** until next eligible bar; do not assume instantaneous success.

### 7.6 Portfolio `/app/portfolio`

- Clearly labeled `Simulated portfolio`; cash, reserved, holdings market value, total equity, total P&L.
- Holdings table: symbol, shares, avg cost, current replay mark, value, cost basis, unrealized P&L, share of equity; user can go to chart or sell.
- Explicit lack of broker connection: **not a live portfolio**.
- Do not compute global values by summing paginated rows; get totals from portfolio endpoint.

### 7.7 Journal `/app/journal`

- User-created notes linked to a paper trade/order/instrument; tags `entry-reason`, `risk`, `lesson`, user-defined labels; notes can be edited/deleted only by owner.
- `Create note`, optional trade association, Markdown-safe plain text (do not render raw HTML), filter by dates/instrument, pagination.
- Phase 2 AI summarization is separate and must be opt-in/clearly identified as AI-generated.

### 7.8 Authentication/settings

- Signup: name, email, password, confirm password, terms acknowledgement; inline field validation and backend errors. Never echo secrets.
- Login, logout and auto-refresh through backend; access token kept **in memory**, not `localStorage`. Refresh cookie is HttpOnly with secure production configuration and CSRF protection as documented by backend.
- Form validation via React Hook Form + Zod or equivalent; backend remains final validation authority.
- Settings: theme, locale/timezone display (MVP fixed en-IN and Asia/Kolkata is acceptable), reset simulation with double confirmation `RESET` (finish active session, then create new one), session management and past-session review.

### 7.9 Phase 2 AI analysis / forecast UI

- Show `Market context`, `Indicators and evidence`, `Bull/bear scenarios`, `Key risks`, `Data as of`, `LLM model/version`, and a `Not investment advice` note.
- Never show an unvalidated LLM-generated exact `win probability` / `90% accurate` / `guaranteed target`. Probability only if backed by an evaluated, calibrated forecasting model and disclosed horizon.
- Display unavailable AI as `AI analysis is unavailable; indicators and paper trading remain usable`. Never block basic trading simulator on AI service failure.
- AI cannot submit orders from its chat output. If suggestions link to order ticket, user must manually review and confirm.
- Backtest screen reports window, sample size, fees/slippage, baseline, win rate, max drawdown, equity curve, and warnings about overfitting/look-ahead bias.

## 8. Shared API contract — frontend MUST implement exactly

**Base:** `VITE_API_BASE_URL=http://localhost:8000/api/v1` in development. All money/price transport uses **decimal strings** (e.g. `"2450.25"`), no currency symbol; use decimal.js or a carefully constrained display converter. Quantities are JSON integers. API times ISO 8601 UTC; `instrument_id` is an opaque string/UUID; dataset and session IDs are opaque. Exact contracts and validations are defined in backend companion, §8–§12.

### Required MVP endpoints

| UI use | HTTP | Endpoint |
|---|---|---|
| Register | POST | `/auth/register` |
| Login | POST | `/auth/login` |
| Refresh | POST | `/auth/refresh` |
| Logout | POST | `/auth/logout` |
| Current user | GET | `/users/me` |
| Search instruments | GET | `/instruments?query=...&limit=20` |
| Instrument details | GET | `/instruments/{instrument_id}` |
| Watchlist | GET, POST, DELETE | `/watchlist`, `/watchlist/{instrument_id}` (see backend) |
| Datasets | GET | `/market/datasets` |
| Historical/replay candles | GET | `/market/instruments/{instrument_id}/candles?session_id=...&timeframe=1d&limit=...` |
| Current replay quote | GET | `/market/instruments/{instrument_id}/quote?session_id=...` |
| Technical indicators | GET | `/market/instruments/{instrument_id}/indicators?session_id=...&timeframe=1d` |
| Get current session | GET | `/paper/sessions/active` |
| Browse past replay sessions | GET | `/paper/sessions`, `/paper/sessions/{session_id}` |
| Start replay | POST | `/paper/sessions` |
| Replay step | POST | `/paper/sessions/{session_id}/advance` |
| Cancel/finish replay | POST | `/paper/sessions/{session_id}/finish` |
| Account/portfolio summary | GET | `/paper/portfolio?session_id=...` (optional) |
| Position list | GET | `/paper/positions?session_id=...` (optional) |
| Validate order before confirmation | POST | `/paper/orders/preview` |
| Hypothetical trade risk preview | POST | `/risk/preview` |
| Place order | POST | `/paper/orders` |
| Get/filter orders | GET | `/paper/orders?status=...&cursor=...` |
| Order detail | GET | `/paper/orders/{order_id}` |
| Cancel pending order | POST | `/paper/orders/{order_id}/cancel` |
| Fills/trade activity | GET | `/paper/executions` |
| Balance movements | GET | `/paper/ledger` |
| Performance/equity history | GET | `/paper/performance?session_id=...` (optional) |
| Journal CRUD | GET/POST/PATCH/DELETE | `/journal`, `/journal/{note_id}` |

HTTP response bodies use plain JSON resources (no generic `data` envelope). Lists use `{ "items": [...], "next_cursor": null }`. Failures use `{ "error": { "code": "...", "message": "...", "details": ... }, "request_id": "..." }`.

### Examples: contract snapshots

```json
{
  "id": "inst-reliance-demo",
  "symbol": "RELIANCE",
  "name": "Reliance Industries (demo instrument)",
  "exchange": "NSE",
  "asset_type": "EQUITY",
  "currency": "INR",
  "tick_size": "0.05",
  "lot_size": 1,
  "data_source": "DEMO_FIXTURE"
}
```

```json
{
  "id": "sess-123",
  "dataset_id": "india-equities-demo-v1",
  "mode": "HISTORICAL_REPLAY",
  "status": "ACTIVE",
  "timeframe": "1d",
  "simulated_at": "2025-07-04T10:00:00Z",
  "next_bar_available": true,
  "initial_cash": "100000.00",
  "currency": "INR"
}
```

```json
{
  "instrument_id": "inst-reliance-demo",
  "side": "BUY",
  "order_type": "MARKET",
  "quantity": 5,
  "limit_price": null,
  "client_order_id": "client-uuid-generated-per-submit"
}
```

```json
{
  "id": "order-123",
  "session_id": "sess-123",
  "instrument_id": "inst-reliance-demo",
  "side": "BUY",
  "order_type": "MARKET",
  "quantity": 5,
  "limit_price": null,
  "status": "PENDING",
  "reserved_cash": "12750.00",
  "reserved_quantity": 0,
  "filled_quantity": 0,
  "average_fill_price": null,
  "rejection_reason": null,
  "placed_simulated_at": "2025-07-04T10:00:00Z"
}
```

These are **illustrative contract shapes, not market prices or computed reservation examples**; backend must calculate reservations via its simulation rules and may return additional documented keys but may not silently rename these fields.

## 9. Frontend data behavior

- Use **TanStack Query** for fetching, caching and invalidation; a small **Zustand** store for non-server UI state (active panels, selected indicator, user theme). Do not duplicate account truth in Zustand.
- Central API client adds Authorization access token, request ID and handles errors. One refresh flow at a time; retry once after refresh and then log out safely. Avoid infinite refresh loops.
- Query keys include `session_id`, `instrument_id`, `timeframe`, filters and limits. Changing replay session invalidates candles, quotes, indicators, orders and portfolio queries.
- No fake optimistic order fills; submit/cancel can temporarily show busy state and then reconcile response.
- Poll only where needed (e.g., 10–30 seconds for account updates if multiple tabs), but **replay step must explicitly invalidate/refetch all dependent queries**. Phase 2 can introduce WebSocket/SSE with reconnect and sequence reconciliation.
- Use `AbortController` for stale instrument requests and avoid race conditions when switching symbols quickly.
- Never call third-party market data APIs directly from browser if credentials, licensing or caching require backend proxy.
- Keep sensitive auth responses out of error logs and frontend analytics.

## 10. Components and ownership

```text
frontend/
├── public/
├── src/
│   ├── app/                      # router, providers, app-level bootstrap
│   ├── components/
│   │   ├── layout/               # Shell, Sidebar, Header, StatusBar
│   │   ├── ui/                   # Button, Input, Tabs, Modal, Toast, Skeleton
│   │   └── charts/               # CandleChart, VolumePane, IndicatorPane
│   ├── features/
│   │   ├── auth/                 # forms, auth context, guard, API
│   │   ├── instruments/          # search, watchlist, detail
│   │   ├── market/               # quote, candles, indicator view
│   │   ├── replay/               # session picker, replay control
│   │   ├── paper-trading/        # OrderTicket, OrderPreview, OrdersTable, PositionTable
│   │   ├── portfolio/            # summary, positions, equity history
│   │   ├── journal/              # notes CRUD
│   │   ├── ai/                   # Phase 2 only
│   │   └── backtests/            # Phase 2 only
│   ├── pages/                    # route screens; mostly compose features
│   ├── services/                 # typed-by-JSDoc API client, auth, formatters
│   ├── hooks/                    # reusable hooks
│   ├── stores/                   # Zustand ephemeral UI stores
│   ├── styles/                   # tokens, reset, layout, global styles
│   ├── test/                     # test utils, MSW fixtures
│   └── main.jsx
├── .env.example
├── package.json
└── vite.config.js
```

**Language:** JavaScript + JSX, **not TypeScript**. Use JSDoc where beneficial for API contracts; ESLint rules, Prettier, accessible semantics. Prefer CSS Modules and shared CSS custom properties; no inline hardcoded colors in features. Suggested stack: React, Vite, React Router, TanStack Query, Zustand, Lightweight Charts, React Hook Form, Zod, Vitest/React Testing Library, MSW; Playwright for crucial end-to-end flows. Validate current library versions before installation; avoid unnecessary dependencies.

## 11. Forms, calculations and input safety

- UI estimates are *display-only*. Never authorize trades using frontend calculations. Server preview & placement both validate under database lock.
- Use integer quantity >=1. Price input must be positive, valid for instrument tick increment and order type; pass exact decimal as string. SELL cannot exceed available quantity, BUY cannot exceed unreserved cash under backend risk/reservation rules.
- `Market` disables limit price. `Limit` requires limit price and remains GTC until filled, canceled or replay finished. Planned stop/target create **only** a risk preview; they are not persisted as execution instructions until stop/target order support is implemented.
- Render `NaN`, negative invalid fields, overflow or unknown quote as readable validation/error states; don't allow malformed payloads.
- If quote/data is stale or session inactive, show action disabled with reason. Client-side status is only UX guard; backend rejects too.
- Provide screen-reader announcement for order success/rejection; focus moves to error summary on failed form.

## 12. Security and privacy UX

Use backend-issued login tokens; never place refresh tokens in JS-readable storage. No unescaped HTML in journal or AI outputs; sanitize Markdown. Avoid `dangerouslySetInnerHTML`. CSP appropriate for charting, exact CORS origins, accessible logout. Obfuscating buttons is not authorization. Do not store broker credentials (not in scope). Always show confirmation on paper-account reset and make recovery/audit policy clear. Keep API secrets off Vite environment (all `VITE_*` variables are public).

## 13. Empty, loading and exceptional states matrix

| Situation | Required UI |
|---|---|
| First login/no session | Welcome checklist + `Start paper trading` CTA |
| Empty watchlist | Discover instruments CTA |
| No candles in dataset | Empty chart with `No historical data for selection`; disable order entry |
| Replay finished | `Replay complete`, orders reconciled, no more next-bar actions |
| Quote missing / stale | Source/as-of warning; block order or preview according to backend |
| API 401 | Attempt refresh, then controlled login redirect |
| API 403 | Access denied, not a generic 500 |
| API 409 | Stale session/order transition message; refetch |
| API 422 | Field-level validation and exact message |
| API 429 | Rate limit message and retry-after if supplied |
| API 5xx / network | Non-destructive retry; preserve form values |
| AI service unavailable | Clear disabled AI state; core simulator continues |
| Slow charts / 10k rows | Server pagination, candle limits, virtualized lists when needed |

## 14. Accessibility and localization

Follow WCAG 2.2 AA as target. Full keyboard use for search, nav, order forms, dialogs and accessible focus order. Every icon-only button has `aria-label`; modals trap focus and restore it after closing; visible focus ring; no color-only indication; contrast-checked theme. Live status updates use `aria-live` judiciously. Date time explicitly says `IST` / `Asia/Kolkata`; for demo history, display correct historical date, not today's time. INR/Indian digit grouping. Later internationalization can be added without placing user-facing copy throughout low-level services.

## 15. Performance requirements

- Route-level code splitting and loading fallbacks.
- Chart only creates one instance per mount; cleanup observers, subscriptions and series on unmount; throttle updates.
- Request pagination for order lists and activities. Avoid re-rendering all 1,000 instruments on every keystroke.
- Smooth interaction at desktop 1366px and mobile 375px; no horizontal overflow of main shell (tables may scroll within a bounded region).
- Budget goals for local demo, not guaranteed SLAs: app renders usable shell in ~2s on normal laptop connection; common client actions provide feedback in <300ms where backend allows. Measure, do not assert benchmarks without tests.

## 16. Tests and acceptance criteria

**Unit:** money/date formatters, status labels, risk input guards, auth refresh controller, watchlist updates. **Component:** login validation, search keyboard behavior, MARKET/LIMIT form toggles, order preview failures, order cancel 409, chart empty state, responsive nav. **Integration with MSW:** authenticated first-use workflow, replay step invalidates queries, order remains PENDING until step, portfolio updates on FILLED, missing-quote blocking. **E2E with backend:** new user → seeded session → select instrument → pending buy → advance → filled → sell → realized P&L → reload and confirm persistence.

**Definition of done for a screen:** correct API fields; loading/error/empty states; dark/light responsive; keyboard/a11y; tests; no fictitious live data; no console errors; traceable link to feature requirements.

## 17. Codex execution roadmap (follow in order; stop after each slice)

1. **F0 Foundation:** Vite React JavaScript, app router, theme tokens, reusable UI, layout, lint/tests, mocked empty screens. Build to desktop/mobile and verify.
2. **F1 Auth:** register/login/logout/me, route guard, refresh recovery and settings. Use real FastAPI endpoints once B1 exists.
3. **F2 Market discovery:** instrument list/search/watchlist, quote badges and historical candlesticks + volume using backend demo fixtures. Confirm licensing attribution.
4. **F3 Replay terminal:** replay session selector/current clock/next bar, quote/time coupling and indicator overlays. Do not reveal future bars.
5. **F4 Paper orders:** order ticket, preview, pending/cancel, order details, execution status and errors. Connect to B4 execution logic.
6. **F5 Portfolio and journal:** wallet/positions/performance, ledger, account history, journal CRUD, reset confirmation.
7. **F6 Hardening:** full component/integration/E2E suites, responsive tests, accessibility, reliable errors.
8. **F7 Phase 2:** AI reports, forecasting and backtesting only after backend endpoints are genuinely implemented.

At every slice, Codex must: (a) summarize code to change; (b) implement one vertical slice; (c) run lints/tests/build; (d) report evidence and blockers; (e) update spec only with explicit approval. Do not fabricate a data feed, AI accuracy or feature that isn't implemented.

## 18. Local setup and environment contracts

```bash
# after frontend project exists
cd frontend
npm install
cp .env.example .env
npm run dev
npm run lint
npm test
npm run build
```

`.env.example`:

```dotenv
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=TradeMind AI
```

Frontend dev origin `http://localhost:5173`; backend should allow this *specific* dev origin. Auth refresh uses cookie `credentials: 'include'` on authorized auth requests; refresh/logout also send `X-CSRF-Token` from the backend-issued readable CSRF cookie, never from localStorage. Don't store backend database credentials or third-party market API tokens in frontend files.

## 19. External technical references

- TradingView Lightweight Charts API, NOTICE and licensing: https://tradingview.github.io/lightweight-charts/docs/ and https://github.com/tradingview/lightweight-charts
- TradingView Paper Trading overview: https://www.tradingview.com/support/solutions/43000516466-paper-trading-main-functionality/
- Kite order types: https://support.zerodha.com/category/trading-and-markets/general-kite/others-kite/articles/order-types-and-execution
- React: https://react.dev/ ; Vite: https://vite.dev/ ; TanStack Query: https://tanstack.com/query/latest
- Accessibility baseline: https://www.w3.org/TR/WCAG22/

**Final UI principle:** Look and behave like a trustworthy trading *practice platform*; be candid about simulated prices and uncertain AI analysis. Build the simulator correctly before decorating it.
