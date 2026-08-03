/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false, // OWASP A05: Disable X-Powered-By header to prevent technology fingerprinting

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // OWASP A05: Anti-clickjacking
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // OWASP A05: Anti-MIME sniffing
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload', // OWASP A02: HSTS
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()', // Feature policy restrict
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block', // OWASP A03: Legacy browser XSS block
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self'; frame-ancestors 'none';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
