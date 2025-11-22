const fs = require('fs').promises;
const path = require('path');
const { parseFile } = require('music-metadata');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');

// Função auxiliar para obter metadados de áudio
const getAudioMetadata = async (filePath) => {
  try {
    const metadata = await parseFile(filePath);
    return {
      duration: metadata.format.duration,
      bitrate: metadata.format.bitrate,
      sampleRate: metadata.format.sampleRate,
      channels: metadata.format.numberOfChannels
    };
  } catch (error) {
    console.error('Erro ao obter metadados de áudio:', error);
    return null;
  }
};

// Função auxiliar para obter metadados de vídeo
const getVideoMetadata = (filePath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        const videoStream = metadata.streams.find(s => s.codec_type === 'video');
        resolve({
          duration: metadata.format.duration,
          width: videoStream?.width,
          height: videoStream?.height,
          fps: eval(videoStream?.r_frame_rate)
        });
      }
    });
  });
};

// Função auxiliar para obter metadados de imagem
const getImageMetadata = async (filePath) => {
  try {
    const metadata = await sharp(filePath).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format
    };
  } catch (error) {
    console.error('Erro ao obter metadados de imagem:', error);
    return null;
  }
};

// Função auxiliar para extrair texto de documentos
const extractTextFromDocument = async (filePath, mimetype) => {
  try {
    if (mimetype === 'text/plain') {
      const text = await fs.readFile(filePath, 'utf-8');
      return text;
    } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               mimetype === 'application/msword') {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } else if (mimetype === 'application/pdf') {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    }
    return null;
  } catch (error) {
    console.error('Erro ao extrair texto:', error);
    return null;
  }
};

// @desc    Upload de múltiplos arquivos do projeto
// @route   POST /api/upload/project-files
// @access  Private
exports.uploadProjectFiles = async (req, res, next) => {
  try {
    if (!req.files) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo foi enviado'
      });
    }

    const uploadedFiles = {};

    // Processar música original
    if (req.files.originalMusic) {
      const file = req.files.originalMusic[0];
      const metadata = await getAudioMetadata(file.path);
      uploadedFiles.originalMusic = {
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
        metadata
      };
    }

    // Processar playback instrumental
    if (req.files.playbackInstrumental) {
      const file = req.files.playbackInstrumental[0];
      const metadata = await getAudioMetadata(file.path);
      uploadedFiles.playbackInstrumental = {
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
        metadata
      };
    }

    // Processar background (imagem ou vídeo)
    if (req.files.background) {
      const file = req.files.background[0];
      let metadata = null;
      
      if (file.mimetype.startsWith('image/')) {
        metadata = await getImageMetadata(file.path);
      } else if (file.mimetype.startsWith('video/')) {
        metadata = await getVideoMetadata(file.path);
      }

      uploadedFiles.background = {
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
        type: file.mimetype.startsWith('image/') ? 'image' : 'video',
        metadata
      };
    }

    // Processar letra
    if (req.files.lyrics) {
      const file = req.files.lyrics[0];
      const text = await extractTextFromDocument(file.path, file.mimetype);
      uploadedFiles.lyrics = {
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
        text
      };
    }

    res.json({
      success: true,
      files: uploadedFiles
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload de arquivo de áudio
// @route   POST /api/upload/audio
// @access  Private
exports.uploadAudio = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo foi enviado'
      });
    }

    const metadata = await getAudioMetadata(req.file.path);

    res.json({
      success: true,
      file: {
        filename: req.file.filename,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size,
        metadata
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload de vídeo de background
// @route   POST /api/upload/video
// @access  Private
exports.uploadVideo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo foi enviado'
      });
    }

    const metadata = await getVideoMetadata(req.file.path);

    res.json({
      success: true,
      file: {
        filename: req.file.filename,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size,
        type: 'video',
        metadata
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload de imagem de background
// @route   POST /api/upload/image
// @access  Private
exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo foi enviado'
      });
    }

    const metadata = await getImageMetadata(req.file.path);

    res.json({
      success: true,
      file: {
        filename: req.file.filename,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size,
        type: 'image',
        metadata
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload de arquivo de letra
// @route   POST /api/upload/lyrics
// @access  Private
exports.uploadLyrics = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo foi enviado'
      });
    }

    const text = await extractTextFromDocument(req.file.path, req.file.mimetype);

    res.json({
      success: true,
      file: {
        filename: req.file.filename,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size,
        text
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deletar arquivo
// @route   DELETE /api/upload/:filename
// @access  Private
exports.deleteFile = async (req, res, next) => {
  try {
    const { filename } = req.params;
    
    // Procurar arquivo em todos os diretórios de upload
    const directories = ['audio', 'video', 'images', 'lyrics', 'exports'];
    
    for (const dir of directories) {
      const filePath = path.join(__dirname, '../../uploads', dir, filename);
      try {
        await fs.access(filePath);
        await fs.unlink(filePath);
        return res.json({
          success: true,
          message: 'Arquivo deletado com sucesso'
        });
      } catch (err) {
        continue;
      }
    }

    return res.status(404).json({
      success: false,
      message: 'Arquivo não encontrado'
    });
  } catch (error) {
    next(error);
  }
};
