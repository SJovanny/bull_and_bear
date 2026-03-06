# Design Tokens and Visual Language

## 1. Design Intent
Create a visual system that blends:
- Clean analytical clarity (TradeZella-style)
- Pro data density option (StonkJournal-style)

Two display modes:
- `light-clarity` (default)
- `dark-pro` (optional toggle)

## 2. Typography
Avoid generic system look.

Primary font:
- `Plus Jakarta Sans` (UI, labels, controls)

Data/monospace font:
- `JetBrains Mono` (numbers, PnL, table metrics)

Type scale:
- Display: 48/56
- H1: 36/44
- H2: 28/36
- H3: 22/30
- Body L: 18/28
- Body: 16/24
- Caption: 13/18
- Micro: 11/16

## 3. Color Tokens

### 3.1 Core Brand
- `--color-brand-500: #3B82F6`
- `--color-brand-600: #2563EB`
- `--color-accent-500: #14B8A6`

### 3.2 Performance Semantics
- `--color-pnl-positive: #10B981`
- `--color-pnl-negative: #EF4444`
- `--color-pnl-neutral: #64748B`
- `--color-discipline-high: #22C55E`
- `--color-discipline-mid: #F59E0B`
- `--color-discipline-low: #DC2626`

### 3.3 Light Mode Surfaces
- `--color-bg: #F5F7FB`
- `--color-surface-1: #FFFFFF`
- `--color-surface-2: #F8FAFC`
- `--color-border: #E2E8F0`
- `--color-text-primary: #0F172A`
- `--color-text-secondary: #475569`

### 3.4 Dark Mode Surfaces
- `--color-bg-dark: #0F172A`
- `--color-surface-1-dark: #111827`
- `--color-surface-2-dark: #1F2937`
- `--color-border-dark: #334155`
- `--color-text-primary-dark: #E5E7EB`
- `--color-text-secondary-dark: #94A3B8`

## 4. Spacing and Radius
Spacing scale:
- `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`

Radius tokens:
- `--radius-sm: 8px`
- `--radius-md: 12px`
- `--radius-lg: 16px`
- `--radius-xl: 24px`

## 5. Elevation
- `--shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.06)`
- `--shadow-md: 0 8px 24px rgba(15, 23, 42, 0.08)`
- `--shadow-lg: 0 16px 40px rgba(15, 23, 42, 0.12)`

Dark mode shadow uses reduced alpha to avoid muddy surfaces.

## 6. Layout Tokens
Breakpoints:
- `sm: 480px`
- `md: 768px`
- `lg: 1024px`
- `xl: 1280px`
- `2xl: 1536px`

Container widths:
- Mobile: fluid with 16px gutters
- Tablet: fluid with 20px gutters
- Desktop: max 1440px, 24px gutters

Grid:
- Desktop dashboard: 12-column grid
- Mobile dashboard: single column stack with optional 2-column mini-cards

## 7. Component Tokens
Card:
- Padding: 16-20px
- Radius: `--radius-lg`
- Border: 1px tokenized border

Button:
- Height: 40px default, 48px mobile primary CTA
- Radius: `--radius-md`
- Primary uses brand color with high-contrast text

Input:
- Height: 40px desktop, 44px mobile
- Focus ring: 2px brand-500 at 35% alpha

Table:
- Row height: 44px desktop, 52px touch mode
- Sticky headers on desktop

## 8. Chart Style Rules
- Equity/cumulative lines: smooth but not overly curved
- Positive areas use translucent green gradient
- Negative segments use red highlight
- Grid lines low contrast
- Always show explicit legend for win/loss and filtered segments
- Tooltip uses monospace for numeric alignment

## 9. Motion Tokens
Use meaningful motion only.

Durations:
- `--motion-fast: 120ms`
- `--motion-base: 200ms`
- `--motion-slow: 320ms`

Easing:
- `--ease-standard: cubic-bezier(0.2, 0.0, 0.2, 1)`

Patterns:
- Stagger reveal for dashboard cards on initial load
- Slide-up sheet animation for mobile filters
- Subtle value-change flash for KPI updates

## 10. Accessibility Rules
- Minimum contrast 4.5:1 for text
- Do not rely on color only for profit/loss; add icons/labels
- Full keyboard navigation for forms, filters, and tables
- Touch targets minimum 44x44 on mobile
- Chart summaries available as text for assistive tech

## 11. CSS Variable Blueprint
```css
:root {
  --color-brand-500: #3B82F6;
  --color-accent-500: #14B8A6;
  --color-pnl-positive: #10B981;
  --color-pnl-negative: #EF4444;
  --color-bg: #F5F7FB;
  --color-surface-1: #FFFFFF;
  --color-text-primary: #0F172A;
  --radius-md: 12px;
  --shadow-md: 0 8px 24px rgba(15, 23, 42, 0.08);
}

[data-theme="dark"] {
  --color-bg: #0F172A;
  --color-surface-1: #111827;
  --color-text-primary: #E5E7EB;
}
```

## 12. Dashboard Composition Guidance
Desktop:
- Top row KPI cards
- Left panel for win/loss and trade distribution
- Main panel for cumulative PnL
- Lower panel for calendar and recent journal items

Mobile:
- KPI cards as swipeable row or stacked cards
- One chart at a time with segmented switcher
- Calendar and journal as separate vertical blocks
- Persistent quick action button for adding a trade
