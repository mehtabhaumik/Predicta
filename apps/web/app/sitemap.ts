import type { MetadataRoute } from 'next';

const SITE_URL = 'https://predicta.rudraix.com';

const publicRoutes: Array<{
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  path: string;
  priority: number;
}> = [
  { changeFrequency: 'weekly', path: '/', priority: 1 },
  { changeFrequency: 'monthly', path: '/accuracy-method', priority: 0.8 },
  { changeFrequency: 'weekly', path: '/pricing', priority: 0.8 },
  { changeFrequency: 'monthly', path: '/safety', priority: 0.7 },
  { changeFrequency: 'monthly', path: '/legal', priority: 0.5 },
  { changeFrequency: 'monthly', path: '/founder', priority: 0.6 },
  { changeFrequency: 'monthly', path: '/feedback', priority: 0.5 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return publicRoutes.map(route => ({
    changeFrequency: route.changeFrequency,
    lastModified,
    priority: route.priority,
    url: `${SITE_URL}${route.path}`,
  }));
}
