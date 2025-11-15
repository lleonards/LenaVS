import iconv from 'iconv-lite';

/**
 * Utilitário para corrigir problemas de codificação de texto
 * Garante que acentos e caracteres especiais sejam preservados
 */
class EncodingFixer {
  /**
   * Tentar detectar e corrigir codificação do texto
   */
  static fixEncoding(text) {
    if (!text) return '';

    // Se o texto já está correto (tem acentos visíveis), retornar
    if (this.hasValidAccents(text)) {
      return text;
    }

    // Tentar diferentes codificações
    const encodings = ['utf-8', 'iso-8859-1', 'windows-1252', 'latin1'];
    
    for (const encoding of encodings) {
      try {
        // Converter texto para buffer assumindo codificação errada
        const buffer = Buffer.from(text, 'binary');
        
        // Decodificar com a codificação correta
        const decoded = iconv.decode(buffer, encoding);
        
        // Verificar se a decodificação resultou em acentos válidos
        if (this.hasValidAccents(decoded) && !this.hasMojibake(decoded)) {
          return decoded;
        }
      } catch (error) {
        continue;
      }
    }

    // Se nenhuma codificação funcionou, retornar o texto original
    return text;
  }

  /**
   * Decodificar buffer com tentativa de múltiplas codificações
   */
  static decodeBuffer(buffer) {
    const encodings = ['utf-8', 'iso-8859-1', 'windows-1252', 'latin1', 'utf-16le'];
    
    for (const encoding of encodings) {
      try {
        const decoded = iconv.decode(buffer, encoding);
        
        // Verificar se a decodificação é válida
        if (this.isValidDecoding(decoded)) {
          return decoded;
        }
      } catch (error) {
        continue;
      }
    }

    // Fallback: UTF-8
    return iconv.decode(buffer, 'utf-8');
  }

  /**
   * Verificar se o texto tem acentos válidos (português)
   */
  static hasValidAccents(text) {
    const accentedChars = /[áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ]/;
    return accentedChars.test(text);
  }

  /**
   * Verificar se o texto tem mojibake (caracteres corrompidos)
   */
  static hasMojibake(text) {
    // Padrões comuns de mojibake
    const mojibakePatterns = [
      /Ã[^A-Za-z\s]/g,      // Padrão comum de UTF-8 mal interpretado
      /â€[™¦¢]/g,           // Aspas e símbolos corrompidos
      /Â[°±²³]/g,           // Símbolos especiais corrompidos
      /Ã£/g,                // 'ã' mal codificado
      /Ã§/g,                // 'ç' mal codificado
      /Ã©/g,                // 'é' mal codificado
      /Ã³/g,                // 'ó' mal codificado
    ];

    return mojibakePatterns.some(pattern => pattern.test(text));
  }

  /**
   * Verificar se a decodificação é válida
   */
  static isValidDecoding(text) {
    // Texto não pode ser vazio
    if (!text || text.trim().length === 0) {
      return false;
    }

    // Verificar taxa de caracteres de substituição
    const replacementChars = (text.match(/�/g) || []).length;
    const totalChars = text.length;
    
    if (totalChars === 0) return false;
    
    const replacementRatio = replacementChars / totalChars;
    
    // Menos de 5% de caracteres inválidos
    if (replacementRatio > 0.05) {
      return false;
    }

    // Verificar se tem caracteres de controle inválidos
    const controlChars = (text.match(/[\x00-\x08\x0B-\x0C\x0E-\x1F]/g) || []).length;
    const controlRatio = controlChars / totalChars;
    
    // Menos de 1% de caracteres de controle
    if (controlRatio > 0.01) {
      return false;
    }

    return true;
  }

  /**
   * Converter de ISO-8859-1 para UTF-8
   */
  static iso88591ToUTF8(text) {
    try {
      const buffer = Buffer.from(text, 'binary');
      return iconv.decode(buffer, 'iso-8859-1');
    } catch (error) {
      return text;
    }
  }

  /**
   * Converter de Windows-1252 para UTF-8
   */
  static windows1252ToUTF8(text) {
    try {
      const buffer = Buffer.from(text, 'binary');
      return iconv.decode(buffer, 'windows-1252');
    } catch (error) {
      return text;
    }
  }

  /**
   * Normalizar texto para UTF-8
   */
  static normalizeToUTF8(text) {
    if (!text) return '';

    // Remover BOM se existir
    if (text.charCodeAt(0) === 0xFEFF) {
      text = text.slice(1);
    }

    // Normalizar usando NFC (Canonical Composition)
    text = text.normalize('NFC');

    return text;
  }

  /**
   * Detectar codificação de um buffer
   */
  static detectEncoding(buffer) {
    // Verificar BOM
    if (buffer.length >= 3) {
      if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
        return 'utf-8';
      }
    }

    if (buffer.length >= 2) {
      if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
        return 'utf-16le';
      }
      if (buffer[0] === 0xFE && buffer[1] === 0xFF) {
        return 'utf-16be';
      }
    }

    // Tentar detectar baseado no conteúdo
    const text = buffer.toString('utf-8');
    
    if (this.isValidDecoding(text)) {
      return 'utf-8';
    }

    // Tentar ISO-8859-1
    const iso = iconv.decode(buffer, 'iso-8859-1');
    if (this.hasValidAccents(iso)) {
      return 'iso-8859-1';
    }

    // Tentar Windows-1252
    const win = iconv.decode(buffer, 'windows-1252');
    if (this.hasValidAccents(win)) {
      return 'windows-1252';
    }

    // Default
    return 'utf-8';
  }

  /**
   * Reparar texto com acentos corrompidos
   */
  static repairAccents(text) {
    // Mapeamento de acentos corrompidos comuns
    const repairs = {
      'Ã¡': 'á',
      'Ã ': 'à',
      'Ã¢': 'â',
      'Ã£': 'ã',
      'Ã©': 'é',
      'Ãª': 'ê',
      'Ã­': 'í',
      'Ã³': 'ó',
      'Ã´': 'ô',
      'Ãµ': 'õ',
      'Ãº': 'ú',
      'Ã§': 'ç',
      'Ã': 'Á',
      'Ã‰': 'É',
      'Ã"': 'Ó',
      'Ãš': 'Ú',
      'Ã‡': 'Ç'
    };

    let repaired = text;
    for (const [broken, correct] of Object.entries(repairs)) {
      repaired = repaired.split(broken).join(correct);
    }

    return repaired;
  }

  /**
   * Garantir que o texto está em UTF-8 válido
   */
  static ensureUTF8(text) {
    text = this.fixEncoding(text);
    text = this.normalizeToUTF8(text);
    text = this.repairAccents(text);
    
    return text;
  }

  /**
   * Validar se o texto está corretamente codificado
   */
  static validate(text) {
    const issues = [];

    // Verificar caracteres de substituição
    const replacementChars = (text.match(/�/g) || []).length;
    if (replacementChars > 0) {
      issues.push(`${replacementChars} caracteres com codificação incorreta`);
    }

    // Verificar mojibake
    if (this.hasMojibake(text)) {
      issues.push('Texto contém caracteres corrompidos (mojibake)');
    }

    // Verificar se faltam acentos esperados (em português)
    const words = text.toLowerCase().split(/\s+/);
    const commonWordsWithAccents = ['é', 'à', 'não', 'até', 'já', 'está'];
    const foundAccents = words.some(word => commonWordsWithAccents.includes(word));
    
    if (!foundAccents && !this.hasValidAccents(text)) {
      issues.push('Texto pode estar sem acentuação correta');
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }
}

export default EncodingFixer;
