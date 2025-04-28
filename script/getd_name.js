import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();

// Chemins des répertoires (à adapter selon vos répertoires locaux)
const aiMethodDir = path.join(process.cwd(), 'AI_method');
const dataDir = path.join(process.cwd(), 'Data');

// Fonction pour lister les dossiers dans un répertoire
function listDirectories(dirPath) {
    return fs.readdirSync(dirPath).filter(item => {
        return fs.statSync(path.join(dirPath, item)).isDirectory();
    });
}

// Route pour lister les méthodes dans /AI_method
app.get('/api/ai-methods', (req, res) => {
    const methods = listDirectories(aiMethodDir);
    res.json(methods);
});

// Route pour lister les datasets dans /Data
app.get('/api/datasets', (req, res) => {
    const datasets = listDirectories(dataDir);
    res.json(datasets);
});

// Démarrer le serveur
const port = 3000;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
