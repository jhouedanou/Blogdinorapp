// Configuration spécifique pour Netlify
export default {
  // Commande de construction pour Netlify
  build: {
    publish: '.output/public',
    command: 'npm run build'
  },
  
  // Redirection pour le routage côté client
  redirects: [
    {
      from: '/*',
      to: '/index.html',
      status: 200
    }
  ]
}
