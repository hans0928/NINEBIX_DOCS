/** 
 * [KR] 서버 부팅 · 보안 · 라우팅 · 에러 / [EN] App bootstrap · security · routing · errors
 * 규약: 모든 주석/문서/커밋 메시지는 한국어/영어 병기
 */
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { itemsRouter } from "./features/items/items.controller.js";
import { validate, CreateItemSchema } from "./middleware/validate.js";

const app = express();

app.use(helmet());
app.use(express.json({ limit: "1mb" }));

// [KR] CORS 허용 도메인 / [EN] CORS allowlist
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (env.CORS_ALLOWLIST.includes(origin)) return cb(null, true);
    return cb(new Error("CORS not allowed"), false);
  },
  credentials: true,
}));

// [KR] Rate Limiting / [EN] Rate limiting
app.use(rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
}));

// [KR] 헬스체크 / [EN] Health check
app.get("/health", (_req, res) => res.json({ success: true, message: "ok" }));

// [KR] 예: zod 검증을 강제 적용한 경우 / [EN] Example of zod validation enforced
app.post("/api/items/create_item", validate(CreateItemSchema), (req, res, next) =>
  (itemsRouter as any).handle({ ...req, params: { path: "create_item" } }, res, next)
);

// [KR] 일반 라우팅 / [EN] Standard routing
app.use("/api/items", itemsRouter);

// [KR] 전역 에러 핸들러(표준 응답 포맷) / [EN] Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error("Unhandled error", { message: err?.message });
  res.status(500).json({ success: false, message: "서버 내부 오류", error: err?.message });
});

app.listen(env.PORT, () => logger.info(`Server listening on :${env.PORT} (${env.NODE_ENV})`));
