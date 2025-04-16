# AltTracker - Système de suivi de candidatures

AltTracker est une application web complète pour faciliter le suivi de vos candidatures, avec des outils d'analyse et de statistiques pour optimiser votre recherche.

## Fonctionnalités

### Itération 1 : Base fonctionnelle
- Gestion complète des entreprises (création, modification, suppression)
- Gestion des offres d'alternance avec catégorisation et prioritisation
- Suivi des candidatures avec gestion des statuts et historique d'interactions
- Tableau de bord avec vue d'ensemble et recherche

### Itération 2 : Statistiques et analyses
- Graphique d'évolution des candidatures dans le temps
- Taux de conversion par étape du processus
- Répartition des candidatures par secteur
- Analyse des délais de réponse moyens
- Indicateurs de performance (taux de réussite)
- Visualisations des candidatures par statut
- Analyse des compétences les plus recherchées

## Installation

### Prérequis
- Node.js (v14+)
- MongoDB (v4+)

### Installation

1. Cloner le dépôt
```bash
git clone https://github.com/votre-nom/alternance-tracker.git
cd alternance-tracker
```

2. Installer les dépendances
```bash
# Installation des dépendances du serveur
cd server
npm install

# Installation des dépendances du client
cd ../client
npm install

# Installer toutes les dépendances (client + serveur):
npm run install-all
```

3. Configuration
- Créer un fichier `.env` dans le dossier `server` avec le contenu suivant :
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/alternance-tracker
JWT_SECRET=votre_secret_jwt_sécurisé
NODE_ENV=development
```

- Créer un fichier `.env` dans le dossier `client` avec le contenu suivant :
```
REACT_APP_API_URL=http://localhost:5000/api
```

4. Démarrer l'application
```bash
# Démarrer le serveur (dans le dossier server)
npm run dev

# Démarrer le client (dans le dossier client)
npm start

# Démarrer l'application complète à la racine (client + serveur) 
npm start
```

5. Accéder à l'application
   Ouvrez votre navigateur et accédez à `http://localhost:3000`

## Technologies utilisées

### Frontend
- React
- Tailwind CSS
- Recharts (visualisations)
- Formik & Yup (validation de formulaires)
- React Router (navigation)
- Axios (requêtes HTTP)

### Backend
- Node.js
- Express
- MongoDB avec Mongoose
- JWT pour l'authentification

## Structure du projet
```
alternance-tracker/
├── client/                      # Frontend React
│   ├── public/
│   ├── src/
│   │   ├── assets/              # Images, icônes, etc.
│   │   ├── components/          # Composants réutilisables
│   │   ├── context/             # Context API
│   │   ├── pages/               # Pages de l'application
│   │   ├── services/            # Services d'API et utilitaires
│   │   └── ...
│   └── ...
│
├── server/                      # Backend Node.js/Express
│   ├── controllers/             # Contrôleurs pour chaque entité
│   ├── models/                  # Modèles MongoDB
│   ├── routes/                  # Routes API
│   ├── middleware/              # Middleware
│   └── ...
│
└── ...
```

## Auteur
Ryan Korban - Étudiant en BUT Informatique