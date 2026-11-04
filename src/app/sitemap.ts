import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site-url'

/** The public pages. Everything else needs an account. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/signup`, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${SITE_URL}/login`, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: 'yearly', priority: 0.2 },
  ]
}
