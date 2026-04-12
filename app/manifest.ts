import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Kojoutárna',
    short_name: 'Kojoutárna',
    description: 'Evidence slepic a vajec',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#1c1009',
    theme_color: '#1c1009',
    icons: [
      {
        src: '/api/pwa-icon?size=192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/api/pwa-icon?size=512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
