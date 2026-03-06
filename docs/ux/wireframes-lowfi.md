# Low-Fidelity Wireframes

## 1. Purpose
Translate product requirements, user flows, and design tokens into concrete low-fidelity screen blueprints for desktop and mobile.

This document defines:
- Core screen structures
- Content hierarchy
- Responsive behavior
- Primary user actions per screen

## 2. Layout System

### 2.1 Desktop Frame
- Header: global filters, account switcher, date range, profile/actions
- Left rail: primary navigation
- Main content: 12-column grid
- Right utility panel (optional on analytics-heavy screens)

### 2.2 Mobile Frame
- Top bar: page title + contextual actions
- Main content: single column stack
- Bottom nav: core modules (`Dashboard`, `Trades`, `Calendar`, `Journal`, `More`)
- Floating primary action button for quick trade entry

## 3. Screen Blueprint: Dashboard

### 3.1 Desktop
```text
+----------------------------------------------------------------------------------+
| Header: Date Range | Account | Filters | Theme Toggle | User                    |
+----------------------+-----------------------------------------------------------+
| Left Nav             | KPI Row: Net PnL | Win Rate | Profit Factor | Drawdown  |
| - Dashboard          +-----------------------------------------------------------+
| - Trades             | Row 2 Left: Win/Loss Donut     | Row 2 Right: Equity     |
| - Calendar           |                                 | Curve / Cumulative PnL  |
| - Journal            +-----------------------------------------------------------+
| - Discipline         | Row 3 Left: Discipline Trend    | Row 3 Right: Day/Time   |
| - Playbook           |                                 | Performance Breakdown    |
| - Backtesting        +-----------------------------------------------------------+
| - Community          | Row 4 Full: Calendar Snapshot + Recent Journal Highlights |
+----------------------+-----------------------------------------------------------+
```

Primary actions:
- Apply global filters
- Drill into underperforming segment
- Open day details from mini-calendar

### 3.2 Mobile
```text
+--------------------------------------+
| Top Bar: Dashboard      [Filter]     |
+--------------------------------------+
| KPI Cards (horizontal swipe)         |
+--------------------------------------+
| Segmented Control: Equity | Breakdown|
+--------------------------------------+
| Chart Panel (single chart at a time) |
+--------------------------------------+
| Calendar Snapshot Card               |
+--------------------------------------+
| Journal Highlights Card              |
+--------------------------------------+
| Bottom Nav + Floating Add Trade      |
+--------------------------------------+
```

Responsive rules:
- One main chart visible at a time
- Quick filter opens slide-up sheet

## 4. Screen Blueprint: Trades (Table + Entry)

### 4.1 Desktop Trades List
```text
+----------------------------------------------------------------------------------+
| Trades Header: Search | Date | Symbol | Setup | Outcome | [Import CSV] [Add]    |
+----------------------------------------------------------------------------------+
| Summary Chips: Total Trades | Win % | Avg R | Avg Hold Time                      |
+----------------------------------------------------------------------------------+
| Data Table (sticky header)                                                     |
| Date | Symbol | Side | Qty | Entry | Exit | PnL | R | Setup | Notes | Actions   |
| ...                                                                            |
+----------------------------------------------------------------------------------+
| Pagination + Bulk actions                                                       |
+----------------------------------------------------------------------------------+
```

### 4.2 Mobile Trades List
```text
+--------------------------------------+
| Trades                    [Filter]   |
+--------------------------------------+
| Search + Sort                        |
+--------------------------------------+
| Trade Card                           |
| Symbol / Date / Side / PnL / Setup   |
| [Expand] -> entry/exit/notes/actions |
+--------------------------------------+
| Trade Card ...                       |
+--------------------------------------+
| Bottom Nav + Add Trade FAB           |
+--------------------------------------+
```

### 4.3 Trade Entry Modal/Screen
Fields:
- Required: symbol, side, quantity, entry/exit, date/time
- Optional: fees, setup, notes, screenshot, tags, legs

Desktop:
- Two-column form with validation on blur/submit

Mobile:
- Single-column form with sticky save button

## 5. Screen Blueprint: CSV Import

### 5.1 Desktop
```text
+----------------------------------------------------------------------------------+
| Import Trades                                                                    |
+----------------------------------------------------------------------------------+
| Step 1 Upload -> Step 2 Map Columns -> Step 3 Preview -> Step 4 Confirm         |
+----------------------------------------------------------------------------------+
| Left: CSV column list      | Right: Internal field mapping                       |
+----------------------------------------------------------------------------------+
| Preview Table + Row warnings                                                     |
+----------------------------------------------------------------------------------+
| Footer: [Back] [Save Template] [Confirm Import]                                 |
+----------------------------------------------------------------------------------+
```

### 5.2 Mobile
- Wizard style, one step per screen
- Sticky next/confirm footer
- Error rows accessible in collapsible panels

## 6. Screen Blueprint: Journal (Daily Psychology)

### 6.1 Desktop
```text
+----------------------------------------------------------------------------------+
| Journal - Day View (Date picker)                                                 |
+-------------------------------+--------------------------------------------------+
| Left: Prompted sections       | Right: Linked trades for selected day           |
| - Pre-market mindset          | - Trade list                                    |
| - During-session emotions     | - Quick link to trade details                   |
| - Post-session reflection     |                                                  |
| - Lessons / action tomorrow   |                                                  |
+-------------------------------+--------------------------------------------------+
| Save / Draft / Mark complete                                                    |
+----------------------------------------------------------------------------------+
```

### 6.2 Mobile
- Accordion sections for each reflection block
- Emotion chips in scrollable row
- Linked trades in collapsible list below form

## 7. Screen Blueprint: Discipline

### 7.1 Desktop
```text
+----------------------------------------------------------------------------------+
| Discipline                                                                       |
+----------------------------------------------------------------------------------+
| Score Card | Weekly Trend | Rule Compliance Pie                                 |
+----------------------------------------------------------------------------------+
| Violations Table: Rule | Trade | Time | Severity | Status | Actions            |
+----------------------------------------------------------------------------------+
| Rule Builder Drawer (add/edit rule and thresholds)                              |
+----------------------------------------------------------------------------------+
```

### 7.2 Mobile
- Top score card + trend mini chart
- Violations list cards with quick drill-down
- Rule builder in full-screen sheet

## 8. Screen Blueprint: Calendar Evolution

### 8.1 Desktop
```text
+----------------------------------------------------------------------------------+
| Calendar (Month selector + account/date filters)                                 |
+----------------------------------------------------------------------------------+
| Monthly Heatmap Grid                                                             |
| Each day: PnL color + trade count + discipline marker                           |
+----------------------------------------------+-----------------------------------+
| Week summaries                               | Day Drill-down panel              |
|                                              | Trades + Journal + Rule events    |
+----------------------------------------------+-----------------------------------+
```

### 8.2 Mobile
- Full-width month grid
- Day tap opens bottom sheet with details
- Swipe month navigation

## 9. Screen Blueprint: Playbook

### 9.1 Desktop
```text
+----------------------------------------------------------------------------------+
| Playbook                                                                         |
+------------------------------+---------------------------------------------------+
| Setup List                   | Setup Detail                                      |
| - Opening Drive              | Checklist                                         |
| - Pullback Reclaim           | Invalidation Rules                                |
| - VWAP Bounce                | Performance: Win %, Expectancy, Sample Size       |
+------------------------------+---------------------------------------------------+
```

### 9.2 Mobile
- Setup list first
- Tap setup -> detail page with checklist and stats cards

## 10. Screen Blueprint: Backtesting

### 10.1 Desktop
```text
+----------------------------------------------------------------------------------+
| Backtesting                                                                      |
+----------------------------------------------------------------------------------+
| Session controls: Market | Setup | Date range | [Start Session]                  |
+----------------------------------------------------------------------------------+
| Simulated trade log table                                                      |
+----------------------------------------------------------------------------------+
| Comparison panel: Backtest vs Live (PnL, Win %, Drawdown, Expectancy)          |
+----------------------------------------------------------------------------------+
```

### 10.2 Mobile
- Session setup wizard
- Log entries as cards
- Comparison metrics in stacked cards

## 11. Screen Blueprint: Community

### 11.1 Desktop
```text
+----------------------------------------------------------------------------------+
| Community Feed                                                                   |
+----------------------------------------------------------------------------------+
| Share composer | Visibility selector | Attach trade/journal                     |
+----------------------------------------------------------------------------------+
| Post cards with comments, mentor feedback, and linked trade snapshots            |
+----------------------------------------------------------------------------------+
```

### 11.2 Mobile
- Feed cards full width
- Inline reply drawer
- Share action in top-right and from trade/journal pages

## 12. Empty States
- Dashboard empty: prompt to add/import first trade
- Trades empty: dual CTA (`Add Trade`, `Import CSV`)
- Journal empty: guided reflection template
- Discipline empty: starter rules presets
- Playbook empty: first setup wizard

## 13. Global Components Inventory
- Account switcher
- Date range picker
- Filter bar
- KPI card
- Chart card
- Data table
- Mobile data card
- Slide-over filter sheet
- Add trade modal/screen
- Share dialog

## 14. Wireframe Validation Checklist
- Every core flow from `docs/ux/user-flows.md` has at least one primary screen
- Desktop and mobile variants exist for all core modules
- Primary action is visible without scroll overload
- Data density does not break readability on mobile
- PnL and discipline semantics are consistent with token definitions

## 15. Next Design Outputs
After low-fi approval:
1. Create high-fidelity wireframes in both `light-clarity` and `dark-pro`
2. Produce clickable prototype for onboarding, trade entry, dashboard, and calendar drill-down
3. Run 5-10 user walkthroughs and capture friction points
