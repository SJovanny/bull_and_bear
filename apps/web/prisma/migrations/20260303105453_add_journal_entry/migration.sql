-- CreateTable
CREATE TABLE "DailyJournalEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entryDate" TIMESTAMP(3) NOT NULL,
    "preMarketPlan" TEXT,
    "mindsetScore" INTEGER,
    "emotions" TEXT,
    "executionReview" TEXT,
    "lessonsLearned" TEXT,
    "nextDayFocus" TEXT,
    "disciplineScore" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyJournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailyJournalEntry_userId_entryDate_idx" ON "DailyJournalEntry"("userId", "entryDate");

-- CreateIndex
CREATE UNIQUE INDEX "DailyJournalEntry_userId_entryDate_key" ON "DailyJournalEntry"("userId", "entryDate");

-- AddForeignKey
ALTER TABLE "DailyJournalEntry" ADD CONSTRAINT "DailyJournalEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
