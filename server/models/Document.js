const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['cv', 'lettre_de_motivation', 'portfolio', 'autre'],
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  version: {
    type: String,
    required: true
  },
  versionNote: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String],
  // Références aux entités associées
  applications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  }],
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware pour mettre à jour la date de modification
documentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Méthode pour obtenir toutes les versions d'un document
documentSchema.statics.getVersions = async function(name, type, userId) {
  return this.find({
    name: name,
    type: type,
    user: userId
  }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Document', documentSchema);