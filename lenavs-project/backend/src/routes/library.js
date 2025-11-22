const express = require('express');
const router = express.Router();
const libraryController = require('../controllers/libraryController');
const { protect } = require('../middleware/auth');

// Todas as rotas requerem autenticação
router.use(protect);

// @route   GET /api/library
// @desc    Listar todos os itens da biblioteca
// @access  Private
router.get('/', libraryController.getLibraryItems);

// @route   GET /api/library/:type
// @desc    Listar itens por tipo
// @access  Private
router.get('/type/:type', libraryController.getLibraryItemsByType);

// @route   GET /api/library/item/:id
// @desc    Obter item específico
// @access  Private
router.get('/item/:id', libraryController.getLibraryItem);

// @route   POST /api/library
// @desc    Adicionar item à biblioteca
// @access  Private
router.post('/', libraryController.createLibraryItem);

// @route   PUT /api/library/:id
// @desc    Atualizar item da biblioteca
// @access  Private
router.put('/:id', libraryController.updateLibraryItem);

// @route   DELETE /api/library/:id
// @desc    Remover item da biblioteca
// @access  Private
router.delete('/:id', libraryController.deleteLibraryItem);

// @route   GET /api/library/community/public
// @desc    Obter recursos públicos da comunidade
// @access  Private
router.get('/community/public', libraryController.getCommunityResources);

module.exports = router;
