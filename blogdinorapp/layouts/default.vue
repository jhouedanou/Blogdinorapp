<template>
  <div class="site-wrapper">
    <slot />
    <footer class="site-footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-logo">
            <NuxtLink to="/" class="logo-link">
              <div class="logo">
                <span class="logo-text">B</span>
              </div>
              <span class="site-name">Blog Dinor</span>
            </NuxtLink>
          </div>
          <div class="footer-nav">
            <NuxtLink to="/" class="footer-link">Accueil</NuxtLink>
            <NuxtLink to="/category/recette" class="footer-link">Recettes</NuxtLink>
            <NuxtLink to="/category/top-10" class="footer-link">Top 10</NuxtLink>
          </div>
          <div class="footer-copyright">
            &copy; {{ new Date().getFullYear() }} Blog Dinor. Tous droits réservés.
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
/* Styles globaux */
body {
  margin: 0;
  padding: 0;
  font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: var(--background);
  color: var(--text-primary);
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.site-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Styles du pied de page */
.site-footer {
  background-color: var(--bistre);
  color: var(--white);
  padding: 40px 0;
  margin-top: auto;
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.footer-logo {
  display: flex;
  align-items: center;
}

.footer-logo .logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--white);
  gap: 12px;
}

.footer-logo .logo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--lion);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  font-weight: 800;
  font-size: 1.5rem;
}

.footer-logo .site-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--white);
}

.footer-nav {
  display: flex;
  gap: 20px;
  margin: 15px 0;
}

.footer-link {
  color: var(--champagne-pink);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: var(--white);
  text-decoration: underline;
}

.footer-copyright {
  color: var(--champagne-pink);
  font-size: 0.8rem;
  text-align: center;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .footer-content {
    text-align: center;
  }
}
</style>
