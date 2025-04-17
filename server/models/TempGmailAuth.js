const mongoose = require('mongoose');

const tempGmailAuthSchema = new mongoose.Schema({
    sessionId: String,
    email: String,
    accessToken: String,
    refreshToken: String,
    expiryDate: Date,
    createdAt: { type: Date, default: Date.now, expires: 3600 } // expire après 1 heure
});

module.exports = mongoose.model('TempGmailAuth', tempGmailAuthSchema);