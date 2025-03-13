# Nuxt 3 Blog

Ce projet est un blog construit avec Nuxt 3, alimenté par un backend WordPress. Il utilise des composants Vue pour afficher les articles de blog et gère la navigation entre les différentes pages.

## Structure du projet

- **assets/**: Contient les fichiers statiques tels que les images et les styles CSS.
- **components/**: Comprend des composants Vue réutilisables.
  - **BlogPost.vue**: Composant pour afficher un article de blog.
- **layouts/**: Définit la mise en page par défaut de l'application.
  - **default.vue**: Mise en page principale avec en-tête et pied de page.
- **pages/**: Contient les différentes pages de l'application.
  - **index.vue**: Page d'accueil du blog.
  - **blog/[slug].vue**: Page dynamique pour afficher un article de blog spécifique.
- **plugins/**: Pour les plugins Nuxt et les bibliothèques tierces.
- **static/**: Fichiers statiques servis directement.
- **store/**: Gestion de l'état de l'application avec Vuex (actuellement vide).
- **nuxt.config.ts**: Configuration de l'application Nuxt.
- **package.json**: Dépendances et scripts pour npm.

## Installation

1. Clonez le dépôt:
   ```
   git clone <URL_DU_DEPOT>
   cd nuxt3-blog
   ```

2. Installez les dépendances:
   ```
   npm install
   ```

3. Démarrez le serveur de développement:
   ```
   npm run dev
   ```

## Utilisation

Le blog se connecte à un backend WordPress pour récupérer les articles. Assurez-vous que votre backend est configuré et accessible. Modifiez les fichiers de configuration si nécessaire pour pointer vers votre instance WordPress.

## Contribuer

Les contributions sont les bienvenues! N'hésitez pas à soumettre des demandes de tirage pour des améliorations ou des corrections de bogues.