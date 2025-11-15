import express from 'express';
import ProjectManager from '../services/ProjectManager.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Criar novo projeto
router.post('/create', async (req, res) => {
  try {
    const { nomeProjeto } = req.body;
    const projectId = uuidv4();

    const project = {
      projectId,
      nomeProjeto: nomeProjeto || 'Projeto Sem Nome',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      files: {},
      lyrics: {
        text: '',
        verses: [],
        source: null
      },
      style: null,
      activeAudioType: 'playback'
    };

    await ProjectManager.createProject(projectId, project);

    res.json({
      success: true,
      message: 'Projeto criado com sucesso',
      data: project
    });

  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Obter projeto completo
router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await ProjectManager.getProject(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    res.json({
      success: true,
      data: project
    });

  } catch (error) {
    console.error('Erro ao obter projeto:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Listar todos os projetos
router.get('/', async (req, res) => {
  try {
    const projects = await ProjectManager.listProjects();

    res.json({
      success: true,
      data: {
        projects,
        total: projects.length
      }
    });

  } catch (error) {
    console.error('Erro ao listar projetos:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Atualizar nome do projeto
router.put('/:projectId/name', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { nomeProjeto } = req.body;

    if (!nomeProjeto || nomeProjeto.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Nome do projeto não pode estar vazio'
      });
    }

    const project = await ProjectManager.getProject(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    project.nomeProjeto = nomeProjeto.trim();
    project.updatedAt = new Date().toISOString();

    await ProjectManager.updateProject(projectId, project);

    res.json({
      success: true,
      message: 'Nome do projeto atualizado',
      data: {
        projectId,
        nomeProjeto: project.nomeProjeto
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar nome:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Duplicar projeto
router.post('/:projectId/duplicate', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { nomeProjeto } = req.body;

    const originalProject = await ProjectManager.getProject(projectId);

    if (!originalProject) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    const newProjectId = uuidv4();
    const newProject = {
      ...originalProject,
      projectId: newProjectId,
      nomeProjeto: nomeProjeto || `${originalProject.nomeProjeto} (Cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await ProjectManager.createProject(newProjectId, newProject);

    res.json({
      success: true,
      message: 'Projeto duplicado com sucesso',
      data: newProject
    });

  } catch (error) {
    console.error('Erro ao duplicar projeto:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Deletar projeto
router.delete('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await ProjectManager.getProject(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    await ProjectManager.deleteProject(projectId);

    res.json({
      success: true,
      message: 'Projeto deletado com sucesso',
      data: {
        projectId,
        nomeProjeto: project.nomeProjeto
      }
    });

  } catch (error) {
    console.error('Erro ao deletar projeto:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Obter status do projeto
router.get('/:projectId/status', async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await ProjectManager.getProject(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    const status = {
      projectId,
      nomeProjeto: project.nomeProjeto,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      progress: {
        panel1: {
          name: 'Upload de Arquivos',
          completed: !!(project.files?.musicaOriginal || project.files?.playback) &&
                      !!project.files?.background &&
                      !!(project.lyrics?.verses && project.lyrics.verses.length > 0)
        },
        panel2: {
          name: 'Editor de Letras',
          completed: !!(project.lyrics?.verses && project.lyrics.verses.length > 0 &&
                       project.lyrics.verses.every(v => v.timeStart && v.timeEnd))
        },
        panel3: {
          name: 'Preview',
          completed: true // Preview sempre disponível
        },
        panel4: {
          name: 'Estilo do Texto',
          completed: !!project.style
        },
        panel5: {
          name: 'Exportar Vídeo',
          completed: !!(project.files?.playback &&
                       project.files?.background &&
                       project.lyrics?.verses &&
                       project.lyrics.verses.length > 0 &&
                       project.lyrics.verses.every(v => v.timeStart && v.timeEnd))
        }
      },
      files: {
        hasMusicaOriginal: !!project.files?.musicaOriginal,
        hasPlayback: !!project.files?.playback,
        hasBackground: !!project.files?.background
      },
      lyrics: {
        hasLyrics: !!(project.lyrics?.verses && project.lyrics.verses.length > 0),
        totalVerses: project.lyrics?.verses?.length || 0,
        allVersesSynced: !!(project.lyrics?.verses && 
                           project.lyrics.verses.length > 0 &&
                           project.lyrics.verses.every(v => v.timeStart !== '00:00' || v.timeEnd !== '00:00'))
      },
      style: {
        hasStyle: !!project.style
      }
    };

    // Calcular progresso geral
    const panels = Object.values(status.progress);
    const completedPanels = panels.filter(p => p.completed).length;
    status.overallProgress = Math.round((completedPanels / panels.length) * 100);

    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('Erro ao obter status:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Exportar dados do projeto (JSON)
router.get('/:projectId/export-data', async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await ProjectManager.getProject(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${project.nomeProjeto}.json"`);
    res.send(JSON.stringify(project, null, 2));

  } catch (error) {
    console.error('Erro ao exportar dados:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Importar dados de projeto
router.post('/import-data', async (req, res) => {
  try {
    const projectData = req.body;

    if (!projectData || !projectData.nomeProjeto) {
      return res.status(400).json({
        success: false,
        message: 'Dados do projeto inválidos'
      });
    }

    const newProjectId = uuidv4();
    const project = {
      ...projectData,
      projectId: newProjectId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await ProjectManager.createProject(newProjectId, project);

    res.json({
      success: true,
      message: 'Projeto importado com sucesso',
      data: project
    });

  } catch (error) {
    console.error('Erro ao importar projeto:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Buscar projetos
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetro de busca "q" é obrigatório'
      });
    }

    const allProjects = await ProjectManager.listProjects();
    const searchTerm = q.toLowerCase();

    const results = allProjects.filter(project =>
      project.nomeProjeto.toLowerCase().includes(searchTerm)
    );

    res.json({
      success: true,
      data: {
        projects: results,
        total: results.length,
        searchTerm: q
      }
    });

  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
