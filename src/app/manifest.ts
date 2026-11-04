import type { MetadataRoute } from 'next'

/** Lets people add CardSense to their home screen; it opens without browser chrome, on paper. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CardSense',
    short_name: 'CardSense',
    description: 'Find the Indian credit card that pays you back.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f4f3ef',
    theme_color: '#f4f3ef',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
