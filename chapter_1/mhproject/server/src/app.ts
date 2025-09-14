// server/src/app.ts
import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

// ✅ 여기! 라우터 import (.js 확장자 꼭 포함: ESM일 때 중요)
import { itemsRouter } from "./routes/items.controller.js";

const app = express();
const PORT = parseInt(process.env.PORT || "4000", 10);

// 보안/미들웨어 순서 권장
app.use(helmet());
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174"] }));
app.use(express.json());
app.use(rateLimit({ windowMs: 60_000, max: 120 }));

// 헬스체크
app.get("/health", (_req, res) => res.json({ success: true, message: "ok" }));

// 라우터 마운트
app.use("/api/items", itemsRouter);

// (선택) 최종 에러 핸들러
app.use((err: any, _req: any, res: any, _next: any) => {
  res.status(500).json({ success: false, message: "서버 내부 오류", error: err?.message });
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
