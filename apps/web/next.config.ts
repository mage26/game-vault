import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@game-vault/types'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.igdb.com',
      },
    ],
  },
};

export default nextConfig;
