import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Called after login to merge anonymous cart into user account
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productIds }: { productIds: string[] } = await request.json();
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return Response.json({ synced: 0 });
  }

  let synced = 0;
  for (const productId of productIds) {
    const exists = await prisma.cartItem.findFirst({
      where: { userId: session.user.id, productId },
    });
    if (!exists) {
      await prisma.cartItem
        .create({
          data: { userId: session.user.id, productId },
        })
        .then(() => synced++)
        .catch(() => {});
    }
  }

  return Response.json({ synced });
}
