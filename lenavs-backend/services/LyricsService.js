import fs from 'fs/promises';
import path from 'path';
import pdfProcessor from '../utils/pdfProcessor.js';
import docxProcessor from '../utils/docxProcessor.js';
import encodingFixer from '../utils/encodingFixer.js';

class LyricsService {
  /**
   * Extrair texto de letra de arquivo (TXT, DOCX, PDF)
   */
  static async extractLyrics(filePath) {
    const ext = path.extname(filePath).toLowerCase();

    try {
      let text = '';

      switch (ext) {
        case '.txt':
          text = await this.extractFromTxt(filePath);
          break;
        case '.docx':
          text = await docxProcessor.extractText(filePath);
          break;
        case '.pdf':
          text = await pdfProcessor.extractText(filePath);
          break;
        default:
          throw new Error('Formato de arquivo não suportado');
      }

      // Garantir codificação correta
      text = encodingFixer.fixEncoding(text);

      return text.trim();
    } catch (error) {
      console.error('Erro ao extrair letra:', error);
      throw new Error(`Falha ao extrair letra: ${error.message}`);
    }
  }

  /**
   * Extrair texto de arquivo TXT com suporte a múltiplas codificações
   */
  static async extractFromTxt(filePath) {
    try {
      // Tentar UTF-8 primeiro
      try {
        const text = await fs.readFile(filePath, 'utf-8');
        if (this.hasValidCharacters(text)) {
          return text;
        }
      } catch (error) {
        // Se UTF-8 falhar, tentar outras codificações
      }

      // Tentar outras codificações
      const buffer = await fs.readFile(filePath);
      return encodingFixer.decodeBuffer(buffer);
    } catch (error) {
      console.error('Erro ao ler arquivo TXT:', error);
      throw error;
    }
  }

  /**
   * Verificar se o texto tem caracteres válidos
   */
  static hasValidCharacters(text) {
    // Verificar se não há muitos caracteres de substituição (�)
    const replacementChars = (text.match(/�/g) || []).length;
    const totalChars = text.length;
    
    if (totalChars === 0) return false;
    
    const replacementRatio = replacementChars / totalChars;
    return replacementRatio < 0.1; // Menos de 10% de caracteres inválidos
  }

  /**
   * Dividir letra em estrofes (separadas por linhas em branco)
   */
  static splitIntoVerses(text) {
    if (!text || text.trim() === '') {
      return [];
    }

    // Normalizar quebras de linha
    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Dividir por linhas duplas (estrofes)
    const verses = text
      .split(/\n\s*\n/)
      .map(verse => verse.trim())
      .filter(verse => verse.length > 0)
      .map(verse => ({
        text: verse,
        timeStart: '00:00',
        timeEnd: '00:00'
      }));

    return verses;
  }

  /**
   * Unir estrofes em texto único
   */
  static joinVerses(verses) {
    return verses
      .map(verse => verse.text)
      .join('\n\n');
  }

  /**
   * Validar estrutura de estrofe
   */
  static validateVerse(verse) {
    const errors = [];

    if (!verse.text || verse.text.trim() === '') {
      errors.push('Texto da estrofe não pode estar vazio');
    }

    if (!verse.timeStart) {
      errors.push('Tempo inicial é obrigatório');
    }

    if (!verse.timeEnd) {
      errors.push('Tempo final é obrigatório');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Normalizar texto (remover espaços extras, etc)
   */
  static normalizeText(text) {
    return text
      .replace(/\s+/g, ' ') // Múltiplos espaços -> um espaço
      .replace(/\n\s+/g, '\n') // Espaços no início de linha
      .replace(/\s+\n/g, '\n') // Espaços no fim de linha
      .replace(/\n{3,}/g, '\n\n') // Múltiplas linhas vazias -> duas linhas
      .trim();
  }

  /**
   * Contar palavras na letra
   */
  static countWords(text) {
    if (!text) return 0;
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Contar linhas na letra
   */
  static countLines(text) {
    if (!text) return 0;
    return text.split('\n').filter(line => line.trim().length > 0).length;
  }

  /**
   * Obter estatísticas da letra
   */
  static getStatistics(lyrics) {
    const text = lyrics.text || '';
    const verses = lyrics.verses || [];

    return {
      totalVerses: verses.length,
      totalWords: this.countWords(text),
      totalLines: this.countLines(text),
      totalCharacters: text.length,
      averageWordsPerVerse: verses.length > 0 
        ? Math.round(this.countWords(text) / verses.length)
        : 0,
      syncedVerses: verses.filter(v => v.timeStart !== '00:00' || v.timeEnd !== '00:00').length
    };
  }

  /**
   * Buscar palavra ou frase na letra
   */
  static searchInLyrics(text, query) {
    if (!text || !query) return [];

    const lines = text.split('\n');
    const results = [];
    const lowerQuery = query.toLowerCase();

    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(lowerQuery)) {
        results.push({
          lineNumber: index + 1,
          line: line.trim(),
          matchIndex: line.toLowerCase().indexOf(lowerQuery)
        });
      }
    });

    return results;
  }

  /**
   * Remover acentos (se necessário para processamento)
   */
  static removeAccents(text) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Validar se texto contém acentos preservados
   */
  static hasPreservedAccents(text) {
    const accentedChars = /[áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ]/;
    return accentedChars.test(text);
  }

  /**
   * Formatar letra para exibição
   */
  static formatForDisplay(verse) {
    return {
      text: verse.text,
      timeStart: verse.timeStart,
      timeEnd: verse.timeEnd,
      displayText: verse.text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n')
    };
  }

  /**
   * Quebrar estrofe em linhas individuais
   */
  static splitVerseIntoLines(verse) {
    return verse.text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }

  /**
   * Mesclar linhas em estrofe
   */
  static mergeLinesToVerse(lines) {
    return lines.join('\n');
  }
}

export default LyricsService;
