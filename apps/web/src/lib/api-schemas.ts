import { z } from "zod";

import {
  ASSET_CLASSES,
  MAX_LONG_TEXT,
  MAX_SHORT_TEXT,
  parseDecimal,
  parseNullableBoolean,
  sanitizeString,
  validateScreenshots,
} from "@/lib/validation";

const ACCOUNT_TYPES = ["CASH", "MARGIN", "PROP", "SIM"] as const;
const TRADE_SIDES = ["LONG", "SHORT"] as const;
const TRADE_STATUSES = ["OPEN", "CLOSED", "CANCELED"] as const;

const dateInputValue = z.union([z.string(), z.date()]);

function decimalValue(fieldName: string) {
  return z.union([z.number().finite(), z.string().trim().min(1)]).transform((value, ctx) => {
    try {
      return parseDecimal(value, fieldName);
    } catch (error) {
      ctx.addIssue({
        code: "custom",
        message: error instanceof Error ? error.message : `Invalid numeric value for ${fieldName}`,
      });

      return z.NEVER;
    }
  });
}

function nullableDecimalValue(fieldName: string) {
  return z.union([z.number().finite(), z.string(), z.null(), z.undefined()]).transform((value, ctx) => {
    if (value == null || value === "") {
      return null;
    }

    try {
      return parseDecimal(value, fieldName);
    } catch (error) {
      ctx.addIssue({
        code: "custom",
        message: error instanceof Error ? error.message : `Invalid numeric value for ${fieldName}`,
      });

      return z.NEVER;
    }
  });
}

function requiredShortText(fieldName: string) {
  return z.string().trim().min(1, `${fieldName} is required`).max(MAX_SHORT_TEXT);
}

function nullableTrimmedText(maxLength = MAX_SHORT_TEXT) {
  return z.union([z.string(), z.null(), z.undefined()]).transform((value, ctx) => {
    const sanitized = sanitizeString(value, maxLength);

    if (typeof sanitized === "string" && sanitized.length >= maxLength && typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.length > maxLength) {
        ctx.addIssue({
          code: "too_big",
          maximum: maxLength,
          inclusive: true,
          origin: "string",
          message: `Must be at most ${maxLength} characters`,
        });

        return z.NEVER;
      }
    }

    return sanitized;
  });
}

function optionalDateValue(fieldName: string, nullable = false) {
  return z.union([dateInputValue, z.null(), z.undefined()]).transform((value, ctx) => {
    if (value === undefined) {
      return undefined;
    }

    if (value === null || value === "") {
      if (!nullable) {
        ctx.addIssue({
          code: "custom",
          message: `${fieldName} is required`,
        });

        return z.NEVER;
      }

      return null;
    }

    const parsed = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      ctx.addIssue({
        code: "custom",
        message: `Invalid ${fieldName} date`,
      });

      return z.NEVER;
    }

    return parsed;
  });
}

const requiredDateValue = (fieldName: string) =>
  dateInputValue.transform((value, ctx) => {
    const parsed = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      ctx.addIssue({
        code: "custom",
        message: `Invalid ${fieldName} date`,
      });

      return z.NEVER;
    }

    return parsed;
  });

const uuidValue = z.string().uuid();

const confluencesValue = z.union([z.array(z.string()), z.null(), z.undefined()]).transform((value, ctx) => {
  if (value == null) {
    return null;
  }

  const items = value
    .map((item) => sanitizeString(item))
    .filter((item): item is string => Boolean(item));

  for (const item of items) {
    if (item.length > MAX_SHORT_TEXT) {
      ctx.addIssue({
        code: "too_big",
        maximum: MAX_SHORT_TEXT,
        inclusive: true,
        origin: "string",
        message: `Confluence items must be at most ${MAX_SHORT_TEXT} characters`,
      });

      return z.NEVER;
    }
  }

  return items;
});

const screenshotsValue = z.unknown().transform((value, ctx) => {
  try {
    return validateScreenshots(value);
  } catch (error) {
    ctx.addIssue({
      code: "custom",
      message: error instanceof Error ? error.message : "Invalid screenshots payload",
    });

    return z.NEVER;
  }
});

const nullableBooleanValue = z
  .union([z.boolean(), z.string(), z.null(), z.undefined()])
  .transform((value, ctx) => {
    const parsed = parseNullableBoolean(value);
    if (value != null && value !== "" && parsed === null) {
      ctx.addIssue({
        code: "custom",
        message: "Invalid boolean value",
      });

      return z.NEVER;
    }

    return parsed;
  });

const tradeExecutionRatingValue = z
  .union([z.number(), z.string(), z.null(), z.undefined()])
  .transform((value, ctx) => {
    if (value == null || value === "") {
      return null;
    }

    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 10) {
      ctx.addIssue({
        code: "custom",
        message: "Execution rating must be an integer between 1 and 10",
      });

      return z.NEVER;
    }

    return parsed;
  });

export const accountCreateSchema = z.strictObject({
  name: requiredShortText("Account name"),
  broker: nullableTrimmedText(),
  currency: z
    .string()
    .trim()
    .min(3)
    .max(3)
    .transform((value) => value.toUpperCase())
    .default("USD"),
  accountType: z.enum(ACCOUNT_TYPES).default("CASH"),
});

export const accountUpdateSchema = z.strictObject({
  name: requiredShortText("Account name"),
  broker: nullableTrimmedText(),
  currency: z
    .string()
    .trim()
    .min(3)
    .max(3)
    .transform((value) => value.toUpperCase())
    .default("USD"),
  accountType: z.enum(ACCOUNT_TYPES),
});

export const tradeCreateSchema = z.strictObject({
  accountId: uuidValue,
  symbol: requiredShortText("Symbol").transform((value) => value.toUpperCase()),
  side: z.enum(TRADE_SIDES),
  status: z.enum(TRADE_STATUSES).default("OPEN"),
  assetClass: z.enum(ASSET_CLASSES).default("STOCK"),
  openedAt: requiredDateValue("openedAt"),
  closedAt: optionalDateValue("closedAt", true).default(null),
  quantity: decimalValue("quantity"),
  entryPrice: decimalValue("entryPrice"),
  initialStopLoss: nullableDecimalValue("initialStopLoss").default(null),
  initialTakeProfit: nullableDecimalValue("initialTakeProfit").default(null),
  exitPrice: nullableDecimalValue("exitPrice").default(null),
  fees: nullableDecimalValue("fees").transform((value) => value ?? 0).default(0),
  contractMultiplier: nullableDecimalValue("contractMultiplier").default(null),
  riskAmount: nullableDecimalValue("riskAmount").default(null),
  setupName: nullableTrimmedText().default(null),
  entryTimeframe: nullableTrimmedText().default(null),
  higherTimeframeBias: nullableTrimmedText().default(null),
  strategyTag: nullableTrimmedText().default(null),
  confluences: confluencesValue.default(null),
  emotionalState: nullableTrimmedText().default(null),
  executionRating: tradeExecutionRatingValue.default(null),
  planFollowed: nullableBooleanValue.default(null),
  entryReason: nullableTrimmedText(MAX_LONG_TEXT).default(null),
  exitReason: nullableTrimmedText(MAX_LONG_TEXT).default(null),
  lessonLearned: nullableTrimmedText(MAX_LONG_TEXT).default(null),
  chartScreenshots: screenshotsValue.default(null),
  notes: nullableTrimmedText(MAX_LONG_TEXT).default(null),
});

export const tradeUpdateSchema = z
  .strictObject({
    symbol: requiredShortText("Symbol").transform((value) => value.toUpperCase()).optional(),
    side: z.enum(TRADE_SIDES).optional(),
    status: z.enum(TRADE_STATUSES).optional(),
    assetClass: z.enum(ASSET_CLASSES).optional(),
    openedAt: optionalDateValue("openedAt").optional(),
    closedAt: optionalDateValue("closedAt", true).optional(),
    quantity: decimalValue("quantity").optional(),
    entryPrice: decimalValue("entryPrice").optional(),
    initialStopLoss: nullableDecimalValue("initialStopLoss").optional(),
    initialTakeProfit: nullableDecimalValue("initialTakeProfit").optional(),
    exitPrice: nullableDecimalValue("exitPrice").optional(),
    fees: nullableDecimalValue("fees").transform((value) => value ?? 0).optional(),
    contractMultiplier: nullableDecimalValue("contractMultiplier").optional(),
    riskAmount: nullableDecimalValue("riskAmount").optional(),
    setupName: nullableTrimmedText().optional(),
    entryTimeframe: nullableTrimmedText().optional(),
    higherTimeframeBias: nullableTrimmedText().optional(),
    strategyTag: nullableTrimmedText().optional(),
    confluences: confluencesValue.optional(),
    emotionalState: nullableTrimmedText().optional(),
    executionRating: tradeExecutionRatingValue.optional(),
    planFollowed: nullableBooleanValue.optional(),
    entryReason: nullableTrimmedText(MAX_LONG_TEXT).optional(),
    exitReason: nullableTrimmedText(MAX_LONG_TEXT).optional(),
    lessonLearned: nullableTrimmedText(MAX_LONG_TEXT).optional(),
    chartScreenshots: screenshotsValue.optional(),
    notes: nullableTrimmedText(MAX_LONG_TEXT).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

const tradeImportSourceValue = z.enum(["CTRADER", "METATRADER"]);

export const tradeImportPreviewSchema = z.strictObject({
  accountId: uuidValue,
  source: tradeImportSourceValue,
  fileName: requiredShortText("fileName"),
  fileContent: z.string().trim().min(1, "fileContent is required").max(1_000_000),
});

export const tradeImportConfirmSchema = z.strictObject({
  accountId: uuidValue,
  source: tradeImportSourceValue,
  fileName: requiredShortText("fileName"),
  fileContent: z.string().trim().min(1, "fileContent is required").max(1_000_000),
});
