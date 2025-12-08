import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/imagenes/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/imagenes/**',
      },
    ],
    // Desactivar optimización en desarrollo para evitar errores de IPs privadas
    unoptimized: process.env.NODE_ENV === 'development',
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
