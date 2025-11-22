const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Registrar novo usuário
// @access  Public
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
    body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres')
  ],
  authController.register
);

// @route   POST /api/auth/login
// @desc    Login de usuário
// @access  Public
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('Senha é obrigatória')
  ],
  authController.login
);

// @route   GET /api/auth/me
// @desc    Obter usuário atual
// @access  Private
router.get('/me', protect, authController.getMe);

// @route   PUT /api/auth/update
// @desc    Atualizar informações do usuário
// @access  Private
router.put('/update', protect, authController.updateUser);

// @route   PUT /api/auth/password
// @desc    Atualizar senha
// @access  Private
router.put(
  '/password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Senha atual é obrigatória'),
    body('newPassword').isLength({ min: 6 }).withMessage('Nova senha deve ter no mínimo 6 caracteres')
  ],
  authController.updatePassword
);

module.exports = router;
