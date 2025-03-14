<template>
  <div class="container">
    <div class="header">
      <h1 class="title">Le Blog de Dinor</h1>
      <button v-if="!loading" @click="refreshData" class="refresh-btn" :class="{'refreshing': isRefreshing}">
        <span class="refresh-icon">↻</span>
        <span class="refresh-text">{{ isRefreshing ? 'Rafraîchissement...' : 'Rafraîchir' }}</span>
      </button>
    </div>
    
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Chargement des articles...</p>
    </div>
    
    <div v-else>
      <transition-group name="post-list" tag="div" class="posts-grid">
        <div v-for="(post, index) in paginatedPosts" :key="post.id" class="post-card" @click="goToPost(post.slug)" :style="{ '--i': index }">
          <div class="post-image">
            <img v-if="post.thumbnail" :src="post.thumbnail" :alt="post.title">
            <div v-else class="no-image">Pas d'image</div>
          </div>
          <div class="post-content">
            <div class="post-date">{{ formatDate(post.date) }}</div>
            <h2 v-html="post.title"></h2>
            <div class="post-excerpt" v-html="post.excerpt"></div>
            <div class="post-read-more">Lire la suite <span class="arrow">→</span></div>
          </div>
        </div>
      </transition-group>
      
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
      
      <div class="posts-info">
        Affichage de {{ displayedRange.start }}-{{ displayedRange.end }} sur {{ totalArticles }} articles
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import useBlog from '../composables/useBlog';

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
  itemsPerPage
} = useBlog();

const isRefreshing = ref(false);

onMounted(async () => {
  await fetchPosts();
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
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

// Calculer le nombre total d'articles
const totalArticles = computed(() => {
  // Accéder au cache pour obtenir la longueur totale
  // Le composable expose posts mais pas cache directement
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
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.title {
  text-align: center;
  font-size: 3rem;
  font-weight: 800;
  color: #2d3748;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  padding-bottom: 15px;
  margin-bottom: 0;
  flex-grow: 1;
}

.title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 4px;
  background: linear-gradient(to right, #6366f1, #a855f7);
  border-radius: 4px;
  animation: gradient-shift 8s infinite;
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes gradient-shift {
  0% {
    background-position: 0% 50%;
    width: 100px;
  }
  50% {
    background-position: 100% 50%;
    width: 150px;
  }
  100% {
    background-position: 0% 50%;
    width: 100px;
  }
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
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.post-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  background: white;
  position: relative;
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.post-card:hover {
  transform: translateY(-12px) scale(1.02);
  box-shadow: 0 20px 35px rgba(0, 0, 0, 0.15);
}

.post-card:hover .post-read-more .arrow {
  transform: translateX(8px);
}

.post-card:hover .post-image img {
  transform: scale(1.1);
}

.post-card:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.7), rgba(168, 85, 247, 0.7));
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: 1;
  pointer-events: none;
}

.post-card:hover:before {
  opacity: 0.05;
}

.post-image {
  height: 220px;
  overflow: hidden;
  position: relative;
}

.post-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 1.2s ease;
}

.no-image {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  color: #6c757d;
  font-weight: 500;
}

.post-content {
  padding: 25px;
  position: relative;
}

.post-content h2 {
  margin-top: 5px;
  margin-bottom: 15px;
  font-size: 1.3rem;
  font-weight: 700;
  color: #2d3748;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-excerpt {
  margin-bottom: 20px;
  font-size: 0.95rem;
  color: #4a5568;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  line-height: 1.6;
}

.post-date {
  font-size: 0.8rem;
  font-weight: 600;
  color: #6366f1;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.post-read-more {
  display: inline-block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #6366f1;
  position: relative;
}

.post-read-more .arrow {
  display: inline-block;
  transition: transform 0.3s ease;
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

/* Animation pour l'entrée des articles */
.post-list-enter-active {
  transition: all 0.6s ease;
  transition-delay: calc(0.1s * var(--i));
}

.post-list-leave-active {
  transition: all 0.3s ease;
}

.post-list-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.post-list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* Pour les écrans mobiles */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 20px;
  }
  
  .title {
    font-size: 2.2rem;
    margin-bottom: 20px;
  }
  
  .posts-grid {
    grid-template-columns: 1fr;
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
}
</style>
