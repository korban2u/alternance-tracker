const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['relance', 'entretien', 'échéance', 'autre'],
    default: 'relance'
  },
  date: {
    type: Date,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['basse', 'normale', 'haute'],
    default: 'normale'
  },
  notificationSent: {
    type: Boolean,
    default: false
  },
  // Références optionnelles aux autres modèles
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  offer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer'
  },
  emailTemplate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailTemplate'
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
reminderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Reminder', reminderSchema);