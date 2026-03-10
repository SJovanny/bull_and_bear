/**
 * Validates that a required environment variable is present.
 * Centralised helper – every module that needs env vars should import from here.
 */
export function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}
