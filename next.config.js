/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    // Permite que `next build` (y por ende Vercel) no falle por errores de TypeScript.
    // Úsalo solo si lo necesitas temporalmente; puede ocultar bugs reales.
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;

