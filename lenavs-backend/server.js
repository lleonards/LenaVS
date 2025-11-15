import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import dotenv from 'dotenv';

// Importar rotas
import uploadRoutes from './routes/uploadRoutes.js';
import lyricsRoutes from './routes/lyricsRoutes.js';
import styleRoutes from './routes/styleRoutes.js';
import previewRoutes from './routes/previewRoutes.js';
import exportRoutes from './routes/exportRoutes.js';
import projectRoutes from './routes/projectRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/outputs', express.static(path.join(__dirname, 'outputs')));

// Criar diretórios necessários
const ensureDirectories = async () => {
  const dirs = [
    './uploads/audio',
    './uploads/background',
    './uploads/lyrics',
    './outputs',
    './temp',
    './projects'
  ];

  for (const dir of dirs) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      console.error(`Erro ao criar diretório ${dir}:`, error);
    }
  }
};

// Inicializar diretórios
await ensureDirectories();

// Rotas da API
app.use('/api/upload', uploadRoutes);
app.use('/api/lyrics', lyricsRoutes);
app.use('/api/style', styleRoutes);
app.use('/api/preview', previewRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/project', projectRoutes);

// Rota de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Rota principal
app.get('/', (req, res) => {
  res.json({
    name: 'LenaVS Backend API',
    version: '1.0.0',
    description: 'API completa para geração de vídeos de karaokê',
    endpoints: {
      upload: '/api/upload',
      lyrics: '/api/lyrics',
      style: '/api/style',
      preview: '/api/preview',
      export: '/api/export',
      project: '/api/project'
    }
  });
});

// Tratamento de erros global
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(err.status || 500).json({
    error: true,
    message: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Tratamento de rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: 'Rota não encontrada'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║                                       ║
║         🎤 LenaVS Backend API 🎤      ║
║                                       ║
║  Status: ✅ Online                    ║
║  Porta: ${PORT}                        ║
║  Ambiente: ${process.env.NODE_ENV || 'development'}            ║
║                                       ║
║  Documentação: /api                   ║
║  Health Check: /health                ║
║                                       ║
╚═══════════════════════════════════════╝
  `);
});

export default app;
