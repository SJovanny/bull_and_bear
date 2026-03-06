# Product Requirements Document (PRD)

## 1. Product Summary
Build a responsive trading journal web app that helps traders improve performance by combining trade tracking, behavioral journaling, and performance analytics.

Core outcomes for users:
- Understand what is working and what is not
- Quantify profitability, consistency, and discipline
- Build and validate repeatable strategies
- Review emotional/mental patterns linked to results

## 2. Target Users
- Active retail traders (futures, stocks, options, forex)
- Traders with one or more broker accounts
- Mentor/mentee pairs reviewing trading behavior
- Small private communities of traders

## 3. Success Metrics (V1)
- Weekly active users (WAU)
- Trades logged/imported per active user per week
- Journal completion rate per trading day
- Retention at day 7 and day 30
- Percentage of users reviewing dashboard >= 3 times/week
- Percentage of users with at least one discipline rule configured

## 4. Functional Requirements

### 4.1 Authentication and Accounts
- Users can register/login/logout
- Multi-user support with per-account data isolation
- Users can manage one or more trading accounts

Acceptance criteria:
- A user cannot access another user's data
- Account switching updates all dashboard and table views correctly

### 4.2 Trade Capture
- Manual trade create/edit/delete
- Trade fields: symbol, side, quantity, entry/exit, fees, date/time, setup tag, notes, screenshot
- Multi-leg support (v1 minimal: optional multiple legs)

Acceptance criteria:
- Invalid values are blocked with field-level errors
- Edits are reflected in analytics within one refresh cycle

### 4.3 CSV Import
- Upload CSV and map columns to internal schema
- Provide saved templates for common broker exports
- Preview import before confirm
- Idempotent ingestion to avoid duplicates

Acceptance criteria:
- Users see import summary: imported/skipped/errors
- Re-importing same file does not duplicate existing rows

### 4.4 Journal and Psychology
- Daily journal entries
- Trade-linked notes
- Mental state tags (confidence, focus, fear, revenge, patience)
- Reflection fields: pre-market plan, execution quality, lessons learned

Acceptance criteria:
- Journal entries can be filtered by date and linked trades
- Emotional tags appear in analytics cross-filters

### 4.5 Discipline and Rule Engine
- User-defined rules (examples: max risk per trade, no overtrading, stop after X losses)
- Automatic checks against trade data
- Manual override with explanation note

Acceptance criteria:
- Each trading day has a discipline score
- Rule violations are traceable to specific trades and timestamps

### 4.6 Dashboard and Analytics
- KPI cards: net PnL, expectancy, profit factor, win rate, avg win/loss, drawdown
- Charts: equity curve, cumulative PnL, day-of-week and time-of-day breakdown
- Segment filters: account, symbol, setup, date range

Acceptance criteria:
- KPI values match calculation reference tests
- Dashboard filters apply consistently to cards/charts/tables

### 4.7 Calendar Evolution View
- Monthly heatmap with daily PnL
- Day click opens drill-down details
- Weekly and monthly summary blocks

Acceptance criteria:
- Calendar supports quick month navigation
- Drill-down shows trades, journal notes, discipline events for selected day

### 4.8 Playbook and Strategy Tracking
- Define setups and checklists
- Attach trades to setups
- Compare setup compliance vs outcomes

Acceptance criteria:
- Setup performance is visible with win rate + expectancy + sample size

### 4.9 Backtesting (Lightweight V1)
- Log simulated setups/trades
- Compare backtest outcomes to live outcomes

Acceptance criteria:
- Backtest sessions are isolated from live records
- Comparison views can be filtered by setup

### 4.10 Community and Mentoring
- Share selected trades/journals with explicit permissions
- Comment threads for feedback

Acceptance criteria:
- Shared items respect visibility settings (private, invite-only)

## 5. Non-Functional Requirements
- Responsive support: mobile and desktop first-class
- Performance: dashboard should remain usable under growing datasets
- Security: role-based data access and protected endpoints
- Reliability: import processes must return deterministic outcomes
- Accessibility: keyboard navigation and readable contrast

## 6. Responsive Requirements
Desktop:
- Dense data table mode and multi-panel dashboards
- Persistent side navigation

Mobile:
- Bottom navigation or compact top navigation
- Stack widgets/cards vertically
- Expandable rows for table details
- Filter drawer and touch-friendly controls

## 7. Out of Scope (Initial Release)
- Native mobile applications
- Direct broker APIs (CSV first)
- Automated strategy execution

## 8. Milestone Mapping
- M1: Auth + schema + project setup
- M2: Manual trade CRUD + CSV import
- M3: Journal + discipline engine v1
- M4: Dashboard + calendar analytics
- M5: Playbook + backtesting
- M6: Community + launch hardening

## 9. Risks and Mitigations
- Risk: CSV format fragmentation across brokers
Mitigation: template library + robust preview/validation + row-level error reporting

- Risk: Scope bloat in v1
Mitigation: strict milestone gates and release criteria

- Risk: Analytics performance under larger data
Mitigation: indexes, caching, pre-aggregation where needed

## 10. Open Questions
- Which 3 broker CSV templates should be prioritized first?
- Should mentor role have limited read-only or comment-only permissions by default?
- What should be the default discipline score weighting model?
