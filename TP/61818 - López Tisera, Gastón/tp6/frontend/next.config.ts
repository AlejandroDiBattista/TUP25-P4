import type { NextConfig } from "next";

const ASSETS_HOST = process.env.NEXT_PUBLIC_ASSETS_HOST ?? "127.0.0.1";
const ASSETS_PROTOCOL = process.env.NEXT_PUBLIC_ASSETS_PROTOCOL ?? "http";
const ASSETS_PORT = process.env.NEXT_PUBLIC_ASSETS_PORT ?? "8000";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: ASSETS_PROTOCOL,
        hostname: ASSETS_HOST,
        port: ASSETS_PORT,
        pathname: "/imagenes/**",
      },
    ],
  },
};

export default nextConfig;
