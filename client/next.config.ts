const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // JANGAN AKTIFKAN DI SERVER (Hanya untuk build Android/iOS)
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  reactCompiler: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {},
};

module.exports = withPWA(nextConfig);
