class LyricsSyncService {
  /**
   * Converter tempo de mm:ss para segundos
   */
  static parseTime(timeString) {
    if (typeof timeString === 'number') {
      return timeString;
    }

    if (!timeString || timeString === '00:00') {
      return 0;
    }

    const parts = timeString.split(':');
    
    if (parts.length === 2) {
      const minutes = parseInt(parts[0]) || 0;
      const seconds = parseFloat(parts[1]) || 0;
      return minutes * 60 + seconds;
    }

    return 0;
  }

  /**
   * Converter segundos para formato mm:ss
   */
  static formatTime(seconds) {
    if (typeof seconds !== 'number' || isNaN(seconds)) {
      return '00:00';
    }

    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);

    const mm = String(minutes).padStart(2, '0');
    const ss = String(secs).padStart(2, '0');

    // Se tiver milissegundos, incluir
    if (ms > 0) {
      return `${mm}:${ss}.${String(ms).padStart(2, '0')}`;
    }

    return `${mm}:${ss}`;
  }

  /**
   * Validar se o timing está correto (início < fim)
   */
  static validateTiming(startSeconds, endSeconds) {
    return startSeconds < endSeconds;
  }

  /**
   * Obter estrofe ativa em determinado tempo
   */
  static getActiveVerse(verses, currentTime) {
    if (!verses || verses.length === 0) {
      return null;
    }

    for (let i = 0; i < verses.length; i++) {
      const verse = verses[i];
      const start = this.parseTime(verse.timeStart);
      const end = this.parseTime(verse.timeEnd);

      if (currentTime >= start && currentTime <= end) {
        return {
          ...verse,
          index: i,
          startSeconds: start,
          endSeconds: end,
          progress: (currentTime - start) / (end - start)
        };
      }
    }

    return null;
  }

  /**
   * Obter próxima estrofe
   */
  static getNextVerse(verses, currentTime) {
    if (!verses || verses.length === 0) {
      return null;
    }

    for (let i = 0; i < verses.length; i++) {
      const verse = verses[i];
      const start = this.parseTime(verse.timeStart);

      if (start > currentTime) {
        return {
          ...verse,
          index: i,
          startSeconds: start,
          endSeconds: this.parseTime(verse.timeEnd),
          timeUntilStart: start - currentTime
        };
      }
    }

    return null;
  }

  /**
   * Obter estrofe anterior
   */
  static getPreviousVerse(verses, currentTime) {
    if (!verses || verses.length === 0) {
      return null;
    }

    for (let i = verses.length - 1; i >= 0; i--) {
      const verse = verses[i];
      const end = this.parseTime(verse.timeEnd);

      if (end < currentTime) {
        return {
          ...verse,
          index: i,
          startSeconds: this.parseTime(verse.timeStart),
          endSeconds: end
        };
      }
    }

    return null;
  }

  /**
   * Calcular duração de uma estrofe
   */
  static getVerseDuration(verse) {
    const start = this.parseTime(verse.timeStart);
    const end = this.parseTime(verse.timeEnd);
    return end - start;
  }

  /**
   * Calcular duração total de todas as estrofes
   */
  static getTotalDuration(verses) {
    if (!verses || verses.length === 0) {
      return 0;
    }

    let total = 0;
    verses.forEach(verse => {
      total += this.getVerseDuration(verse);
    });

    return total;
  }

  /**
   * Verificar se há sobreposição de tempos
   */
  static checkOverlap(verses) {
    const overlaps = [];

    for (let i = 0; i < verses.length - 1; i++) {
      const current = verses[i];
      const next = verses[i + 1];

      const currentEnd = this.parseTime(current.timeEnd);
      const nextStart = this.parseTime(next.timeStart);

      if (currentEnd > nextStart) {
        overlaps.push({
          verse1Index: i,
          verse2Index: i + 1,
          overlapDuration: currentEnd - nextStart,
          verse1: current,
          verse2: next
        });
      }
    }

    return overlaps;
  }

  /**
   * Verificar se há gaps (espaços vazios) entre estrofes
   */
  static checkGaps(verses, audioDuration) {
    const gaps = [];

    for (let i = 0; i < verses.length - 1; i++) {
      const current = verses[i];
      const next = verses[i + 1];

      const currentEnd = this.parseTime(current.timeEnd);
      const nextStart = this.parseTime(next.timeStart);

      if (nextStart > currentEnd) {
        gaps.push({
          afterVerseIndex: i,
          beforeVerseIndex: i + 1,
          gapDuration: nextStart - currentEnd,
          gapStart: currentEnd,
          gapEnd: nextStart
        });
      }
    }

    // Verificar gap no início
    if (verses.length > 0) {
      const firstStart = this.parseTime(verses[0].timeStart);
      if (firstStart > 0) {
        gaps.unshift({
          type: 'start',
          gapDuration: firstStart,
          gapStart: 0,
          gapEnd: firstStart
        });
      }
    }

    // Verificar gap no final
    if (verses.length > 0 && audioDuration) {
      const lastEnd = this.parseTime(verses[verses.length - 1].timeEnd);
      if (lastEnd < audioDuration) {
        gaps.push({
          type: 'end',
          gapDuration: audioDuration - lastEnd,
          gapStart: lastEnd,
          gapEnd: audioDuration
        });
      }
    }

    return gaps;
  }

  /**
   * Ajustar tempo automaticamente (distribuir uniformemente)
   */
  static autoDistributeTime(verses, totalDuration) {
    if (!verses || verses.length === 0 || !totalDuration) {
      return verses;
    }

    const timePerVerse = totalDuration / verses.length;
    
    return verses.map((verse, index) => {
      const start = index * timePerVerse;
      const end = (index + 1) * timePerVerse;

      return {
        ...verse,
        timeStart: this.formatTime(start),
        timeEnd: this.formatTime(end)
      };
    });
  }

  /**
   * Validar sincronização completa
   */
  static validateSync(verses) {
    const issues = [];

    verses.forEach((verse, index) => {
      // Verificar se tem timing
      const start = this.parseTime(verse.timeStart);
      const end = this.parseTime(verse.timeEnd);

      if (start === 0 && end === 0) {
        issues.push({
          verseIndex: index,
          type: 'no_timing',
          message: 'Estrofe não tem timing definido'
        });
      }

      // Verificar se timing é válido
      if (!this.validateTiming(start, end)) {
        issues.push({
          verseIndex: index,
          type: 'invalid_timing',
          message: 'Tempo inicial deve ser menor que tempo final'
        });
      }
    });

    // Verificar sobreposições
    const overlaps = this.checkOverlap(verses);
    overlaps.forEach(overlap => {
      issues.push({
        verseIndex: overlap.verse1Index,
        type: 'overlap',
        message: `Sobreposição com estrofe ${overlap.verse2Index + 1}`,
        data: overlap
      });
    });

    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Obter porcentagem de progresso da sincronização
   */
  static getSyncProgress(verses) {
    if (!verses || verses.length === 0) {
      return 0;
    }

    const syncedVerses = verses.filter(verse => {
      const start = this.parseTime(verse.timeStart);
      const end = this.parseTime(verse.timeEnd);
      return start !== 0 || end !== 0;
    }).length;

    return Math.round((syncedVerses / verses.length) * 100);
  }

  /**
   * Converter para formato de legenda (SRT)
   */
  static toSRT(verses) {
    let srt = '';

    verses.forEach((verse, index) => {
      const start = this.parseTime(verse.timeStart);
      const end = this.parseTime(verse.timeEnd);

      srt += `${index + 1}\n`;
      srt += `${this.formatSRTTime(start)} --> ${this.formatSRTTime(end)}\n`;
      srt += `${verse.text}\n\n`;
    });

    return srt;
  }

  /**
   * Formatar tempo para SRT (hh:mm:ss,ms)
   */
  static formatSRTTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
  }
}

export default LyricsSyncService;
