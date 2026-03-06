# User Flows

## 1. Information Architecture
Primary navigation:
- Dashboard
- Trades
- Calendar
- Journal
- Discipline
- Playbook
- Backtesting
- Community
- Settings

## 2. Flow: New User Onboarding
1. User signs up
2. User creates first trading account
3. User chooses data source (manual or CSV import)
4. User sets first discipline rules
5. User lands on empty-state dashboard with setup checklist

Success state:
- User has at least one account and one path to ingest data

## 3. Flow: Manual Trade Logging
1. User opens Trades page
2. Clicks "Add Trade"
3. Fills required fields
4. Optionally links setup, notes, screenshot, tags
5. Saves trade
6. System recalculates KPIs and timeline

Failure states:
- Invalid numeric/time values
- Missing required fields

## 4. Flow: CSV Import
1. User opens Import
2. Uploads CSV file
3. Maps CSV columns to app fields (template auto-suggest)
4. Reviews preview and row warnings
5. Confirms import
6. System processes and returns summary (imported/skipped/errors)

Recovery:
- User can download error rows and retry import

## 5. Flow: Daily Journal + Mentality
1. User opens Journal (day view)
2. Enters pre-market mindset and plan
3. Adds during-session emotional tags
4. Adds post-market reflection and lessons
5. Optionally links relevant trades
6. Saves entry

Success state:
- Journal linked to date and visible in calendar/day detail

## 6. Flow: Discipline Review
1. User opens Discipline dashboard
2. Sees rule compliance score by day/week
3. Opens violations list
4. Drills into violating trades
5. Adds context note or override reason if justified

Success state:
- Violations are auditable and trendable

## 7. Flow: Performance Review (Dashboard)
1. User chooses date range and account filters
2. Reviews KPI cards
3. Reviews equity curve and cumulative PnL
4. Opens underperforming segment (setup/time/day)
5. Exports or bookmarks insights

Success state:
- User identifies one actionable improvement item

## 8. Flow: Calendar Evolution
1. User opens Calendar
2. Sees monthly PnL heatmap
3. Taps/clicks a day
4. Views day panel: trades, journal, discipline, summary
5. Navigates to next/previous month

Success state:
- User can quickly inspect streaks and outlier days

## 9. Flow: Playbook Setup and Validation
1. User creates strategy/setup template
2. Adds checklist and invalidation rules
3. Tags incoming trades to this setup
4. Reviews setup scorecard (compliance vs profitability)

Success state:
- User can see if strategy edge is real and repeatable

## 10. Flow: Backtesting
1. User creates backtest session
2. Logs simulated trades and rationale
3. Completes session
4. Compares backtest stats to live stats for same setup

Success state:
- User sees gap between theory and execution

## 11. Flow: Share With Mentor/Community
1. User opens trade or journal entry
2. Clicks share
3. Chooses visibility and recipients
4. Shares link/post
5. Receives comments and feedback

Success state:
- Feedback loop is captured and linked to source trade/journal

## 12. Mobile Interaction Rules
- One primary CTA per screen
- Bottom navigation for core modules
- Filters in slide-over sheet
- Dense tables collapse into summary cards + detail drawer
- Charts switch to tabbed carousel for readability

## 13. Core Empty States
- No trades yet: show add/import actions
- No journal entries: show quick daily reflection template
- No discipline rules: show starter rule presets
- No playbook: show first setup wizard

## 14. Primary Event Tracking
Track events for product learning:
- `trade_created`
- `csv_import_confirmed`
- `journal_submitted`
- `discipline_rule_created`
- `dashboard_filter_applied`
- `calendar_day_opened`
- `playbook_created`
- `backtest_completed`
- `share_sent`
