const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const projectController = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

// Todas as rotas requerem autenticação
router.use(protect);

// @route   GET /api/projects
// @desc    Listar todos os projetos do usuário
// @access  Private
router.get('/', projectController.getProjects);

// @route   GET /api/projects/recent
// @desc    Obter projetos recentes
// @access  Private
router.get('/recent', projectController.getRecentProjects);

// @route   GET /api/projects/:id
// @desc    Obter projeto por ID
// @access  Private
router.get('/:id', projectController.getProject);

// @route   POST /api/projects
// @desc    Criar novo projeto
// @access  Private
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Nome do projeto é obrigatório')
  ],
  projectController.createProject
);

// @route   PUT /api/projects/:id
// @desc    Atualizar projeto
// @access  Private
router.put('/:id', projectController.updateProject);

// @route   DELETE /api/projects/:id
// @desc    Deletar projeto
// @access  Private
router.delete('/:id', projectController.deleteProject);

// @route   PUT /api/projects/:id/verses
// @desc    Atualizar estrofes do projeto
// @access  Private
router.put('/:id/verses', projectController.updateVerses);

// @route   PUT /api/projects/:id/style
// @desc    Atualizar estilo global
// @access  Private
router.put('/:id/style', projectController.updateGlobalStyle);

// @route   PUT /api/projects/:id/visibility
// @desc    Alterar visibilidade do projeto
// @access  Private
router.put('/:id/visibility', projectController.updateVisibility);

module.exports = router;
