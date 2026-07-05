"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { getRecentlyViewed } from "@/lib/recently-viewed";
import { ProductCard, type SearchProductLike } from "@/components/product-card";

export function RecentlyViewed() {
  const [items, setItems] = useState<SearchProductLike[]>([]);

  useEffect(() => {
    setItems(getRecentlyViewed());
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#1c1917]">
        <Clock className="h-5 w-5 text-brand-500" /> Recently Viewed
      </h2>
      <div className="stagger grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {items.slice(0, 5).map((p, i) => (
          <ProductCard key={p.id} index={i} {...p} />
        ))}
      </div>
    </section>
  );
}
