import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Local dev
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/imagenes/**',
      },
      // 127.0.0.1 fallback (por si NEXT_PUBLIC_API_URL usa esta IP)
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/imagenes/**',
      },
    ],
  },
};

export default nextConfig;
