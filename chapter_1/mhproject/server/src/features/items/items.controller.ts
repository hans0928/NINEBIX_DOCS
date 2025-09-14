/** [KR/EN] Items Controller (PATH whitelist) */
import { Router } from "express";
import { PATH_LIST } from "../../db/query.types.js";
import ItemsService from "./items.service.js";

export const itemsRouter = Router();
const service = ItemsService.getInstance();

itemsRouter.use("/:path", async (req, res) => {
  if (PATH_LIST.includes(req.params.path as any)) {
    await service.getMainFunction(req.params.path, req, res);
  } else {
    res.status(405).json({ success: false, message: "허용되지 않은 경로입니다" });
  }
});
