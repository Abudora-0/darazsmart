"use client";

import { useEffect } from "react";
import { addRecentlyViewed } from "@/lib/recently-viewed";
import type { SearchProductLike } from "@/components/product-card";

export function RecordView({ product }: { product: SearchProductLike }) {
  useEffect(() => {
    addRecentlyViewed(product);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);
  return null;
}
