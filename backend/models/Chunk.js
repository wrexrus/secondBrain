const mongoose = require('mongoose');

const chunkSchema = new mongoose.Schema({
  // Who owns this chunk — used to scope ALL vector queries to a single user
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Which Website document this chunk came from
  websiteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website',
    required: true,
    index: true
  },

  // Position of this chunk within the parent item (0, 1, 2 ...)
  chunkIndex: {
    type: Number,
    required: true
  },

  // The raw text of this chunk — stored so we can show it as context in Phase 4
  text: {
    type: String,
    required: true
  },

  // The vector embedding from Gemini's text-embedding model
  // Stored as a plain array of floats — Atlas Vector Search reads this field
  embedding: {
    type: [Number],
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Chunk', chunkSchema);
