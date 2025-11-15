import express from 'express';
import LyricsSyncService from '../services/LyricsSyncService.js';
import ProjectManager from '../services/ProjectManager.js';

const router = express.Router();

// Obter todas as estrofes de um projeto
router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await ProjectManager.getProject(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        verses: project.lyrics?.verses || [],
        totalVerses: project.lyrics?.verses?.length || 0
      }
    });

  } catch (error) {
    console.error('Erro ao obter letras:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Atualizar uma estrofe específica
router.put('/:projectId/verse/:verseIndex', async (req, res) => {
  try {
    const { projectId, verseIndex } = req.params;
    const { text, timeStart, timeEnd } = req.body;

    // Validações
    if (text === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Texto da estrofe é obrigatório'
      });
    }

    if (timeStart !== undefined && timeEnd !== undefined) {
      const start = LyricsSyncService.parseTime(timeStart);
      const end = LyricsSyncService.parseTime(timeEnd);

      if (!LyricsSyncService.validateTiming(start, end)) {
        return res.status(400).json({
          success: false,
          message: 'Tempo inicial deve ser menor que o tempo final'
        });
      }
    }

    const project = await ProjectManager.getProject(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    const index = parseInt(verseIndex);
    
    if (index < 0 || index >= project.lyrics.verses.length) {
      return res.status(400).json({
        success: false,
        message: 'Índice de estrofe inválido'
      });
    }

    // Atualizar estrofe
    project.lyrics.verses[index] = {
      ...project.lyrics.verses[index],
      text,
      ...(timeStart !== undefined && { timeStart }),
      ...(timeEnd !== undefined && { timeEnd })
    };

    await ProjectManager.updateProject(projectId, project);

    res.json({
      success: true,
      message: 'Estrofe atualizada com sucesso',
      data: project.lyrics.verses[index]
    });

  } catch (error) {
    console.error('Erro ao atualizar estrofe:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Adicionar nova estrofe
router.post('/:projectId/verse', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { text, timeStart, timeEnd, position } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Texto da estrofe é obrigatório'
      });
    }

    const project = await ProjectManager.getProject(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    const newVerse = {
      text,
      timeStart: timeStart || '00:00',
      timeEnd: timeEnd || '00:00'
    };

    // Adicionar na posição especificada ou no final
    if (position !== undefined && position >= 0 && position <= project.lyrics.verses.length) {
      project.lyrics.verses.splice(position, 0, newVerse);
    } else {
      project.lyrics.verses.push(newVerse);
    }

    await ProjectManager.updateProject(projectId, project);

    res.json({
      success: true,
      message: 'Estrofe adicionada com sucesso',
      data: {
        verse: newVerse,
        index: position !== undefined ? position : project.lyrics.verses.length - 1
      }
    });

  } catch (error) {
    console.error('Erro ao adicionar estrofe:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Remover estrofe
router.delete('/:projectId/verse/:verseIndex', async (req, res) => {
  try {
    const { projectId, verseIndex } = req.params;
    const project = await ProjectManager.getProject(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    const index = parseInt(verseIndex);
    
    if (index < 0 || index >= project.lyrics.verses.length) {
      return res.status(400).json({
        success: false,
        message: 'Índice de estrofe inválido'
      });
    }

    const removedVerse = project.lyrics.verses.splice(index, 1)[0];
    await ProjectManager.updateProject(projectId, project);

    res.json({
      success: true,
      message: 'Estrofe removida com sucesso',
      data: {
        removedVerse,
        remainingVerses: project.lyrics.verses.length
      }
    });

  } catch (error) {
    console.error('Erro ao remover estrofe:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Sincronizar tempo de uma estrofe (botão "agora")
router.post('/:projectId/verse/:verseIndex/sync', async (req, res) => {
  try {
    const { projectId, verseIndex } = req.params;
    const { currentTime, type } = req.body; // type: 'start' ou 'end'

    if (currentTime === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Tempo atual é obrigatório'
      });
    }

    if (!['start', 'end'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo deve ser "start" ou "end"'
      });
    }

    const project = await ProjectManager.getProject(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    const index = parseInt(verseIndex);
    
    if (index < 0 || index >= project.lyrics.verses.length) {
      return res.status(400).json({
        success: false,
        message: 'Índice de estrofe inválido'
      });
    }

    const formattedTime = LyricsSyncService.formatTime(parseFloat(currentTime));

    if (type === 'start') {
      project.lyrics.verses[index].timeStart = formattedTime;
    } else {
      project.lyrics.verses[index].timeEnd = formattedTime;
    }

    // Validar após atualização
    const start = LyricsSyncService.parseTime(project.lyrics.verses[index].timeStart);
    const end = LyricsSyncService.parseTime(project.lyrics.verses[index].timeEnd);

    if (!LyricsSyncService.validateTiming(start, end)) {
      return res.status(400).json({
        success: false,
        message: 'Tempo inicial deve ser menor que o tempo final'
      });
    }

    await ProjectManager.updateProject(projectId, project);

    res.json({
      success: true,
      message: 'Tempo sincronizado com sucesso',
      data: project.lyrics.verses[index]
    });

  } catch (error) {
    console.error('Erro ao sincronizar tempo:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Obter estrofe ativa em determinado tempo
router.get('/:projectId/active', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { currentTime } = req.query;

    if (currentTime === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Tempo atual é obrigatório'
      });
    }

    const project = await ProjectManager.getProject(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    const time = parseFloat(currentTime);
    const activeVerse = LyricsSyncService.getActiveVerse(project.lyrics.verses, time);

    res.json({
      success: true,
      data: {
        activeVerse,
        currentTime: time
      }
    });

  } catch (error) {
    console.error('Erro ao obter estrofe ativa:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Reordenar estrofes
router.put('/:projectId/reorder', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { verses } = req.body;

    if (!Array.isArray(verses)) {
      return res.status(400).json({
        success: false,
        message: 'Lista de estrofes inválida'
      });
    }

    const project = await ProjectManager.getProject(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    project.lyrics.verses = verses;
    await ProjectManager.updateProject(projectId, project);

    res.json({
      success: true,
      message: 'Estrofes reordenadas com sucesso',
      data: {
        verses: project.lyrics.verses
      }
    });

  } catch (error) {
    console.error('Erro ao reordenar estrofes:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
