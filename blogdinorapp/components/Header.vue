<template>
  <header class="site-header">
    <div class="container">
      <div class="header-content">
        <div class="logo-wrapper">
          <NuxtLink to="/" class="logo-link">
          <img
            src="/images/logo.jpg"
            :alt="siteName"
            width="40"
            height="40"
            class="logo"
          />
          </NuxtLink>
        </div>
        
        <nav class="site-nav">
          <NuxtLink 
            to="/" 
            class="nav-link" 
            exact-active-class="active"
            @click.native="resetCategoryFilter"
          >
            Tous
          </NuxtLink>
          <NuxtLink 
            to="/category/recette" 
            class="nav-link" 
            active-class="active" 
            @click.native.prevent="filterByCategory('recette')"
          >
            Recettes
          </NuxtLink>
          <NuxtLink 
            to="/category/top-10" 
            class="nav-link" 
            active-class="active"
            @click.native.prevent="filterByCategory('top-10')"
          >
            Top 10
          </NuxtLink>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router';
import useBlog from '../composables/useBlog';

const siteName = 'Dinor App';
const router = useRouter();
const { setActiveCategory, clearCategoryFilter } = useBlog();

const filterByCategory = (slug) => {
  setActiveCategory(slug);
  router.push({ query: { category: slug }});
}

const resetCategoryFilter = () => {
  clearCategoryFilter();
  router.push('/');
}
</script>

<style scoped>
.site-header {
  background: var(--white);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 16px 0;
  width: 100%;
  display: flex;
  justify-content: center;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.logo-wrapper {
  display: flex;
  align-items: center;
}

.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
  gap: 12px;
}

.logo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  font-weight: 800;
  font-size: 1.5rem;
  box-shadow: 0 2px 6px rgba(54, 32, 27, 0.4);
}

.logo-text {
  color: var(--white);
  font-weight: 800;
}

.site-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.site-nav {
  display: flex;
  gap: 24px;
}

.nav-link {
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  color: var(--text-primary);
  position: relative;
  padding: 6px 0;
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: var(--primary);
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  transition: width 0.3s ease;
}

.nav-link:hover::after,
.nav-link.active::after {
  width: 100%;
}

.nav-link.active {
  color: var(--primary);
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
  }
  
  .site-nav {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .site-nav {
    gap: 16px;
  }
  
  .nav-link {
    font-size: 0.9rem;
  }
}
</style>
