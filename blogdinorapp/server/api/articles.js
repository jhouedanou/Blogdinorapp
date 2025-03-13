import { readFileSync } from 'fs'
import { resolve } from 'path'

export default defineEventHandler(async (event) => {
  try {
    // Utiliser l'API WordPress au lieu du fichier local
    const response = await fetch('https://bigfive.dev/blogdinor/wp-json/wp/v2/posts?_embed')
    const articles = await response.json()
    
    // Traiter les articles pour s'assurer que les thumbnails sont correctement gérés
    const processedArticles = articles.map(article => {
      // Vérifier si l'article a une featured_image
      let thumbnail = null;
      
      // Si l'article a déjà une featured_image formatée correctement, utiliser celle-ci
      if (article.featured_image) {
        // Priorité aux tailles: medium, thumbnail, full (par ordre de préférence)
        if (article.featured_image.medium && article.featured_image.medium.url) {
          thumbnail = article.featured_image.medium.url;
        } else if (article.featured_image.thumbnail && article.featured_image.thumbnail.url) {
          thumbnail = article.featured_image.thumbnail.url;
        } else if (article.featured_image.full) {
          thumbnail = article.featured_image.full;
        }
      } 
      // Sinon, essayer de récupérer depuis _embedded
      else if (article._embedded && article._embedded['wp:featuredmedia'] && article._embedded['wp:featuredmedia'][0]) {
        const media = article._embedded['wp:featuredmedia'][0];
        
        // Construire un objet featured_image à partir des données _embedded
        const featuredImage = {
          full: media.source_url || null
        };
        
        // Extraire les tailles disponibles
        if (media.media_details && media.media_details.sizes) {
          const sizes = media.media_details.sizes;
          
          if (sizes.thumbnail) {
            featuredImage.thumbnail = {
              url: sizes.thumbnail.source_url,
              width: sizes.thumbnail.width,
              height: sizes.thumbnail.height
            };
          }
          
          if (sizes.medium) {
            featuredImage.medium = {
              url: sizes.medium.source_url,
              width: sizes.medium.width,
              height: sizes.medium.height
            };
          }
          
          if (sizes.medium_large) {
            featuredImage.medium_large = {
              url: sizes.medium_large.source_url,
              width: sizes.medium_large.width,
              height: sizes.medium_large.height
            };
          }
          
          if (sizes.large) {
            featuredImage.large = {
              url: sizes.large.source_url,
              width: sizes.large.width,
              height: sizes.large.height
            };
          }
        }
        
        // Ajouter les méta-données
        if (media.alt_text) featuredImage.alt = media.alt_text;
        if (media.caption && media.caption.rendered) featuredImage.caption = media.caption.rendered;
        if (media.description && media.description.rendered) featuredImage.description = media.description.rendered;
        if (media.title && media.title.rendered) featuredImage.title = media.title.rendered;
        
        // Appliquer l'image
        article.featured_image = featuredImage;
        
        // Définir le thumbnail par ordre de préférence
        if (featuredImage.medium && featuredImage.medium.url) {
          thumbnail = featuredImage.medium.url;
        } else if (featuredImage.thumbnail && featuredImage.thumbnail.url) {
          thumbnail = featuredImage.thumbnail.url;
        } else if (featuredImage.full) {
          thumbnail = featuredImage.full;
        }
      }
      
      // Si aucun thumbnail n'est trouvé, utiliser une image par défaut
      if (!thumbnail) {
        thumbnail = 'https://via.placeholder.com/300x200?text=No+Image';
      }
      
      return {
        ...article,
        thumbnail
      };
    });
    
    return processedArticles;
  } catch (error) {
    console.error('Erreur lors de la récupération des articles depuis WordPress:', error)
    
    // Fallback: utiliser le fichier JSON local en cas d'erreur
    try {
      const filePath = resolve(process.cwd(), 'server/articles.json')
      const fileContent = readFileSync(filePath, 'utf-8')
      const articles = JSON.parse(fileContent)
      return articles
    } catch (localError) {
      console.error('Erreur lors de la lecture des articles locaux:', localError)
      return []
    }
  }
})
