import express from 'express';
import ProjectManager from '../services/ProjectManager.js';
import LyricsSyncService from '../services/LyricsSyncService.js';

const router = express.Router();

// Obter dados completos para preview
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
        projectId,
        nomeProjeto: project.nomeProjeto,
        audio: {
          musicaOriginal: project.files?.musicaOriginal || null,
          playback: project.files?.playback || null
        },
        background: project.files?.background || null,
        lyrics: project.lyrics || null,
        style: project.style || null
      }
    });

  } catch (error) {
    console.error('Erro ao obter preview:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Obter estrofe ativa em tempo real
router.get('/:projectId/verse-at-time', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { time } = req.query;

    if (!time) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetro "time" é obrigatório'
      });
    }

    const project = await ProjectManager.getProject(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    const currentTime = parseFloat(time);
    const activeVerse = LyricsSyncService.getActiveVerse(
      project.lyrics?.verses || [],
      currentTime
    );

    res.json({
      success: true,
      data: {
        currentTime,
        activeVerse,
        hasActiveVerse: activeVerse !== null
      }
    });

  } catch (error) {
    console.error('Erro ao obter estrofe em tempo:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Obter URL do áudio (música original ou playback)
router.get('/:projectId/audio', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { type } = req.query; // 'original' ou 'playback'

    const project = await ProjectManager.getProject(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    let audioData = null;

    if (type === 'playback' && project.files?.playback) {
      audioData = project.files.playback;
    } else if (type === 'original' && project.files?.musicaOriginal) {
      audioData = project.files.musicaOriginal;
    } else {
      // Padrão: retorna playback se existir, senão música original
      audioData = project.files?.playback || project.files?.musicaOriginal;
    }

    if (!audioData) {
      return res.status(404).json({
        success: false,
        message: 'Áudio não encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        type: type || 'auto',
        audio: audioData
      }
    });

  } catch (error) {
    console.error('Erro ao obter áudio:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Atualizar tipo de áudio ativo (original/playback)
router.put('/:projectId/audio-type', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { audioType } = req.body; // 'original' ou 'playback'

    if (!['original', 'playback'].includes(audioType)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de áudio deve ser "original" ou "playback"'
      });
    }

    const project = await ProjectManager.getProject(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    // Verificar se o áudio solicitado existe
    if (audioType === 'original' && !project.files?.musicaOriginal) {
      return res.status(404).json({
        success: false,
        message: 'Música original não encontrada'
      });
    }

    if (audioType === 'playback' && !project.files?.playback) {
      return res.status(404).json({
        success: false,
        message: 'Playback não encontrado'
      });
    }

    // Salvar preferência
    project.activeAudioType = audioType;
    await ProjectManager.updateProject(projectId, project);

    const audioData = audioType === 'original' 
      ? project.files.musicaOriginal 
      : project.files.playback;

    res.json({
      success: true,
      message: 'Tipo de áudio atualizado',
      data: {
        audioType,
        audio: audioData
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar tipo de áudio:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Obter background
router.get('/:projectId/background', async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await ProjectManager.getProject(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    if (!project.files?.background) {
      return res.status(404).json({
        success: false,
        message: 'Background não encontrado'
      });
    }

    res.json({
      success: true,
      data: project.files.background
    });

  } catch (error) {
    console.error('Erro ao obter background:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Obter todas as estrofes com formatação para preview
router.get('/:projectId/verses-formatted', async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await ProjectManager.getProject(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    const verses = project.lyrics?.verses || [];
    const style = project.style || {};

    // Formatar cada estrofe com informações de timing
    const formattedVerses = verses.map((verse, index) => ({
      index,
      text: verse.text,
      timeStart: verse.timeStart,
      timeEnd: verse.timeEnd,
      timeStartSeconds: LyricsSyncService.parseTime(verse.timeStart),
      timeEndSeconds: LyricsSyncService.parseTime(verse.timeEnd),
      duration: LyricsSyncService.parseTime(verse.timeEnd) - LyricsSyncService.parseTime(verse.timeStart)
    }));

    res.json({
      success: true,
      data: {
        verses: formattedVerses,
        style,
        totalVerses: formattedVerses.length
      }
    });

  } catch (error) {
    console.error('Erro ao obter estrofes formatadas:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Sincronizar posição do player
router.post('/:projectId/sync-position', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { currentTime, verseIndex } = req.body;

    const project = await ProjectManager.getProject(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    let targetTime = currentTime;

    // Se verseIndex for fornecido, ir para o início dessa estrofe
    if (verseIndex !== undefined) {
      const verses = project.lyrics?.verses || [];
      if (verseIndex >= 0 && verseIndex < verses.length) {
        targetTime = LyricsSyncService.parseTime(verses[verseIndex].timeStart);
      }
    }

    res.json({
      success: true,
      data: {
        targetTime,
        verseIndex
      }
    });

  } catch (error) {
    console.error('Erro ao sincronizar posição:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Validar sincronização completa
router.get('/:projectId/validate', async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await ProjectManager.getProject(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    const validation = {
      hasAudio: !!(project.files?.musicaOriginal || project.files?.playback),
      hasPlayback: !!project.files?.playback,
      hasBackground: !!project.files?.background,
      hasLyrics: !!(project.lyrics?.verses && project.lyrics.verses.length > 0),
      hasStyle: !!project.style,
      verses: []
    };

    if (project.lyrics?.verses) {
      validation.verses = project.lyrics.verses.map((verse, index) => {
        const start = LyricsSyncService.parseTime(verse.timeStart);
        const end = LyricsSyncService.parseTime(verse.timeEnd);
        
        return {
          index,
          text: verse.text,
          hasTiming: verse.timeStart !== '00:00' || verse.timeEnd !== '00:00',
          timingValid: LyricsSyncService.validateTiming(start, end),
          timeStart: verse.timeStart,
          timeEnd: verse.timeEnd
        };
      });
    }

    validation.allVersesTimed = validation.verses.every(v => v.hasTiming && v.timingValid);
    validation.readyToExport = validation.hasPlayback && 
                               validation.hasBackground && 
                               validation.hasLyrics && 
                               validation.allVersesTimed;

    res.json({
      success: true,
      data: validation
    });

  } catch (error) {
    console.error('Erro ao validar sincronização:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
