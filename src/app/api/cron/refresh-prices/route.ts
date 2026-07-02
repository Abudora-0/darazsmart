import { type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { searchProducts } from "@/lib/scraper/search";

// Refreshes prices for products currently in any cart. Uses the fetch-based
// search API (no headless browser) so it runs on serverless/Vercel: we
// re-search each product's title and match it back by its Daraz URL.
export async function GET(request: NextRequest) {
  if (
    request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cartProducts = await prisma.cartItem.findMany({
    select: { productId: true },
    distinct: ["productId"],
  });

  let updated = 0;
  for (const { productId } of cartProducts) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) continue;

    const results = await searchProducts(product.title);
    const match = results.find((r) => r.darazUrl === product.darazUrl);
    if (!match || match.currentPrice === product.currentPrice) continue;

    await prisma.product.update({
      where: { id: productId },
      data: {
        currentPrice: match.currentPrice,
        originalPrice: match.originalPrice,
        discount: match.discount,
      },
    });
    await prisma.priceHistory.create({
      data: { productId, price: match.currentPrice },
    });
    updated++;
  }

  return Response.json({ updated });
}
