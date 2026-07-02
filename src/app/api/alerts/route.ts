import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const alerts = await prisma.priceAlert.findMany({
    where: { userId: session.user.id },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ alerts });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId, targetPrice } = await request.json();
  if (!productId || !targetPrice) {
    return Response.json({ error: "productId and targetPrice required" }, { status: 400 });
  }

  const alert = await prisma.priceAlert.upsert({
    where: { userId_productId: { userId: session.user.id, productId } },
    update: { targetPrice: parseFloat(targetPrice), notified: false },
    create: { userId: session.user.id, productId, targetPrice: parseFloat(targetPrice) },
    include: { product: true },
  });

  return Response.json({ alert });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { alertId } = await request.json();
  const alert = await prisma.priceAlert.findUnique({ where: { id: alertId } });
  if (!alert || alert.userId !== session.user.id) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.priceAlert.delete({ where: { id: alertId } });
  return Response.json({ success: true });
}
