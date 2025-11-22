const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const { uploadProjectFiles, uploadSingle } = require('../middleware/upload');

// Todas as rotas requerem autenticação
router.use(protect);

// @route   POST /api/upload/project-files
// @desc    Upload de múltiplos arquivos do projeto
// @access  Private
router.post('/project-files', uploadProjectFiles, uploadController.uploadProjectFiles);

// @route   POST /api/upload/audio
// @desc    Upload de arquivo de áudio
// @access  Private
router.post('/audio', uploadSingle('audio'), uploadController.uploadAudio);

// @route   POST /api/upload/video
// @desc    Upload de vídeo de background
// @access  Private
router.post('/video', uploadSingle('video'), uploadController.uploadVideo);

// @route   POST /api/upload/image
// @desc    Upload de imagem de background
// @access  Private
router.post('/image', uploadSingle('image'), uploadController.uploadImage);

// @route   POST /api/upload/lyrics
// @desc    Upload de arquivo de letra
// @access  Private
router.post('/lyrics', uploadSingle('lyrics'), uploadController.uploadLyrics);

// @route   DELETE /api/upload/:filename
// @desc    Deletar arquivo
// @access  Private
router.delete('/:filename', uploadController.deleteFile);

module.exports = router;
