import { prisma } from "@/lib/db";

export async function GET() {
  const coupons = await prisma.coupon.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
  return Response.json({ coupons });
}
