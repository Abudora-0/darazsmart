import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await auth();
  const sessionId = request.cookies.get("session-id")?.value;

  const items = await prisma.cartItem.findMany({
    where: session?.user?.id
      ? { userId: session.user.id }
      : sessionId
      ? { sessionId }
      : { id: "none" },
    include: { product: true },
    orderBy: { addedAt: "desc" },
  });

  return Response.json({ items });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const sessionId =
    request.cookies.get("session-id")?.value ?? crypto.randomUUID();
  const { productId } = await request.json();

  if (!productId) {
    return Response.json({ error: "productId required" }, { status: 400 });
  }

  const existing = await prisma.cartItem.findFirst({
    where: {
      productId,
      ...(session?.user?.id ? { userId: session.user.id } : { sessionId }),
    },
  });

  if (existing) {
    return Response.json({ item: existing, duplicate: true });
  }

  const item = await prisma.cartItem.create({
    data: {
      productId,
      userId: session?.user?.id ?? null,
      sessionId: session?.user?.id ? null : sessionId,
    },
    include: { product: true },
  });

  const response = Response.json({ item });
  if (!session?.user?.id) {
    // Set sessionId cookie for anonymous users
    (response.headers as Headers).append(
      "Set-Cookie",
      `session-id=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`
    );
  }
  return response;
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  const sessionId = request.cookies.get("session-id")?.value;
  const { itemId } = await request.json();

  const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
  if (!item) return Response.json({ error: "Not found" }, { status: 404 });

  const isOwner = session?.user?.id
    ? item.userId === session.user.id
    : item.sessionId === sessionId;

  if (!isOwner) return Response.json({ error: "Forbidden" }, { status: 403 });

  await prisma.cartItem.delete({ where: { id: itemId } });
  return Response.json({ success: true });
}
