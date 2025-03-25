import { d as defineEventHandler, c as createError } from '../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'ipx';

const articles = defineEventHandler(async (event) => {
  try {
    const wpBaseUrl = "https://bigfive.dev/blogdinor";
    console.log(`API articles - URL de base fixe utilis\xE9e: ${wpBaseUrl}`);
    const apiUrl = `${wpBaseUrl}/wp-json/wp/v2/posts?_embed&per_page=10`;
    console.log(`API articles - R\xE9cup\xE9ration depuis ${apiUrl}`);
    const response = await $fetch(apiUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      },
      retry: 3
    });
    console.log(`API articles - Articles r\xE9cup\xE9r\xE9s: ${response ? response.length : 0}`);
    if (!response || !Array.isArray(response)) {
      console.error("API articles - Format de r\xE9ponse invalide:", response);
      throw new Error("Format de donn\xE9es invalide re\xE7u de l'API WordPress");
    }
    const processedArticles = response.map((article) => {
      var _a, _b;
      console.log(`API articles - Traitement de l'article: ${article.id}`);
      let title = "";
      if (article.title && article.title.rendered) {
        title = article.title.rendered;
      } else if (typeof article.title === "string") {
        title = article.title;
      } else {
        title = "Sans titre";
      }
      let thumbnail = null;
      if (article._embedded && article._embedded["wp:featuredmedia"] && article._embedded["wp:featuredmedia"][0]) {
        const media = article._embedded["wp:featuredmedia"][0];
        thumbnail = media.source_url;
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
      let categories = [];
      if (article._embedded && article._embedded["wp:term"] && article._embedded["wp:term"][0]) {
        categories = article._embedded["wp:term"][0].map((cat) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug
        }));
      }
      return {
        id: article.id,
        title,
        excerpt: ((_a = article.excerpt) == null ? void 0 : _a.rendered) || "",
        content: ((_b = article.content) == null ? void 0 : _b.rendered) || "",
        date: article.date,
        slug: article.slug,
        thumbnail,
        categories
      };
    });
    return processedArticles;
  } catch (error) {
    console.error("API articles - Erreur:", error.message);
    throw createError({
      statusCode: 500,
      statusMessage: `Erreur lors de la r\xE9cup\xE9ration des articles: ${error.message}`
    });
  }
});

export { articles as default };
//# sourceMappingURL=articles.mjs.map
