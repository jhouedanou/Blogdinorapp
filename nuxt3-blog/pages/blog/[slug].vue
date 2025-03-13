<template>
  <div>
    <BlogPost v-if="post" :title="post.title.rendered" :content="post.content.rendered" />
    <div v-else>Loading...</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import BlogPost from '@/components/BlogPost.vue';

const route = useRoute();
const post = ref(null);
const slug = route.params.slug;

onMounted(async () => {
  const response = await fetch(`https://your-wordpress-site.com/wp-json/wp/v2/posts?slug=${slug}`);
  const data = await response.json();
  post.value = data[0]; // Assuming the first post matches the slug
});
</script>

<style scoped>
/* Add any specific styles for the blog post page here */
</style>