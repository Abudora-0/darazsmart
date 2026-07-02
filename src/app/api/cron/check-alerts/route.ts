import { type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { sendPriceAlert } from "@/lib/email";

export async function GET(request: NextRequest) {
  if (
    request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const alerts = await prisma.priceAlert.findMany({
    where: { notified: false },
    include: { product: true, user: true },
  });

  let triggered = 0;
  for (const alert of alerts) {
    if (alert.product.currentPrice <= alert.targetPrice) {
      await sendPriceAlert({
        to: alert.user.email,
        productTitle: alert.product.title,
        currentPrice: alert.product.currentPrice,
        targetPrice: alert.targetPrice,
        darazUrl: alert.product.darazUrl,
      }).catch(() => {});

      await prisma.priceAlert.update({
        where: { id: alert.id },
        data: { notified: true },
      });
      triggered++;
    }
  }

  return Response.json({ triggered });
}
