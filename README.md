# Blog Dinor App

Application de blog moderne construite avec Nuxt 3, qui récupère et affiche des articles depuis une API WordPress.

## Fonctionnalités

- ✅ Affichage des articles de blog avec pagination (6 articles par page)
- ✅ Mise en cache des articles pour des performances optimales (localStorage + mémoire)
- ✅ Détails des articles avec images et formatage du contenu
- ✅ Design moderne avec animations et transitions
- ✅ Interface responsive
- ✅ Système de rafraîchissement manuel du cache

## Prérequis

- Node.js (v14 ou supérieur)
- NPM ou Yarn

## Installation

```bash
# Cloner le dépôt
git clone https://github.com/jhouedanou/Blogdinorapp.git
cd Blogdinorapp

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

## Construction pour la production

```bash
# Construire l'application pour la production
npm run build

# Prévisualiser la version de production
npm run preview
```

## Déploiement sur Netlify

Cette application est préconfigurée pour un déploiement facile sur Netlify.

### Option 1 : Déploiement automatique via GitHub

1. Connectez-vous à votre compte Netlify
2. Cliquez sur "New site from Git"
3. Sélectionnez GitHub et choisissez votre dépôt
4. Laissez les paramètres par défaut (ils sont déjà configurés dans le fichier `netlify.toml`)
5. Cliquez sur "Deploy site"

### Option 2 : Déploiement manuel

```bash
# Installer l'interface en ligne de commande Netlify
npm install netlify-cli -g

# Construire le projet
npm run build

# Déployer sur Netlify
netlify deploy --prod
```

## Structure du projet

- `pages/` : Pages de l'application (index, détail d'article)
- `composables/` : Logique réutilisable (gestion du blog, cache)
- `server/api/` : Points d'entrée API (récupération des articles)
- `public/` : Fichiers statiques

## Configuration du cache

Le système de cache est configuré pour conserver les articles pendant 30 minutes. Vous pouvez modifier cette durée en ajustant la valeur de `CACHE_EXPIRY_TIME` dans le fichier `composables/useBlog.js`.

## Source des données

Les articles sont récupérés depuis l'API WordPress à l'adresse `https://bigfive.dev/blogdinor/wp-json/wp/v2/posts?_embed`.

## Licence

MIT
