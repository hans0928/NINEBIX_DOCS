/** [KR/EN] Items Service (Singleton, Controller+Service Pattern) */
import { Request, Response } from "express";
import Query from "../../db/query.class.js";
import RedisStorage from "../../infra/redis.storage.js";

export default class ItemsService {
  private static _instance: ItemsService;
  public static getInstance() { return this._instance ??= new ItemsService(); }

  private query = Query.getInstance();
  private cache = RedisStorage.getInstance();

  private constructor() {}

  /** [KR] PATH별 분기 / [EN] Dispatch by path */
  public async getMainFunction(path: string, req: Request, res: Response) {
    try {
      switch (path) {
        case "get_list":
          if (req.method.toUpperCase() === "GET") return this.getList(req, res);
          break;
        case "create_item":
          if (req.method.toUpperCase() === "POST") return this.createItem(req, res);
          break;
      }
      return res.status(405).json({ success: false, message: "허용되지 않은 메서드/경로" });
    } catch (error:any) {
      return res.status(500).json({ success: false, message: "서버 내부 오류", error: error?.message });
    }
  }

  private async getList(_req: Request, res: Response) {
    const cacheKey = "items:list";
    const cached = await this.cache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached });
    const result = await this.query.getAllItems();
    if (result.success) await this.cache.set(cacheKey, result.data, 30);
    return res.json(result);
  }

  private async createItem(req: Request, res: Response) {
    const { name, description } = req.body as { name?: string; description?: string };
    if (!name || !description)
      return res.status(400).json({ success: false, message: "필수 필드 누락" });
    const result = await this.query.createItem({ name, description });
    return res.json({ success: result.success, data: { id: result.id }, message: result.success ? "생성 완료" : "생성 실패" });
  }
}
