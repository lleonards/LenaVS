import fs from 'fs/promises';
import path from 'path';

class ProjectManager {
  static projectsDir = './projects';

  /**
   * Criar novo projeto
   */
  static async createProject(projectId, projectData) {
    try {
      const projectPath = path.join(this.projectsDir, `${projectId}.json`);
      const data = JSON.stringify(projectData, null, 2);
      await fs.writeFile(projectPath, data, 'utf-8');
      return true;
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      throw new Error('Falha ao criar projeto');
    }
  }

  /**
   * Obter projeto
   */
  static async getProject(projectId) {
    try {
      const projectPath = path.join(this.projectsDir, `${projectId}.json`);
      const data = await fs.readFile(projectPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null;
      }
      console.error('Erro ao obter projeto:', error);
      throw new Error('Falha ao obter projeto');
    }
  }

  /**
   * Atualizar projeto
   */
  static async updateProject(projectId, projectData) {
    try {
      projectData.updatedAt = new Date().toISOString();
      const projectPath = path.join(this.projectsDir, `${projectId}.json`);
      const data = JSON.stringify(projectData, null, 2);
      await fs.writeFile(projectPath, data, 'utf-8');
      return true;
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error);
      throw new Error('Falha ao atualizar projeto');
    }
  }

  /**
   * Deletar projeto
   */
  static async deleteProject(projectId) {
    try {
      const projectPath = path.join(this.projectsDir, `${projectId}.json`);
      await fs.unlink(projectPath);
      
      // Também tentar deletar arquivos relacionados
      await this.deleteProjectFiles(projectId);
      
      return true;
    } catch (error) {
      console.error('Erro ao deletar projeto:', error);
      throw new Error('Falha ao deletar projeto');
    }
  }

  /**
   * Deletar arquivos relacionados ao projeto
   */
  static async deleteProjectFiles(projectId) {
    try {
      const project = await this.getProject(projectId);
      
      if (!project) return;

      // Lista de arquivos para deletar
      const filesToDelete = [];

      if (project.files?.musicaOriginal?.path) {
        filesToDelete.push(project.files.musicaOriginal.path);
      }

      if (project.files?.playback?.path) {
        filesToDelete.push(project.files.playback.path);
      }

      if (project.files?.background?.path) {
        filesToDelete.push(project.files.background.path);
      }

      // Deletar arquivos
      for (const file of filesToDelete) {
        try {
          await fs.unlink(file);
        } catch (error) {
          console.warn(`Não foi possível deletar arquivo: ${file}`);
        }
      }
    } catch (error) {
      console.error('Erro ao deletar arquivos do projeto:', error);
    }
  }

  /**
   * Listar todos os projetos
   */
  static async listProjects() {
    try {
      const files = await fs.readdir(this.projectsDir);
      const projects = [];

      for (const file of files) {
        if (path.extname(file) === '.json') {
          try {
            const projectPath = path.join(this.projectsDir, file);
            const data = await fs.readFile(projectPath, 'utf-8');
            const project = JSON.parse(data);
            
            // Adicionar apenas informações básicas
            projects.push({
              projectId: project.projectId,
              nomeProjeto: project.nomeProjeto,
              createdAt: project.createdAt,
              updatedAt: project.updatedAt,
              hasAudio: !!(project.files?.musicaOriginal || project.files?.playback),
              hasBackground: !!project.files?.background,
              hasLyrics: !!(project.lyrics?.verses && project.lyrics.verses.length > 0)
            });
          } catch (error) {
            console.warn(`Erro ao ler projeto ${file}:`, error);
          }
        }
      }

      // Ordenar por data de atualização (mais recente primeiro)
      projects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

      return projects;
    } catch (error) {
      console.error('Erro ao listar projetos:', error);
      return [];
    }
  }

  /**
   * Verificar se projeto existe
   */
  static async projectExists(projectId) {
    try {
      const projectPath = path.join(this.projectsDir, `${projectId}.json`);
      await fs.access(projectPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Exportar projeto para JSON
   */
  static async exportProject(projectId) {
    try {
      const project = await this.getProject(projectId);
      
      if (!project) {
        throw new Error('Projeto não encontrado');
      }

      return {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        project
      };
    } catch (error) {
      console.error('Erro ao exportar projeto:', error);
      throw error;
    }
  }

  /**
   * Importar projeto de JSON
   */
  static async importProject(projectData) {
    try {
      if (!projectData.project) {
        throw new Error('Dados de projeto inválidos');
      }

      const project = projectData.project;
      
      // Gerar novo ID se não existir
      if (!project.projectId) {
        const { v4: uuidv4 } = await import('uuid');
        project.projectId = uuidv4();
      }

      // Atualizar timestamps
      project.createdAt = new Date().toISOString();
      project.updatedAt = new Date().toISOString();

      await this.createProject(project.projectId, project);

      return project;
    } catch (error) {
      console.error('Erro ao importar projeto:', error);
      throw error;
    }
  }

  /**
   * Duplicar projeto
   */
  static async duplicateProject(projectId, newName) {
    try {
      const originalProject = await this.getProject(projectId);
      
      if (!originalProject) {
        throw new Error('Projeto original não encontrado');
      }

      const { v4: uuidv4 } = await import('uuid');
      const newProjectId = uuidv4();
      
      const newProject = {
        ...originalProject,
        projectId: newProjectId,
        nomeProjeto: newName || `${originalProject.nomeProjeto} (Cópia)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await this.createProject(newProjectId, newProject);

      return newProject;
    } catch (error) {
      console.error('Erro ao duplicar projeto:', error);
      throw error;
    }
  }

  /**
   * Buscar projetos por nome
   */
  static async searchProjects(query) {
    try {
      const allProjects = await this.listProjects();
      const searchTerm = query.toLowerCase();

      return allProjects.filter(project =>
        project.nomeProjeto.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      return [];
    }
  }

  /**
   * Obter estatísticas gerais
   */
  static async getStatistics() {
    try {
      const projects = await this.listProjects();

      const stats = {
        totalProjects: projects.length,
        withAudio: projects.filter(p => p.hasAudio).length,
        withBackground: projects.filter(p => p.hasBackground).length,
        withLyrics: projects.filter(p => p.hasLyrics).length,
        complete: projects.filter(p => p.hasAudio && p.hasBackground && p.hasLyrics).length
      };

      return stats;
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return null;
    }
  }

  /**
   * Limpar projetos antigos
   */
  static async cleanupOldProjects(daysOld = 30) {
    try {
      const projects = await this.listProjects();
      const now = Date.now();
      const maxAge = daysOld * 24 * 60 * 60 * 1000;
      let removed = 0;

      for (const project of projects) {
        const updatedAt = new Date(project.updatedAt).getTime();
        const age = now - updatedAt;

        if (age > maxAge) {
          await this.deleteProject(project.projectId);
          removed++;
        }
      }

      return {
        removed,
        remaining: projects.length - removed
      };
    } catch (error) {
      console.error('Erro ao limpar projetos antigos:', error);
      return { removed: 0, remaining: 0 };
    }
  }

  /**
   * Fazer backup de projeto
   */
  static async backupProject(projectId) {
    try {
      const project = await this.getProject(projectId);
      
      if (!project) {
        throw new Error('Projeto não encontrado');
      }

      const backupDir = './backups';
      await fs.mkdir(backupDir, { recursive: true });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFilename = `${project.nomeProjeto}_${timestamp}.json`;
      const backupPath = path.join(backupDir, backupFilename);

      const backupData = {
        version: '1.0',
        backedUpAt: new Date().toISOString(),
        project
      };

      await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2), 'utf-8');

      return {
        success: true,
        backupPath,
        backupFilename
      };
    } catch (error) {
      console.error('Erro ao fazer backup:', error);
      throw error;
    }
  }

  /**
   * Restaurar projeto de backup
   */
  static async restoreFromBackup(backupPath) {
    try {
      const data = await fs.readFile(backupPath, 'utf-8');
      const backupData = JSON.parse(data);

      if (!backupData.project) {
        throw new Error('Arquivo de backup inválido');
      }

      return await this.importProject(backupData);
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      throw error;
    }
  }
}

export default ProjectManager;
