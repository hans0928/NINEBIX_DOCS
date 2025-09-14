/** [KR/EN] Redis Storage Singleton (optional if REDIS_URL unset) */
import { createClient, RedisClientType } from "redis";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

export default class RedisStorage {
  private static _instance: RedisStorage;
  public static getInstance() { return this._instance ??= new RedisStorage(); }

  private client?: RedisClientType;

  private constructor() {
    if (!env.REDIS_URL) return; // disabled when no URL
    this.client = createClient({ url: env.REDIS_URL });
    this.client.on("error", (err) => logger.error("Redis error", { message: (err as any)?.message }));
    this.client.connect().catch((e) => logger.error("Redis connect failed", { message: e?.message }));
  }

  async get<T=unknown>(key: string): Promise<T|null> {
    if (!this.client) return null;
    const raw = await this.client.get(key);
    return raw ? JSON.parse(raw) as T : null;
  }

  async set(key: string, value: unknown, ttlSec?: number) {
    if (!this.client) return;
    const raw = JSON.stringify(value);
    ttlSec ? await this.client.setEx(key, ttlSec, raw) : await this.client.set(key, raw);
  }
}
