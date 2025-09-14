import "dotenv/config";
/** [KR] 환경변수 객체 패턴 / [EN] Typed env object */
export const env = {
  NODE_ENV: (process.env.NODE_ENV ?? "development") as "development"|"production"|"test",
  PORT: parseInt(process.env.PORT || "4000", 10),
  DATABASE_HOST: process.env.DATABASE_HOST || "127.0.0.1",
  DATABASE_PORT: parseInt(process.env.DATABASE_PORT || "3306", 10),
  DATABASE_USERNAME: process.env.DATABASE_USERNAME || "mhuser",
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD || "",
  DATABASE_DATABASE: process.env.DATABASE_DATABASE || "mhproject",
  CORS_ALLOWLIST: (process.env.CORS_ALLOWLIST || "http://localhost:5173").split(","),
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || "120", 10),
  REDIS_URL: process.env.REDIS_URL
} as const;
