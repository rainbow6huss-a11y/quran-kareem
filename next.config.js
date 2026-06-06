/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,

  // ── ضغط الصفحات ──
  compress: true,
  swcMinify: true,

  // ── تحسين الصور ──
  images: {
    formats: ['image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // أسبوع
  },

  // ── HTTP Headers للـ Cache ──
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
      {
        // Cache الـ static assets أسبوع
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=604800, immutable' },
        ],
      },
      {
        // Cache الـ fonts والصور سنة
        source: '/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },

  // ── Webpack optimization ──
  webpack(config, { dev, isServer }) {
    // دعم JSON كبير الحجم
    config.module.rules.push({ test: /\.json$/, type: 'json' });
    if (!dev && !isServer) {
      // تقسيم الـ chunks بشكل أذكى
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    return config;
  },
};

module.exports = nextConfig;
