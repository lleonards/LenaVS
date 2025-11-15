import ffmpeg from 'fluent-ffmpeg';

/**
 * Utilitários para FFmpeg
 */
class FFmpegUtils {
  /**
   * Verificar se FFmpeg está instalado
   */
  static async checkFFmpeg() {
    return new Promise((resolve) => {
      ffmpeg.getAvailableFormats((err, formats) => {
        if (err) {
          resolve({
            installed: false,
            error: err.message
          });
        } else {
          resolve({
            installed: true,
            formats: Object.keys(formats).length
          });
        }
      });
    });
  }

  /**
   * Obter versão do FFmpeg
   */
  static async getFFmpegVersion() {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe('-version', (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  /**
   * Obter codecs disponíveis
   */
  static async getAvailableCodecs() {
    return new Promise((resolve, reject) => {
      ffmpeg.getAvailableCodecs((err, codecs) => {
        if (err) {
          reject(err);
        } else {
          resolve(codecs);
        }
      });
    });
  }

  /**
   * Obter formatos disponíveis
   */
  static async getAvailableFormats() {
    return new Promise((resolve, reject) => {
      ffmpeg.getAvailableFormats((err, formats) => {
        if (err) {
          reject(err);
        } else {
          resolve(formats);
        }
      });
    });
  }

  /**
   * Obter filtros disponíveis
   */
  static async getAvailableFilters() {
    return new Promise((resolve, reject) => {
      ffmpeg.getAvailableFilters((err, filters) => {
        if (err) {
          reject(err);
        } else {
          resolve(filters);
        }
      });
    });
  }

  /**
   * Validar arquivo de mídia
   */
  static async validateMediaFile(filePath) {
    return new Promise((resolve) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          resolve({
            valid: false,
            error: err.message
          });
        } else {
          resolve({
            valid: true,
            metadata
          });
        }
      });
    });
  }

  /**
   * Obter duração de arquivo de mídia
   */
  static async getDuration(filePath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          resolve(metadata.format.duration);
        }
      });
    });
  }

  /**
   * Obter resolução de vídeo/imagem
   */
  static async getResolution(filePath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          const videoStream = metadata.streams.find(s => s.codec_type === 'video');
          if (videoStream) {
            resolve({
              width: videoStream.width,
              height: videoStream.height,
              resolution: `${videoStream.width}x${videoStream.height}`
            });
          } else {
            reject(new Error('Nenhum stream de vídeo encontrado'));
          }
        }
      });
    });
  }

  /**
   * Obter informações de áudio
   */
  static async getAudioInfo(filePath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
          if (audioStream) {
            resolve({
              codec: audioStream.codec_name,
              sampleRate: audioStream.sample_rate,
              channels: audioStream.channels,
              bitrate: audioStream.bit_rate,
              duration: metadata.format.duration
            });
          } else {
            reject(new Error('Nenhum stream de áudio encontrado'));
          }
        }
      });
    });
  }

  /**
   * Gerar thumbnail de vídeo
   */
  static async generateThumbnail(videoPath, outputPath, timeStamp = '00:00:01') {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          timestamps: [timeStamp],
          filename: outputPath,
          size: '320x240'
        })
        .on('end', () => {
          resolve({ success: true, outputPath });
        })
        .on('error', (err) => {
          reject(err);
        });
    });
  }

  /**
   * Extrair frame específico de vídeo
   */
  static async extractFrame(videoPath, outputPath, timeStamp) {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .seekInput(timeStamp)
        .frames(1)
        .output(outputPath)
        .on('end', () => {
          resolve({ success: true, outputPath });
        })
        .on('error', (err) => {
          reject(err);
        })
        .run();
    });
  }

  /**
   * Converter tempo de string para segundos
   */
  static timeToSeconds(timeString) {
    const parts = timeString.split(':');
    
    if (parts.length === 3) {
      // HH:MM:SS
      return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2]);
    } else if (parts.length === 2) {
      // MM:SS
      return parseInt(parts[0]) * 60 + parseFloat(parts[1]);
    } else {
      // SS
      return parseFloat(timeString);
    }
  }

  /**
   * Converter segundos para string de tempo
   */
  static secondsToTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);

    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
    } else {
      return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
    }
  }

  /**
   * Calcular bitrate baseado na qualidade
   */
  static calculateBitrate(quality, type = 'video') {
    const videoBitrates = {
      '480p': '1500k',
      '720p': '2500k',
      '1080p': '5000k',
      '4k': '20000k'
    };

    const audioBitrates = {
      'low': '128k',
      'medium': '192k',
      'high': '320k'
    };

    if (type === 'video') {
      return videoBitrates[quality] || '2500k';
    } else {
      return audioBitrates[quality] || '192k';
    }
  }

  /**
   * Obter preset de codificação baseado na qualidade
   */
  static getEncodingPreset(quality) {
    const presets = {
      'ultrafast': 'ultrafast',
      'superfast': 'superfast',
      'veryfast': 'veryfast',
      'faster': 'faster',
      'fast': 'fast',
      'medium': 'medium',
      'slow': 'slow',
      'slower': 'slower',
      'veryslow': 'veryslow'
    };

    // Qualidades padrão
    if (quality === '480p') return 'fast';
    if (quality === '720p') return 'medium';
    if (quality === '1080p') return 'medium';
    if (quality === '4k') return 'slow';

    return presets[quality] || 'medium';
  }

  /**
   * Criar filtro complexo para múltiplas operações
   */
  static buildComplexFilter(operations) {
    const filters = [];

    operations.forEach((op, index) => {
      switch (op.type) {
        case 'scale':
          filters.push(`[${index}:v]scale=${op.width}:${op.height}[v${index}]`);
          break;
        case 'overlay':
          filters.push(`[${op.base}][${op.overlay}]overlay=${op.x}:${op.y}[v${index}]`);
          break;
        case 'text':
          filters.push(`drawtext=text='${op.text}':fontsize=${op.fontSize}:x=${op.x}:y=${op.y}[v${index}]`);
          break;
        default:
          break;
      }
    });

    return filters.join(';');
  }

  /**
   * Verificar se codec é suportado
   */
  static async isCodecSupported(codecName) {
    try {
      const codecs = await this.getAvailableCodecs();
      return codecName in codecs;
    } catch (error) {
      return false;
    }
  }

  /**
   * Verificar se formato é suportado
   */
  static async isFormatSupported(formatName) {
    try {
      const formats = await this.getAvailableFormats();
      return formatName in formats;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obter informações completas de um arquivo
   */
  static async getFullMediaInfo(filePath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          const videoStream = metadata.streams.find(s => s.codec_type === 'video');
          const audioStream = metadata.streams.find(s => s.codec_type === 'audio');

          resolve({
            format: metadata.format,
            video: videoStream ? {
              codec: videoStream.codec_name,
              width: videoStream.width,
              height: videoStream.height,
              fps: eval(videoStream.r_frame_rate),
              bitrate: videoStream.bit_rate
            } : null,
            audio: audioStream ? {
              codec: audioStream.codec_name,
              sampleRate: audioStream.sample_rate,
              channels: audioStream.channels,
              bitrate: audioStream.bit_rate
            } : null,
            duration: metadata.format.duration,
            size: metadata.format.size
          });
        }
      });
    });
  }
}

export default FFmpegUtils;
