import { randomUserAgent } from "./ua";

export interface SearchResult {
  darazUrl: string;
  darazItemId: string;
  title: string;
  image: string;
  currentPrice: number;
  originalPrice?: number;
  discount?: number;
  rating?: number;
  reviewCount?: number;
  seller?: string;
}

interface DarazListItem {
  name?: string;
  itemId?: string;
  nid?: string;
  price?: string;
  originalPrice?: string;
  discount?: string;
  ratingScore?: string;
  review?: string;
  image?: string;
  itemUrl?: string;
  location?: string;
  sellerName?: string;
  brandName?: string;
}

function toInt(v?: string): number {
  return parseInt((v ?? "").replace(/[^\d]/g, "")) || 0;
}

/** Fetch + parse one query against Daraz's JSON catalog API. */
async function fetchDaraz(query: string, page: number): Promise<SearchResult[]> {
  const url = `https://www.daraz.pk/catalog/?ajax=true&q=${encodeURIComponent(
    query
  )}&page=${page}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": randomUserAgent(),
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "X-Requested-With": "XMLHttpRequest",
        Referer: `https://www.daraz.pk/catalog/?q=${encodeURIComponent(query)}`,
      },
    });
    if (!res.ok) return [];

    const json = await res.json();
    const items: DarazListItem[] = json?.mods?.listItems ?? [];

    return items
      .map((it): SearchResult | null => {
        const currentPrice = toInt(it.price);
        const title = it.name?.trim() ?? "";
        const itemUrl = it.itemUrl ?? "";
        if (!currentPrice || !title || !itemUrl) return null;

        const darazUrl = itemUrl.startsWith("http") ? itemUrl : `https:${itemUrl}`;
        const darazItemId =
          it.itemId ?? itemUrl.match(/-i(\d+)\.html/)?.[1] ?? darazUrl;
        const originalPrice = toInt(it.originalPrice);
        const rating = it.ratingScore ? parseFloat(it.ratingScore) : undefined;
        const image = it.image?.startsWith("//")
          ? `https:${it.image}`
          : it.image ?? "";

        return {
          darazUrl,
          darazItemId,
          title,
          image,
          currentPrice,
          originalPrice: originalPrice > currentPrice ? originalPrice : undefined,
          discount: toInt(it.discount) || undefined,
          rating: rating && rating > 0 ? rating : undefined,
          reviewCount: toInt(it.review) || undefined,
          seller: it.brandName?.trim() || it.sellerName?.trim() || undefined,
        };
      })
      .filter((r): r is SearchResult => r !== null);
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Search Daraz. Daraz requires ALL query words to match a product (strict AND),
 * so an extra qualifier (e.g. "... Vp") can return zero results even when the
 * core query has plenty. If the full query comes back empty, we progressively
 * drop trailing words until we get hits — so users always see relevant products.
 */
export async function searchProducts(
  query: string,
  page = 1
): Promise<SearchResult[]> {
  const terms = query.trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  // Full query first, then drop one trailing word at a time (cap the attempts).
  // Keep a floor of 2 words for multi-word queries so pure nonsense
  // ("asdfghjkl zxcvb") doesn't fall back to a single word's generic
  // recommendations — Daraz returns 0 for unknown 2-word combos.
  const minTerms = terms.length >= 2 ? Math.max(2, terms.length - 3) : 1;
  for (let n = terms.length; n >= minTerms; n--) {
    const results = await fetchDaraz(terms.slice(0, n).join(" "), page);
    if (results.length > 0) return results;
  }
  return [];
}
