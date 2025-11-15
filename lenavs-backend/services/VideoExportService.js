import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';
import BackgroundService from './BackgroundService.js';
import StyleService from './StyleService.js';
import LyricsSyncService from './LyricsSyncService.js';

class VideoExportService {
  /**
   * Exportar vídeo completo com legendas
   */
  static async exportVideo(project, format, quality, progressCallback) {
    try {
      // Validar projeto
      if (!project.files?.playback) {
        throw new Error('Playback não encontrado');
      }

      if (!project.files?.background) {
        throw new Error('Background não encontrado');
      }

      if (!project.lyrics?.verses || project.lyrics.verses.length === 0) {
        throw new Error('Letras não encontradas');
      }

      progressCallback?.({ percent: 5, message: 'Preparando arquivos...' });

      // Preparar background
      const backgroundPath = await this.prepareBackground(
        project,
        quality,
        progressCallback
      );

      progressCallback?.({ percent: 30, message: 'Gerando legendas...' });

      // Gerar arquivo de legendas
      const subtitlePath = await this.generateSubtitles(
        project.lyrics.verses,
        project.style || StyleService.getDefaultStyle()
      );

      progressCallback?.({ percent: 50, message: 'Combinando vídeo e áudio...' });

      // Nome do arquivo final
      const filename = this.sanitizeFilename(project.nomeProjeto || 'video');
      const outputFilename = `${filename}.${format}`;
      const outputPath = `./outputs/${outputFilename}`;

      // Combinar tudo
      await this.combineVideoAudioSubtitles(
        backgroundPath,
        project.files.playback.path,
        subtitlePath,
        outputPath,
        format,
        quality,
        progressCallback
      );

      progressCallback?.({ percent: 100, message: 'Exportação concluída!' });

      // Obter duração final
      const videoInfo = await BackgroundService.getVideoInfo(outputPath);

      return {
        success: true,
        outputFile: outputPath,
        outputUrl: `/outputs/${outputFilename}`,
        filename: outputFilename,
        duration: videoInfo.duration,
        format,
        quality
      };

    } catch (error) {
      console.error('Erro na exportação:', error);
      throw new Error(`Falha na exportação: ${error.message}`);
    }
  }

  /**
   * Preparar background para exportação
   */
  static async prepareBackground(project, quality, progressCallback) {
    const backgroundData = project.files.background;
    const audioDuration = project.files.playback.duration;
    const tempPath = `./temp/background-${Date.now()}.mp4`;

    progressCallback?.({ percent: 15, message: 'Processando background...' });

    await BackgroundService.prepareForExport(
      backgroundData,
      audioDuration,
      quality,
      tempPath
    );

    return tempPath;
  }

  /**
   * Gerar arquivo de legendas (ASS format para maior compatibilidade)
   */
  static async generateSubtitles(verses, style) {
    const assContent = this.generateASSContent(verses, style);
    const subtitlePath = `./temp/subtitles-${Date.now()}.ass`;
    
    await fs.writeFile(subtitlePath, assContent, 'utf-8');
    
    return subtitlePath;
  }

  /**
   * Gerar conteúdo do arquivo ASS
   */
  static generateASSContent(verses, style) {
    let ass = '[Script Info]\n';
    ass += 'Title: LenaVS Karaoke\n';
    ass += 'ScriptType: v4.00+\n';
    ass += 'WrapStyle: 0\n';
    ass += 'PlayResX: 1920\n';
    ass += 'PlayResY: 1080\n';
    ass += 'ScaledBorderAndShadow: yes\n\n';

    ass += '[V4+ Styles]\n';
    ass += 'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n';
    ass += StyleService.generateASSStyle(style) + '\n\n';

    ass += '[Events]\n';
    ass += 'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n';

    verses.forEach((verse) => {
      const start = this.secondsToASSTime(LyricsSyncService.parseTime(verse.timeStart));
      const end = this.secondsToASSTime(LyricsSyncService.parseTime(verse.timeEnd));
      const text = verse.text.replace(/\n/g, '\\N'); // ASS line break

      ass += `Dialogue: 0,${start},${end},Default,,0,0,0,,${text}\n`;
    });

    return ass;
  }

  /**
   * Converter segundos para formato ASS time (h:mm:ss.cs)
   */
  static secondsToASSTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const centisecs = Math.floor((seconds % 1) * 100);

    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(centisecs).padStart(2, '0')}`;
  }

  /**
   * Combinar vídeo, áudio e legendas
   */
  static async combineVideoAudioSubtitles(
    videoPath,
    audioPath,
    subtitlePath,
    outputPath,
    format,
    quality,
    progressCallback
  ) {
    return new Promise((resolve, reject) => {
      const videoCodec = this.getVideoCodec(format);
      const videoParams = this.getVideoParams(quality);

      const command = ffmpeg()
        .input(videoPath)
        .input(audioPath)
        .outputOptions([
          '-c:v', videoCodec,
          '-preset', videoParams.preset,
          '-crf', videoParams.crf,
          '-c:a', 'aac',
          '-b:a', '320k',
          '-vf', `ass=${subtitlePath}`,
          '-shortest'
        ]);

      // Configurar formato específico
      if (format === 'mov') {
        command.outputOptions(['-movflags', '+faststart']);
      } else if (format === 'avi') {
        command.outputOptions(['-vtag', 'xvid']);
      }

      command
        .on('start', (commandLine) => {
          console.log('FFmpeg command:', commandLine);
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            const percent = Math.min(99, 50 + Math.floor(progress.percent / 2));
            progressCallback?.({
              percent,
              message: `Renderizando vídeo... ${Math.floor(progress.percent)}%`
            });
          }
        })
        .on('end', () => {
          console.log('Vídeo exportado com sucesso');
          resolve({ success: true });
        })
        .on('error', (err) => {
          console.error('Erro ao combinar vídeo:', err);
          reject(new Error(`Falha ao combinar: ${err.message}`));
        })
        .save(outputPath);
    });
  }

  /**
   * Obter codec de vídeo baseado no formato
   */
  static getVideoCodec(format) {
    const codecs = {
      mp4: 'libx264',
      mov: 'libx264',
      avi: 'libxvid'
    };

    return codecs[format] || 'libx264';
  }

  /**
   * Obter parâmetros de vídeo baseados na qualidade
   */
  static getVideoParams(quality) {
    const params = {
      '480p': {
        width: 854,
        height: 480,
        bitrate: '1500k',
        preset: 'fast',
        crf: '23'
      },
      '720p': {
        width: 1280,
        height: 720,
        bitrate: '2500k',
        preset: 'medium',
        crf: '23'
      },
      '1080p': {
        width: 1920,
        height: 1080,
        bitrate: '5000k',
        preset: 'medium',
        crf: '23'
      },
      '4k': {
        width: 3840,
        height: 2160,
        bitrate: '20000k',
        preset: 'slow',
        crf: '18'
      }
    };

    return params[quality] || params['1080p'];
  }

  /**
   * Sanitizar nome de arquivo
   */
  static sanitizeFilename(filename) {
    return filename
      .replace(/[^a-z0-9_\-\s]/gi, '')
      .replace(/\s+/g, '_')
      .toLowerCase()
      .substring(0, 100);
  }

  /**
   * Obter opções de exportação disponíveis
   */
  static getExportOptions() {
    return {
      formats: [
        { value: 'mp4', label: 'MP4 (Recomendado)', description: 'Melhor compatibilidade' },
        { value: 'mov', label: 'MOV', description: 'Alta qualidade (Apple)' },
        { value: 'avi', label: 'AVI', description: 'Compatibilidade universal' }
      ],
      qualities: [
        { value: '480p', label: '480p SD', resolution: '854x480', description: 'Baixa qualidade, arquivo menor' },
        { value: '720p', label: '720p HD', resolution: '1280x720', description: 'Boa qualidade' },
        { value: '1080p', label: '1080p Full HD', resolution: '1920x1080', description: 'Alta qualidade (Recomendado)' },
        { value: '4k', label: '4K Ultra HD', resolution: '3840x2160', description: 'Máxima qualidade, arquivo grande' }
      ]
    };
  }

  /**
   * Estimar tempo de exportação
   */
  static estimateExportTime(audioDuration, quality) {
    // Fator de tempo baseado na qualidade (tempo real * fator)
    const timeFactors = {
      '480p': 1.5,
      '720p': 2.0,
      '1080p': 3.0,
      '4k': 6.0
    };

    const factor = timeFactors[quality] || 2.0;
    const estimatedSeconds = Math.ceil(audioDuration * factor);

    return {
      time: estimatedSeconds,
      formatted: this.formatEstimatedTime(estimatedSeconds)
    };
  }

  /**
   * Formatar tempo estimado
   */
  static formatEstimatedTime(seconds) {
    if (seconds < 60) {
      return `${seconds} segundos`;
    } else if (seconds < 3600) {
      const minutes = Math.ceil(seconds / 60);
      return `${minutes} minuto${minutes > 1 ? 's' : ''}`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.ceil((seconds % 3600) / 60);
      return `${hours}h ${minutes}min`;
    }
  }

  /**
   * Limpar arquivos temporários da exportação
   */
  static async cleanup(files) {
    for (const file of files) {
      try {
        await fs.unlink(file);
      } catch (error) {
        console.warn(`Não foi possível remover arquivo temporário: ${file}`);
      }
    }
  }

  /**
   * Obter informações do vídeo exportado
   */
  static async getExportedVideoInfo(videoPath) {
    try {
      const videoInfo = await BackgroundService.getVideoInfo(videoPath);
      const stats = await fs.stat(videoPath);

      return {
        duration: videoInfo.duration,
        resolution: videoInfo.resolution,
        format: videoInfo.format,
        codec: videoInfo.codec,
        bitrate: videoInfo.bitrate,
        fileSize: stats.size,
        fileSizeFormatted: this.formatFileSize(stats.size)
      };
    } catch (error) {
      console.error('Erro ao obter informações do vídeo:', error);
      return null;
    }
  }

  /**
   * Formatar tamanho de arquivo
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

export default VideoExportService;
