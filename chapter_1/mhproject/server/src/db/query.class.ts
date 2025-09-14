/** [KR/EN] DB Query Singleton with optional pool + memory fallback */
import mariadb, { Pool, PoolConnection } from "mariadb";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import type { Item } from "./query.types.js";

// In-memory store (fallback when DB is absent)
const memory: Item[] = [
  { id: 1, name: "샘플", description: "첫 번째 아이템" },
];

function isDbEnabled() {
  // DB 동작 조건: HOST/USER/DB 세 값이 모두 유효해야 함
  return !!(env.DATABASE_HOST && env.DATABASE_USERNAME && env.DATABASE_DATABASE);
}

export default class Query {
  private static _instance: Query;
  public static getInstance(): Query { return this._instance ??= new Query(); }

  // ✅ pool을 선택적(null)로 두고, DB가 없으면 만들지 않음
  private pool: Pool | null = null;

  private constructor() {
    if (isDbEnabled()) {
      this.pool = mariadb.createPool({
        host: env.DATABASE_HOST,
        port: env.DATABASE_PORT,
        user: env.DATABASE_USERNAME,
        password: env.DATABASE_PASSWORD,
        database: env.DATABASE_DATABASE,
        connectionLimit: 10,
        // 짧은 타임아웃으로 지연 방지
        acquireTimeout: 3000,
        connectTimeout: 2000,
        socketTimeout: 2000,
      });
      logger.info("DB pool created");
    } else {
      logger.info("DB disabled → using memory fallback");
    }
  }

  private async safeConn(): Promise<PoolConnection | null> {
    if (!this.pool) return null; // 메모리 모드
    try {
      return await this.pool.getConnection();
    } catch (e: any) {
      logger.error("DB getConnection failed", { message: e?.message });
      return null;
    }
  }

  // ----- Queries -----

  async getAllItems() {
    const conn = await this.safeConn();
    if (!conn) {
      // 🔁 메모리 폴백
      return { success: true, data: memory };
    }
    try {
      const rows = await conn.query("SELECT id, name, description FROM items ORDER BY id DESC");
      return { success: true, data: rows as Item[] };
    } catch (e: any) {
      logger.error("DB getAllItems error", { message: e?.message });
      // 🔁 DB 오류 시에도 즉시 메모리 폴백
      return { success: true, data: memory };
    } finally {
      conn.release();
    }
  }

  async createItem(payload: Pick<Item, "name" | "description">) {
    const conn = await this.safeConn();
    if (!conn) {
      // 🔁 메모리 모드: 로컬에 추가
      const id = memory.length ? memory[memory.length - 1].id + 1 : 1;
      memory.push({ id, ...payload });
      return { success: true, id };
    }
    try {
      const res = await conn.query(
        "INSERT INTO items(name, description) VALUES (?, ?)",
        [payload.name, payload.description]
      );
      return { success: true, id: res.insertId as number };
    } catch (e: any) {
      logger.error("DB createItem error", { message: e?.message });
      // 🔁 DB 오류 시에도 메모리로 저장(옵션: 원치 않으면 false 반환으로 바꾸세요)
      const id = memory.length ? memory[memory.length - 1].id + 1 : 1;
      memory.push({ id, ...payload });
      return { success: true, id };
    }
  }
}
