const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Routes
const companyRoutes = require('./routes/companyRoutes');
const offerRoutes = require('./routes/offerRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const userRoutes = require('./routes/userRoutes');

const emailTemplateRoutes = require('./routes/emailTemplateRoutes');
const letterTemplateRoutes = require('./routes/letterTemplateRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const documentRoutes = require('./routes/documentRoutes');
const importRoutes = require('./routes/importRoutes');

// Configuration
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Créer le répertoire d'uploads s'il n'existe pas
const uploadsDir = path.join(__dirname, 'uploads');
const tempDir = path.join(__dirname, 'uploads/temp');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Base de données
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connexion à MongoDB établie avec succès'))
.catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Routes API
app.use('/api/companies', companyRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes);

app.use('/api/email-templates', emailTemplateRoutes);
app.use('/api/letter-templates', letterTemplateRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/import', importRoutes);

// Servir les uploads de manière statique
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Servir les fichiers statiques en production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}


// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Une erreur est survenue sur le serveur'
  });
});

// Démarrage du serveur
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));