import { type NextRequest } from "next/server";
import { searchProducts } from "@/lib/scraper/search";
import { getCached, setCached } from "@/lib/cache";
import { prisma } from "@/lib/db";

// Cold starts (fresh Neon connection + ~40 upserts) can exceed the default
// 10s serverless limit. Give this route real breathing room on Vercel.
export const maxDuration = 30;

// Run async operations in parallel, but in bounded chunks so we don't
// exhaust the connection pool with 40 simultaneous queries.
async function chunkedMap<T, R>(
  items: T[],
  size: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(...(await Promise.all(items.slice(i, i + size).map(fn))));
  }
  return out;
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q) return Response.json({ error: "query required" }, { status: 400 });

  const page = Math.max(1, parseInt(request.nextUrl.searchParams.get("page") ?? "1") || 1);

  const cacheKey = `search:${q.toLowerCase()}:${page}`;
  const cached = await getCached(cacheKey);
  if (cached) return Response.json({ results: cached, fromCache: true });

  try {
    const scraped = await searchProducts(q, page);

    // Don't cache empty results — a transient failure shouldn't leave a
    // query "stuck" returning nothing for the whole cache window.
    if (scraped.length === 0) {
      return Response.json({ results: [] });
    }

    // Upsert in bounded-parallel chunks to keep total latency low.
    const products = await chunkedMap(scraped, 10, (r) =>
      prisma.product.upsert({
        where: { darazUrl: r.darazUrl },
        update: {
          currentPrice: r.currentPrice,
          originalPrice: r.originalPrice,
          discount: r.discount,
          rating: r.rating,
          reviewCount: r.reviewCount,
          image: r.image,
          title: r.title,
          seller: r.seller,
        },
        create: {
          darazUrl: r.darazUrl,
          title: r.title,
          image: r.image,
          currentPrice: r.currentPrice,
          originalPrice: r.originalPrice,
          discount: r.discount,
          rating: r.rating,
          reviewCount: r.reviewCount,
          seller: r.seller,
        },
      })
    );

    await setCached(cacheKey, products);
    return Response.json({ results: products });
  } catch (err) {
    console.error("Search error:", err);
    return Response.json({ error: "Failed to search" }, { status: 500 });
  }
}
