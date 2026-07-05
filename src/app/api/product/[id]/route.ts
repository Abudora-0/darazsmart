import type { NextRequest } from "next/server";
import { getProductWithHistory } from "@/lib/product-service";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const product = await getProductWithHistory(id);

  if (!product) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }

  return Response.json({ product });
}
