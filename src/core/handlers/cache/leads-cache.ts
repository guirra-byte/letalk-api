import { RedisCacheProvider } from "@/core/providers/cache/cache-provider";

export const LEADS_CACHE_KEY = "leads:v2";
export const LEADS_CACHE_GEN_KEY = "leads:gen";

export async function invalidateLeadsCache(
  cache = new RedisCacheProvider()
): Promise<void> {
  await cache.del(LEADS_CACHE_KEY);
  await cache.incr(LEADS_CACHE_GEN_KEY);
  console.info(`[InvalidateLeadsCache] Invalidated ${LEADS_CACHE_KEY}`);
}
