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
