import { type NextRequest } from "next/server";

// Daraz vouchers are rendered client-side with no public JSON endpoint, so
// automated scraping required a headless browser (not available on serverless).
// Coupons are instead sourced via the DB (`Coupon` rows with source
// "community"/"scraped"). This endpoint is kept as a no-op so the cron
// schedule stays valid; populate coupons via an admin action or a separate
// worker if you want live scraping.
export async function GET(request: NextRequest) {
  if (
    request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json({
    ok: true,
    note: "Coupon auto-scraping is disabled in the serverless build. Add coupons via the DB (source: 'community').",
  });
}
