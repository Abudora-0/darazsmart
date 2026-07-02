import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      priceHistory: { orderBy: { timestamp: "asc" }, take: 90 },
    },
  });

  if (!product) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }

  // Record a price-history point only when the price actually changed
  // (or none exists yet) — keeps the chart meaningful without write spam.
  const last = product.priceHistory[product.priceHistory.length - 1];
  if (!last || last.price !== product.currentPrice) {
    await prisma.priceHistory
      .create({ data: { productId: id, price: product.currentPrice } })
      .catch(() => {});
  }

  return Response.json({ product });
}
