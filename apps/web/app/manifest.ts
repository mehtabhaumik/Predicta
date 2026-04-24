import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: '#0A0A0F',
    categories: ['lifestyle', 'productivity', 'utilities'],
    description:
      'Premium Vedic astrology intelligence for kundli creation, chart-aware guidance, and polished reports.',
    display: 'standalone',
    display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
    dir: 'ltr',
    id: '/',
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
    lang: 'en-IN',
    name: 'Predicta',
    orientation: 'portrait',
    prefer_related_applications: false,
    short_name: 'Predicta',
    scope: '/',
    shortcuts: [
      {
        name: 'Open Dashboard',
        short_name: 'Dashboard',
        url: '/dashboard',
      },
      {
        name: 'Ask Predicta',
        short_name: 'Chat',
        url: '/dashboard/chat',
      },
      {
        name: 'Create Kundli',
        short_name: 'Kundli',
        url: '/dashboard/kundli',
      },
      {
        name: 'View Pricing',
        short_name: 'Pricing',
        url: '/pricing',
      },
    ],
    start_url: '/',
    theme_color: '#0A0A0F',
  };
}
