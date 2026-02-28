import type { MetadataRoute } from 'next';

/**
 * Static sitemap for public pages.
 *
 * Dynamic pages (individual teams, tournaments) can be added later by
 * querying the database here. For now, this covers the core marketing pages
 * that search engines should index.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.tnebasketball.com';

  const staticRoutes = [
    { path: '/', priority: 1.0, changeFrequency: 'weekly' as const },
    { path: '/about', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/teams', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/schedule', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/tryouts', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/skills-academy', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/contact', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/payments', priority: 0.5, changeFrequency: 'monthly' as const },
  ];

  return staticRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
