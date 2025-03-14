<template>
  <div class="container">
    <div class="header-actions">
      <button class="back-button" @click="goBack">
        <span class="back-icon">←</span> Retour
      </button>
      <button v-if="!loading" @click="refreshData" class="refresh-btn" :class="{'refreshing': isRefreshing}">
        <span class="refresh-icon">↻</span>
        <span class="refresh-text">{{ isRefreshing ? 'Rafraîchissement...' : 'Rafraîchir' }}</span>
      </button>
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
        <div class="post-meta">
          <div class="post-date">{{ formatDate(post.date) }}</div>
          <div v-if="post.categories && post.categories.length" class="post-categories">
            <span v-for="category in post.categories" :key="category" class="category">
              {{ getCategoryName(category, post) }}
            </span>
          </div>
        </div>
        <h1 class="post-title" v-html="post.title"></h1>
      </header>

      <div v-if="featuredImage" class="post-featured-image">
        <img :src="featuredImage" :alt="post.title">
      </div>

      <div class="post-content" v-html="post.content"></div>
    </article>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import useBlog from '../../composables/useBlog';

const route = useRoute();
const { post, loading, fetchPostBySlug, getCategoryName, refreshCache } = useBlog();
const isRefreshing = ref(false);

onMounted(async () => {
  const slug = route.params.slug;
  if (slug) {
    console.log('Chargement de l\'article avec le slug:', slug);
    await fetchPostBySlug(slug);
  }
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

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
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
</script>

<style scoped>
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 30px 20px;
  font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.back-button, .refresh-btn {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.back-button:hover, .refresh-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.back-button:active, .refresh-btn:active {
  transform: translateY(0);
}

.back-icon, .refresh-icon {
  display: inline-block;
  margin-right: 8px;
  font-size: 1.1rem;
}

.refreshing .refresh-icon {
  animation: spin 1s linear infinite;
}

.refresh-text {
  white-space: nowrap;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading, .error {
  text-align: center;
  font-size: 18px;
  margin: 80px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.error h2 {
  color: #e53e3e;
  margin-bottom: 20px;
}

.error p {
  margin-bottom: 30px;
  max-width: 500px;
}

.spinner {
  border: 5px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 5px solid #6366f1;
  width: 50px;
  height: 50px;
  margin-bottom: 20px;
  animation: spin 1s linear infinite;
}

.post-header {
  margin-bottom: 30px;
  animation: fade-in 0.8s ease-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.post-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
}

.post-date {
  font-size: 0.95rem;
  font-weight: 600;
  color: #6366f1;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.post-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category {
  font-size: 0.8rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
  color: #6366f1;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 600;
}

.post-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #2d3748;
  line-height: 1.3;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  margin-bottom: 30px;
}

.post-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 0;
  width: 100px;
  height: 4px;
  background: linear-gradient(to right, #6366f1, #a855f7);
  border-radius: 4px;
}

.post-featured-image {
  margin-bottom: 30px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  animation: slide-up 0.8s ease-out;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.post-featured-image img {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.8s ease;
}

.post-featured-image:hover img {
  transform: scale(1.02);
}

.post-content {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #4a5568;
  animation: fade-in 1s ease-out 0.3s both;
}

.post-content :deep(h2) {
  margin-top: 40px;
  margin-bottom: 20px;
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
}

.post-content :deep(h3) {
  margin-top: 30px;
  margin-bottom: 15px;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
}

.post-content :deep(p) {
  margin-bottom: 20px;
}

.post-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 20px 0;
}

.post-content :deep(a) {
  color: #6366f1;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.post-content :deep(a:hover) {
  color: #a855f7;
  text-decoration: underline;
}

.post-content :deep(blockquote) {
  border-left: 4px solid #6366f1;
  padding-left: 20px;
  margin-left: 0;
  margin-right: 0;
  font-style: italic;
  color: #4a5568;
}

.post-content :deep(pre) {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 20px 0;
}

.post-content :deep(code) {
  background: #f1f5f9;
  padding: 3px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9em;
}

.post-content :deep(ul), .post-content :deep(ol) {
  margin-bottom: 20px;
  padding-left: 40px;
}

.post-content :deep(li) {
  margin-bottom: 10px;
}

/* Pour les écrans mobiles */
@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .post-title {
    font-size: 1.8rem;
  }
  
  .post-content {
    font-size: 1rem;
  }
}
</style>
