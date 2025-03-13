<template>
  <div class="blog-post">
    <h1>{{ title }}</h1>
    <div v-html="content"></div>
    <div class="meta">
      <p>Published on: {{ publishedDate }}</p>
      <p>Author: {{ author }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'BlogPost',
  props: {
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    publishedDate: {
      type: String,
      required: true
    },
    author: {
      type: String,
      required: true
    }
  }
});
</script>

<style scoped>
.blog-post {
  margin: 20px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f9f9f9;
}
.meta {
  font-size: 0.9em;
  color: #666;
}
</style>