const path = require('path');
const fs = require('fs').promises;
const Project = require('../models/Project');
const videoService = require('../services/videoService');

// @desc    Exportar projeto como vídeo
// @route   POST /api/export/:projectId
// @access  Private
exports.exportVideo = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);

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
        message: 'Você não tem permissão para exportar este projeto'
      });
    }

    // Verificar se todos os arquivos necessários estão presentes
    if (!project.originalMusic || !project.originalMusic.path) {
      return res.status(400).json({
        success: false,
        message: 'Música original não encontrada'
      });
    }

    if (!project.background || !project.background.path) {
      return res.status(400).json({
        success: false,
        message: 'Background não encontrado'
      });
    }

    if (!project.lyrics || !project.lyrics.verses || project.lyrics.verses.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Letras não encontradas'
      });
    }

    // Atualizar status para processando
    project.status = 'processing';
    await project.save();

    // Iniciar processamento em background
    videoService.processVideo(project._id)
      .then(async (result) => {
        project.status = 'completed';
        project.exportedVideo = result;
        await project.save();
      })
      .catch(async (error) => {
        console.error('Erro ao processar vídeo:', error);
        project.status = 'error';
        await project.save();
      });

    res.json({
      success: true,
      message: 'Exportação iniciada. Você será notificado quando estiver pronta.',
      projectId: project._id
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obter status da exportação
// @route   GET /api/export/status/:projectId
// @access  Private
exports.getExportStatus = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .select('status exportedVideo');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    res.json({
      success: true,
      status: project.status,
      exportedVideo: project.exportedVideo
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download do vídeo exportado
// @route   GET /api/export/download/:projectId
// @access  Private
exports.downloadVideo = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);

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
        message: 'Você não tem permissão para baixar este vídeo'
      });
    }

    if (project.status !== 'completed' || !project.exportedVideo || !project.exportedVideo.path) {
      return res.status(400).json({
        success: false,
        message: 'Vídeo ainda não está pronto para download'
      });
    }

    // Verificar se o arquivo existe
    try {
      await fs.access(project.exportedVideo.path);
    } catch (err) {
      return res.status(404).json({
        success: false,
        message: 'Arquivo de vídeo não encontrado'
      });
    }

    // Enviar arquivo
    res.download(project.exportedVideo.path, project.exportedVideo.filename);
  } catch (error) {
    next(error);
  }
};
