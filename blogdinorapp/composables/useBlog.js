import { ref, computed } from 'vue'

export default function useBlog() {
    const posts = ref([])
    const post = ref(null)
    const loading = ref(true)
    const cache = ref([])
    
    // Pagination
    const currentPage = ref(1)
    const itemsPerPage = ref(6)
    const totalPages = computed(() => Math.ceil(cache.value.length / itemsPerPage.value))
    
    // Computed property pour les articles paginés
    const paginatedPosts = computed(() => {
        const startIndex = (currentPage.value - 1) * itemsPerPage.value
        const endIndex = startIndex + itemsPerPage.value
        return cache.value.slice(startIndex, endIndex)
    })
    
    // Clés pour le localStorage
    const CACHE_KEY = 'dinor-blog-posts-cache'
    const CACHE_TIMESTAMP_KEY = 'dinor-blog-posts-cache-timestamp'
    const CACHE_EXPIRY_TIME = 1000 * 60 * 30 // 30 minutes en millisecondes

    // Fonction pour charger les données du cache local
    const loadFromLocalCache = () => {
        try {
            const cachedData = localStorage.getItem(CACHE_KEY)
            const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY)
            
            if (cachedData && cachedTimestamp) {
                const now = new Date().getTime()
                const timestamp = parseInt(cachedTimestamp)
                
                // Vérifier si le cache est encore valide (moins de 30 minutes)
                if (now - timestamp < CACHE_EXPIRY_TIME) {
                    console.log('Utilisation du cache localStorage (âge:', Math.round((now - timestamp) / 1000 / 60), 'minutes)')
                    const data = JSON.parse(cachedData)
                    cache.value = data
                    updatePaginatedPosts()
                    return true
                } else {
                    console.log('Cache localStorage expiré (âge:', Math.round((now - timestamp) / 1000 / 60), 'minutes)')
                    return false
                }
            }
            return false
        } catch (error) {
            console.error('Erreur lors du chargement du cache:', error)
            return false
        }
    }

    // Fonction pour sauvegarder les données dans le cache local
    const saveToLocalCache = (data) => {
        try {
            const timestamp = new Date().getTime()
            localStorage.setItem(CACHE_KEY, JSON.stringify(data))
            localStorage.setItem(CACHE_TIMESTAMP_KEY, timestamp.toString())
            console.log('Données sauvegardées dans le cache localStorage')
        } catch (error) {
            console.error('Erreur lors de la sauvegarde du cache:', error)
        }
    }

    // Mise à jour des posts affichés en fonction de la pagination
    const updatePaginatedPosts = () => {
        const startIndex = (currentPage.value - 1) * itemsPerPage.value
        const endIndex = startIndex + itemsPerPage.value
        posts.value = cache.value.slice(startIndex, endIndex)
    }

    // Navigation entre les pages
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages.value) {
            currentPage.value = page
            updatePaginatedPosts()
        }
    }

    const nextPage = () => {
        if (currentPage.value < totalPages.value) {
            currentPage.value++
            updatePaginatedPosts()
        }
    }

    const prevPage = () => {
        if (currentPage.value > 1) {
            currentPage.value--
            updatePaginatedPosts()
        }
    }

    const fetchPosts = async (forceRefresh = false) => {
        // Si on a déjà les posts en mémoire, les utiliser
        if (cache.value.length && !forceRefresh) {
            console.log('Utilisation du cache mémoire:', cache.value.length, 'articles')
            updatePaginatedPosts()
            loading.value = false
            return
        }
        
        // Sinon, essayer d'utiliser le localStorage (sauf si forceRefresh est true)
        if (!forceRefresh && loadFromLocalCache()) {
            loading.value = false
            return
        }

        loading.value = true
        try {
            console.log('Récupération des articles depuis l\'API...')
            // Utiliser l'API qui récupère les articles depuis WordPress
            const response = await fetch('/api/articles')
            const data = await response.json()
            
            console.log('Articles récupérés:', data.length)
            
            // Traiter les données pour un format cohérent
            const processedPosts = data.map(post => {
                // Déterminer la meilleure image à utiliser
                let thumbnail = post.thumbnail || null;
                
                // Si l'image n'est pas encore définie mais qu'on a une featured_image
                if (!thumbnail && post.featured_image) {
                    // Utiliser l'image moyenne en priorité, sinon la miniature, sinon l'image complète
                    if (post.featured_image.medium && post.featured_image.medium.url) {
                        thumbnail = post.featured_image.medium.url;
                    } else if (post.featured_image.thumbnail && post.featured_image.thumbnail.url) {
                        thumbnail = post.featured_image.thumbnail.url;
                    } else if (post.featured_image.full) {
                        thumbnail = post.featured_image.full;
                    }
                }
                
                // Si toujours pas d'image, utiliser un placeholder
                if (!thumbnail) {
                    thumbnail = 'https://dummyimage.com/300x200?text=No+Image';
                }
                
                console.log(`Article ${post.id} - ${post.title.rendered} - Image: ${thumbnail.substring(0, 50)}...`)
                
                return {
                    id: post.id,
                    date: post.date,
                    slug: post.slug,
                    title: post.title.rendered,
                    content: post.content.rendered,
                    excerpt: post.excerpt.rendered,
                    categories: post.categories || [],
                    thumbnail: thumbnail,
                    // Stocker la structure complète de featured_image pour un usage potentiel ultérieur
                    featuredImage: post.featured_image || null,
                    // Stocker tout l'objet original pour accès complet si nécessaire
                    originalData: post
                };
            });
            
            // Mettre à jour le cache en mémoire
            cache.value = processedPosts
            
            // Mettre à jour les posts paginés
            updatePaginatedPosts()
            
            // Sauvegarder dans le localStorage pour les prochaines visites
            saveToLocalCache(processedPosts)
        } catch (error) {
            console.error('Erreur lors du chargement des posts:', error)
            
            // En cas d'erreur, essayer de charger depuis le cache local
            // même si on avait demandé un rafraîchissement forcé
            if (loadFromLocalCache()) {
                console.log('Utilisation du cache en cas d\'erreur réseau')
            }
        } finally {
            loading.value = false
        }
    }

    const fetchPostBySlug = async (slug, forceRefresh = false) => {
        console.log('Récupération de l\'article avec le slug:', slug)
        loading.value = true

        // Vérifier si on a déjà le post en cache
        const cachedPost = cache.value.find(p => p.slug === slug)
        if (cachedPost && !forceRefresh) {
            console.log('Article trouvé dans le cache mémoire:', cachedPost.title)
            post.value = cachedPost
            loading.value = false
            return
        }

        // Si on n'a pas de cache en mémoire mais qu'on a potentiellement du cache en localStorage
        if (!cache.value.length && !forceRefresh) {
            const cacheLoaded = loadFromLocalCache()
            if (cacheLoaded) {
                const localCachedPost = cache.value.find(p => p.slug === slug)
                if (localCachedPost) {
                    console.log('Article trouvé dans le cache localStorage:', localCachedPost.title)
                    post.value = localCachedPost
                    loading.value = false
                    return
                }
            }
        }

        try {
            console.log('Récupération de tous les articles depuis l\'API...')
            // Charger tous les articles puis filtrer par slug
            const response = await fetch('/api/articles')
            const data = await response.json()
            console.log('Articles récupérés:', data.length)
            
            // Chercher l'article avec le slug correspondant dans les données brutes
            const rawPost = data.find(p => p.slug === slug)
            
            if (rawPost) {
                console.log('Article trouvé dans l\'API:', rawPost.title.rendered)
                
                // Pour la page de détail, nous devons préserver le format original pour certains champs
                // tout en fournissant des propriétés adaptées pour l'affichage
                post.value = {
                    ...rawPost,
                    // Ajouter des propriétés pour faciliter l'affichage
                    featuredImage: rawPost.featured_image || null,
                    thumbnail: getPostThumbnail(rawPost),
                    title: rawPost.title.rendered,
                    content: rawPost.content.rendered,
                    excerpt: rawPost.excerpt.rendered
                }
                
                // Si on n'a pas encore mis à jour le cache avec les données de l'API,
                // le faire maintenant pour accélérer les requêtes futures
                if (!cache.value.length || forceRefresh) {
                    // Traiter les données pour un format cohérent
                    const processedPosts = data.map(apiPost => {
                        return {
                            id: apiPost.id,
                            date: apiPost.date,
                            slug: apiPost.slug,
                            title: apiPost.title.rendered,
                            content: apiPost.content.rendered,
                            excerpt: apiPost.excerpt.rendered,
                            categories: apiPost.categories || [],
                            thumbnail: apiPost.thumbnail || getPostThumbnail(apiPost),
                            featuredImage: apiPost.featured_image || null,
                            originalData: apiPost
                        };
                    });
                    
                    cache.value = processedPosts
                    updatePaginatedPosts()
                    saveToLocalCache(processedPosts)
                }
            } else {
                console.log('Article non trouvé avec le slug:', slug)
                post.value = null
            }
        } catch (error) {
            console.error('Erreur lors du chargement du post:', error)
            post.value = null
            
            // En cas d'erreur, vérifier si on peut charger depuis le cache
            if (!cache.value.length) {
                loadFromLocalCache()
                const localCachedPost = cache.value.find(p => p.slug === slug)
                if (localCachedPost) {
                    console.log('Article chargé depuis le cache en cas d\'erreur:', localCachedPost.title)
                    post.value = localCachedPost
                }
            }
        } finally {
            loading.value = false
        }
    }

    // Fonction pour rafraîchir le cache
    const refreshCache = async () => {
        console.log('Rafraîchissement forcé du cache...')
        await fetchPosts(true)
        return cache.value.length
    }

    // Nouvelle fonction pour extraire le thumbnail d'un article brut
    const getPostThumbnail = (post) => {
        let thumbnail = post.thumbnail || null;
        
        if (!thumbnail && post.featured_image) {
            if (post.featured_image.medium && post.featured_image.medium.url) {
                thumbnail = post.featured_image.medium.url;
            } else if (post.featured_image.thumbnail && post.featured_image.thumbnail.url) {
                thumbnail = post.featured_image.thumbnail.url;
            } else if (post.featured_image.full) {
                thumbnail = post.featured_image.full;
            }
        }
        
        if (!thumbnail) {
            thumbnail = 'https://dummyimage.com/300x200?text=No+Image';
        }
        
        return thumbnail;
    }

    // Fonction pour obtenir différentes tailles d'images
    const getPostImageBySize = (post, size = 'medium') => {
        if (!post || !post.featuredImage) return null;
        
        // Vérifier les différentes tailles disponibles
        if (size === 'thumbnail' && post.featuredImage.thumbnail && post.featuredImage.thumbnail.url) {
            return post.featuredImage.thumbnail.url;
        } else if (size === 'medium' && post.featuredImage.medium && post.featuredImage.medium.url) {
            return post.featuredImage.medium.url;
        } else if (size === 'medium_large' && post.featuredImage.medium_large && post.featuredImage.medium_large.url) {
            return post.featuredImage.medium_large.url;
        } else if (size === 'large' && post.featuredImage.large && post.featuredImage.large.url) {
            return post.featuredImage.large.url;
        } else if (size === 'full' && post.featuredImage.full) {
            return post.featuredImage.full;
        }
        
        // Fallback à thumbnail si disponible
        return post.thumbnail || 'https://dummyimage.com/300x200?text=No+Image';
    }

    const getCategoryName = (categoryId, post) => {
        if (!post || !post.originalData || !post.originalData.categories) {
            return '';
        }

        const category = post.originalData.categories.find(cat => cat.id === categoryId);
        return category ? category.name : '';
    }

    return {
        posts,
        post,
        loading,
        fetchPosts,
        fetchPostBySlug,
        refreshCache,
        getPostImageBySize,
        getCategoryName,
        // Pagination
        currentPage,
        totalPages,
        goToPage,
        nextPage,
        prevPage,
        itemsPerPage,
        paginatedPosts
    }
}
