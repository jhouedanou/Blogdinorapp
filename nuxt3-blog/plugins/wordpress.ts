export default defineNuxtPlugin(() => {
  const config = {
    baseURL: 'https://votre-site-wordpress.com/wp-json/wp/v2',
    endpoints: {
      posts: '/posts',
      pages: '/pages',
      categories: '/categories',
      tags: '/tags'
    }
  }

  return {
    provide: {
      wordpress: {
        async getPosts(params = {}) {
          return await $fetch(config.baseURL + config.endpoints.posts, { params })
        },
        async getPost(slug: string) {
          return await $fetch(`${config.baseURL}${config.endpoints.posts}?slug=${slug}`)
        }
      }
    }
  }
})