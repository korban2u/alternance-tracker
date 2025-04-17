const { google } = require('googleapis');
const GmailAuth = require('../models/GmailAuth');
const Application = require('../models/Application');
const Company = require('../models/Company');
const EmailTemplate = require('../models/EmailTemplate');

// Valeurs hardcodées pour le test
const CLIENT_ID = '873225104151-u2gjd91tfas6e8c9pskas9j728elc5ja.apps.googleusercontent.com';
const CLIENT_SECRET = 'GOCSPX-your-client-secret-here'; // Remplacez par votre client secret
const REDIRECT_URI = 'http://localhost:5000/api/gmail/auth/callback';

console.log('Utilisation des credentials hardcodés:');
console.log('CLIENT_ID:', CLIENT_ID);
console.log('REDIRECT_URI:', REDIRECT_URI);

// Configuration OAuth2 avec les valeurs hardcodées
const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

// Portée des autorisations demandées
const SCOPES = [
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/userinfo.email'
];

// @desc    Obtenir l'URL d'authentification Google
// @route   GET /api/gmail/auth/url
// @access  Private
exports.getAuthUrl = async (req, res) => {
    try {
        console.log('Generating auth URL with hardcoded client ID');

        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
            prompt: 'consent' // Force à obtenir un refresh token
        });

        console.log('Generated auth URL:', authUrl);

        res.status(200).json({
            success: true,
            data: { authUrl }
        });
    } catch (error) {
        console.error('Error generating auth URL:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Gérer le callback d'authentification Google
// @route   GET /api/gmail/auth/callback
// @access  Private
exports.handleAuthCallback = async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).json({
            success: false,
            message: 'Code d\'autorisation manquant'
        });
    }

    try {
        console.log('Received auth code, exchanging for tokens');
        // Échanger le code contre des tokens
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Obtenir l'email de l'utilisateur
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
        const profile = await gmail.users.getProfile({ userId: 'me' });
        const email = profile.data.emailAddress;

        console.log('Authenticated with email:', email);

        // Enregistrer ou mettre à jour les tokens dans la base de données
        let gmailAuth = await GmailAuth.findOne({ user: req.user._id });

        if (gmailAuth) {
            gmailAuth.email = email;
            gmailAuth.accessToken = tokens.access_token;
            if (tokens.refresh_token) {
                gmailAuth.refreshToken = tokens.refresh_token;
            }
            gmailAuth.expiryDate = new Date(tokens.expiry_date);
            await gmailAuth.save();
        } else {
            await GmailAuth.create({
                user: req.user._id,
                email,
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiryDate: new Date(tokens.expiry_date)
            });
        }

        res.status(200).json({
            success: true,
            data: { email }
        });
    } catch (error) {
        console.error('Error in auth callback:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Vérifier le statut d'authentification Gmail
// @route   GET /api/gmail/auth/status
// @access  Private
exports.checkAuthStatus = async (req, res) => {
    try {
        const gmailAuth = await GmailAuth.findOne({ user: req.user._id });

        if (!gmailAuth) {
            return res.status(200).json({
                success: true,
                data: {
                    isConnected: false
                }
            });
        }

        // Vérifier si les tokens sont expirés
        const isExpired = new Date() > new Date(gmailAuth.expiryDate);

        if (isExpired) {
            // Configurer le client OAuth2 avec le refresh token
            oauth2Client.setCredentials({
                refresh_token: gmailAuth.refreshToken
            });

            // Rafraîchir le token
            try {
                const { tokens } = await oauth2Client.refreshToken(gmailAuth.refreshToken);

                // Mettre à jour les informations d'authentification
                gmailAuth.accessToken = tokens.access_token;
                if (tokens.refresh_token) {
                    gmailAuth.refreshToken = tokens.refresh_token;
                }
                gmailAuth.expiryDate = new Date(tokens.expiry_date);
                await gmailAuth.save();
            } catch (error) {
                // En cas d'erreur lors du rafraîchissement, considérer l'utilisateur comme déconnecté
                return res.status(200).json({
                    success: true,
                    data: {
                        isConnected: false
                    }
                });
            }
        }

        res.status(200).json({
            success: true,
            data: {
                isConnected: true,
                email: gmailAuth.email
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Déconnecter Gmail
// @route   DELETE /api/gmail/auth
// @access  Private
exports.disconnectGmail = async (req, res) => {
    try {
        await GmailAuth.findOneAndDelete({ user: req.user._id });

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Fonction utilitaire pour encoder en base64url
const encodeBase64Url = (str) => {
    return Buffer.from(str)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
};

// Fonction utilitaire pour créer le message RFC 2822
const createRFC2822Message = (options) => {
    const { from, to, cc, bcc, subject, body, isHtml } = options;

    let message = [
        `From: ${from}`,
        `To: ${to}`,
    ];

    if (cc) message.push(`Cc: ${cc}`);
    if (bcc) message.push(`Bcc: ${bcc}`);

    message.push(
        `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
        'MIME-Version: 1.0',
        `Content-Type: ${isHtml ? 'text/html' : 'text/plain'}; charset=UTF-8`,
        'Content-Transfer-Encoding: 8bit',
        '',
        body
    );

    return message.join('\r\n');
};

// @desc    Envoyer un email via Gmail
// @route   POST /api/gmail/send
// @access  Private
exports.sendEmail = async (req, res) => {
    const { to, cc, bcc, subject, body, isHtml, applicationId } = req.body;

    if (!to || !subject || !body) {
        return res.status(400).json({
            success: false,
            message: 'Destinataire, sujet et contenu sont requis'
        });
    }

    try {
        // Récupérer les informations d'authentification Gmail
        const gmailAuth = await GmailAuth.findOne({ user: req.user._id });

        if (!gmailAuth) {
            return res.status(401).json({
                success: false,
                message: 'Authentification Gmail non trouvée. Veuillez vous connecter à Gmail.'
            });
        }

        // Configurer le client OAuth2
        oauth2Client.setCredentials({
            access_token: gmailAuth.accessToken,
            refresh_token: gmailAuth.refreshToken
        });

        // Créer le client Gmail
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

        // Créer le message au format RFC 2822
        const raw = createRFC2822Message({
            from: gmailAuth.email,
            to,
            cc,
            bcc,
            subject,
            body,
            isHtml
        });

        // Encoder le message en base64url
        const encodedMessage = encodeBase64Url(raw);

        // Envoyer l'email
        const response = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage
            }
        });

        // Si un ID d'application est fourni, ajouter une entrée dans la timeline
        if (applicationId) {
            await Application.findByIdAndUpdate(
                applicationId,
                {
                    $push: {
                        timeline: {
                            date: new Date(),
                            action: `Email envoyé: ${subject}`,
                            notes: `Email envoyé à ${to}`
                        }
                    }
                }
            );
        }

        res.status(200).json({
            success: true,
            data: {
                messageId: response.data.id
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Enregistrer un brouillon d'email via Gmail
// @route   POST /api/gmail/draft
// @access  Private
exports.saveDraft = async (req, res) => {
    const { to, cc, bcc, subject, body, isHtml, applicationId } = req.body;

    if (!subject || !body) {
        return res.status(400).json({
            success: false,
            message: 'Sujet et contenu sont requis'
        });
    }

    try {
        // Récupérer les informations d'authentification Gmail
        const gmailAuth = await GmailAuth.findOne({ user: req.user._id });

        if (!gmailAuth) {
            return res.status(401).json({
                success: false,
                message: 'Authentification Gmail non trouvée. Veuillez vous connecter à Gmail.'
            });
        }

        // Configurer le client OAuth2
        oauth2Client.setCredentials({
            access_token: gmailAuth.accessToken,
            refresh_token: gmailAuth.refreshToken
        });

        // Créer le client Gmail
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

        // Créer le message au format RFC 2822
        const raw = createRFC2822Message({
            from: gmailAuth.email,
            to: to || '',
            cc: cc || '',
            bcc: bcc || '',
            subject,
            body,
            isHtml
        });

        // Encoder le message en base64url
        const encodedMessage = encodeBase64Url(raw);

        // Enregistrer le brouillon
        const response = await gmail.users.drafts.create({
            userId: 'me',
            requestBody: {
                message: {
                    raw: encodedMessage
                }
            }
        });

        // Si un ID d'application est fourni, ajouter une entrée dans la timeline
        if (applicationId) {
            await Application.findByIdAndUpdate(
                applicationId,
                {
                    $push: {
                        timeline: {
                            date: new Date(),
                            action: `Brouillon d'email créé: ${subject}`,
                            notes: `Brouillon enregistré sur Gmail`
                        }
                    }
                }
            );
        }

        res.status(200).json({
            success: true,
            data: {
                draftId: response.data.id
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};