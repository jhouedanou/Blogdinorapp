import { ref } from 'vue'

export default function useBlog() {
    const posts = ref([])
    const post = ref(null)
    const loading = ref(true)
    const cache = ref([])

    const fetchPosts = async () => {
        if (cache.value.length) {
            posts.value = cache.value
            loading.value = false
            return
        }

        loading.value = true
        try {
            // Utiliser l'API qui récupère les articles depuis WordPress
            const response = await fetch('/api/articles')
            const data = await response.json()
            
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
                    thumbnail = 'https://via.placeholder.com/300x200?text=No+Image';
                }
                
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
            
            cache.value = processedPosts
            posts.value = processedPosts
        } catch (error) {
            console.error('Erreur lors du chargement des posts:', error)
        } finally {
            loading.value = false
        }
    }

    const fetchPostBySlug = async (slug) => {
        loading.value = true

        // Vérifier si on a déjà le post en cache
        const cachedPost = cache.value.find(p => p.slug === slug)
        if (cachedPost) {
            post.value = cachedPost
            loading.value = false
            return
        }

        try {
            // Charger tous les articles puis filtrer par slug
            const response = await fetch('/api/articles')
            const data = await response.json()
            
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
                    thumbnail = 'https://via.placeholder.com/300x200?text=No+Image';
                }
                
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
            
            const foundPost = processedPosts.find(p => p.slug === slug)
            if (foundPost) {
                post.value = foundPost
            }
        } catch (error) {
            console.error('Erreur lors du chargement du post:', error)
        } finally {
            loading.value = false
        }
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
        return post.thumbnail || 'https://via.placeholder.com/300x200?text=No+Image';
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
        getPostImageBySize,
        getCategoryName
    }
}
