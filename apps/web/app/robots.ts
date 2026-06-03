import type { MetadataRoute } from 'next';

const SITE_URL = 'https://predicta.rudraix.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        allow: [
          '/',
          '/accuracy-method',
          '/pricing',
          '/safety',
          '/legal',
          '/founder',
          '/feedback',
        ],
        disallow: ['/api/', '/checkout', '/dashboard/', '/_next/'],
        userAgent: '*',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
