const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  sector: {
    type: String,
    required: true,
    trim: true
  },
  contacts: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    role: {
      type: String,
      trim: true
    }
  }],
  address: {
    street: String,
    city: String,
    postalCode: String,
    country: {
      type: String,
      default: 'France'
    }
  },
  website: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

companySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Company', companySchema);