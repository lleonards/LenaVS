import pdf from 'pdf-parse';
import fs from 'fs/promises';
import encodingFixer from './encodingFixer.js';

/**
 * Processador de arquivos PDF
 */
class PDFProcessor {
  /**
   * Extrair texto de PDF
   */
  static async extractText(pdfPath) {
    try {
      const dataBuffer = await fs.readFile(pdfPath);
      const data = await pdf(dataBuffer);

      let text = data.text;

      // Garantir codificação correta
      text = encodingFixer.fixEncoding(text);

      // Normalizar quebras de linha
      text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

      // Remover linhas vazias excessivas
      text = text.replace(/\n{3,}/g, '\n\n');

      return text.trim();
    } catch (error) {
      console.error('Erro ao extrair texto do PDF:', error);
      throw new Error(`Falha ao processar PDF: ${error.message}`);
    }
  }

  /**
   * Obter metadados do PDF
   */
  static async getMetadata(pdfPath) {
    try {
      const dataBuffer = await fs.readFile(pdfPath);
      const data = await pdf(dataBuffer);

      return {
        totalPages: data.numpages,
        info: data.info || {},
        metadata: data.metadata || {},
        version: data.version || 'unknown'
      };
    } catch (error) {
      console.error('Erro ao obter metadados do PDF:', error);
      return null;
    }
  }

  /**
   * Extrair texto de página específica
   */
  static async extractPageText(pdfPath, pageNumber) {
    try {
      const dataBuffer = await fs.readFile(pdfPath);
      const data = await pdf(dataBuffer, {
        pagerender: (pageData) => {
          if (pageData.pageIndex + 1 === pageNumber) {
            return pageData.getTextContent().then((textContent) => {
              return textContent.items.map(item => item.str).join(' ');
            });
          }
          return '';
        }
      });

      return data.text;
    } catch (error) {
      console.error(`Erro ao extrair texto da página ${pageNumber}:`, error);
      throw error;
    }
  }

  /**
   * Validar se arquivo é um PDF válido
   */
  static async validate(pdfPath) {
    try {
      const buffer = await fs.readFile(pdfPath);
      
      // Verificar magic bytes do PDF
      const header = buffer.toString('utf-8', 0, 5);
      if (!header.startsWith('%PDF-')) {
        return {
          valid: false,
          error: 'Arquivo não é um PDF válido'
        };
      }

      // Tentar extrair texto para validação completa
      await this.extractText(pdfPath);

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
   * Contar palavras no PDF
   */
  static async countWords(pdfPath) {
    try {
      const text = await this.extractText(pdfPath);
      return text.split(/\s+/).filter(word => word.length > 0).length;
    } catch (error) {
      console.error('Erro ao contar palavras:', error);
      return 0;
    }
  }

  /**
   * Buscar palavra ou frase no PDF
   */
  static async search(pdfPath, query) {
    try {
      const text = await this.extractText(pdfPath);
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
      console.error('Erro ao buscar no PDF:', error);
      return [];
    }
  }
}

export default PDFProcessor;
