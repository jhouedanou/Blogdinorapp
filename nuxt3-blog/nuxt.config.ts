import { defineNuxtConfig } from 'nuxt3'

export default defineNuxtConfig({
  head: {
    title: 'Mon Blog Nuxt 3',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'description', content: 'Un blog alimenté par WordPress' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  css: [
    '@/assets/styles/main.css' // Assurez-vous d'avoir ce fichier CSS
  ],
  modules: [
    '@nuxt/content', // Si vous utilisez le module de contenu
  ],
  plugins: [
    // Ajoutez vos plugins ici
  ],
  build: {
    // Configuration de build personnalisée
  }
})