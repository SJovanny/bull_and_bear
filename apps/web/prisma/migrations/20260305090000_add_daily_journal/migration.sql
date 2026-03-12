DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'DailyJournal'
  ) THEN
    CREATE TABLE "DailyJournal" (
      "id" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "accountId" TEXT NOT NULL,
      "date" TIMESTAMP(3) NOT NULL,
      "economicEvents" JSONB,
      "marketConditions" TEXT,
      "keyLevels" TEXT,
      "strategiesFocus" JSONB,
      "executionRating" INTEGER,
      "mentalState" JSONB,
      "mistakes" JSONB,
      "lessonsLearned" TEXT,
      "notes" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "DailyJournal_pkey" PRIMARY KEY ("id")
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'DailyJournal_userId_fkey'
  ) THEN
    ALTER TABLE "DailyJournal"
    ADD CONSTRAINT "DailyJournal_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'DailyJournal_accountId_fkey'
  ) THEN
    ALTER TABLE "DailyJournal"
    ADD CONSTRAINT "DailyJournal_accountId_fkey"
    FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  CREATE UNIQUE INDEX IF NOT EXISTS "DailyJournal_accountId_date_key"
  ON "DailyJournal"("accountId", "date");

  CREATE INDEX IF NOT EXISTS "DailyJournal_userId_date_idx"
  ON "DailyJournal"("userId", "date");
END $$;
