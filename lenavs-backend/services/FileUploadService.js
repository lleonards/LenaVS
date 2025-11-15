import fs from 'fs/promises';
import path from 'path';

class FileUploadService {
  /**
   * Salvar projeto no sistema de arquivos
   */
  static async saveProject(projectId, projectData) {
    try {
      const projectPath = `./projects/${projectId}.json`;
      const data = JSON.stringify(projectData, null, 2);
      await fs.writeFile(projectPath, data, 'utf-8');
      return true;
    } catch (error) {
      console.error('Erro ao salvar projeto:', error);
      throw new Error('Falha ao salvar projeto');
    }
  }

  /**
   * Carregar projeto do sistema de arquivos
   */
  static async loadProject(projectId) {
    try {
      const projectPath = `./projects/${projectId}.json`;
      const data = await fs.readFile(projectPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null;
      }
      console.error('Erro ao carregar projeto:', error);
      throw new Error('Falha ao carregar projeto');
    }
  }

  /**
   * Validar tipo de arquivo
   */
  static validateFileType(filename, allowedExtensions) {
    const ext = path.extname(filename).toLowerCase();
    return allowedExtensions.includes(ext);
  }

  /**
   * Gerar nome único para arquivo
   */
  static generateUniqueFilename(originalName) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const ext = path.extname(originalName);
    const name = path.basename(originalName, ext);
    return `${name}-${timestamp}-${random}${ext}`;
  }

  /**
   * Verificar se arquivo existe
   */
  static async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Deletar arquivo
   */
  static async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      return false;
    }
  }

  /**
   * Obter informações do arquivo
   */
  static async getFileInfo(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory()
      };
    } catch (error) {
      console.error('Erro ao obter informações do arquivo:', error);
      return null;
    }
  }

  /**
   * Limpar arquivos temporários antigos
   */
  static async cleanupOldFiles(directory, maxAgeInDays = 7) {
    try {
      const files = await fs.readdir(directory);
      const now = Date.now();
      const maxAge = maxAgeInDays * 24 * 60 * 60 * 1000;

      for (const file of files) {
        const filePath = path.join(directory, file);
        const stats = await fs.stat(filePath);
        const age = now - stats.mtime.getTime();

        if (age > maxAge) {
          await fs.unlink(filePath);
          console.log(`Arquivo antigo removido: ${file}`);
        }
      }
    } catch (error) {
      console.error('Erro ao limpar arquivos antigos:', error);
    }
  }

  /**
   * Copiar arquivo
   */
  static async copyFile(source, destination) {
    try {
      await fs.copyFile(source, destination);
      return true;
    } catch (error) {
      console.error('Erro ao copiar arquivo:', error);
      return false;
    }
  }

  /**
   * Mover arquivo
   */
  static async moveFile(source, destination) {
    try {
      await fs.rename(source, destination);
      return true;
    } catch (error) {
      console.error('Erro ao mover arquivo:', error);
      return false;
    }
  }

  /**
   * Listar arquivos em diretório
   */
  static async listFiles(directory, extension = null) {
    try {
      const files = await fs.readdir(directory);
      
      if (extension) {
        return files.filter(file => 
          path.extname(file).toLowerCase() === extension.toLowerCase()
        );
      }
      
      return files;
    } catch (error) {
      console.error('Erro ao listar arquivos:', error);
      return [];
    }
  }

  /**
   * Calcular tamanho de diretório
   */
  static async getDirectorySize(directory) {
    try {
      const files = await fs.readdir(directory);
      let totalSize = 0;

      for (const file of files) {
        const filePath = path.join(directory, file);
        const stats = await fs.stat(filePath);
        
        if (stats.isFile()) {
          totalSize += stats.size;
        } else if (stats.isDirectory()) {
          totalSize += await this.getDirectorySize(filePath);
        }
      }

      return totalSize;
    } catch (error) {
      console.error('Erro ao calcular tamanho do diretório:', error);
      return 0;
    }
  }

  /**
   * Formatar tamanho de arquivo
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

export default FileUploadService;
