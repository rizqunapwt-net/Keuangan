const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true, // Penting untuk navigasi Capacitor agar tidak 404/crash
  images: {
    unoptimized: true,
  },
  reactCompiler: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {},
  webpack: (config: any) => {
    return config;
  }
};

module.exports = withPWA(nextConfig);
