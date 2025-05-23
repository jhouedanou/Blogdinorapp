<template>
  <div class="container">
    <div class="blog-background"></div>
    <div class="blog-overlay"></div>
    <div class="content-wrapper">
      <div>
        <Header />
        
        <div class="header-actions">
          <div v-if="activeCategory" class="active-filter">
            <span class="filter-label">Filtré par : </span>
            <span class="filter-value">{{ formatCategoryName(activeCategory) }}</span>
            <button @click="clearFilter" class="clear-filter-btn">×</button>
          </div>
        </div>
        
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>Chargement des articles...</p>
        </div>
        
        <div v-else>
          <div class="posts-grid">
            <div v-for="(post, index) in posts" :key="post.id" class="post-card" @click="goToPost(post.slug)">
              <div class="post-image-container">
                <img 
                  v-if="post.thumbnail" 
                  :src="post.thumbnail" 
                  :alt="post.title"
                  class="post-thumbnail-image"
                  loading="lazy"
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
          </div>
          
          <div v-if="posts.length === 0" class="no-posts">
            <h3>Aucun article trouvé</h3>
            <p v-if="activeCategory">Aucun article n'a été trouvé dans la catégorie "{{ formatCategoryName(activeCategory) }}".</p>
            <button @click="clearFilter" class="refresh-btn">Voir tous les articles</button>
          </div>
          
          <!-- Pagination controls -->
          <div v-if="totalPages > 1" class="pagination">
            <button 
              @click="prevPage" 
              class="pagination-btn" 
              :class="{ 'disabled': currentPage === 1 }" 
              :disabled="currentPage === 1"
            >
              <span class="pagination-arrow">←</span> Précédent
            </button>
            
            <div class="pagination-pages">
              <button 
                v-for="page in paginationButtons" 
                :key="page.value" 
                @click="goToPage(page.value)" 
                class="pagination-page" 
                :class="{ 
                  'active': page.value === currentPage,
                  'ellipsis': page.type === 'ellipsis' 
                }"
                :disabled="page.type === 'ellipsis'"
              >
                {{ page.label }}
              </button>
            </div>
            
            <button 
              @click="nextPage" 
              class="pagination-btn" 
              :class="{ 'disabled': currentPage === totalPages }" 
              :disabled="currentPage === totalPages"
            >
              Suivant <span class="pagination-arrow">→</span>
            </button>
          </div>
          
          <div v-if="posts.length > 0" class="posts-info">
            Affichage de {{ displayedRange.start }}-{{ displayedRange.end }} sur {{ totalArticles }} articles
            <span v-if="activeCategory"> dans la catégorie "{{ formatCategoryName(activeCategory) }}"</span>
          </div>
        </div>
      </div>
      
      <!-- Bouton flottant pour rafraîchir -->
      <button v-if="!loading" @click="refreshData" class="floating-btn refresh-floating-btn" :class="{'refreshing': isRefreshing}" aria-label="Rafraîchir les articles">
        <span class="refresh-icon">↻</span>
        <span class="btn-tooltip">{{ isRefreshing ? 'Rafraîchissement...' : 'Rafraîchir' }}</span>
      </button>
      <button v-if="!loading" @click="goBack" class="floating-btn back-floating-btn" aria-label="Retour">
        <span class="back-icon">⇐</span>
        <span class="btn-tooltip">Retour</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch, onBeforeMount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import useBlog from '../composables/useBlog';
import Header from '../components/Header.vue';

const route = useRoute();
const router = useRouter();

const { 
  posts, 
  loading, 
  fetchPosts, 
  refreshCache,
  // Pagination
  currentPage,
  totalPages,
  goToPage,
  nextPage,
  prevPage,
  itemsPerPage,
  // Catégories
  activeCategory,
  setActiveCategory,
  clearCategoryFilter
} = useBlog();

const isRefreshing = ref(false);

// Mode debug désactivé en production
const debug = ref(false);

onBeforeMount(() => {
  // Vérifier si une catégorie est présente dans l'URL
  const { category } = route.query;
  if (category) {
    setActiveCategory(category);
  }
});

onMounted(async () => {
  await fetchPosts();
  
  // Obtenir les données brutes pour le premier article
  if (posts.value && posts.value.length > 0) {
    console.log('Premier article:', posts.value[0]);
    console.log('Type du titre:', typeof posts.value[0].title);
    console.log('Titre brut:', posts.value[0].title);
  }
});

const refreshData = async () => {
  if (isRefreshing.value) return;
  
  try {
    isRefreshing.value = true;
    await refreshCache();
    console.log('Cache rafraîchi avec succès');
  } catch (error) {
    console.error('Erreur lors du rafraîchissement du cache:', error);
  } finally {
    isRefreshing.value = false;
  }
};

const goToPost = (slug) => {
  navigateTo(`/post/${slug}`);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

const clearFilter = () => {
  clearCategoryFilter();
  router.replace('/');
};

const formatCategoryName = (slug) => {
  switch (slug) {
    case 'recette':
      return 'Recettes';
    case 'top-10':
      return 'Top 10';
    default:
      return slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
  }
};

const formatExcerpt = (excerpt) => {
  if (!excerpt) return '';
  
  // Décoder les entités HTML pour les caractères accentués
  let formattedExcerpt = excerpt
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
  
  // Nettoyer les balises en trop
  formattedExcerpt = formattedExcerpt
    .replace(/<p>/g, '')
    .replace(/<\/p>/g, '')
    .replace(/\[&hellip;\]/g, '...')
    .replace(/\[…\]/g, '...')
    .replace(/\.\.\.<\/p>/g, '...')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Limiter la longueur de l'extrait
  if (formattedExcerpt.length > 150) {
    formattedExcerpt = formattedExcerpt.substring(0, 150) + '...';
  }
  
  return formattedExcerpt;
};

const formatTitle = (title) => {
  if (!title) return '';
  
  // Décoder les entités HTML pour les caractères accentués et les apostrophes
  return title
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, "\"")
    .replace(/&ldquo;/g, "\"")
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
};

// Calculer le nombre total d'articles
const totalArticles = computed(() => {
  return totalPages.value * itemsPerPage.value;
});

// Calculer l'intervalle d'articles affichés
const displayedRange = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value + 1;
  const end = Math.min(currentPage.value * itemsPerPage.value, totalArticles.value);
  return { start, end };
});

// Générer les boutons de pagination de manière dynamique
const paginationButtons = computed(() => {
  const maxVisibleButtons = 5;
  const buttons = [];
  
  if (totalPages.value <= maxVisibleButtons) {
    // Afficher tous les boutons si le nombre total de pages est petit
    for (let i = 1; i <= totalPages.value; i++) {
      buttons.push({ value: i, label: i, type: 'page' });
    }
  } else {
    // Toujours afficher la première page
    buttons.push({ value: 1, label: 1, type: 'page' });
    
    // Calculer la plage autour de la page actuelle
    let startPage = Math.max(2, currentPage.value - Math.floor(maxVisibleButtons / 2) + 1);
    let endPage = Math.min(totalPages.value - 1, startPage + maxVisibleButtons - 3);
    
    // Ajuster la plage si nécessaire
    if (endPage - startPage < maxVisibleButtons - 3) {
      startPage = Math.max(2, endPage - (maxVisibleButtons - 3) + 1);
    }
    
    // Ajouter des ellipses si nécessaire avant la plage
    if (startPage > 2) {
      buttons.push({ value: null, label: '...', type: 'ellipsis' });
    }
    
    // Ajouter les pages dans la plage
    for (let i = startPage; i <= endPage; i++) {
      buttons.push({ value: i, label: i, type: 'page' });
    }
    
    // Ajouter des ellipses si nécessaire après la plage
    if (endPage < totalPages.value - 1) {
      buttons.push({ value: null, label: '...', type: 'ellipsis' });
    }
    
    // Toujours afficher la dernière page
    buttons.push({ value: totalPages.value, label: totalPages.value, type: 'page' });
  }
  
  return buttons;
});

// Articles paginés
const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return posts.value.slice(start, end);
});

// Surveiller les changements d'URL pour mettre à jour la catégorie active
watch(() => route.query.category, (newCategory) => {
  if (newCategory) {
    setActiveCategory(newCategory);
  } else {
    clearCategoryFilter();
  }
});

const goBack = () => {
  router.go(-1);
};
</script>

<style scoped>
/* Styles généraux */
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
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
}

.refresh-btn {
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

.refresh-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.refresh-btn:active {
  transform: translateY(0);
}

.refresh-icon {
  display: inline-block;
  margin-right: 8px;
  font-size: 1.1rem;
  transition: transform 0.5s ease;
}

.refreshing .refresh-icon {
  animation: spin 1s linear infinite;
}

.refresh-text {
  white-space: nowrap;
}

.active-filter {
  display: flex;
  align-items: center;
  background-color: rgba(99, 102, 241, 0.1);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 0.9rem;
}

.filter-label {
  color: #6c757d;
  margin-right: 5px;
}

.filter-value {
  font-weight: 600;
  color: #6366f1;
}

.clear-filter-btn {
  background: none;
  border: none;
  color: #dc3545;
  font-size: 1.2rem;
  cursor: pointer;
  margin-left: 8px;
  padding: 0 5px;
  line-height: 1;
}

.clear-filter-btn:hover {
  color: #c82333;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading {
  text-align: center;
  font-size: 18px;
  margin: 80px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
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

.posts-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 25px;
  margin-top: 30px;
  margin-bottom: 40px;
  width: 100%;
}

@media (min-width: 768px) {
  .posts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .posts-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.no-posts {
  text-align: center;
  padding: 40px 0;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  margin-bottom: 40px;
}

.no-posts h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #4a5568;
}

.no-posts p {
  color: #718096;
  margin-bottom: 20px;
}

.post-card {
  background-color: var(--white);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.post-image-container {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  border-radius: 10px 10px 0 0;
  width: 100%;
}

.post-thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.3s ease-in-out;
}

.post-card:hover .post-thumbnail-image {
  transform: scale(1.05);
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 500;
  color: var(--white);
  background: linear-gradient(135deg, var(--no-image-gradient-start), var(--no-image-gradient-end));
  min-height: 180px;
}

.post-content {
  padding: 0 8px;
}

.post-meta {
  padding: 15px 15px 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.post-date {
  font-size: 0.85rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
}

.post-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.category-badge {
  background-color: var(--primary-color);
  color: white;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.category-badge:hover {
  background-color: var(--primary-dark);
}

.post-excerpt {
  padding: 15px;
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--text-primary);
  flex-grow: 1;
}

.post-footer {
  padding: 0 15px 15px;
  display: flex;
  justify-content: flex-end;
}

.read-more-btn {
  display: inline-block;
  padding: 8px 15px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 4px;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.read-more-btn:hover {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
}

/* Pagination styles */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 40px 0 20px;
}

.pagination-btn {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
  color: #6366f1;
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(.disabled) {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2));
  transform: translateY(-2px);
}

.pagination-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-arrow {
  display: inline-block;
  margin: 0 4px;
  font-size: 1.1rem;
  line-height: 1;
}

.pagination-pages {
  display: flex;
  gap: 6px;
}

.pagination-page {
  min-width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 600;
  background-color: transparent;
  color: #4a5568;
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.pagination-page:hover:not(.active):not(.ellipsis) {
  background-color: rgba(99, 102, 241, 0.1);
  color: #6366f1;
  border-color: rgba(99, 102, 241, 0.2);
}

.pagination-page.active {
  background: linear-gradient(135deg, #6366f1, #a855f7);
  color: white;
  border: none;
  box-shadow: 0 4px 6px rgba(99, 102, 241, 0.3);
}

.pagination-page.ellipsis {
  background: transparent;
  border: none;
  cursor: default;
}

.posts-info {
  text-align: center;
  font-size: 0.9rem;
  color: #718096;
  margin-top: 10px;
}

/* Pour les écrans mobiles */
@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .post-card {
    margin-bottom: 20px;
  }
  
  .pagination {
    flex-direction: column;
    gap: 20px;
  }
  
  .pagination-pages {
    order: -1;
    margin-bottom: 10px;
  }
  
  .post-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}

/* Style pour le bouton flottant */
.floating-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary);
  color: white;
  border: none;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  font-size: 24px;
}

.back-floating-btn {
  right: 100px;
  background: var(--bistre);
}

.refresh-floating-btn {
  background: var(--primary-red);
}

.floating-btn:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  filter: brightness(1.1);
}

.floating-btn:active {
  transform: translateY(0) scale(0.95);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.floating-btn .refresh-icon,
.floating-btn .back-icon {
  font-size: 24px;
  margin: 0;
  transition: transform 0.3s ease;
}

.floating-btn:hover .refresh-icon,
.floating-btn:hover .back-icon {
  transform: scale(1.2);
}

.refreshing .refresh-icon {
  animation: spin 1s linear infinite;
}

.btn-tooltip {
  position: absolute;
  right: 70px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 15px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.3s ease;
  pointer-events: none;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.back-floating-btn .btn-tooltip {
  right: auto;
  left: 70px;
  transform: translateX(-10px);
}

.back-floating-btn:hover .btn-tooltip {
  transform: translateX(0);
  opacity: 1;
}

.floating-btn:hover .btn-tooltip {
  opacity: 1;
  transform: translateX(0);
}

/* Pour les écrans mobiles */
@media (max-width: 768px) {
  .floating-btn {
    bottom: 20px;
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
  
  .refresh-floating-btn {
    right: 20px;
  }
  
  .back-floating-btn {
    right: auto;
    left: 20px;
  }
  
  .btn-tooltip {
    display: none; /* Masquer les tooltips sur mobile pour économiser de l'espace */
  }
}

/* Style pour l'extrait */
.post-excerpt {
  margin: 15px 0;
  padding: 0 15px;
  font-size: 0.95rem;
  line-height: 1.6;
  color: #555;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  text-align: left;
}

/* Style pour la catégorie */
.category-badge {
  display: inline-block;
  background-color: var(--primary);
  color: white;
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 0.75rem;
  margin-right: 5px;
  margin-bottom: 5px;
  font-weight: 500;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1);
}

/* Style pour la date */
.post-date {
  font-size: 0.85rem;
  color: #777;
  margin-right: 10px;
}

/* Style pour les métadonnées */
.post-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  padding: 0 15px;
  margin-top: 10px;
  gap: 5px;
}

/* Style pour le footer de la carte */
.post-footer {
  display: flex;
  justify-content: flex-end;
  padding: 10px 15px 15px;
}

/* Style pour le bouton "Lire plus" */
.read-more-btn {
  display: inline-block;
  background-color: var(--button-read-more);
  color: var(--white);
  text-decoration: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.read-more-btn:hover {
  background-color: var(--button-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.post-title-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 15px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  color: white;
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  transition: transform 0.3s ease;
  z-index: 2;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

.post-card:hover .post-title-overlay {
  transform: translateY(-5px);
}

.content-wrapper{
  margin: 0 auto;
  width: 100%;
}
</style>
