import { defineNuxtConfig } from 'nuxt/config'
export default defineNuxtConfig({
  // Spécifiez explicitement le mode de sortie pour Vercel
  output: 'server',

  devtools: { enabled: false },

  modules: [],

  css: [
    '@/assets/css/colors.css',
    '@/assets/css/global.css',
  ],

  ssr: true,

  nitro: {
    preset: 'vercel',
    // Suppression des options non nécessaires
  },
  
  // Restauration des valeurs par défaut
  experimental: {
    // Pas de configuration expérimentale
  },
  
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
    },
    // Laisser le baseURL simple
    baseURL: '/'
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE || 'https://bigfive.dev/blogdinor',
      wordpress: {
        apiBase: process.env.API_BASE || 'https://bigfive.dev/blogdinor'
      }
    }
  }
})