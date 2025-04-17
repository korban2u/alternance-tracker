const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  offer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer'
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  type: {
    type: String,
    enum: ['offre', 'spontanée'],
    required: true
  },
  status: {
    type: String,
    enum: ['à envoyer', 'envoyée', 'relance effectuée', 'entretien planifié', 'en attente de réponse', 'acceptée', 'refusée'],
    default: 'à envoyer'
  },
  documents: {
    cv: {
      version: String,
      sent: Boolean,
      fileName: String
    },
    coverLetter: {
      version: String,
      sent: Boolean,
      fileName: String
    },
    other: [{
      name: String,
      sent: Boolean,
      fileName: String
    }]
  },
  timeline: [{
    date: {
      type: Date,
      default: Date.now
    },
    action: {
      type: String,
      required: true
    },
    notes: String
  }],
  nextAction: {
    type: String,
    trim: true
  },
  nextActionDate: Date,
  notes: String,
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

applicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Application', applicationSchema);