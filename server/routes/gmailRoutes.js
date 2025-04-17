const express = require('express');
const {
    getAuthUrl,
    handleAuthCallback,
    sendEmail,
    saveDraft,
    checkAuthStatus,
    disconnectGmail
} = require('../controllers/gmailController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Route de callback publique (pas de middleware protect)
router.get('/auth/callback', handleAuthCallback);

// Protection du reste des routes
router.use(protect);

// Routes d'authentification
router.get('/auth/url', getAuthUrl);
router.get('/auth/status', checkAuthStatus);
router.delete('/auth', disconnectGmail);

// Routes d'envoi d'emails
router.post('/send', sendEmail);
router.post('/draft', saveDraft);

module.exports = router;