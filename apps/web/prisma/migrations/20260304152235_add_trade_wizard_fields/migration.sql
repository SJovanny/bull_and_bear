-- CreateEnum
CREATE TYPE "TradeOutcome" AS ENUM ('WIN', 'LOSS', 'BREAKEVEN');

-- AlterTable
ALTER TABLE "Trade" ADD COLUMN     "confluences" JSONB,
ADD COLUMN     "contractMultiplier" DECIMAL(18,6) NOT NULL DEFAULT 1,
ADD COLUMN     "initialStopLoss" DECIMAL(18,6),
ADD COLUMN     "initialTakeProfit" DECIMAL(18,6),
ADD COLUMN     "planFollowed" BOOLEAN,
ADD COLUMN     "tradeOutcome" "TradeOutcome";
