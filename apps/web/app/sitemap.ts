import type { MetadataRoute } from 'next';

const siteUrl = 'https://predicta.rudraix.com';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      changeFrequency: 'weekly',
      lastModified: now,
      priority: 1,
      url: siteUrl,
    },
    {
      changeFrequency: 'weekly',
      lastModified: now,
      priority: 0.8,
      url: `${siteUrl}/pricing`,
    },
    {
      changeFrequency: 'monthly',
      lastModified: now,
      priority: 0.7,
      url: `${siteUrl}/founder`,
    },
  ];
}
