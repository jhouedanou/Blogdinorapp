<template>
  <div class="container">
    <div v-if="loading" class="loading">
      Chargement de l'article...
    </div>
    
    <div v-else-if="post" class="post-detail">
      <div class="featured-image" v-if="getPostImage(post)">
        <img :src="getPostImage(post)" :alt="post.title.rendered">
      </div>
      
      <h1 class="post-title" v-html="post.title.rendered"></h1>
      
      <div class="post-meta">
        <span class="post-date">{{ formatDate(post.date) }}</span>
      </div>
      
      <div class="post-content" v-html="post.content.rendered"></div>
      
      <div class="back-link">
        <a @click.prevent="goBack" href="#">Retour à la liste des articles</a>
      </div>
    </div>
    
    <div v-else class="not-found">
      Article non trouvé
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import useBlog from '../../composables/useBlog';

const route = useRoute();
const { post, loading, fetchPostBySlug } = useBlog();

onMounted(async () => {
  const slug = route.params.slug;
  await fetchPostBySlug(slug);
});

const goBack = () => {
  navigateTo('/');
};

const getPostImage = (post) => {
  // Essayer de trouver l'image mise en avant
  if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]) {
    return post._embedded['wp:featuredmedia'][0].source_url;
  }
  
  // Essayer d'extraire la première image du contenu
  const regex = /<img[^>]+src="([^">]+)"/;
  const match = post.content.rendered.match(regex);
  return match ? match[1] : null;
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};
</script>

<style scoped>
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.loading, .not-found {
  text-align: center;
  font-size: 18px;
  margin: 50px 0;
}

.post-detail {
  margin-top: 20px;
}

.featured-image {
  margin-bottom: 20px;
  border-radius: 10px;
  overflow: hidden;
  max-height: 400px;
}

.featured-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-title {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.post-meta {
  color: #666;
  margin-bottom: 30px;
  font-size: 0.9rem;
}

.post-content {
  line-height: 1.7;
  font-size: 1.1rem;
}

.post-content img {
  max-width: 100%;
  height: auto;
}

.back-link {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.back-link a {
  color: #007bff;
  text-decoration: none;
  cursor: pointer;
}

.back-link a:hover {
  text-decoration: underline;
}
</style>
