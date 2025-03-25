<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
// Définition des métadonnées par défaut pour le site
useHead({
  title: 'Blog Dinor',
  meta: [
    { name: 'description', content: 'Découvrez des recettes et des tops 10 sur Blog Dinor' },
    // Open Graph par défaut
    { property: 'og:title', content: 'Blog Dinor' },
    { property: 'og:description', content: 'Découvrez des recettes et des tops 10 sur Blog Dinor' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://blogdinor.vercel.app/' },
    { property: 'og:image', content: 'https://blogdinor.vercel.app/images/bg1.jpg' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Blog Dinor' },
    { name: 'twitter:description', content: 'Découvrez des recettes et des tops 10 sur Blog Dinor' },
    { name: 'twitter:image', content: 'https://blogdinor.vercel.app/images/bg1.jpg' },
  ],
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
  ]
})
</script>
