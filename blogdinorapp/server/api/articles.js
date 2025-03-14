import { readFileSync } from 'fs'
import { resolve } from 'path'

export default defineEventHandler(async (event) => {
  try {
    console.log('API articles - Récupération des articles depuis WordPress...')
    // Utiliser l'API WordPress au lieu du fichier local
    const response = await fetch('https://bigfive.dev/blogdinor/wp-json/wp/v2/posts?_embed')
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`)
    }
    
    const articles = await response.json()
    console.log(`API articles - ${articles.length} articles récupérés`)
    
    // Traiter les articles pour s'assurer que les thumbnails sont correctement gérés
    const processedArticles = articles.map(article => {
      console.log(`API articles - Traitement de l'article: ${article.id} - ${article.title.rendered}`)
      
      // Vérifier si l'article a une featured_image
      let thumbnail = article.thumbnail || null;
      let featuredImageSource = 'aucune source';
      
      // Si l'article a déjà une featured_image formatée correctement, utiliser celle-ci
      if (article.featured_image) {
        featuredImageSource = 'featured_image existante';
        // Priorité aux tailles: medium, thumbnail, full (par ordre de préférence)
        if (article.featured_image.medium && article.featured_image.medium.url) {
          thumbnail = article.featured_image.medium.url;
          console.log(`API articles - Image trouvée via featured_image.medium: ${thumbnail}`)
        } else if (article.featured_image.thumbnail && article.featured_image.thumbnail.url) {
          thumbnail = article.featured_image.thumbnail.url;
          console.log(`API articles - Image trouvée via featured_image.thumbnail: ${thumbnail}`)
        } else if (article.featured_image.full) {
          thumbnail = article.featured_image.full;
          console.log(`API articles - Image trouvée via featured_image.full: ${thumbnail}`)
        }
      } 
      // Sinon, essayer de récupérer depuis _embedded
      else if (article._embedded && article._embedded['wp:featuredmedia'] && article._embedded['wp:featuredmedia'][0]) {
        featuredImageSource = '_embedded';
        const media = article._embedded['wp:featuredmedia'][0];
        console.log(`API articles - Média trouvé dans _embedded: ${media.source_url || 'aucune URL'}`)
        
        // Construire un objet featured_image à partir des données _embedded
        const featuredImage = {
          full: media.source_url || null
        };
        
        // Extraire les tailles disponibles
        if (media.media_details && media.media_details.sizes) {
          const sizes = media.media_details.sizes;
          console.log(`API articles - Tailles d'images disponibles: ${Object.keys(sizes).join(', ')}`)
          
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
        } else {
          console.log(`API articles - Aucun media_details.sizes disponible`)
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
          console.log(`API articles - Image définie via featuredImage.medium.url: ${thumbnail}`)
        } else if (featuredImage.thumbnail && featuredImage.thumbnail.url) {
          thumbnail = featuredImage.thumbnail.url;
          console.log(`API articles - Image définie via featuredImage.thumbnail.url: ${thumbnail}`)
        } else if (featuredImage.full) {
          thumbnail = featuredImage.full;
          console.log(`API articles - Image définie via featuredImage.full: ${thumbnail}`)
        }
      } else {
        console.log(`API articles - Aucune image trouvée dans les propriétés standard de l'article ${article.id}`)
        
        // Essayer de trouver une image dans le contenu
        const regex = /<img[^>]+src="([^">]+)"/;
        if (article.content && article.content.rendered) {
          const match = article.content.rendered.match(regex);
          if (match) {
            thumbnail = match[1];
            featuredImageSource = 'contenu';
            console.log(`API articles - Image extraite du contenu: ${thumbnail}`)
          }
        }
      }
      
      // Si aucun thumbnail n'est trouvé, utiliser une image par défaut
      if (!thumbnail) {
        thumbnail = 'https://dummyimage.com/600x400?text=Dinor+Blog';
        featuredImageSource = 'placeholder';
        console.log(`API articles - Utilisation de l'image par défaut pour l'article ${article.id}`)
      }
      
      // Corriger les URLs relatives si nécessaires
      if (thumbnail && !thumbnail.startsWith('http')) {
        if (thumbnail.startsWith('//')) {
          thumbnail = 'https:' + thumbnail;
        } else if (thumbnail.startsWith('/')) {
          thumbnail = 'https://bigfive.dev' + thumbnail;
        }
        console.log(`API articles - URL d'image corrigée: ${thumbnail}`)
      }

      // Vérifier si l'URL est valide
      console.log(`API articles - Image finale pour l'article ${article.id}: ${thumbnail} (source: ${featuredImageSource})`)
      
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
      console.log('API articles - Chargement du fallback depuis le fichier JSON local')
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
