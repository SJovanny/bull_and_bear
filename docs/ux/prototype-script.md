# Clickable Prototype Script

## 1. Purpose
Define a repeatable script to validate the first clickable prototype with target users before implementation.

## 2. Test Setup
Participants:
- 5 to 10 traders
- Mix of beginner/intermediate/advanced

Session length:
- 20 to 30 minutes each

Devices:
- Desktop browser (required)
- Mobile browser viewport (required)

## 3. Scenarios to Test

### Scenario 1: Onboarding Completion
Goal:
- User can complete onboarding and reach dashboard without help.

Tasks:
1. Create first account
2. Choose import method
3. Configure starter discipline rules
4. Reach dashboard

Success signals:
- Completed in under 3 minutes
- No confusion on CTA sequence

### Scenario 2: Trade Entry
Goal:
- User can add one complete trade with notes.

Tasks:
1. Open add trade flow
2. Fill required fields
3. Add optional note and setup
4. Save trade

Success signals:
- User understands required vs optional fields
- Validation errors are understandable

### Scenario 3: Dashboard Review
Goal:
- User can identify one insight from analytics.

Tasks:
1. Apply date filter
2. Review KPI cards
3. Open cumulative PnL chart
4. Identify worst-performing segment

Success signals:
- User states one actionable insight
- Filter behavior is predictable

### Scenario 4: Calendar Drill-Down
Goal:
- User can inspect one day deeply.

Tasks:
1. Open calendar
2. Navigate to prior month
3. Select a negative PnL day
4. Review trades + journal + discipline info

Success signals:
- User can find all day details within 2 taps/clicks
- Drill-down panel/sheet is clear and complete

## 4. Moderator Prompts
- What do you expect to happen when you click this?
- What information do you need that is missing?
- Which section feels overloaded or unclear?
- Would you use this daily after trading? Why or why not?

## 5. Data Capture Template
For each participant capture:
- Completion status per scenario (`success`, `partial`, `failed`)
- Time to complete per scenario
- Number of confusion events
- Severity of friction (`low`, `medium`, `high`)
- Verbatim quotes

## 6. Scoring Rubric
- Usability pass threshold: >= 80 percent scenario success
- Critical issue threshold: no blocker may appear in more than 2 sessions
- Mobile parity threshold: all scenarios must be completable on mobile

## 7. Common Failure Watchlist
- Hard-to-find add trade action on mobile
- Filter state not obvious on dashboard
- Calendar day details missing key context
- Discipline language too abstract for new users

## 8. Iteration Protocol
After each 3 sessions:
1. Consolidate top 5 friction points
2. Classify by severity and frequency
3. Update design screens
4. Re-run affected scenario checks

## 9. Output Artifacts
After prototype testing produce:
- Prioritized issue list
- Updated screens with change annotations
- Decision summary for what is fixed now vs deferred
- Updated `plan.md` entries in decision log and next step

## 10. Exit Criteria
Prototype is approved for implementation when:
- All 4 scenarios meet pass thresholds
- No critical navigation blockers remain
- Desktop and mobile flows are both validated
