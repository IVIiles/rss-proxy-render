// server.js
const express = require('express');
const RssParser = require('rss-parser');
const cors = require('cors');

const app = express();
const parser = new RssParser();

// Autoriser CORS (utile pour les requêtes depuis ton frontend)
app.use(cors());

// Route principale pour récupérer un flux RSS
app.get('/rss', async (req, res) => {
    const rssUrl = req.query.url;

    if (!rssUrl) {
        return res.status(400).json({ error: 'URL du flux RSS manquante (paramètre ?url=...)' });
    }

    // Nettoyer l'URL (supprimer les espaces éventuels)
    const cleanUrl = decodeURIComponent(rssUrl.trim());

    try {
        const feed = await parser.parseURL(cleanUrl);
        const items = feed.items?.map(item => ({
            title: item.title || 'Sans titre',
            link: item.link || '#',
            description: item.description || item.contentSnippet || ''
        })) || [];

        res.json({
            title: feed.title || 'Flux RSS',
            items
        });
    } catch (error) {
        console.error(`Erreur lors du parsing de ${cleanUrl}:`, error.message);
        res.status(500).json({
            error: 'Impossible de charger ou parser le flux RSS',
            details: error.message
        });
    }
});

// Route racine (optionnelle, pour vérifier que le serveur tourne)
app.get('/', (req, res) => {
    res.json({ message: 'RSS Proxy fonctionnel. Utilisez /rss?url=VOTRE_FLUX_RSS' });
});

// Port dynamique fourni par Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Serveur RSS Proxy démarré sur le port ${PORT}`);
});