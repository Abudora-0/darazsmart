/**
 * Base URL for server-side calls to our own API routes.
 * Works locally and on Vercel (which auto-sets VERCEL_URL per deployment),
 * so it doesn't depend on knowing the production domain ahead of time.
 */
export function getBaseUrl(): string {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
