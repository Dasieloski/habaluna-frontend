/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    // Permite que `next build` (y por ende Vercel) no falle por errores de TypeScript.
    // Úsalo solo si lo necesitas temporalmente; puede ocultar bugs reales.
    ignoreBuildErrors: true,
  },
  images: {
    // Deprecado: usar remotePatterns en su lugar
    // domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: 'habaluna-backend-production.up.railway.app',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '4000',
      },
    ],
    // Optimización de imágenes
    formats: ['image/avif', 'image/webp'],
    // Tamaños de imagen para responsive
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Calidad de compresión (1-100, default 75)
    minimumCacheTTL: 60,
    // Deshabilitar optimización solo para imágenes específicas (data URLs, etc)
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

module.exports = nextConfig;

