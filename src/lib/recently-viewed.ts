import type { SearchProductLike } from "@/components/product-card";

const KEY = "darazsmart-recently-viewed";
const MAX = 8;

export function getRecentlyViewed(): SearchProductLike[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function addRecentlyViewed(p: SearchProductLike) {
  if (typeof window === "undefined") return;
  const list = getRecentlyViewed().filter((x) => x.id !== p.id);
  list.unshift(p);
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
}
