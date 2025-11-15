import express from 'express';
import StyleService from '../services/StyleService.js';
import ProjectManager from '../services/ProjectManager.js';

const router = express.Router();

// Obter estilo atual do projeto
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

    const style = project.style || StyleService.getDefaultStyle();

    res.json({
      success: true,
      data: style
    });

  } catch (error) {
    console.error('Erro ao obter estilo:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Atualizar estilo do projeto
router.put('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const styleData = req.body;

    // Validar dados de estilo
    const validation = StyleService.validateStyle(styleData);
    
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Dados de estilo inválidos',
        errors: validation.errors
      });
    }

    const project = await ProjectManager.getProject(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    // Mesclar com estilo existente
    project.style = {
      ...project.style,
      ...styleData
    };

    await ProjectManager.updateProject(projectId, project);

    res.json({
      success: true,
      message: 'Estilo atualizado com sucesso',
      data: project.style
    });

  } catch (error) {
    console.error('Erro ao atualizar estilo:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Atualizar apenas fonte
router.put('/:projectId/font', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { fontFamily, fontSize } = req.body;

    const project = await ProjectManager.getProject(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    if (!project.style) {
      project.style = StyleService.getDefaultStyle();
    }

    if (fontFamily) project.style.fontFamily = fontFamily;
    if (fontSize) project.style.fontSize = parseInt(fontSize);

    await ProjectManager.updateProject(projectId, project);

    res.json({
      success: true,
      message: 'Fonte atualizada com sucesso',
      data: {
        fontFamily: project.style.fontFamily,
        fontSize: project.style.fontSize
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar fonte:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Atualizar cores
router.put('/:projectId/colors', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { textColor, outlineColor } = req.body;

    const project = await ProjectManager.getProject(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    if (!project.style) {
      project.style = StyleService.getDefaultStyle();
    }

    if (textColor) {
      if (!StyleService.isValidColor(textColor)) {
        return res.status(400).json({
          success: false,
          message: 'Cor de texto inválida'
        });
      }
      project.style.textColor = textColor;
    }

    if (outlineColor) {
      if (!StyleService.isValidColor(outlineColor)) {
        return res.status(400).json({
          success: false,
          message: 'Cor de contorno inválida'
        });
      }
      project.style.outlineColor = outlineColor;
    }

    await ProjectManager.updateProject(projectId, project);

    res.json({
      success: true,
      message: 'Cores atualizadas com sucesso',
      data: {
        textColor: project.style.textColor,
        outlineColor: project.style.outlineColor
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar cores:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Atualizar formatação (negrito, itálico, sublinhado)
router.put('/:projectId/formatting', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { bold, italic, underline } = req.body;

    const project = await ProjectManager.getProject(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    if (!project.style) {
      project.style = StyleService.getDefaultStyle();
    }

    if (bold !== undefined) project.style.bold = Boolean(bold);
    if (italic !== undefined) project.style.italic = Boolean(italic);
    if (underline !== undefined) project.style.underline = Boolean(underline);

    await ProjectManager.updateProject(projectId, project);

    res.json({
      success: true,
      message: 'Formatação atualizada com sucesso',
      data: {
        bold: project.style.bold,
        italic: project.style.italic,
        underline: project.style.underline
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar formatação:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Atualizar alinhamento
router.put('/:projectId/alignment', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { alignment } = req.body;

    if (!['left', 'center', 'right'].includes(alignment)) {
      return res.status(400).json({
        success: false,
        message: 'Alinhamento deve ser "left", "center" ou "right"'
      });
    }

    const project = await ProjectManager.getProject(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    if (!project.style) {
      project.style = StyleService.getDefaultStyle();
    }

    project.style.alignment = alignment;
    await ProjectManager.updateProject(projectId, project);

    res.json({
      success: true,
      message: 'Alinhamento atualizado com sucesso',
      data: {
        alignment: project.style.alignment
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar alinhamento:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Resetar estilo para o padrão
router.post('/:projectId/reset', async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await ProjectManager.getProject(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    project.style = StyleService.getDefaultStyle();
    await ProjectManager.updateProject(projectId, project);

    res.json({
      success: true,
      message: 'Estilo resetado para o padrão',
      data: project.style
    });

  } catch (error) {
    console.error('Erro ao resetar estilo:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Obter lista de fontes disponíveis
router.get('/fonts/available', (req, res) => {
  try {
    const fonts = StyleService.getAvailableFonts();

    res.json({
      success: true,
      data: fonts
    });

  } catch (error) {
    console.error('Erro ao obter fontes:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Preview de estilo (sem salvar)
router.post('/preview', (req, res) => {
  try {
    const styleData = req.body;
    const validation = StyleService.validateStyle(styleData);
    
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Dados de estilo inválidos',
        errors: validation.errors
      });
    }

    const cssProperties = StyleService.generateCSSProperties(styleData);
    const ffmpegFilter = StyleService.generateFFmpegFilter(styleData);

    res.json({
      success: true,
      data: {
        style: styleData,
        cssProperties,
        ffmpegFilter
      }
    });

  } catch (error) {
    console.error('Erro no preview de estilo:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
