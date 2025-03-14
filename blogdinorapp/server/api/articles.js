// Endpoint pour récupérer les articles depuis l'API WordPress
export default defineEventHandler(async (event) => {
  try {
    // URL directe et fixe - pas de dépendance à la configuration
    const wpBaseUrl = 'https://bigfive.dev/blogdinor';
    console.log(`API articles - URL de base fixe utilisée: ${wpBaseUrl}`);
    
    // URL directe pour tester avec paramètres essentiels
    const apiUrl = `${wpBaseUrl}/wp-json/wp/v2/posts?_embed&per_page=10`;
    console.log(`API articles - Récupération depuis ${apiUrl}`);
    
    // Récupérer les articles avec un timeout plus long
    const response = await $fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      retry: 3
    });
    
    console.log(`API articles - Articles récupérés: ${response ? response.length : 0}`);
    
    // Si la réponse n'est pas un tableau, retourner une erreur
    if (!response || !Array.isArray(response)) {
      console.error('API articles - Format de réponse invalide:', response);
      throw new Error('Format de données invalide reçu de l\'API WordPress');
    }
    
    // Traiter les articles pour extraire uniquement les données nécessaires
    const processedArticles = response.map(article => {
      console.log(`API articles - Traitement de l'article: ${article.id}`);
      
      // Extraire le titre
      let title = '';
      if (article.title && article.title.rendered) {
        title = article.title.rendered;
      } else if (typeof article.title === 'string') {
        title = article.title;
      } else {
        title = 'Sans titre';
      }
      
      // Extraire la miniature
      let thumbnail = null;
      
      if (article._embedded && article._embedded['wp:featuredmedia'] && article._embedded['wp:featuredmedia'][0]) {
        const media = article._embedded['wp:featuredmedia'][0];
        thumbnail = media.source_url;
        
        // Si media_details est disponible, utiliser medium_large ou medium ou thumbnail
        if (media.media_details && media.media_details.sizes) {
          if (media.media_details.sizes.medium_large) {
            thumbnail = media.media_details.sizes.medium_large.source_url;
          } else if (media.media_details.sizes.medium) {
            thumbnail = media.media_details.sizes.medium.source_url;
          } else if (media.media_details.sizes.thumbnail) {
            thumbnail = media.media_details.sizes.thumbnail.source_url;
          }
        }
      }
      
      // Extraire les catégories si elles existent
      let categories = [];
      if (article._embedded && article._embedded['wp:term'] && article._embedded['wp:term'][0]) {
        categories = article._embedded['wp:term'][0].map(cat => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug
        }));
      }
      
      // Retourner un objet simplifié avec les données essentielles
      return {
        id: article.id,
        title: title,
        excerpt: article.excerpt?.rendered || '',
        content: article.content?.rendered || '',
        date: article.date,
        slug: article.slug,
        thumbnail: thumbnail,
        categories: categories
      };
    });
    
    return processedArticles;
  } catch (error) {
    console.error('API articles - Erreur:', error.message);
    throw createError({
      statusCode: 500,
      statusMessage: `Erreur lors de la récupération des articles: ${error.message}`
    });
  }
});
