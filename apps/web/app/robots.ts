import type { MetadataRoute } from 'next';

const siteUrl = 'https://predicta.rudraix.com';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    host: siteUrl,
    rules: [
      {
        allow: ['/', '/pricing'],
        disallow: ['/dashboard', '/dashboard/'],
        userAgent: '*',
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
