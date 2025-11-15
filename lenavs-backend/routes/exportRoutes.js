import express from 'express';
import VideoExportService from '../services/VideoExportService.js';
import ProjectManager from '../services/ProjectManager.js';

const router = express.Router();

// Status dos exports em andamento
const exportJobs = new Map();

// Iniciar exportação de vídeo
router.post('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { format, quality } = req.body;

    // Validar formato
    if (!['mp4', 'mov', 'avi'].includes(format)) {
      return res.status(400).json({
        success: false,
        message: 'Formato deve ser mp4, mov ou avi'
      });
    }

    // Validar qualidade
    if (!['480p', '720p', '1080p', '4k'].includes(quality)) {
      return res.status(400).json({
        success: false,
        message: 'Qualidade deve ser 480p, 720p, 1080p ou 4k'
      });
    }

    const project = await ProjectManager.getProject(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    // Validar se o projeto está pronto para exportar
    if (!project.files?.playback) {
      return res.status(400).json({
        success: false,
        message: 'Playback não encontrado'
      });
    }

    if (!project.files?.background) {
      return res.status(400).json({
        success: false,
        message: 'Background não encontrado'
      });
    }

    if (!project.lyrics?.verses || project.lyrics.verses.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhuma letra encontrada'
      });
    }

    // Criar ID único para o job
    const jobId = `${projectId}-${Date.now()}`;

    // Iniciar exportação em background
    exportJobs.set(jobId, {
      status: 'processing',
      progress: 0,
      message: 'Iniciando exportação...'
    });

    // Processar de forma assíncrona
    VideoExportService.exportVideo(
      project,
      format,
      quality,
      (progress) => {
        // Callback de progresso
        const job = exportJobs.get(jobId);
        if (job) {
          job.progress = progress.percent;
          job.message = progress.message;
          exportJobs.set(jobId, job);
        }
      }
    ).then((result) => {
      exportJobs.set(jobId, {
        status: 'completed',
        progress: 100,
        message: 'Exportação concluída',
        outputFile: result.outputFile,
        outputUrl: result.outputUrl,
        duration: result.duration,
        format: result.format,
        quality: result.quality,
        filename: result.filename
      });
    }).catch((error) => {
      console.error('Erro na exportação:', error);
      exportJobs.set(jobId, {
        status: 'error',
        progress: 0,
        message: error.message || 'Erro na exportação'
      });
    });

    res.json({
      success: true,
      message: 'Exportação iniciada',
      data: {
        jobId,
        projectId,
        format,
        quality
      }
    });

  } catch (error) {
    console.error('Erro ao iniciar exportação:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Obter status da exportação
router.get('/:projectId/status/:jobId', (req, res) => {
  try {
    const { jobId } = req.params;

    const job = exportJobs.get(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job não encontrado'
      });
    }

    res.json({
      success: true,
      data: job
    });

  } catch (error) {
    console.error('Erro ao obter status:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Listar todos os exports de um projeto
router.get('/:projectId/history', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const history = Array.from(exportJobs.entries())
      .filter(([key]) => key.startsWith(projectId))
      .map(([jobId, job]) => ({
        jobId,
        ...job
      }));

    res.json({
      success: true,
      data: {
        exports: history,
        total: history.length
      }
    });

  } catch (error) {
    console.error('Erro ao obter histórico:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Cancelar exportação
router.delete('/:projectId/cancel/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = exportJobs.get(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job não encontrado'
      });
    }

    if (job.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Exportação já foi concluída'
      });
    }

    // Atualizar status para cancelado
    exportJobs.set(jobId, {
      ...job,
      status: 'cancelled',
      message: 'Exportação cancelada pelo usuário'
    });

    res.json({
      success: true,
      message: 'Exportação cancelada'
    });

  } catch (error) {
    console.error('Erro ao cancelar exportação:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Limpar histórico de exports antigos
router.delete('/:projectId/history/clear', (req, res) => {
  try {
    const { projectId } = req.params;
    
    let removed = 0;
    for (const [key, job] of exportJobs.entries()) {
      if (key.startsWith(projectId) && (job.status === 'completed' || job.status === 'error')) {
        exportJobs.delete(key);
        removed++;
      }
    }

    res.json({
      success: true,
      message: `${removed} exports removidos do histórico`
    });

  } catch (error) {
    console.error('Erro ao limpar histórico:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Download direto do vídeo exportado
router.get('/download/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = `./outputs/${filename}`;

    res.download(filePath, (err) => {
      if (err) {
        console.error('Erro no download:', err);
        if (!res.headersSent) {
          res.status(404).json({
            success: false,
            message: 'Arquivo não encontrado'
          });
        }
      }
    });

  } catch (error) {
    console.error('Erro ao fazer download:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Obter informações sobre formatos e qualidades disponíveis
router.get('/options', (req, res) => {
  try {
    const options = VideoExportService.getExportOptions();

    res.json({
      success: true,
      data: options
    });

  } catch (error) {
    console.error('Erro ao obter opções:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Estimar tempo de exportação
router.post('/:projectId/estimate', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { quality } = req.body;

    const project = await ProjectManager.getProject(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    const audioDuration = project.files?.playback?.duration || 0;
    const estimate = VideoExportService.estimateExportTime(audioDuration, quality);

    res.json({
      success: true,
      data: {
        audioDuration,
        quality,
        estimatedTime: estimate.time,
        estimatedTimeFormatted: estimate.formatted
      }
    });

  } catch (error) {
    console.error('Erro ao estimar tempo:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
