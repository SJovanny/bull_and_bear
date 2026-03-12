SET LOCAL statement_timeout = 0;

ALTER TABLE "Trade"
ADD COLUMN IF NOT EXISTS "importSource" TEXT,
ADD COLUMN IF NOT EXISTS "importSourceTradeId" TEXT,
ADD COLUMN IF NOT EXISTS "importFingerprint" TEXT,
ADD COLUMN IF NOT EXISTS "importedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "Trade_accountId_importSource_importSourceTradeId_key"
ON "Trade"("accountId", "importSource", "importSourceTradeId");

CREATE UNIQUE INDEX IF NOT EXISTS "Trade_accountId_importFingerprint_key"
ON "Trade"("accountId", "importFingerprint");
