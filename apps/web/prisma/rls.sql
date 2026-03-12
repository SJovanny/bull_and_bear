-- Supabase-only Row Level Security policies.
-- Keep this outside Prisma migrate dev so local shadow databases do not fail.

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Trade" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DailyJournal" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON "User" FOR SELECT
  USING (id = auth.uid()::text);

CREATE POLICY "Users can update own profile"
  ON "User" FOR UPDATE
  USING (id = auth.uid()::text)
  WITH CHECK (id = auth.uid()::text);

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
