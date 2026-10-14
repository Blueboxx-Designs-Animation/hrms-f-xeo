import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    const rawApi = (process.env.NEXT_PUBLIC_API_URL || '').trim();
    const backendUrl = rawApi
      ? rawApi.replace(/\/api\/?$/, '')
      : 'https://xeob.blueboxxda.com';

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
