# DarazSmart

A smarter way to shop [Daraz.pk](https://www.daraz.pk). Search products, compare prices and ratings, save items to a virtual cart, collect coupons, and track price drops — all in one fast, modern interface that pulls **live Daraz data**.

> **Disclaimer:** DarazSmart is an independent price-comparison tool and is **not affiliated with, endorsed by, or sponsored by Daraz.pk**. All products, prices, and trademarks belong to their respective owners. Purchases are completed on Daraz.

---

## Features

- 🔎 **Live product search** — powered by Daraz's JSON catalog API (fast, no headless browser)
- 🧠 **Smart query fallback** — over-specific searches still return relevant results
- 🎚️ **Filter sidebar** — price range with histogram, star rating, brand; sort + "on sale" toggle
- 🛒 **Virtual cart** — save products (anonymous or synced to your account) with a savings summary
- 🏷️ **Coupon collector** — browse and copy voucher codes
- 📈 **Price history + alerts** — track prices over time and get an email when they drop
- 🕑 **Recently viewed** & **trending deals** on the home page
- 🔐 **Auth** — email/password with validation, rate limiting, and bcrypt hashing
- ⚡ **Load-more pagination**, skeleton loaders, and polished animations

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) + React 19 |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL (Neon) + Prisma 7 (`@prisma/adapter-pg`) |
| Cache | Upstash Redis |
| Auth | NextAuth v5 (Credentials) |
| Email | Resend |
| State | Zustand (localStorage-persisted cart) |
| Charts | Recharts |

## Getting Started

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env.local   # then fill in the values

# 3. Create the database schema
npx prisma migrate dev --name init

# 4. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

You'll need free accounts at **Neon** (database), **Upstash** (Redis), and **Resend** (email). See `.env.example` for the exact variables.

## Deploying to Vercel

This app is **serverless-ready** — no headless browser; all scraping is done via `fetch`.

1. Push to GitHub and import the repo in Vercel.
2. Add every variable from `.env.example` under **Project → Settings → Environment Variables** (set `NEXTAUTH_URL` to your deployed URL).
3. Deploy. `prisma generate` runs automatically via the `postinstall` script.
4. Run the migration once against your database: `npx prisma migrate deploy` (locally with the production `DIRECT_URL`, or as a one-off job).

**Cron jobs** (`vercel.json`) run daily, protected by `CRON_SECRET`:
- `refresh-prices` — updates prices for products in carts
- `check-alerts` — emails users when their target price is hit

> Vercel's Hobby plan allows daily crons only. Coupons are populated via the database (`Coupon` rows) rather than live scraping, since Daraz's voucher page has no public API.

## Project Structure

```
src/
├── app/                  # routes (pages + API + cron)
├── components/           # UI components
├── lib/
│   ├── scraper/search.ts # Daraz JSON search (fetch-based)
│   ├── db.ts             # Prisma client
│   ├── cache.ts          # Upstash Redis
│   └── auth.ts           # NextAuth config
├── store/cart.ts         # Zustand cart
└── generated/prisma/     # generated Prisma client (gitignored)
```
