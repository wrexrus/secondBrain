const mongoose = require('mongoose');

const websiteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  url: {
    type: String
  },
  imagePath: {
    type: String,
    default: null
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['website', 'image', 'video'],
    default: 'website'
  },
  subCategory: {
    type: String,
    default: '',
    trim: true
  },
  content: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Website', websiteSchema);
