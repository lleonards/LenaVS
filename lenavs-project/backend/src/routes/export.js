const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const { protect } = require('../middleware/auth');

// Todas as rotas requerem autenticação
router.use(protect);

// @route   POST /api/export/:projectId
// @desc    Exportar projeto como vídeo
// @access  Private
router.post('/:projectId', exportController.exportVideo);

// @route   GET /api/export/status/:projectId
// @desc    Obter status da exportação
// @access  Private
router.get('/status/:projectId', exportController.getExportStatus);

// @route   GET /api/export/download/:projectId
// @desc    Download do vídeo exportado
// @access  Private
router.get('/download/:projectId', exportController.downloadVideo);

module.exports = router;
