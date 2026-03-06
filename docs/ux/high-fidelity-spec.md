# High-Fidelity UI Specification

## 1. Objective
Define final visual and interaction specs for the first clickable prototype and implementation handoff.

Priority journeys:
- Onboarding
- Trade entry
- Dashboard review
- Calendar day drill-down

Modes required:
- `light-clarity` (default)
- `dark-pro` (optional)

## 2. Global UI Rules
- Use `Plus Jakarta Sans` for interface text and `JetBrains Mono` for all key metrics.
- Maintain semantic color rules from `docs/ux/design-tokens.md`.
- Ensure all primary actions are visible without hidden menus.
- Preserve identical information architecture across desktop and mobile.

## 3. Desktop Screen Specs

### 3.1 Onboarding
Screen A: Account setup
- Left: product value summary and trust copy
- Right: form card
- Fields: account name, market type, base currency, timezone
- Primary CTA: `Create Account`
- Secondary CTA: `Skip for now`

Screen B: Data source selection
- Two cards: `Manual Entry` and `Import CSV`
- Info note below cards with recommended path
- CTA: `Continue`

Screen C: Starter discipline rules
- Preset checkboxes:
  - Max risk per trade
  - Max daily loss
  - Stop after consecutive losses
- CTA: `Save Rules and Open Dashboard`

### 3.2 Trade Entry
- Modal width: 880px, two-column form
- Left column: symbol, side, size, datetime, setup
- Right column: entry, exit, stop, target, fees
- Bottom full-width: notes, tags, screenshot upload, optional legs editor
- Sticky footer with `Cancel` and `Save Trade`

Validation states:
- Inline error under field
- Prevent save until required fields are valid
- Display normalized PnL preview after entry/exit inputs

### 3.3 Dashboard Review
- Header: account switcher, date range, filter chips, theme toggle
- Row 1: 4 KPI cards (`Net PnL`, `Win Rate`, `Profit Factor`, `Drawdown`)
- Row 2: left donut (`Winners vs Losers`), right area chart (`Cumulative PnL`)
- Row 3: `Discipline Trend` and `Time-of-day performance`
- Row 4: mini calendar + recent journal reflections

KPI card interactions:
- Hover shows metric definition tooltip
- Click opens drill-down panel

### 3.4 Calendar Drill-Down
- Main: month heatmap grid
- Right side panel:
  - Day summary (PnL, trade count, rule violations)
  - Trade list for the day
  - Linked journal entry summary
- Controls: previous/next month, quick jump dropdown

Day states:
- Positive day
- Negative day
- Flat/no trades day
- Rule violation marker

## 4. Mobile Screen Specs

### 4.1 Onboarding
- Full-screen stacked cards
- Progress indicator at top (1/3, 2/3, 3/3)
- Single primary CTA in sticky bottom bar

### 4.2 Trade Entry
- Single-column form
- Core fields first; advanced fields in expandable section
- Sticky bottom action bar (`Save Trade`)
- Image upload uses native picker

### 4.3 Dashboard Review
- Swipeable KPI cards
- Segmented chart tabs (`PnL`, `Win/Loss`, `Discipline`)
- Calendar snapshot card opens full calendar page
- Journal highlights as collapsible cards

### 4.4 Calendar Drill-Down
- Month grid full width
- Tap day opens bottom sheet with details
- Bottom sheet tabs: `Trades`, `Journal`, `Discipline`
- Horizontal swipe for month navigation

## 5. Component States

### 5.1 KPI Card
- Default
- Hover (desktop)
- Active (selected filter)
- Loading skeleton
- Empty state (insufficient data)

### 5.2 Data Table / Trade Card
- Default row/card
- Expanded details
- Selected for bulk action
- Error badge for incomplete data

### 5.3 Filters
- Closed
- Open with active pills
- Reset state
- No-results state

### 5.4 Chart Blocks
- Loading
- Loaded
- Empty data
- Error retry

## 6. Copy Guidelines
- Use short, action-first button text
- Prefer measurable labels (`Net PnL`, `Avg R`, `Rule Violations`)
- Keep helper text concise and specific

## 7. Accessibility Checklist
- Contrast >= 4.5:1 for body text
- Interactive targets >= 44px on mobile
- Keyboard-only path for all desktop interactions
- Chart summaries exposed in text below visual area

## 8. Prototype Scope Lock
This high-fidelity cycle must include only:
- Onboarding flow (3 screens)
- Trade entry form (1 modal desktop + 1 page mobile)
- Dashboard view (desktop + mobile)
- Calendar view + day drill-down (desktop + mobile)

Out of scope for this prototype iteration:
- Playbook high-fi
- Backtesting high-fi
- Community high-fi

## 9. Handoff Notes
Required export artifacts from design tool:
- Screen list and flow links
- Component inventory
- Spacing and typography references
- Color styles for both theme modes
- Interaction notes for transitions and overlays
