export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://eagleholdings-ph.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/partner-portal', '/onboarding', '/login'], // hide API routes and sensitive portals from search engines
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
