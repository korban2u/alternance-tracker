const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  technologies: [String],
  duration: {
    type: String,
    required: true,
    trim: true
  },
  salary: {
    type: String,
    trim: true
  },
  interestLevel: {
    type: String,
    enum: ['prioritaire', 'très intéressant', 'intéressant', 'peu intéressant', 'non intéressant'],
    default: 'intéressant'
  },
  dates: {
    publication: {
      type: Date,
      default: Date.now
    },
    deadline: Date
  },
  status: {
    type: String,
    enum: ['active', 'expirée', 'pourvue'],
    default: 'active'
  },
  sourceUrl: {
    type: String,
    trim: true
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

offerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Offer', offerSchema);