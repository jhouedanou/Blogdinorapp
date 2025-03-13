<template>
  <div>
    <header>
      <h1>Mon Blog</h1>
      <nav>
        <ul>
          <li><nuxt-link to="/">Accueil</nuxt-link></li>
          <li><nuxt-link to="/blog">Blog</nuxt-link></li>
        </ul>
      </nav>
    </header>
    <main>
      <nuxt />
    </main>
    <footer>
      <p>&copy; 2023 Mon Blog. Tous droits réservés.</p>
    </footer>
  </div>
</template>

<script setup>
// Ce fichier est la mise en page par défaut de l'application.
</script>

<style scoped>
header {
  background-color: #f8f9fa;
  padding: 1rem;
}

nav ul {
  list-style-type: none;
  padding: 0;
}

nav ul li {
  display: inline;
  margin-right: 1rem;
}

footer {
  text-align: center;
  padding: 1rem;
  background-color: #f8f9fa;
}
</style>