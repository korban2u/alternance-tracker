const mongoose = require('mongoose');

const letterTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  structure: {
    header: {
      type: String,
      default: ''
    },
    introduction: {
      type: String,
      default: ''
    },
    body: {
      type: String,
      default: ''
    },
    conclusion: {
      type: String,
      default: ''
    },
    signature: {
      type: String,
      default: ''
    }
  },
  variables: [{
    key: String,
    description: String
  }],
  isDefault: {
    type: Boolean,
    default: false
  },
  tags: [String],
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
letterTemplateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('LetterTemplate', letterTemplateSchema);