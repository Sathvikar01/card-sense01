import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site-url'

/** Public pages are indexable; the signed-in app and the API are not. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/auth/', '/dashboard', '/advisor', '/cards', '/spending', '/education', '/profile', '/settings', '/chat', '/recommendations', '/beginner'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
