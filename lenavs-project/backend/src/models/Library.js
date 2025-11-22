const mongoose = require('mongoose');

const LibraryItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['audio', 'video', 'image', 'style'],
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  file: {
    filename: String,
    path: String,
    mimetype: String,
    size: Number,
    duration: Number // Para áudio e vídeo
  },
  style: {
    font: String,
    fontSize: Number,
    textColor: String,
    outlineColor: String,
    bold: Boolean,
    italic: Boolean,
    underline: Boolean,
    alignment: String,
    transition: String
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  usageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Índices
LibraryItemSchema.index({ user: 1, type: 1 });
LibraryItemSchema.index({ isPublic: 1 });
LibraryItemSchema.index({ tags: 1 });

module.exports = mongoose.model('LibraryItem', LibraryItemSchema);
