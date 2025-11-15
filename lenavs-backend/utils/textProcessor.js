/**
 * Utilitários para processamento de texto
 */

class TextProcessor {
  /**
   * Remover BOM (Byte Order Mark) do início do texto
   */
  static removeBOM(text) {
    if (text.charCodeAt(0) === 0xFEFF) {
      return text.slice(1);
    }
    return text;
  }

  /**
   * Normalizar quebras de linha
   */
  static normalizeLineBreaks(text) {
    return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  }

  /**
   * Remover linhas vazias excessivas
   */
  static removeExcessiveEmptyLines(text, maxConsecutive = 2) {
    const regex = new RegExp(`\n{${maxConsecutive + 1},}`, 'g');
    return text.replace(regex, '\n'.repeat(maxConsecutive));
  }

  /**
   * Limpar espaços em branco no início e fim de cada linha
   */
  static trimLines(text) {
    return text
      .split('\n')
      .map(line => line.trim())
      .join('\n');
  }

  /**
   * Remover caracteres de controle inválidos
   */
  static removeControlCharacters(text) {
    // Remove caracteres de controle exceto tab e newline
    return text.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  }

  /**
   * Normalizar espaços (múltiplos espaços -> um espaço)
   */
  static normalizeSpaces(text) {
    return text.replace(/[ \t]+/g, ' ');
  }

  /**
   * Capitalizar primeira letra de cada frase
   */
  static capitalizeSentences(text) {
    return text.replace(/(^\s*\w|[.!?]\s+\w)/g, match => match.toUpperCase());
  }

  /**
   * Contar palavras
   */
  static countWords(text) {
    if (!text) return 0;
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Contar caracteres (sem espaços)
   */
  static countCharactersWithoutSpaces(text) {
    if (!text) return 0;
    return text.replace(/\s/g, '').length;
  }

  /**
   * Contar linhas
   */
  static countLines(text) {
    if (!text) return 0;
    return text.split('\n').filter(line => line.trim().length > 0).length;
  }

  /**
   * Truncar texto
   */
  static truncate(text, maxLength, suffix = '...') {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - suffix.length) + suffix;
  }

  /**
   * Quebrar texto em chunks de tamanho específico
   */
  static chunkText(text, chunkSize, overlap = 0) {
    const words = text.split(/\s+/);
    const chunks = [];
    
    for (let i = 0; i < words.length; i += chunkSize - overlap) {
      const chunk = words.slice(i, i + chunkSize).join(' ');
      if (chunk) {
        chunks.push(chunk);
      }
    }
    
    return chunks;
  }

  /**
   * Extrair hashtags
   */
  static extractHashtags(text) {
    const regex = /#[\wÀ-ÿ]+/g;
    return text.match(regex) || [];
  }

  /**
   * Extrair menções (@usuario)
   */
  static extractMentions(text) {
    const regex = /@[\w]+/g;
    return text.match(regex) || [];
  }

  /**
   * Extrair URLs
   */
  static extractUrls(text) {
    const regex = /https?:\/\/[^\s]+/g;
    return text.match(regex) || [];
  }

  /**
   * Remover acentos
   */
  static removeAccents(text) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Converter para slug (URL-friendly)
   */
  static slugify(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Verificar se texto contém apenas ASCII
   */
  static isASCII(text) {
    return /^[\x00-\x7F]*$/.test(text);
  }

  /**
   * Verificar se texto contém caracteres especiais
   */
  static hasSpecialCharacters(text) {
    return /[áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ]/.test(text);
  }

  /**
   * Escapar HTML
   */
  static escapeHTML(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Unescapar HTML
   */
  static unescapeHTML(text) {
    const map = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#039;': "'"
    };
    return text.replace(/&(amp|lt|gt|quot|#039);/g, m => map[m]);
  }

  /**
   * Comparar similaridade entre dois textos (Levenshtein distance)
   */
  static similarity(text1, text2) {
    const longer = text1.length > text2.length ? text1 : text2;
    const shorter = text1.length > text2.length ? text2 : text1;

    if (longer.length === 0) {
      return 1.0;
    }

    return (longer.length - this.editDistance(longer, shorter)) / longer.length;
  }

  /**
   * Calcular distância de edição (Levenshtein)
   */
  static editDistance(text1, text2) {
    text1 = text1.toLowerCase();
    text2 = text2.toLowerCase();

    const costs = [];
    for (let i = 0; i <= text1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= text2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (text1.charAt(i - 1) !== text2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) {
        costs[text2.length] = lastValue;
      }
    }
    return costs[text2.length];
  }

  /**
   * Processar texto completo (aplicar todas as normalizações)
   */
  static process(text) {
    if (!text) return '';

    text = this.removeBOM(text);
    text = this.normalizeLineBreaks(text);
    text = this.removeControlCharacters(text);
    text = this.normalizeSpaces(text);
    text = this.trimLines(text);
    text = this.removeExcessiveEmptyLines(text);

    return text.trim();
  }

  /**
   * Validar se o texto está bem formatado
   */
  static validate(text) {
    const issues = [];

    if (!text || text.trim().length === 0) {
      issues.push('Texto está vazio');
    }

    // Verificar caracteres de substituição
    const replacementChars = (text.match(/�/g) || []).length;
    if (replacementChars > 0) {
      issues.push(`${replacementChars} caracteres com codificação incorreta`);
    }

    // Verificar linhas muito longas
    const lines = text.split('\n');
    const longLines = lines.filter(line => line.length > 1000);
    if (longLines.length > 0) {
      issues.push(`${longLines.length} linhas muito longas`);
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }
}

export default TextProcessor;
