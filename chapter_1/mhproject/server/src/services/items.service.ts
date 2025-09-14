// server/src/services/items.service.ts
import { Request, Response } from "express";
import Query from "../db/query.class.js";

export default class ItemsService {
  private static _instance: ItemsService;
  public static getInstance() {
    return this._instance ?? (this._instance = new ItemsService());
  }

  private query: Query;

  private constructor() {
    this.query = Query.getInstance();
  }

  // 컨트롤러에서 직접 호출할 public 메서드
  public async getList(_req: Request, res: Response) {
    const result = await this.query.getAllItems();
    return res.json({ success: true, data: result.data ?? [] });
  }

  public async createItem(req: Request, res: Response) {
    const { name, description } = req.body ?? {};
    if (!name || !description) {
      return res.status(400).json({ success: false, message: "필수 필드가 누락되었습니다" });
    }
    const r = await this.query.createItem({ name, description });
    return res.json({
      success: true,
      message: "성공적으로 생성되었습니다",
      id: (r as any).id,
    });
  }
}
