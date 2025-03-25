<template>
  <div class="container">
    <div class="blog-background"></div>
    <div class="blog-overlay"></div>
    <div class="content-wrapper">
      <div>
        <Header />
        
        <div class="header-actions">
          <div class="active-filter">
            <span class="filter-label">Catégorie : </span>
            <span class="filter-value">{{ formatCategoryName(slug) }}</span>
            <button @click="goBack" class="back-btn">Retour</button>
          </div>
        </div>
        
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>Chargement des articles...</p>
        </div>
        
        <div v-else-if="filteredPosts.length === 0" class="no-posts">
          <p>Aucun article trouvé dans cette catégorie.</p>
          <button @click="goBack" class="back-btn">Retour à l'accueil</button>
        </div>
        
        <div v-else>
          <transition-group name="post-list" tag="div" class="posts-grid">
            <div v-for="(post, index) in filteredPosts" :key="post.id" class="post-card" @click="goToPost(post.slug)" :style="{ '--i': index }">
              <div class="post-image-container">
                <nuxt-img 
                  v-if="post.thumbnail" 
                  :src="post.thumbnail" 
                  width="340"
                  height="180"
                  quality="90"
                  format="webp"
                  :alt="post.title"
                  class="post-thumbnail-image"
                />
                <div v-else class="no-image">Pas d'image</div>
                <h3 class="post-title-overlay" v-html="formatTitle(post.title)"></h3>
              </div>
              <div class="post-meta">
                <span class="post-date">{{ formatDate(post.date) }}</span>
                <div v-if="post.categories && post.categories.length" class="post-categories">
                  <span v-for="category in post.categories" :key="category.id" class="category-badge">
                    {{ category.name }}
                  </span>
                </div>
              </div>
              <div class="post-excerpt" v-html="formatExcerpt(post.excerpt)"></div>
              <div class="post-footer">
                <nuxt-link :to="`/post/${post.slug}`" class="read-more-btn">Lire plus</nuxt-link>
              </div>
            </div>
          </transition-group>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import useBlog from '../../composables/useBlog';
import Header from '../../components/Header.vue';

const route = useRoute();
const router = useRouter();
const slug = computed(() => route.params.slug);

// Utiliser le composable useBlog pour récupérer les articles
const { 
  posts: allPosts, 
  loading, 
  error, 
  fetchPosts 
} = useBlog();

// Filtrer les articles par catégorie
const filteredPosts = computed(() => {
  if (!allPosts.value) return [];
  
  return allPosts.value.filter(post => {
    if (!post.categories || !post.categories.length) return false;
    
    return post.categories.some(category => {
      // Convertir le nom de la catégorie en slug pour la comparaison
      const categorySlug = category.name.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
      
      return categorySlug === slug.value;
    });
  });
});

onMounted(() => {
  fetchPosts();
});

// Navigation vers un article
const goToPost = (postSlug) => {
  navigateTo(`/post/${postSlug}`);
};

// Retour à la page d'accueil
const goBack = () => {
  router.push('/');
};

// Formatage de la date
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('fr-FR', options);
};

// Formatage du nom de la catégorie pour l'affichage
const formatCategoryName = (categorySlug) => {
  if (categorySlug === 'recette') {
    return 'Recettes';
  } else if (categorySlug === 'top-10') {
    return 'Top 10';
  }
  
  // Si c'est un autre slug, le formater proprement
  return categorySlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Formatage de l'extrait pour l'affichage
const formatExcerpt = (excerpt) => {
  if (!excerpt) return '';
  
  // Limiter la longueur de l'extrait
  let cleanExcerpt = excerpt.replace(/<\/?[^>]+(>|$)/g, ' ');
  cleanExcerpt = cleanExcerpt.replace(/&hellip;/g, '...');
  cleanExcerpt = cleanExcerpt.replace(/\s+/g, ' ').trim();
  
  if (cleanExcerpt.length > 120) {
    cleanExcerpt = cleanExcerpt.substring(0, 120) + '...';
  }
  
  return cleanExcerpt;
};

// Formatage du titre pour l'affichage
const formatTitle = (title) => {
  if (!title) return '';
  
  // Limiter la longueur du titre
  let cleanTitle = title;
  if (cleanTitle.length > 60) {
    cleanTitle = cleanTitle.substring(0, 60) + '...';
  }
  
  return cleanTitle;
};

// Définir les métadonnées de la page
useHead({
  title: `${formatCategoryName(slug.value)} - Blog Dinor`,
  meta: [
    { 
      name: 'description', 
      content: `Découvrez nos articles dans la catégorie ${formatCategoryName(slug.value)} sur Blog Dinor` 
    },
    { 
      property: 'og:title', 
      content: `${formatCategoryName(slug.value)} - Blog Dinor` 
    },
    { 
      property: 'og:description', 
      content: `Découvrez nos articles dans la catégorie ${formatCategoryName(slug.value)} sur Blog Dinor` 
    }
  ]
});
</script>

<style scoped>
/* Styles généraux */
.container {
  position: relative;
  min-height: 100vh;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
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
  z-index: -2;
}

.blog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.85);
  z-index: -1;
}

.content-wrapper {
  position: relative;
  z-index: 1;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
}

.active-filter {
  display: flex;
  align-items: center;
  background-color: var(--champagne-pink);
  padding: 8px 15px;
  border-radius: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filter-label {
  font-weight: 600;
  margin-right: 5px;
  color: var(--dark-goldenrod);
}

.filter-value {
  font-weight: 700;
  color: var(--lion);
}

.back-btn {
  margin-left: 15px;
  background-color: var(--lion);
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 15px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.back-btn:hover {
  background-color: var(--dark-goldenrod);
}

/* Styles pour la grille d'articles */
.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
  margin-top: 30px;
}

/* Styles pour les cartes d'articles */
.post-card {
  background-color: var(--white);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.5s forwards;
  animation-delay: calc(var(--i) * 0.1s);
}

.post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.post-image-container {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.post-thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.post-card:hover .post-thumbnail-image {
  transform: scale(1.05);
}

.no-image {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: var(--champagne-pink);
  color: var(--lion);
  font-weight: 600;
}

.post-title-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  color: white;
  padding: 15px;
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.3;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.post-date {
  font-size: 0.85rem;
  color: #777;
}

.post-categories {
  display: flex;
  gap: 5px;
}

.category-badge {
  background-color: var(--lion);
  color: white;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
}

.post-excerpt {
  padding: 15px;
  color: #555;
  font-size: 0.95rem;
  line-height: 1.5;
  flex-grow: 1;
}

.post-footer {
  padding: 0 15px 15px;
  text-align: right;
}

.read-more-btn {
  display: inline-block;
  background-color: var(--lion);
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  text-decoration: none;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
}

.read-more-btn:hover {
  background-color: var(--dark-goldenrod);
}

/* Animation pour la liste d'articles */
.post-list-enter-active,
.post-list-leave-active {
  transition: all 0.5s ease;
}

.post-list-enter-from,
.post-list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* Styles pour le chargement */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(185, 155, 118, 0.3);
  border-radius: 50%;
  border-top-color: var(--lion);
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Styles pour aucun article */
.no-posts {
  text-align: center;
  padding: 50px 0;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  margin-top: 30px;
}

/* Responsive */
@media (max-width: 768px) {
  .posts-grid {
    grid-template-columns: 1fr;
  }
  
  .header-actions {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .active-filter {
    margin-bottom: 15px;
  }
}
</style>
