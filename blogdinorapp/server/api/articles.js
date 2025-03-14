import { readFileSync } from 'fs'
import { resolve } from 'path'

export default defineEventHandler(async (event) => {
  try {
    console.log('API articles - Récupération des articles depuis WordPress...')
    // Utiliser l'API WordPress au lieu du fichier local
    const response = await fetch('https://bigfive.dev/blogdinor/wp-json/wp/v2/posts?_embed&per_page=20')
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`)
    }
    
    const articles = await response.json()
    console.log(`API articles - ${articles.length} articles récupérés`)
    
    // Traiter les articles pour s'assurer que les thumbnails sont correctement gérés
    const processedArticles = articles.map(article => {
      console.log(`API articles - Traitement de l'article: ${article.id} - ${article.title.rendered}`)
      
      // Initialiser les variables pour les images
      let thumbnail = null;
      let featuredImageSource = 'aucune source';
      
      // Extraire les catégories
      let categories = [];
      if (article._embedded && article._embedded['wp:term']) {
        const terms = article._embedded['wp:term'];
        // La première collection de termes contient généralement les catégories
        if (terms[0] && Array.isArray(terms[0])) {
          categories = terms[0].map(term => ({
            id: term.id,
            name: term.name,
            slug: term.slug
          }));
        }
      }
      
      // Traitement des images depuis _embedded (prioritaire)
      if (article._embedded && article._embedded['wp:featuredmedia'] && article._embedded['wp:featuredmedia'][0]) {
        featuredImageSource = '_embedded';
        const media = article._embedded['wp:featuredmedia'][0];
        console.log(`API articles - Média trouvé dans _embedded: ${media.source_url || 'aucune URL'}`)
        
        // Construire un objet featured_image
        const featuredImage = {
          full: media.source_url || null,
          alt: media.alt_text || article.title.rendered
        };
        
        // Extraire les tailles disponibles
        if (media.media_details && media.media_details.sizes) {
          const sizes = media.media_details.sizes;
          
          // Priorité à medium_large
          if (sizes.medium_large) {
            featuredImage.medium_large = {
              url: sizes.medium_large.source_url,
              width: sizes.medium_large.width,
              height: sizes.medium_large.height
            };
            // Définir le thumbnail préféré (medium_large)
            thumbnail = sizes.medium_large.source_url;
            console.log(`API articles - Image medium_large utilisée: ${thumbnail}`);
          }
          // Fallback sur medium si medium_large n'est pas disponible
          else if (sizes.medium && !thumbnail) {
            featuredImage.medium = {
              url: sizes.medium.source_url,
              width: sizes.medium.width,
              height: sizes.medium.height
            };
            // Utiliser medium comme fallback
            thumbnail = sizes.medium.source_url;
            console.log(`API articles - Image medium utilisée: ${thumbnail}`);
          }
          
          // Toujours stocker thumbnail pour référence
          if (sizes.thumbnail) {
            featuredImage.thumbnail = {
              url: sizes.thumbnail.source_url,
              width: sizes.thumbnail.width,
              height: sizes.thumbnail.height
            };
            // Utiliser thumbnail seulement si aucune autre taille n'est disponible
            if (!thumbnail) {
              thumbnail = sizes.thumbnail.source_url;
              console.log(`API articles - Image thumbnail utilisée: ${thumbnail}`);
            }
          }
          
          // Toujours stocker large pour référence
          if (sizes.large) {
            featuredImage.large = {
              url: sizes.large.source_url,
              width: sizes.large.width,
              height: sizes.large.height
            };
          }
          
          if (!thumbnail && featuredImage.full) {
            // Si aucune autre taille n'est disponible, utiliser l'image complète
            thumbnail = featuredImage.full;
            console.log(`API articles - Image full utilisée: ${thumbnail}`);
          }
        } else {
          console.log(`API articles - Aucun media_details.sizes disponible`);
          if (media.source_url) {
            thumbnail = media.source_url;
          }
        }
        
        article.featured_image = featuredImage;
      } 
      // Utiliser featured_image existante si disponible
      else if (article.featured_image) {
        featuredImageSource = 'featured_image existante';
        if (article.featured_image.medium_large && article.featured_image.medium_large.url) {
          thumbnail = article.featured_image.medium_large.url;
        } else if (article.featured_image.medium && article.featured_image.medium.url) {
          thumbnail = article.featured_image.medium.url;
        } else if (article.featured_image.thumbnail && article.featured_image.thumbnail.url) {
          thumbnail = article.featured_image.thumbnail.url;
        } else if (article.featured_image.full) {
          thumbnail = article.featured_image.full;
        }
      } 
      // Si aucune featured_image n'est trouvée, chercher une image dans le contenu
      else {
        console.log(`API articles - Aucune image trouvée dans les propriétés standard de l'article ${article.id}`);
        const regex = /<img[^>]+src="([^">]+)"/;
        const match = article.content.rendered.match(regex);
        if (match && match[1]) {
          thumbnail = match[1];
          console.log(`API articles - Image trouvée dans le contenu: ${thumbnail}`);
        }
      }
      
      // Assurer que l'URL de l'image est absolue
      if (thumbnail && !thumbnail.startsWith('http')) {
        thumbnail = `https://bigfive.dev/blogdinor${thumbnail.startsWith('/') ? '' : '/'}${thumbnail}`;
      }
      
      // Créer un nouvel objet article avec seulement les propriétés dont nous avons besoin
      return {
        id: article.id,
        title: article.title.rendered,
        slug: article.slug,
        date: article.date,
        excerpt: article.excerpt.rendered,
        content: article.content.rendered,
        thumbnail: thumbnail,
        featured_image: article.featured_image || null,
        categories: categories || []
      };
    });
    
    return processedArticles;
  } catch (error) {
    console.error('Erreur lors de la récupération des articles depuis WordPress:', error)
    
    // Fallback: utiliser le fichier JSON local en cas d'erreur
    try {
      console.log('API articles - Chargement du fallback depuis le fichier JSON local')
      const articlesJson = readFileSync(resolve('./server/data/articles.json'), 'utf-8')
      return JSON.parse(articlesJson)
    } catch (fallbackError) {
      console.error('Erreur lors du chargement du fichier de fallback:', fallbackError)
      return []
    }
  }
})
