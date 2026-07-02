import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const CACHE_TTL = 60 * 45; // 45 minutes

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    return await redis.get<T>(key);
  } catch {
    return null;
  }
}

export async function setCached<T>(
  key: string,
  value: T,
  ttl = CACHE_TTL
): Promise<void> {
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
  } catch {
    // cache failure is non-fatal
  }
}
