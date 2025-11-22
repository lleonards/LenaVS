const mongoose = require('mongoose');

const VerseStyleSchema = new mongoose.Schema({
  font: { type: String, default: 'Montserrat' },
  fontSize: { type: Number, default: 48 },
  textColor: { type: String, default: '#FFFFFF' },
  outlineColor: { type: String, default: '#000000' },
  bold: { type: Boolean, default: false },
  italic: { type: Boolean, default: false },
  underline: { type: Boolean, default: false },
  alignment: { type: String, enum: ['left', 'center', 'right'], default: 'center' }
});

const VerseSchema = new mongoose.Schema({
  text: { type: String, required: true },
  startTime: { type: String, required: true }, // formato mm:ss
  endTime: { type: String, required: true },   // formato mm:ss
  style: { type: VerseStyleSchema, required: true },
  order: { type: Number, required: true }
});

const GlobalStyleSchema = new mongoose.Schema({
  font: { type: String, default: 'Montserrat' },
  fontSize: { type: Number, default: 48 },
  textColor: { type: String, default: '#FFFFFF' },
  outlineColor: { type: String, default: '#000000' },
  bold: { type: Boolean, default: false },
  italic: { type: Boolean, default: false },
  underline: { type: Boolean, default: false },
  alignment: { type: String, enum: ['left', 'center', 'right'], default: 'center' },
  transition: { type: String, enum: ['fade', 'slide', 'none'], default: 'fade' }
});

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalMusic: {
    filename: String,
    path: String,
    duration: Number,
    mimetype: String
  },
  playbackInstrumental: {
    filename: String,
    path: String,
    duration: Number,
    mimetype: String
  },
  background: {
    filename: String,
    path: String,
    type: { type: String, enum: ['image', 'video'] },
    duration: Number,
    mimetype: String
  },
  lyrics: {
    text: String,
    verses: [VerseSchema]
  },
  globalStyle: {
    type: GlobalStyleSchema,
    default: () => ({})
  },
  exportSettings: {
    format: { type: String, enum: ['mp4', 'mov', 'avi'], default: 'mp4' },
    resolution: { type: String, default: '1920x1080' },
    fps: { type: Number, default: 30 }
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  exportedVideo: {
    filename: String,
    path: String,
    size: Number
  },
  status: {
    type: String,
    enum: ['draft', 'processing', 'completed', 'error'],
    default: 'draft'
  }
}, {
  timestamps: true
});

// Índices
ProjectSchema.index({ user: 1, createdAt: -1 });
ProjectSchema.index({ name: 'text' });

module.exports = mongoose.model('Project', ProjectSchema);
