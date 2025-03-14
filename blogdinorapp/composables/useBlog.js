import { ref, computed, onMounted, watch } from 'vue';

export default function useBlog() {
  const posts = ref([]);
  const cache = ref([]);
  const loading = ref(true);
  
  // Pagination
  const currentPage = ref(1);
  const itemsPerPage = ref(6);
  
  // Catégories
  const activeCategory = ref(null);
  
  // Calculer le nombre total de pages
  const totalPages = computed(() => {
    const filteredCache = activeCategory.value
      ? cache.value.filter(post => 
          post.categories && 
          post.categories.some(cat => cat.slug === activeCategory.value)
        )
      : cache.value;
    
    return Math.ceil(filteredCache.length / itemsPerPage.value);
  });
  
  // Durée de vie du cache en minutes
  const CACHE_EXPIRY_TIME = 30;
  
  // Stocker les posts dans le localStorage avec une date d'expiration
  const setCacheInStorage = (data) => {
    if (process.client) {
      const cacheData = {
        data,
        expiry: Date.now() + CACHE_EXPIRY_TIME * 60 * 1000
      };
      
      localStorage.setItem('blogCache', JSON.stringify(cacheData));
    }
  };
  
  // Récupérer les posts du cache
  const getCacheFromStorage = () => {
    if (process.client) {
      const cacheData = localStorage.getItem('blogCache');
      
      if (cacheData) {
        const { data, expiry } = JSON.parse(cacheData);
        
        // Vérifier si le cache a expiré
        if (Date.now() < expiry) {
          return data;
        }
      }
    }
    
    return null;
  };
  
  // Mettre à jour les posts paginés
  const updatePaginatedPosts = () => {
    // Filtrer les articles par catégorie si nécessaire
    const filteredCache = activeCategory.value
      ? cache.value.filter(post => 
          post.categories && 
          post.categories.some(cat => cat.slug === activeCategory.value)
        )
      : cache.value;
    
    const startIndex = (currentPage.value - 1) * itemsPerPage.value;
    const endIndex = startIndex + itemsPerPage.value;
    posts.value = filteredCache.slice(startIndex, endIndex);
    
    // S'assurer que currentPage est valide
    if (totalPages.value > 0 && currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value;
    }
  };
  
  // Récupérer les posts depuis l'API
  const fetchPosts = async (forceRefresh = false) => {
    loading.value = true;
    
    try {
      // Vérifier si les données sont en cache et si nous ne forçons pas un rafraîchissement
      const cachedData = !forceRefresh && getCacheFromStorage();
      
      if (cachedData) {
        cache.value = cachedData;
        updatePaginatedPosts();
      } else {
        // Utiliser une URL absolue ou relative à la base de l'application
        const config = useRuntimeConfig();
        const baseUrl = process.client ? '' : config.public.apiBase || '';
        const response = await fetch(`${baseUrl}/api/articles`);
        const data = await response.json();
        
        if (data && Array.isArray(data)) {
          cache.value = data.map(post => {
            // Extraire l'URL de la miniature s'il y en a une
            let thumbnail = null;
            if (post.featured_media_thumbnail) {
              thumbnail = post.featured_media_thumbnail;
            } else if (post.featured_image && post.featured_image.thumbnail) {
              thumbnail = post.featured_image.thumbnail.url;
            }
            
            // Retourner un objet avec uniquement les propriétés dont nous avons besoin
            return {
              id: post.id,
              title: post.title.rendered,
              excerpt: post.excerpt.rendered,
              content: post.content.rendered,
              date: post.date,
              slug: post.slug,
              thumbnail,
              categories: post.categories || []
            };
          });
          
          // Stocker les données dans le localStorage
          setCacheInStorage(cache.value);
          
          // Mettre à jour les posts paginés
          updatePaginatedPosts();
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des posts :', error);
    } finally {
      loading.value = false;
    }
  };
  
  // Rafraîchir le cache manuellement
  const refreshCache = async () => {
    return fetchPosts(true);
  };
  
  // Obtenir un post par son slug
  const getPostBySlug = (slug) => {
    return cache.value.find(post => post.slug === slug);
  };
  
  // Pagination
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
      updatePaginatedPosts();
    }
  };
  
  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
      updatePaginatedPosts();
    }
  };
  
  const prevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--;
      updatePaginatedPosts();
    }
  };
  
  // Filtrage par catégorie
  const setActiveCategory = (categorySlug) => {
    activeCategory.value = categorySlug;
    currentPage.value = 1; // Retour à la première page lors du changement de catégorie
    updatePaginatedPosts();
  };
  
  const clearCategoryFilter = () => {
    activeCategory.value = null;
    currentPage.value = 1;
    updatePaginatedPosts();
  };
  
  // Surveiller les changements de catégorie et de page pour mettre à jour les posts
  watch([activeCategory, currentPage], () => {
    updatePaginatedPosts();
  });
  
  return {
    posts,
    loading,
    fetchPosts,
    getPostBySlug,
    refreshCache,
    cache,
    // Pagination
    currentPage,
    totalPages,
    itemsPerPage,
    goToPage,
    nextPage,
    prevPage,
    // Catégories
    activeCategory,
    setActiveCategory,
    clearCategoryFilter
  };
}
