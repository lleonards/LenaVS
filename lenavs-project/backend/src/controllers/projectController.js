const { validationResult } = require('express-validator');
const Project = require('../models/Project');

// @desc    Obter todos os projetos do usuário
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    const query = { user: req.user.id };

    // Busca por nome
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const projects = await Project.find(query)
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Project.countDocuments(query);

    res.json({
      success: true,
      projects,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obter projetos recentes
// @route   GET /api/projects/recent
// @access  Private
exports.getRecentProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ user: req.user.id })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('name updatedAt status')
      .lean();

    res.json({
      success: true,
      projects
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obter projeto por ID
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    // Verificar se o usuário é o dono do projeto
    if (project.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para acessar este projeto'
      });
    }

    res.json({
      success: true,
      project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Criar novo projeto
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res, next) => {
  try {
    // Validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const projectData = {
      ...req.body,
      user: req.user.id
    };

    const project = await Project.create(projectData);

    res.status(201).json({
      success: true,
      project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Atualizar projeto
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    // Verificar se o usuário é o dono do projeto
    if (project.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para atualizar este projeto'
      });
    }

    project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deletar projeto
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    // Verificar se o usuário é o dono do projeto
    if (project.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para deletar este projeto'
      });
    }

    await project.deleteOne();

    res.json({
      success: true,
      message: 'Projeto deletado com sucesso'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Atualizar estrofes do projeto
// @route   PUT /api/projects/:id/verses
// @access  Private
exports.updateVerses = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    // Verificar se o usuário é o dono do projeto
    if (project.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para atualizar este projeto'
      });
    }

    project.lyrics.verses = req.body.verses;
    await project.save();

    res.json({
      success: true,
      project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Atualizar estilo global
// @route   PUT /api/projects/:id/style
// @access  Private
exports.updateGlobalStyle = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    // Verificar se o usuário é o dono do projeto
    if (project.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para atualizar este projeto'
      });
    }

    project.globalStyle = req.body.globalStyle;
    await project.save();

    res.json({
      success: true,
      project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Atualizar visibilidade do projeto
// @route   PUT /api/projects/:id/visibility
// @access  Private
exports.updateVisibility = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    // Verificar se o usuário é o dono do projeto
    if (project.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para atualizar este projeto'
      });
    }

    project.isPublic = req.body.isPublic;
    await project.save();

    res.json({
      success: true,
      project
    });
  } catch (error) {
    next(error);
  }
};
