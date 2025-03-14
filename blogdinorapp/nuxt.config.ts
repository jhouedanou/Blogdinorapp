// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: process.env.NODE_ENV !== 'production' },
  modules: [
    '@nuxt/image',
  ],
  css: [
    '~/assets/css/colors.css',
    '~/assets/css/global.css',
  ],
  app: {
    head: {
      title: 'Blog de Dinor App',
      meta: [
        { name: 'description', content: 'Blog officiel de Dinor App avec des articles sur la cuisine, les recettes et plus encore.' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { charset: 'utf-8' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },
  image: {
    domains: ['bigfive.dev', 'secure.gravatar.com'],
    alias: {
      wordpress: 'https://bigfive.dev/blogdinor'
    },
    format: ['webp', 'jpg', 'png'],
    quality: 80,
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536
    }
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE || 'https://bigfive.dev/blogdinor',
      wordpress: {
        apiBase: process.env.API_BASE || 'https://bigfive.dev/blogdinor'
      }
    }
  },
  // Configuration spécifique pour le déploiement sur Vercel
  nitro: {
    preset: 'vercel',
    prerender: {
      crawlLinks: true,
      routes: [
        '/'
      ]
    }
  },
  // Optimisations pour la performance
  routeRules: {
    '/_nuxt/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/images/**': { headers: { 'cache-control': 'public, max-age=604800' } }
  },
  // Assurer que le routage fonctionne correctement
  ssr: true
})