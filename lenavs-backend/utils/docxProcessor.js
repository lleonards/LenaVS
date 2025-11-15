import mammoth from 'mammoth';
import fs from 'fs/promises';
import encodingFixer from './encodingFixer.js';

/**
 * Processador de arquivos DOCX
 */
class DOCXProcessor {
  /**
   * Extrair texto de DOCX
   */
  static async extractText(docxPath) {
    try {
      const buffer = await fs.readFile(docxPath);
      const result = await mammoth.extractRawText({ buffer });

      let text = result.value;

      // Garantir codificação correta
      text = encodingFixer.fixEncoding(text);

      // Normalizar quebras de linha
      text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

      // Remover linhas vazias excessivas
      text = text.replace(/\n{3,}/g, '\n\n');

      return text.trim();
    } catch (error) {
      console.error('Erro ao extrair texto do DOCX:', error);
      throw new Error(`Falha ao processar DOCX: ${error.message}`);
    }
  }

  /**
   * Extrair texto com formatação (HTML)
   */
  static async extractHTML(docxPath) {
    try {
      const buffer = await fs.readFile(docxPath);
      const result = await mammoth.convertToHtml({ buffer });

      return {
        html: result.value,
        messages: result.messages
      };
    } catch (error) {
      console.error('Erro ao extrair HTML do DOCX:', error);
      throw error;
    }
  }

  /**
   * Extrair texto com metadados
   */
  static async extractWithMetadata(docxPath) {
    try {
      const buffer = await fs.readFile(docxPath);
      
      const textResult = await mammoth.extractRawText({ buffer });
      const htmlResult = await mammoth.convertToHtml({ buffer });

      const text = encodingFixer.fixEncoding(textResult.value);

      return {
        text: text.trim(),
        html: htmlResult.value,
        messages: textResult.messages,
        warnings: textResult.messages.filter(m => m.type === 'warning'),
        errors: textResult.messages.filter(m => m.type === 'error')
      };
    } catch (error) {
      console.error('Erro ao extrair metadados:', error);
      throw error;
    }
  }

  /**
   * Validar se arquivo é um DOCX válido
   */
  static async validate(docxPath) {
    try {
      const buffer = await fs.readFile(docxPath);
      
      // Verificar magic bytes do ZIP (DOCX é um arquivo ZIP)
      const header = buffer.toString('hex', 0, 4);
      if (header !== '504b0304') { // PK.. (ZIP header)
        return {
          valid: false,
          error: 'Arquivo não é um DOCX válido'
        };
      }

      // Tentar extrair texto para validação completa
      await this.extractText(docxPath);

      return {
        valid: true
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  /**
   * Contar palavras no DOCX
   */
  static async countWords(docxPath) {
    try {
      const text = await this.extractText(docxPath);
      return text.split(/\s+/).filter(word => word.length > 0).length;
    } catch (error) {
      console.error('Erro ao contar palavras:', error);
      return 0;
    }
  }

  /**
   * Buscar palavra ou frase no DOCX
   */
  static async search(docxPath, query) {
    try {
      const text = await this.extractText(docxPath);
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
    } catch (error) {
      console.error('Erro ao buscar no DOCX:', error);
      return [];
    }
  }

  /**
   * Extrair estilos do documento
   */
  static async extractStyles(docxPath) {
    try {
      const buffer = await fs.readFile(docxPath);
      const result = await mammoth.convertToHtml({
        buffer,
        includeDefaultStyleMap: true
      });

      // Analisar o HTML para extrair estilos
      const styles = new Set();
      const styleRegex = /<(\w+)[^>]*class="([^"]+)"/g;
      let match;

      while ((match = styleRegex.exec(result.value)) !== null) {
        styles.add(match[2]);
      }

      return Array.from(styles);
    } catch (error) {
      console.error('Erro ao extrair estilos:', error);
      return [];
    }
  }

  /**
   * Extrair imagens do DOCX
   */
  static async extractImages(docxPath) {
    try {
      const buffer = await fs.readFile(docxPath);
      const images = [];

      const result = await mammoth.convertToHtml({
        buffer,
        convertImage: mammoth.images.imgElement((image) => {
          return image.read("base64").then((imageBuffer) => {
            images.push({
              contentType: image.contentType,
              data: imageBuffer
            });
            return {
              src: `data:${image.contentType};base64,${imageBuffer}`
            };
          });
        })
      });

      return {
        images,
        html: result.value
      };
    } catch (error) {
      console.error('Erro ao extrair imagens:', error);
      return { images: [], html: '' };
    }
  }

  /**
   * Obter estatísticas do documento
   */
  static async getStatistics(docxPath) {
    try {
      const text = await this.extractText(docxPath);
      
      const words = text.split(/\s+/).filter(word => word.length > 0);
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);

      return {
        characters: text.length,
        charactersWithoutSpaces: text.replace(/\s/g, '').length,
        words: words.length,
        lines: lines.length,
        paragraphs: paragraphs.length,
        averageWordLength: words.length > 0 
          ? (words.reduce((sum, word) => sum + word.length, 0) / words.length).toFixed(2)
          : 0
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return null;
    }
  }
}

export default DOCXProcessor;
