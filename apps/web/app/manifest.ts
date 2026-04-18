import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: '#0A0A0F',
    description:
      'Premium Vedic astrology intelligence for kundli creation, chart-aware guidance, and polished reports.',
    display: 'standalone',
    icons: [
      {
        sizes: '192x192',
        src: '/icon-192.png',
        type: 'image/png',
      },
      {
        sizes: '512x512',
        src: '/icon-512.png',
        type: 'image/png',
      },
    ],
    name: 'Predicta',
    short_name: 'Predicta',
    start_url: '/',
    theme_color: '#0A0A0F',
  };
}
