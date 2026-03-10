-- ============================================================================
-- Row-Level Security (RLS) — defence-in-depth
-- ============================================================================
-- Even if the application layer is compromised, Postgres will enforce that
-- each authenticated user can only access their own rows.
--
-- Supabase exposes the JWT claim via auth.uid().
-- The service_role key bypasses RLS by default (needed for Prisma migrations).
-- ============================================================================

-- ── Enable RLS on all tables ────────────────────────────────────────────────

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Trade" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DailyJournal" ENABLE ROW LEVEL SECURITY;

-- ── User table policies ─────────────────────────────────────────────────────
-- Users can only read and update their own profile.

CREATE POLICY "Users can view own profile"
  ON "User" FOR SELECT
  USING (id = auth.uid()::text);

CREATE POLICY "Users can update own profile"
  ON "User" FOR UPDATE
  USING (id = auth.uid()::text)
  WITH CHECK (id = auth.uid()::text);

-- ── Account table policies ──────────────────────────────────────────────────
-- Users can CRUD only their own accounts.

CREATE POLICY "Users can view own accounts"
  ON "Account" FOR SELECT
  USING ("userId" = auth.uid()::text);

CREATE POLICY "Users can insert own accounts"
  ON "Account" FOR INSERT
  WITH CHECK ("userId" = auth.uid()::text);

CREATE POLICY "Users can update own accounts"
  ON "Account" FOR UPDATE
  USING ("userId" = auth.uid()::text)
  WITH CHECK ("userId" = auth.uid()::text);

CREATE POLICY "Users can delete own accounts"
  ON "Account" FOR DELETE
  USING ("userId" = auth.uid()::text);

-- ── Trade table policies ────────────────────────────────────────────────────
-- Users can CRUD only their own trades.

CREATE POLICY "Users can view own trades"
  ON "Trade" FOR SELECT
  USING ("userId" = auth.uid()::text);

CREATE POLICY "Users can insert own trades"
  ON "Trade" FOR INSERT
  WITH CHECK ("userId" = auth.uid()::text);

CREATE POLICY "Users can update own trades"
  ON "Trade" FOR UPDATE
  USING ("userId" = auth.uid()::text)
  WITH CHECK ("userId" = auth.uid()::text);

CREATE POLICY "Users can delete own trades"
  ON "Trade" FOR DELETE
  USING ("userId" = auth.uid()::text);

-- ── DailyJournal table policies ─────────────────────────────────────────────
-- Users can CRUD only their own journal entries.

CREATE POLICY "Users can view own journals"
  ON "DailyJournal" FOR SELECT
  USING ("userId" = auth.uid()::text);

CREATE POLICY "Users can insert own journals"
  ON "DailyJournal" FOR INSERT
  WITH CHECK ("userId" = auth.uid()::text);

CREATE POLICY "Users can update own journals"
  ON "DailyJournal" FOR UPDATE
  USING ("userId" = auth.uid()::text)
  WITH CHECK ("userId" = auth.uid()::text);

CREATE POLICY "Users can delete own journals"
  ON "DailyJournal" FOR DELETE
  USING ("userId" = auth.uid()::text);
