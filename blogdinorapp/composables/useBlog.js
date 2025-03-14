import { ref, computed, onMounted, watch } from 'vue';

export default function useBlog() {
  const posts = ref([]);
  const cache = ref([]);
  const loading = ref(true);
  const error = ref(null);
  
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
      try {
        const cacheData = {
          data,
          expiry: Date.now() + CACHE_EXPIRY_TIME * 60 * 1000
        };
        
        localStorage.setItem('blogCache', JSON.stringify(cacheData));
        console.log('Cache sauvegardé avec', data.length, 'articles');
      } catch (err) {
        console.error('Erreur lors de la sauvegarde du cache:', err);
      }
    }
  };
  
  // Récupérer les posts du cache
  const getCacheFromStorage = () => {
    if (process.client) {
      try {
        const cacheData = localStorage.getItem('blogCache');
        
        if (cacheData) {
          const { data, expiry } = JSON.parse(cacheData);
          
          // Vérifier si le cache a expiré
          if (Date.now() < expiry) {
            console.log('Utilisation du cache avec', data.length, 'articles');
            return data;
          } else {
            console.log('Cache expiré, récupération de nouvelles données');
          }
        }
      } catch (err) {
        console.error('Erreur lors de la récupération du cache:', err);
      }
    }
    
    return null;
  };
  
  // Mettre à jour les posts paginés
  const updatePaginatedPosts = () => {
    try {
      // Filtrer les articles par catégorie si nécessaire
      const filteredCache = activeCategory.value
        ? cache.value.filter(post => 
            post.categories && 
            post.categories.some(cat => cat.slug === activeCategory.value)
          )
        : cache.value;
      
      console.log(`Filtrage des articles: ${filteredCache.length} articles après filtrage`);
      
      const startIndex = (currentPage.value - 1) * itemsPerPage.value;
      const endIndex = startIndex + itemsPerPage.value;
      posts.value = filteredCache.slice(startIndex, endIndex);
      
      console.log(`Pagination: affichage des articles ${startIndex} à ${endIndex} (${posts.value.length} articles)`);
      
      // S'assurer que currentPage est valide
      if (totalPages.value > 0 && currentPage.value > totalPages.value) {
        currentPage.value = totalPages.value;
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour des posts paginés:', err);
    }
  };
  
  // Récupérer les posts depuis l'API
  const fetchPosts = async (forceRefresh = false) => {
    loading.value = true;
    error.value = null;
    
    try {
      console.log('------- DÉBUT RÉCUPÉRATION DES ARTICLES -------');
      // Vérifier si les données sont en cache et si nous ne forçons pas un rafraîchissement
      const cachedData = !forceRefresh && getCacheFromStorage();
      
      if (cachedData) {
        cache.value = cachedData;
        updatePaginatedPosts();
      } else {
        console.log('Pas de cache, récupération depuis l\'API');
        // Utiliser une URL absolue ou relative à la base de l'application
        const config = useRuntimeConfig();
        console.log('Configuration détectée:', JSON.stringify(config.public));
        
        // URL de l'API avec gestion de fallback
        const baseUrl = process.client ? '' : (config.public?.apiBase || 'https://bigfive.dev/blogdinor');
        console.log('URL de base utilisée:', baseUrl);
        
        console.log('Requête API vers:', `${baseUrl}/api/articles`);
        const response = await fetch(`${baseUrl}/api/articles`);
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Réponse reçue:', data ? `${data.length} articles reçus` : 'Aucune donnée');
        
        if (data && Array.isArray(data)) {
          console.log('Premier article reçu:', data[0] ? JSON.stringify(data[0].id) : 'Aucun article');
          
          cache.value = data.map(post => {
            // Extraire l'URL de la miniature s'il y en a une
            let thumbnail = post.thumbnail || null;
            
            // Debug des données d'article
            console.log(`Article ID ${post.id} - Titre: ${post.title || 'Sans titre'} - Thumbnail: ${thumbnail || 'Aucun'}`);
            
            // Retourner un objet avec uniquement les propriétés dont nous avons besoin
            return {
              id: post.id,
              title: post.title || 'Sans titre',
              excerpt: post.excerpt?.rendered || post.excerpt || '',
              content: post.content?.rendered || post.content || '',
              date: post.date,
              slug: post.slug,
              thumbnail: post.thumbnail || null,
              categories: post.categories || []
            };
          });
          
          // Stocker les données dans le localStorage
          setCacheInStorage(cache.value);
          
          // Mettre à jour les posts paginés
          updatePaginatedPosts();
        } else {
          throw new Error('Format de données invalide reçu de l\'API');
        }
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des posts :', err);
      error.value = err.message || 'Erreur lors de la récupération des articles';
    } finally {
      console.log('------- FIN RÉCUPÉRATION DES ARTICLES -------');
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
  
  // Fonction pour charger un article spécifique par slug
  const fetchPostBySlug = async (slug, forceRefresh = false) => {
    try {
      // Si nous n'avons pas encore les données ou si on force le rafraîchissement
      if (cache.value.length === 0 || forceRefresh) {
        await fetchPosts(forceRefresh);
      }
      
      // Trouver l'article par slug
      const foundPost = getPostBySlug(slug);
      
      if (foundPost) {
        // Définir l'article trouvé comme article actif
        posts.value = [foundPost];
        return foundPost;
      } else {
        console.error(`Article avec slug '${slug}' non trouvé`);
        posts.value = [];
        return null;
      }
    } catch (err) {
      console.error(`Erreur lors de la récupération de l'article avec slug '${slug}':`, err);
      error.value = `Impossible de charger l'article: ${err.message}`;
      posts.value = [];
      return null;
    }
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
    error,
    fetchPosts,
    getPostBySlug,
    fetchPostBySlug,
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
