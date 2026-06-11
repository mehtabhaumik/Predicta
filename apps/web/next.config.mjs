/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  images: {
    unoptimized: true
  },
  typedRoutes: false,
  eslint: {
    ignoreDuringBuilds: true
  },
  async headers() {
    const noStoreEntryHeaders = [
      {
        key: 'Cache-Control',
        value: 'private, no-store, max-age=0, must-revalidate'
      }
    ];

    return [
      {
        source: '/',
        headers: noStoreEntryHeaders
      },
      {
        source: '/ask',
        headers: noStoreEntryHeaders
      }
    ];
  },
  skipTrailingSlashRedirect: true,
  transpilePackages: [
    '@pridicta/access',
    '@pridicta/ai',
    '@pridicta/astrology',
    '@pridicta/config',
    '@pridicta/firebase',
    '@pridicta/monetization',
    '@pridicta/pdf',
    '@pridicta/types',
    '@pridicta/ui-tokens',
    '@pridicta/utils'
  ]
};

export default nextConfig;
