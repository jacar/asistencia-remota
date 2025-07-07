/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Optimizaciones para Vercel
  serverExternalPackages: [],

  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=*, microphone=*, display-capture=*',
          },
        ],
      },
    ]
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/demo',
        destination: '/control',
        permanent: true,
      },
      {
        source: '/test',
        destination: '/verify',
        permanent: true,
      },
    ]
  },

  // Configuración de imágenes
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
    unoptimized: true,
  },

  // Variables de entorno públicas
  env: {
    CUSTOM_KEY: 'FULLASISTENTE',
    DEVELOPER: 'Armando Ovalle',
    WHATSAPP: '+573052891719',
  },

  // Configuración de webpack
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Configuraciones adicionales si es necesario
    return config
  },

  // Ignorar errores de ESLint y TypeScript durante la construcción
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
