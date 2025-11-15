import ffmpeg from 'fluent-ffmpeg';
import { promisify } from 'util';

class AudioService {
  /**
   * Obter informações do áudio usando FFprobe
   */
  static async getAudioInfo(audioPath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(audioPath, (err, metadata) => {
        if (err) {
          console.error('Erro ao obter informações do áudio:', err);
          reject(new Error('Falha ao processar áudio'));
          return;
        }

        const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
        
        if (!audioStream) {
          reject(new Error('Nenhum stream de áudio encontrado'));
          return;
        }

        resolve({
          duration: metadata.format.duration,
          format: metadata.format.format_name,
          bitrate: metadata.format.bit_rate,
          codec: audioStream.codec_name,
          sampleRate: audioStream.sample_rate,
          channels: audioStream.channels,
          size: metadata.format.size
        });
      });
    });
  }

  /**
   * Converter áudio para formato específico
   */
  static async convertAudio(inputPath, outputPath, format = 'mp3') {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .toFormat(format)
        .on('end', () => {
          resolve({ success: true, outputPath });
        })
        .on('error', (err) => {
          console.error('Erro ao converter áudio:', err);
          reject(new Error('Falha ao converter áudio'));
        })
        .save(outputPath);
    });
  }

  /**
   * Normalizar volume do áudio
   */
  static async normalizeAudio(inputPath, outputPath, targetVolume = -20) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .audioFilters(`volume=${targetVolume}dB`)
        .on('end', () => {
          resolve({ success: true, outputPath });
        })
        .on('error', (err) => {
          console.error('Erro ao normalizar áudio:', err);
          reject(new Error('Falha ao normalizar áudio'));
        })
        .save(outputPath);
    });
  }

  /**
   * Cortar áudio (trim)
   */
  static async trimAudio(inputPath, outputPath, startTime, endTime) {
    return new Promise((resolve, reject) => {
      const command = ffmpeg(inputPath)
        .setStartTime(startTime);

      if (endTime) {
        command.setDuration(endTime - startTime);
      }

      command
        .on('end', () => {
          resolve({ success: true, outputPath });
        })
        .on('error', (err) => {
          console.error('Erro ao cortar áudio:', err);
          reject(new Error('Falha ao cortar áudio'));
        })
        .save(outputPath);
    });
  }

  /**
   * Mesclar múltiplos áudios
   */
  static async mergeAudios(audioPaths, outputPath) {
    return new Promise((resolve, reject) => {
      const command = ffmpeg();

      audioPaths.forEach(audioPath => {
        command.input(audioPath);
      });

      command
        .on('end', () => {
          resolve({ success: true, outputPath });
        })
        .on('error', (err) => {
          console.error('Erro ao mesclar áudios:', err);
          reject(new Error('Falha ao mesclar áudios'));
        })
        .mergeToFile(outputPath);
    });
  }

  /**
   * Extrair áudio de vídeo
   */
  static async extractAudioFromVideo(videoPath, outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .noVideo()
        .audioCodec('libmp3lame')
        .audioBitrate('320k')
        .on('end', () => {
          resolve({ success: true, outputPath });
        })
        .on('error', (err) => {
          console.error('Erro ao extrair áudio:', err);
          reject(new Error('Falha ao extrair áudio'));
        })
        .save(outputPath);
    });
  }

  /**
   * Ajustar velocidade do áudio
   */
  static async changeAudioSpeed(inputPath, outputPath, speed = 1.0) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .audioFilters(`atempo=${speed}`)
        .on('end', () => {
          resolve({ success: true, outputPath });
        })
        .on('error', (err) => {
          console.error('Erro ao ajustar velocidade:', err);
          reject(new Error('Falha ao ajustar velocidade do áudio'));
        })
        .save(outputPath);
    });
  }

  /**
   * Aplicar fade in/out
   */
  static async applyFade(inputPath, outputPath, fadeInDuration = 2, fadeOutDuration = 2) {
    return new Promise(async (resolve, reject) => {
      try {
        const info = await this.getAudioInfo(inputPath);
        const duration = info.duration;

        ffmpeg(inputPath)
          .audioFilters([
            `afade=t=in:st=0:d=${fadeInDuration}`,
            `afade=t=out:st=${duration - fadeOutDuration}:d=${fadeOutDuration}`
          ])
          .on('end', () => {
            resolve({ success: true, outputPath });
          })
          .on('error', (err) => {
            console.error('Erro ao aplicar fade:', err);
            reject(new Error('Falha ao aplicar fade'));
          })
          .save(outputPath);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Criar loop de áudio até duração específica
   */
  static async loopAudio(inputPath, outputPath, targetDuration) {
    return new Promise(async (resolve, reject) => {
      try {
        const info = await this.getAudioInfo(inputPath);
        const loopCount = Math.ceil(targetDuration / info.duration);

        const inputs = [];
        for (let i = 0; i < loopCount; i++) {
          inputs.push(inputPath);
        }

        const command = ffmpeg();
        inputs.forEach(input => command.input(input));

        command
          .complexFilter(`concat=n=${loopCount}:v=0:a=1[out]`)
          .outputOptions('-map', '[out]')
          .duration(targetDuration)
          .on('end', () => {
            resolve({ success: true, outputPath });
          })
          .on('error', (err) => {
            console.error('Erro ao criar loop:', err);
            reject(new Error('Falha ao criar loop de áudio'));
          })
          .save(outputPath);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Obter waveform (forma de onda) do áudio
   */
  static async getWaveform(audioPath, outputImagePath, width = 1920, height = 200) {
    return new Promise((resolve, reject) => {
      ffmpeg(audioPath)
        .complexFilter([
          `showwavespic=s=${width}x${height}:colors=0x00FF00`
        ])
        .frames(1)
        .on('end', () => {
          resolve({ success: true, outputPath: outputImagePath });
        })
        .on('error', (err) => {
          console.error('Erro ao gerar waveform:', err);
          reject(new Error('Falha ao gerar waveform'));
        })
        .save(outputImagePath);
    });
  }

  /**
   * Detectar silêncios no áudio
   */
  static async detectSilences(audioPath, silenceThreshold = -50, minDuration = 1) {
    return new Promise((resolve, reject) => {
      const silences = [];
      
      ffmpeg(audioPath)
        .audioFilters(`silencedetect=n=${silenceThreshold}dB:d=${minDuration}`)
        .on('stderr', (stderrLine) => {
          // Parsear informações de silêncio do stderr
          const silenceStartMatch = stderrLine.match(/silence_start: ([\d.]+)/);
          const silenceEndMatch = stderrLine.match(/silence_end: ([\d.]+)/);
          
          if (silenceStartMatch) {
            silences.push({ start: parseFloat(silenceStartMatch[1]) });
          }
          if (silenceEndMatch && silences.length > 0) {
            silences[silences.length - 1].end = parseFloat(silenceEndMatch[1]);
          }
        })
        .on('end', () => {
          resolve({ success: true, silences });
        })
        .on('error', (err) => {
          console.error('Erro ao detectar silêncios:', err);
          reject(new Error('Falha ao detectar silêncios'));
        })
        .format('null')
        .output('-')
        .run();
    });
  }

  /**
   * Formatar duração em formato legível
   */
  static formatDuration(seconds) {
    if (!seconds || isNaN(seconds)) return '00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
}

export default AudioService;
