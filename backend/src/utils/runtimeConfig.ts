const MIN_JWT_SECRET_LENGTH = 32;
const EXAMPLE_JWT_SECRET = "your-secret-key-here";

/**
 * CORS_ORIGIN is a comma-separated list of allowed origins, e.g.
 * "https://puls.onrender.com". A browser's Origin header never ends with "/",
 * so a trailing slash is removed to avoid a silent mismatch.
 */
export function parseCorsOrigins(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter((origin) => origin !== "");
}

/**
 * In production the server must not start with a missing or example setting:
 * it would look like it works while being open (CORS) or insecure (JWT).
 */
export function assertProductionConfig(env: NodeJS.ProcessEnv = process.env): void {
  if (env.NODE_ENV !== "production") return;

  const missing = ["DATABASE_URL", "JWT_SECRET", "CORS_ORIGIN"].filter((key) => !env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing environment variables in production: ${missing.join(", ")}`);
  }

  const secret = env.JWT_SECRET ?? "";
  if (secret === EXAMPLE_JWT_SECRET || secret.length < MIN_JWT_SECRET_LENGTH) {
    throw new Error(
      `JWT_SECRET must be a random value of at least ${MIN_JWT_SECRET_LENGTH} characters in production`
    );
  }

  if (parseCorsOrigins(env.CORS_ORIGIN).length === 0) {
    throw new Error("CORS_ORIGIN must list at least one origin in production");
  }
}
