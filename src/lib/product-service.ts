import { prisma } from "@/lib/db";

/**
 * Fetch a product with its price history, recording a new history point
 * only when the price has actually changed. Called directly (in-process)
 * by both the /api/product/[id] route and the product page — no self-fetch.
 */
export async function getProductWithHistory(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      priceHistory: { orderBy: { timestamp: "asc" }, take: 90 },
    },
  });

  if (!product) return null;

  const last = product.priceHistory[product.priceHistory.length - 1];
  if (!last || last.price !== product.currentPrice) {
    await prisma.priceHistory
      .create({ data: { productId: id, price: product.currentPrice } })
      .catch(() => {});
  }

  return product;
}
