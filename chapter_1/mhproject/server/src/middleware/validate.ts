/** [KR/EN] zod validation middleware */
import { z } from "zod";
import { RequestHandler } from "express";

export const validate =
  (schema: z.ZodTypeAny): RequestHandler =>
  (req, res, next) => {
    const parsed = schema.safeParse({ body: req.body, query: req.query, params: req.params });
    if (!parsed.success) {
      // [KR] 에러 응답 규약 / [EN] Standard error response
      return res.status(400).json({ success: false, message: "요청 데이터가 올바르지 않습니다", error: parsed.error.flatten() });
    }
    next();
  };

export const CreateItemSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().min(1),
  }),
});
