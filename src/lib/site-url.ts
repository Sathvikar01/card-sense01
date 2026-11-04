/**
 * The site's public address, for share links, the sitemap and robots.txt.
 * Set NEXT_PUBLIC_SITE_URL once a custom domain exists; until then Vercel's production
 * address is used, and localhost in development.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000')
).replace(/\/$/, '')
