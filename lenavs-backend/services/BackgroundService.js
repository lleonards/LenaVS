import ffmpeg from 'fluent-ffmpeg';
import path from 'path';

class BackgroundService {
  /**
   * Processar background (imagem ou vídeo)
   */
  static async processBackground(backgroundPath, audioDuration) {
    const ext = path.extname(backgroundPath).toLowerCase();
    const isVideo = ['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(ext);
    const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext);

    if (isVideo) {
      return await this.processVideoBackground(backgroundPath, audioDuration);
    } else if (isImage) {
      return await this.processImageBackground(backgroundPath, audioDuration);
    } else {
      throw new Error('Formato de background não suportado');
    }
  }

  /**
   * Processar vídeo como background
   */
  static async processVideoBackground(videoPath, audioDuration) {
    try {
      const videoInfo = await this.getVideoInfo(videoPath);
      
      return {
        type: 'video',
        duration: videoInfo.duration,
        resolution: videoInfo.resolution,
        needsLoop: videoInfo.duration < audioDuration,
        needsTrim: videoInfo.duration > audioDuration,
        processed: false,
        originalPath: videoPath
      };
    } catch (error) {
      console.error('Erro ao processar vídeo background:', error);
      throw error;
    }
  }

  /**
   * Processar imagem como background
   */
  static async processImageBackground(imagePath, audioDuration) {
    try {
      const imageInfo = await this.getImageInfo(imagePath);
      
      return {
        type: 'image',
        duration: audioDuration,
        resolution: imageInfo.resolution,
        needsConversion: true,
        processed: false,
        originalPath: imagePath
      };
    } catch (error) {
      console.error('Erro ao processar imagem background:', error);
      throw error;
    }
  }

  /**
   * Obter informações do vídeo
   */
  static async getVideoInfo(videoPath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          console.error('Erro ao obter informações do vídeo:', err);
          reject(new Error('Falha ao processar vídeo'));
          return;
        }

        const videoStream = metadata.streams.find(s => s.codec_type === 'video');
        
        if (!videoStream) {
          reject(new Error('Nenhum stream de vídeo encontrado'));
          return;
        }

        resolve({
          duration: metadata.format.duration,
          format: metadata.format.format_name,
          bitrate: metadata.format.bit_rate,
          codec: videoStream.codec_name,
          width: videoStream.width,
          height: videoStream.height,
          resolution: `${videoStream.width}x${videoStream.height}`,
          fps: eval(videoStream.r_frame_rate),
          size: metadata.format.size
        });
      });
    });
  }

  /**
   * Obter informações da imagem
   */
  static async getImageInfo(imagePath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(imagePath, (err, metadata) => {
        if (err) {
          console.error('Erro ao obter informações da imagem:', err);
          reject(new Error('Falha ao processar imagem'));
          return;
        }

        const videoStream = metadata.streams.find(s => s.codec_type === 'video');
        
        if (!videoStream) {
          reject(new Error('Informações da imagem não encontradas'));
          return;
        }

        resolve({
          width: videoStream.width,
          height: videoStream.height,
          resolution: `${videoStream.width}x${videoStream.height}`,
          format: metadata.format.format_name
        });
      });
    });
  }

  /**
   * Converter imagem para vídeo estático
   */
  static async imageToVideo(imagePath, outputPath, duration, resolution = '1920x1080') {
    return new Promise((resolve, reject) => {
      ffmpeg(imagePath)
        .loop(duration)
        .inputOptions([
          '-framerate 30'
        ])
        .size(resolution)
        .videoCodec('libx264')
        .outputOptions([
          '-pix_fmt yuv420p',
          '-t', duration
        ])
        .on('end', () => {
          resolve({ success: true, outputPath });
        })
        .on('error', (err) => {
          console.error('Erro ao converter imagem para vídeo:', err);
          reject(new Error('Falha ao converter imagem'));
        })
        .save(outputPath);
    });
  }

  /**
   * Fazer loop de vídeo até duração especificada
   */
  static async loopVideo(videoPath, outputPath, targetDuration) {
    return new Promise(async (resolve, reject) => {
      try {
        const videoInfo = await this.getVideoInfo(videoPath);
        const loopCount = Math.ceil(targetDuration / videoInfo.duration);

        const inputs = [];
        for (let i = 0; i < loopCount; i++) {
          inputs.push(videoPath);
        }

        const command = ffmpeg();
        inputs.forEach(input => command.input(input));

        const filterComplex = inputs.map((_, i) => `[${i}:v]`).join('') + 
                              `concat=n=${loopCount}:v=1:a=0[outv]`;

        command
          .complexFilter(filterComplex)
          .outputOptions('-map', '[outv]')
          .duration(targetDuration)
          .videoCodec('libx264')
          .on('end', () => {
            resolve({ success: true, outputPath });
          })
          .on('error', (err) => {
            console.error('Erro ao criar loop de vídeo:', err);
            reject(new Error('Falha ao criar loop de vídeo'));
          })
          .save(outputPath);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Cortar vídeo
   */
  static async trimVideo(videoPath, outputPath, duration) {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .setStartTime(0)
        .setDuration(duration)
        .videoCodec('libx264')
        .on('end', () => {
          resolve({ success: true, outputPath });
        })
        .on('error', (err) => {
          console.error('Erro ao cortar vídeo:', err);
          reject(new Error('Falha ao cortar vídeo'));
        })
        .save(outputPath);
    });
  }

  /**
   * Redimensionar vídeo/imagem
   */
  static async resize(inputPath, outputPath, width, height) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .size(`${width}x${height}`)
        .videoCodec('libx264')
        .on('end', () => {
          resolve({ success: true, outputPath });
        })
        .on('error', (err) => {
          console.error('Erro ao redimensionar:', err);
          reject(new Error('Falha ao redimensionar'));
        })
        .save(outputPath);
    });
  }

  /**
   * Aplicar filtro de escala mantendo aspect ratio
   */
  static async scaleWithAspectRatio(inputPath, outputPath, targetResolution) {
    return new Promise((resolve, reject) => {
      const [width, height] = targetResolution.split('x').map(Number);

      ffmpeg(inputPath)
        .videoFilters(`scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`)
        .videoCodec('libx264')
        .on('end', () => {
          resolve({ success: true, outputPath });
        })
        .on('error', (err) => {
          console.error('Erro ao escalar com aspect ratio:', err);
          reject(new Error('Falha ao escalar'));
        })
        .save(outputPath);
    });
  }

  /**
   * Preparar background para exportação final
   */
  static async prepareForExport(backgroundData, audioDuration, quality, outputPath) {
    try {
      const resolution = this.getResolutionFromQuality(quality);
      
      if (backgroundData.type === 'image') {
        // Converter imagem para vídeo
        return await this.imageToVideo(
          backgroundData.originalPath || backgroundData.path,
          outputPath,
          audioDuration,
          resolution
        );
      } else {
        // Processar vídeo
        const videoInfo = await this.getVideoInfo(backgroundData.originalPath || backgroundData.path);
        
        if (videoInfo.duration < audioDuration) {
          // Loop se vídeo for menor
          const tempPath = `./temp/loop-${Date.now()}.mp4`;
          await this.loopVideo(
            backgroundData.originalPath || backgroundData.path,
            tempPath,
            audioDuration
          );
          return await this.scaleWithAspectRatio(tempPath, outputPath, resolution);
        } else if (videoInfo.duration > audioDuration) {
          // Cortar se vídeo for maior
          const tempPath = `./temp/trim-${Date.now()}.mp4`;
          await this.trimVideo(
            backgroundData.originalPath || backgroundData.path,
            tempPath,
            audioDuration
          );
          return await this.scaleWithAspectRatio(tempPath, outputPath, resolution);
        } else {
          // Apenas redimensionar
          return await this.scaleWithAspectRatio(
            backgroundData.originalPath || backgroundData.path,
            outputPath,
            resolution
          );
        }
      }
    } catch (error) {
      console.error('Erro ao preparar background:', error);
      throw error;
    }
  }

  /**
   * Obter resolução baseada na qualidade
   */
  static getResolutionFromQuality(quality) {
    const resolutions = {
      '480p': '854x480',
      '720p': '1280x720',
      '1080p': '1920x1080',
      '4k': '3840x2160'
    };

    return resolutions[quality] || '1920x1080';
  }

  /**
   * Adicionar blur/desfoque no background
   */
  static async addBlur(inputPath, outputPath, blurStrength = 5) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .videoFilters(`boxblur=${blurStrength}:${blurStrength}`)
        .videoCodec('libx264')
        .on('end', () => {
          resolve({ success: true, outputPath });
        })
        .on('error', (err) => {
          console.error('Erro ao adicionar blur:', err);
          reject(new Error('Falha ao adicionar blur'));
        })
        .save(outputPath);
    });
  }
}

export default BackgroundService;
