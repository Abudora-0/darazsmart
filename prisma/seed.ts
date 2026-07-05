/**
 * Seeds the Coupon table with starter codes.
 * Daraz's own voucher page has no public API to scrape (see
 * lib/scraper — search-only), so coupons are curated/community-sourced
 * here instead. Safe to re-run: upserts by unique `code`.
 *
 * Run with: npm run db:seed
 */
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

config({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const daysFromNow = (n: number) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

const COUPONS = [
  {
    code: "DARAZ50",
    description: "Rs. 50 off orders over Rs. 500",
    discount: "Rs. 50 OFF",
    category: "Site-wide",
    expiresAt: daysFromNow(30),
  },
  {
    code: "MOBILE10",
    description: "10% off Mobiles & Tablets",
    discount: "10% OFF",
    category: "Electronics",
    expiresAt: daysFromNow(30),
  },
  {
    code: "FASHION15",
    description: "15% off Fashion items over Rs. 1,500",
    discount: "15% OFF",
    category: "Fashion",
    expiresAt: daysFromNow(21),
  },
  {
    code: "BEAUTY20",
    description: "20% off Health & Beauty",
    discount: "20% OFF",
    category: "Beauty",
    expiresAt: daysFromNow(21),
  },
  {
    code: "HOME100",
    description: "Rs. 100 off Home & Living over Rs. 2,000",
    discount: "Rs. 100 OFF",
    category: "Home",
    expiresAt: daysFromNow(14),
  },
  {
    code: "NEWUSER",
    description: "Extra 5% off your first order",
    discount: "5% OFF",
    category: "Site-wide",
    expiresAt: daysFromNow(60),
  },
  {
    code: "FREESHIP",
    description: "Free shipping on orders over Rs. 1,000",
    discount: "Free Shipping",
    category: "Site-wide",
    expiresAt: daysFromNow(30),
  },
  {
    code: "GADGET25",
    description: "25% off select gadgets & accessories",
    discount: "25% OFF",
    category: "Electronics",
    expiresAt: daysFromNow(10),
  },
];

async function main() {
  for (const c of COUPONS) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: { ...c, isActive: true, source: "community" },
      create: { ...c, source: "community" },
    });
    console.log(`  ✓ ${c.code}`);
  }
  console.log(`\nSeeded ${COUPONS.length} coupons.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
