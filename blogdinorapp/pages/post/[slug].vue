<template>
  <div class="container">
    <div class="blog-background"></div>
    <div class="blog-overlay"></div>
    <div class="content-wrapper">
      <Header />
      
      <!-- Barre de progression de lecture -->
      <div class="reading-progress-container">
        <div class="reading-progress-bar" :style="{ width: readingProgress + '%' }"></div>
      </div>
      
      <div class="header-actions">
        <!-- Supprimé les boutons "Retour" et "Rafraîchir" -->
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Chargement de l'article...</p>
      </div>

      <div v-else-if="!post" class="error">
        <h2>Article non trouvé</h2>
        <p>L'article que vous recherchez n'existe pas ou a été supprimé.</p>
        <button class="back-button" @click="goBack">Retourner à la liste des articles</button>
      </div>

      <article v-else class="post-article">
        <header class="post-header">
          <div class="post-meta-info">
            <div class="post-date">{{ formatDate(post.date) }}</div>
            <div v-if="post.categories && post.categories.length" class="post-categories">
              <span v-for="category in post.categories" :key="category" class="category-badge">
                {{ getCategoryName(category, post) }}
              </span>
            </div>
          </div>
          <h1 class="post-title" v-html="post.title"></h1>
        </header>

        <div v-if="featuredImage" class="post-image-container">
          <img 
            :src="featuredImage" 
            :alt="post.title" 
            class="post-featured-image"
            loading="lazy"
          />
        </div>
        <div v-else class="post-no-image">
          <div class="no-image-label">Pas d'image disponible</div>
        </div>

        <div class="post-content" v-html="enhancePostContent(post.content)"></div>
          <!-- Section de commentaires -->
          <DisqusComments 
            :pageUrl="shareUrl"
            :pageIdentifier="route.path"
          />
        <!-- Boutons de partage -->
        <div class="share-container">
          <h3 class="share-title">Partager cet article</h3>
          <div class="share-buttons">
            <button @click="shareNative" class="share-button native" aria-label="Partager nativement">
              <span class="share-icon">⇧</span>
            </button>
            <button @click="shareOnFacebook" class="share-button facebook" aria-label="Partager sur Facebook">
              <span class="share-icon">f</span>
            </button>
            <button @click="shareOnTwitter" class="share-button twitter" aria-label="Partager sur Twitter">
              <span class="share-icon">t</span>
            </button>
            <button @click="shareOnLinkedIn" class="share-button linkedin" aria-label="Partager sur LinkedIn">
              <span class="share-icon">in</span>
            </button>
            <button @click="shareOnWhatsApp" class="share-button whatsapp" aria-label="Partager sur WhatsApp">
              <span class="share-icon">w</span>
            </button>
          </div>
        </div>
      </article>
    </div>
    
    <!-- Bouton flottant pour revenir en arrière -->
    <button class="floating-btn back-floating-btn" @click="goBack" aria-label="Retour à la liste des articles">
      <span class="back-icon">←</span>
      <span class="btn-tooltip">Retour</span>
    </button>
    
    <!-- Bouton flottant pour rafraîchir -->
    <button v-if="!loading" @click="refreshData" class="floating-btn refresh-floating-btn" :class="{'refreshing': isRefreshing}" aria-label="Rafraîchir l'article">
      <span class="refresh-icon">↻</span>
      <span class="btn-tooltip">{{ isRefreshing ? 'Rafraîchissement...' : 'Rafraîchir' }}</span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useHead } from '#imports';
import { useRoute } from 'vue-router';
import useBlog from '../../composables/useBlog';
import Header from '../../components/Header.vue';
import DisqusComments from '../../components/DisqusComments.vue';
const route = useRoute();
const { posts, loading, error, fetchPostBySlug, refreshCache } = useBlog();
const isRefreshing = ref(false);
const readingProgress = ref(0);

// Référence au post actuel (le premier élément de posts)
const post = computed(() => posts.value && posts.value.length > 0 ? posts.value[0] : null);

// Fonction pour calculer la progression de lecture
const calculateReadingProgress = () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight;
  const winHeight = window.innerHeight;
  const scrollPercent = scrollTop / (docHeight - winHeight);
  readingProgress.value = Math.min(scrollPercent * 100, 100);
};

// Formater la date
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

// Obtenir le nom d'une catégorie
const getCategoryName = (categoryId, post) => {
  if (!post || !post.categories) return '';
  const category = post.categories.find(cat => cat.id === categoryId || cat.slug === categoryId);
  return category ? category.name : '';
};

onMounted(async () => {
  const slug = route.params.slug;
  if (slug) {
    console.log('Chargement de l\'article avec le slug:', slug);
    await fetchPostBySlug(slug);
  }
  
  // Ajouter l'écouteur d'événement pour suivre le défilement
  window.addEventListener('scroll', calculateReadingProgress);
});

onUnmounted(() => {
  // Nettoyer l'écouteur d'événement lors de la destruction du composant
  window.removeEventListener('scroll', calculateReadingProgress);
});

const refreshData = async () => {
  if (isRefreshing.value) return;
  
  try {
    isRefreshing.value = true;
    const slug = route.params.slug;
    await fetchPostBySlug(slug, true); // Force refresh
    console.log('Cache rafraîchi et article rechargé avec succès');
  } catch (error) {
    console.error('Erreur lors du rafraîchissement du cache:', error);
  } finally {
    isRefreshing.value = false;
  }
};

const goBack = () => {
  navigateTo('/');
};

// Améliorer l'affichage des caractères accentués dans le contenu HTML
const enhancePostContent = (content) => {
  if (!content) return '';
  
  // Décoder les entités HTML pour les caractères accentués
  let enhancedContent = content
    .replace(/&eacute;/g, 'é')
    .replace(/&egrave;/g, 'è')
    .replace(/&agrave;/g, 'à')
    .replace(/&ccedil;/g, 'ç')
    .replace(/&ecirc;/g, 'ê')
    .replace(/&ocirc;/g, 'ô')
    .replace(/&ucirc;/g, 'û')
    .replace(/&icirc;/g, 'î')
    .replace(/&euml;/g, 'ë')
    .replace(/&iuml;/g, 'ï')
    .replace(/&uuml;/g, 'ü')
    .replace(/&acirc;/g, 'â')
    .replace(/&ugrave;/g, 'ù')
    .replace(/&Eacute;/g, 'É')
    .replace(/&Egrave;/g, 'È')
    .replace(/&Agrave;/g, 'À')
    .replace(/&Ccedil;/g, 'Ç')
    .replace(/&nbsp;/g, ' ');
  
  // Améliorer la présentation des paragraphes
  enhancedContent = enhancedContent.replace(/<p>/g, '<p class="enhanced-paragraph">');
  
  return enhancedContent;
};

// Computed property qui essaie de trouver la meilleure image disponible
const featuredImage = computed(() => {
  if (!post.value) return null;
  
  // Option 1: Utiliser directement l'image du featured_image si disponible
  if (post.value.featuredImage) {
    // Essayer d'obtenir l'image en taille moyenne, ou grande, ou pleine
    if (post.value.featuredImage.medium && post.value.featuredImage.medium.url) {
      console.log('Utilisation de l\'image moyenne du featured_image');
      return post.value.featuredImage.medium.url;
    }
    if (post.value.featuredImage.large && post.value.featuredImage.large.url) {
      console.log('Utilisation de l\'image large du featured_image');
      return post.value.featuredImage.large.url;
    }
    if (post.value.featuredImage.full) {
      console.log('Utilisation de l\'image full du featured_image');
      return post.value.featuredImage.full;
    }
  }
  
  // Option 2: Utiliser l'image thumbnail déjà traitée
  if (post.value.thumbnail) {
    console.log('Utilisation de l\'image thumbnail');
    return post.value.thumbnail;
  }
  
  // Option 3: Aucune image disponible
  console.log('Aucune image disponible pour cet article');
  return null;
});

// Prepare meta description from content
const metaDescription = computed(() => {
  if (!post.value) return '';
  // Strip HTML tags and get first 160 characters
  const plainText = post.value.content.replace(/<[^>]*>/g, '');
  return plainText.substring(0, 160) + (plainText.length > 160 ? '...' : '');
});

// Extract keywords from content and title
const keywords = computed(() => {
  if (!post.value) return '';
  const allText = `${post.value.title} ${post.value.content.replace(/<[^>]*>/g, '')}`;
  const words = allText.toLowerCase()
    .split(/\W+/)
    .filter(word => word.length > 3)
    .filter((word, index, self) => self.indexOf(word) === index)
    .slice(0, 10);
  return words.join(', ');
});

// Set meta tags
useHead(() => {
  // Créer l'URL de manière sécurisée pour SSR et CSR
  const baseUrl = process.client 
    ? window.location.origin 
    : 'https://blogdinor.vercel.app';
  const currentPath = `/post/${route.params.slug}`;
  const fullUrl = `${baseUrl}${currentPath}`;
  
  return {
    title: post.value ? `${post.value.title} | Dinor App` : 'Chargement...',
    meta: [
      { name: 'description', content: metaDescription.value },
      { name: 'keywords', content: keywords.value },
      // OpenGraph tags
      { property: 'og:title', content: post.value?.title },
      { property: 'og:description', content: metaDescription.value },
      { property: 'og:type', content: 'article' },
      { property: 'og:url', content: fullUrl },
      { property: 'og:image', content: featuredImage.value || '/images/default-thumbnail.jpg' },
      { property: 'og:site_name', content: 'Dinor App' },
      // Twitter Card tags
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: post.value?.title },
      { name: 'twitter:description', content: metaDescription.value },
      { name: 'twitter:image', content: featuredImage.value || '/images/default-thumbnail.jpg' }
    ],
  };
});

// Fonction pour partager sur les réseaux sociaux
const shareUrl = computed(() => {
  if (!post.value) return '';
  
  // Créer l'URL de manière sécurisée pour SSR et CSR
  const baseUrl = process.client 
    ? window.location.origin 
    : 'https://blogdinor.vercel.app';
  const currentPath = `/post/${route.params.slug}`;
  return `${baseUrl}${currentPath}`;
});

const shareTitle = computed(() => post.value?.title || 'Blog Dinor')

const shareOnFacebook = () => {
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl.value)}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

const shareOnTwitter = () => {
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle.value)}&url=${encodeURIComponent(shareUrl.value)}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

const shareOnLinkedIn = () => {
  const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl.value)}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

const shareOnWhatsApp = () => {
  const url = `https://wa.me/?text=${encodeURIComponent(`${shareTitle.value} ${shareUrl.value}`)}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

// Fonction de partage native (si disponible)
const shareNative = async () => {
  if (!process.client) return
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: shareTitle.value,
        text: metaDescription.value,
        url: shareUrl.value
      })
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err)
      }
    }
  }
}
</script>

<style scoped>
.container {
  position: relative;
  min-height: 100vh;
  width: 100vw;
  padding: 0;
  margin: 0 auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.blog-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/images/bg1.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: -2;
}

.blog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.7);
  z-index: -1;
}

.content-wrapper {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.action-button {
  background-color: transparent;
  color: var(--primary);
  border: 1px solid var(--border-color);
  padding: 8px 15px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  margin-left: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.action-button:hover {
  background-color: var(--primary);
  color: var(--white);
}

.post-article {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  padding: 30px;
  margin-top: 20px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.post-header {
  width: 100%;
  margin-bottom: 30px;
}

.post-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 15px;
  color: var(--primary-color);
  line-height: 1.3;
}

.post-meta-info {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.post-author, .post-date, .post-categories {
  display: flex;
  align-items: center;
  gap: 5px;
}

.post-author-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
}

.category-badge {
  background-color: var(--primary-color);
  color: white;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.category-badge:hover {
  background-color: var(--primary-dark);
}

.post-content {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--text-primary);
  width: 100%;
}

.post-content p {
  margin-bottom: 1.5rem;
}

.post-content img {
  max-width: 100%;
  height: auto;
  border-radius: 5px;
  margin: 20px 0;
}

.post-content h2, .post-content h3, .post-content h4 {
  margin-top: 2rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
}

.post-content a {
  color: var(--primary-color);
  text-decoration: underline;
}

.post-content a:hover {
  color: var(--primary-dark);
}

.post-content ul, .post-content ol {
  margin-left: 1.5rem;
  margin-bottom: 1.5rem;
}

.post-content blockquote {
  border-left: 4px solid var(--primary-color);
  padding-left: 1rem;
  margin-left: 0;
  color: var(--text-secondary);
  font-style: italic;
}

.post-image-container {
  width: 100%;
  max-height: 500px;
  overflow: hidden;
  border-radius: 5px;
  margin-bottom: 30px;
  position: relative;
  aspect-ratio: 16 / 9;
}

.post-featured-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.post-image-container:hover .post-featured-image {
  transform: scale(1.05);
}

.post-no-image {
  width: 100%;
  height: 300px;
  background: linear-gradient(135deg, var(--no-image-gradient-start), var(--no-image-gradient-end));
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.no-image-label {
  color: var(--white);
  font-size: 1.2rem;
  font-weight: 500;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid var(--primary);
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: var(--text-secondary);
  font-size: 1.2rem;
}

.error-container {
  text-align: center;
  color: var(--imperial-red);
  padding: 50px 0;
}

.error-message {
  margin-bottom: 20px;
  font-size: 1.2rem;
}

.error-detail {
  color: var(--falu-red);
  margin-bottom: 20px;
  font-size: 0.9rem;
  font-family: monospace;
  white-space: pre-wrap;
  background-color: rgba(0, 0, 0, 0.05);
  padding: 15px;
  border-radius: 5px;
  text-align: left;
  max-width: 100%;
  overflow-x: auto;
}

.refresh-button {
  background-color: var(--primary);
  color: var(--white);
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
}

.refresh-button:hover {
  background-color: var(--secondary);
}

/* Pour les écrans mobiles */
@media (max-width: 768px) {
  .post-title {
    font-size: 1.8rem;
  }

  .post-content {
    font-size: 1rem;
  }

  .post-content h2 {
    font-size: 1.5rem;
  }

  .post-content h3 {
    font-size: 1.3rem;
  }
}

/* Style pour la barre de progression de lecture */
.reading-progress-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background-color: rgba(200, 200, 200, 0.2);
  z-index: 1000;
}

.reading-progress-bar {
  height: 100%;
  background: linear-gradient(to right, var(--primary), var(--secondary));
  width: 0%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

/* Styles pour les boutons de partage */
.share-container {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.share-title {
  font-size: 1.2rem;
  margin-bottom: 15px;
  color: var(--text-primary);
}

.share-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.share-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-weight: bold;
}

.facebook {
  background-color: #3b5998;
}

.twitter {
  background-color: #1da1f2;
}

.linkedin {
  background-color: #0077b5;
}

.whatsapp {
  background-color: #25d366;
}

.native {
  background-color: var(--primary);
}

.share-icon {
  font-size: 1.2rem;
}
</style>
