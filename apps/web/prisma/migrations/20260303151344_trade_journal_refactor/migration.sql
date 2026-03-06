/*
  Warnings:

  - You are about to drop the `DailyJournalEntry` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AssetClass" AS ENUM ('STOCK', 'FUTURES', 'FOREX', 'CRYPTO', 'OPTIONS', 'ETF', 'INDEX', 'CFD', 'OTHER');

-- DropForeignKey
ALTER TABLE "DailyJournalEntry" DROP CONSTRAINT "DailyJournalEntry_userId_fkey";

-- AlterTable
ALTER TABLE "Trade" ADD COLUMN     "assetClass" "AssetClass" NOT NULL DEFAULT 'STOCK',
ADD COLUMN     "chartScreenshots" JSONB,
ADD COLUMN     "emotionalState" TEXT,
ADD COLUMN     "entryReason" TEXT,
ADD COLUMN     "entryTimeframe" TEXT,
ADD COLUMN     "executionRating" INTEGER,
ADD COLUMN     "exitReason" TEXT,
ADD COLUMN     "higherTimeframeBias" TEXT,
ADD COLUMN     "lessonLearned" TEXT,
ADD COLUMN     "setupName" TEXT;

-- DropTable
DROP TABLE "DailyJournalEntry";
