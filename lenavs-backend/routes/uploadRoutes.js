import express from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import FileUploadService from '../services/FileUploadService.js';
import LyricsService from '../services/LyricsService.js';
import AudioService from '../services/AudioService.js';
import BackgroundService from '../services/BackgroundService.js';

const router = express.Router();

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/';
    
    if (file.fieldname === 'musicaOriginal' || file.fieldname === 'playback') {
      folder += 'audio/';
    } else if (file.fieldname === 'background') {
      folder += 'background/';
    } else if (file.fieldname === 'letra') {
      folder += 'lyrics/';
    }
    
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: (process.env.MAX_FILE_SIZE || 500) * 1024 * 1024 // MB para bytes
  },
  fileFilter: (req, file, cb) => {
    const audioFormats = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.wma', '.opus'];
    const videoFormats = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
    const imageFormats = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const lyricsFormats = ['.txt', '.docx', '.pdf'];
    
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (file.fieldname === 'musicaOriginal' || file.fieldname === 'playback') {
      if (!audioFormats.includes(ext)) {
        return cb(new Error('Formato de áudio não suportado'));
      }
    } else if (file.fieldname === 'background') {
      if (![...videoFormats, ...imageFormats].includes(ext)) {
        return cb(new Error('Formato de background não suportado'));
      }
    } else if (file.fieldname === 'letra') {
      if (!lyricsFormats.includes(ext)) {
        return cb(new Error('Formato de letra não suportado'));
      }
    }
    
    cb(null, true);
  }
});

// Rota para upload completo (todos os arquivos de uma vez)
router.post('/complete', upload.fields([
  { name: 'musicaOriginal', maxCount: 1 },
  { name: 'playback', maxCount: 1 },
  { name: 'background', maxCount: 1 },
  { name: 'letra', maxCount: 1 }
]), async (req, res) => {
  try {
    const projectId = uuidv4();
    const files = req.files;
    const { letraTexto, nomeProjeto } = req.body;
    
    const result = {
      projectId,
      nomeProjeto: nomeProjeto || 'Projeto Sem Nome',
      files: {},
      lyrics: null
    };

    // Processar música original
    if (files.musicaOriginal) {
      const audioInfo = await AudioService.getAudioInfo(files.musicaOriginal[0].path);
      result.files.musicaOriginal = {
        path: files.musicaOriginal[0].path,
        filename: files.musicaOriginal[0].filename,
        url: `/uploads/audio/${files.musicaOriginal[0].filename}`,
        duration: audioInfo.duration,
        format: audioInfo.format
      };
    }

    // Processar playback
    if (files.playback) {
      const audioInfo = await AudioService.getAudioInfo(files.playback[0].path);
      result.files.playback = {
        path: files.playback[0].path,
        filename: files.playback[0].filename,
        url: `/uploads/audio/${files.playback[0].filename}`,
        duration: audioInfo.duration,
        format: audioInfo.format
      };
    }

    // Processar background
    if (files.background) {
      const bgInfo = await BackgroundService.processBackground(
        files.background[0].path,
        result.files.playback?.duration || result.files.musicaOriginal?.duration || 0
      );
      
      result.files.background = {
        path: files.background[0].path,
        filename: files.background[0].filename,
        url: `/uploads/background/${files.background[0].filename}`,
        type: bgInfo.type,
        duration: bgInfo.duration,
        resolution: bgInfo.resolution,
        processed: bgInfo.processed
      };
    }

    // Processar letra
    if (files.letra) {
      const lyricsText = await LyricsService.extractLyrics(files.letra[0].path);
      const verses = LyricsService.splitIntoVerses(lyricsText);
      
      result.lyrics = {
        text: lyricsText,
        verses,
        source: 'file'
      };
    } else if (letraTexto) {
      const verses = LyricsService.splitIntoVerses(letraTexto);
      
      result.lyrics = {
        text: letraTexto,
        verses,
        source: 'text'
      };
    }

    // Salvar projeto
    await FileUploadService.saveProject(projectId, result);

    res.json({
      success: true,
      message: 'Upload concluído com sucesso',
      data: result
    });

  } catch (error) {
    console.error('Erro no upload completo:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Rota para upload individual de música original
router.post('/musica-original', upload.single('musicaOriginal'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo enviado'
      });
    }

    const audioInfo = await AudioService.getAudioInfo(req.file.path);

    res.json({
      success: true,
      data: {
        path: req.file.path,
        filename: req.file.filename,
        url: `/uploads/audio/${req.file.filename}`,
        duration: audioInfo.duration,
        format: audioInfo.format
      }
    });

  } catch (error) {
    console.error('Erro no upload de música:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Rota para upload individual de playback
router.post('/playback', upload.single('playback'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo enviado'
      });
    }

    const audioInfo = await AudioService.getAudioInfo(req.file.path);

    res.json({
      success: true,
      data: {
        path: req.file.path,
        filename: req.file.filename,
        url: `/uploads/audio/${req.file.filename}`,
        duration: audioInfo.duration,
        format: audioInfo.format
      }
    });

  } catch (error) {
    console.error('Erro no upload de playback:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Rota para upload de background
router.post('/background', upload.single('background'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo enviado'
      });
    }

    const { audioDuration } = req.body;
    const bgInfo = await BackgroundService.processBackground(
      req.file.path,
      parseFloat(audioDuration) || 0
    );

    res.json({
      success: true,
      data: {
        path: req.file.path,
        filename: req.file.filename,
        url: `/uploads/background/${req.file.filename}`,
        type: bgInfo.type,
        duration: bgInfo.duration,
        resolution: bgInfo.resolution,
        processed: bgInfo.processed
      }
    });

  } catch (error) {
    console.error('Erro no upload de background:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Rota para upload de letra
router.post('/letra', upload.single('letra'), async (req, res) => {
  try {
    if (!req.file && !req.body.letraTexto) {
      return res.status(400).json({
        success: false,
        message: 'Nenhuma letra fornecida'
      });
    }

    let lyricsText;
    let source;

    if (req.file) {
      lyricsText = await LyricsService.extractLyrics(req.file.path);
      source = 'file';
    } else {
      lyricsText = req.body.letraTexto;
      source = 'text';
    }

    const verses = LyricsService.splitIntoVerses(lyricsText);

    res.json({
      success: true,
      data: {
        text: lyricsText,
        verses,
        source
      }
    });

  } catch (error) {
    console.error('Erro no upload de letra:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
