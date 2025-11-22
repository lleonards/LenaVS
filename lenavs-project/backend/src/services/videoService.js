const ffmpeg = require('fluent-ffmpeg');
const { createCanvas, registerFont } = require('canvas');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

// Converter tempo mm:ss para segundos
const timeToSeconds = (timeStr) => {
  const [minutes, seconds] = timeStr.split(':').map(Number);
  return minutes * 60 + seconds;
};

// Processar background (imagem ou vídeo)
const processBackground = (backgroundPath, backgroundType, audioDuration, outputPath) => {
  return new Promise((resolve, reject) => {
    if (backgroundType === 'image') {
      // Converter imagem em vídeo fixo
      ffmpeg(backgroundPath)
        .loop(audioDuration)
        .outputOptions([
          '-t ' + audioDuration,
          '-vf scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2',
          '-pix_fmt yuv420p'
        ])
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(err))
        .run();
    } else {
      // Processar vídeo
      ffmpeg.ffprobe(backgroundPath, (err, metadata) => {
        if (err) return reject(err);

        const videoDuration = metadata.format.duration;

        if (videoDuration > audioDuration) {
          // Cortar vídeo
          ffmpeg(backgroundPath)
            .setStartTime(0)
            .setDuration(audioDuration)
            .outputOptions([
              '-vf scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2',
              '-pix_fmt yuv420p'
            ])
            .output(outputPath)
            .on('end', () => resolve(outputPath))
            .on('error', (err) => reject(err))
            .run();
        } else {
          // Loop do vídeo
          const loopCount = Math.ceil(audioDuration / videoDuration);
          
          ffmpeg()
            .input(backgroundPath)
            .inputOptions([`-stream_loop ${loopCount - 1}`])
            .setDuration(audioDuration)
            .outputOptions([
              '-vf scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2',
              '-pix_fmt yuv420p'
            ])
            .output(outputPath)
            .on('end', () => resolve(outputPath))
            .on('error', (err) => reject(err))
            .run();
        }
      });
    }
  });
};

// Criar arquivo de legendas ASS com estilos individuais
const createSubtitlesFile = async (verses, globalStyle) => {
  const assFile = path.join(__dirname, '../../uploads/exports', `subtitles_${uuidv4()}.ass`);
  
  let assContent = `[Script Info]
Title: LenaVS Karaoke
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
`;

  // Criar um estilo para cada estrofe
  verses.forEach((verse, index) => {
    const style = verse.style;
    const alignment = style.alignment === 'left' ? 1 : style.alignment === 'right' ? 3 : 2;
    const bold = style.bold ? -1 : 0;
    const italic = style.italic ? -1 : 0;
    const underline = style.underline ? -1 : 0;
    
    // Converter cores hex para formato ASS (BGR)
    const textColor = hexToAssColor(style.textColor);
    const outlineColor = hexToAssColor(style.outlineColor);
    
    assContent += `Style: Verse${index},${style.font},${style.fontSize},${textColor},${textColor},${outlineColor},&H00000000,${bold},${italic},${underline},0,100,100,0,0,1,3,0,${alignment},10,10,10,1\n`;
  });

  assContent += `\n[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`;

  // Adicionar cada estrofe com seu estilo
  verses.forEach((verse, index) => {
    const startTime = formatAssTime(timeToSeconds(verse.startTime));
    const endTime = formatAssTime(timeToSeconds(verse.endTime));
    const text = verse.text.replace(/\n/g, '\\N'); // Preservar quebras de linha
    
    assContent += `Dialogue: 0,${startTime},${endTime},Verse${index},,0,0,0,,${text}\n`;
  });

  await fs.writeFile(assFile, assContent, 'utf-8');
  return assFile;
};

// Converter cor hex para formato ASS (BGR com alpha)
const hexToAssColor = (hex) => {
  // Remove # se existir
  hex = hex.replace('#', '');
  
  // Extrai componentes RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Formato ASS: &HAABBGGRR (alpha é 00 para opaco)
  return `&H00${b.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${r.toString(16).padStart(2, '0')}`.toUpperCase();
};

// Formatar tempo para ASS (h:mm:ss.cs)
const formatAssTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const centisecs = Math.floor((seconds % 1) * 100);
  
  return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centisecs.toString().padStart(2, '0')}`;
};

// Processar vídeo completo
exports.processVideo = async (projectId) => {
  const Project = require('../models/Project');
  const project = await Project.findById(projectId);

  if (!project) {
    throw new Error('Projeto não encontrado');
  }

  try {
    const outputFilename = `${project.name.replace(/[^a-z0-9]/gi, '_')}_${uuidv4()}.${project.exportSettings.format}`;
    const outputPath = path.join(__dirname, '../../uploads/exports', outputFilename);

    // 1. Processar background
    const tempBackgroundPath = path.join(__dirname, '../../uploads/exports', `temp_bg_${uuidv4()}.mp4`);
    
    // Obter duração do áudio
    const audioDuration = await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(project.originalMusic.path, (err, metadata) => {
        if (err) reject(err);
        else resolve(metadata.format.duration);
      });
    });

    await processBackground(
      project.background.path,
      project.background.type,
      audioDuration,
      tempBackgroundPath
    );

    // 2. Criar arquivo de legendas
    const subtitlesPath = await createSubtitlesFile(project.lyrics.verses, project.globalStyle);

    // 3. Combinar tudo
    const audioPath = project.playbackInstrumental && project.playbackInstrumental.path 
      ? project.playbackInstrumental.path 
      : project.originalMusic.path;

    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(tempBackgroundPath)
        .input(audioPath)
        .outputOptions([
          '-c:v libx264',
          '-preset medium',
          '-crf 23',
          '-c:a aac',
          '-b:a 192k',
          '-vf ass=' + subtitlesPath.replace(/\\/g, '/').replace(/:/g, '\\\\:'),
          '-pix_fmt yuv420p',
          '-movflags +faststart'
        ])
        .output(outputPath)
        .on('end', async () => {
          // Limpar arquivos temporários
          try {
            await fs.unlink(tempBackgroundPath);
            await fs.unlink(subtitlesPath);
          } catch (err) {
            console.error('Erro ao deletar arquivos temporários:', err);
          }
          resolve();
        })
        .on('error', (err) => reject(err))
        .run();
    });

    // Obter tamanho do arquivo
    const stats = await fs.stat(outputPath);

    return {
      filename: outputFilename,
      path: outputPath,
      size: stats.size
    };
  } catch (error) {
    console.error('Erro ao processar vídeo:', error);
    throw error;
  }
};
