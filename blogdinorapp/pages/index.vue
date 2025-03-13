<template>
  <div class="container">
    <h1 class="title">Le Blog de Dinor</h1>
    
    <div v-if="loading" class="loading">
      Chargement des articles...
    </div>
    
    <div v-else class="posts-grid">
      <div v-for="post in posts" :key="post.id" class="post-card" @click="goToPost(post.slug)">
        <div class="post-image">
          <!-- Utiliser la propriété thumbnail qui vient de featured_image -->
          <img v-if="post.thumbnail" :src="post.thumbnail" :alt="post.title">
          <div v-else class="no-image">Pas d'image</div>
        </div>
        <div class="post-content">
          <h2 v-html="post.title"></h2>
          <div class="post-excerpt" v-html="post.excerpt"></div>
          <div class="post-date">{{ formatDate(post.date) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import useBlog from '../composables/useBlog';

const { posts, loading, fetchPosts, getPostImageBySize } = useBlog();

onMounted(async () => {
  await fetchPosts();
});

const goToPost = (slug) => {
  navigateTo(`/post/${slug}`);
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.title {
  margin-bottom: 30px;
  text-align: center;
}

.loading {
  text-align: center;
  font-size: 18px;
  margin: 50px 0;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
}

.post-card {
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
  cursor: pointer;
}

.post-card:hover {
  transform: translateY(-5px);
}

.post-image {
  height: 200px;
  overflow: hidden;
}

.post-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
}

.post-content {
  padding: 20px;
}

.post-content h2 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1.2rem;
}

.post-excerpt {
  margin-bottom: 15px;
  font-size: 0.9rem;
  color: #555;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  line-clamp: 3;
}

.post-date {
  font-size: 0.8rem;
  color: #888;
}
</style>
