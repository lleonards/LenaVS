# 🎤 LenaVS Backend API

**Backend completo e profissional para geração de vídeos de karaokê**

Sistema robusto desenvolvido em Node.js + Express que processa áudio, vídeo, legendas sincronizadas e exporta vídeos de karaokê em múltiplos formatos e qualidades.

---

## 📋 Índice

- [Características](#-características)
- [Requisitos](#-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Execução](#-execução)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Endpoints da API](#-endpoints-da-api)
- [Deploy](#-deploy)
- [Documentação Adicional](#-documentação-adicional)
- [Suporte](#-suporte)

---

## ✨ Características

### 🎵 Painel 1 - Upload de Arquivos
- ✅ Suporte a todos os formatos de áudio (MP3, WAV, OGG, M4A, AAC, FLAC, WMA)
- ✅ Background em vídeo (MP4, MOV, AVI, MKV) ou imagem (JPG, PNG)
- ✅ Letras em TXT, DOCX ou PDF
- ✅ Preservação automática de acentos (UTF-8, ISO-8859-1, Windows-1252)
- ✅ Processamento automático de background (loop/corte conforme duração do áudio)

### ✏️ Painel 2 - Editor de Letras
- ✅ Divisão automática em estrofes
- ✅ Sincronização manual precisa (mm:ss)
- ✅ Botão "agora" para capturar tempo do preview
- ✅ Botão "play" para navegar até estrofe específica
- ✅ Adicionar/remover estrofes dinamicamente
- ✅ Auto-salvamento do projeto

### 👁️ Painel 3 - Preview
- ✅ Preview em tempo real com estrofes sincronizadas
- ✅ Alternância entre música original e playback
- ✅ Exibição da estrofe ativa
- ✅ Manutenção da posição do player ao trocar áudio

### 🎨 Painel 4 - Estilo do Texto
- ✅ 15+ fontes disponíveis (Arial, Montserrat, Roboto, etc)
- ✅ Tamanho personalizável (12-200px)
- ✅ Cores customizáveis (texto e contorno)
- ✅ Negrito, itálico, sublinhado
- ✅ Alinhamento (esquerda, centro, direita)
- ✅ Sombra configurável
- ✅ Presets de estilo (Clássico, Moderno, Elegante, etc)

### 🎬 Painel 5 - Exportar Vídeo
- ✅ Formatos: MP4, MOV, AVI
- ✅ Qualidades: 480p, 720p, 1080p, 4K
- ✅ Progresso em tempo real
- ✅ Nome personalizado do arquivo
- ✅ Download direto após exportação

### 🔧 Recursos Técnicos
- ✅ Processamento local com FFmpeg
- ✅ API REST completa e documentada
- ✅ Tratamento robusto de erros
- ✅ Sistema de projetos com auto-salvamento
- ✅ Validação de sincronização
- ✅ Suporte a múltiplas codificações de texto
- ✅ Arquitetura modular e escalável

---

## 🔧 Requisitos

### Software Obrigatório

1. **Node.js** (versão 18 ou superior)
   ```bash
   node --version  # Deve ser >= v18.0.0
   ```

2. **FFmpeg** (com FFprobe)
   ```bash
   ffmpeg -version
   ffprobe -version
   ```

   **Instalação do FFmpeg:**
   
   - **Ubuntu/Debian:**
     ```bash
     sudo apt update
     sudo apt install ffmpeg
     ```
   
   - **macOS (Homebrew):**
     ```bash
     brew install ffmpeg
     ```
   
   - **Windows:**
     - Baixar de: https://ffmpeg.org/download.html
     - Adicionar ao PATH do sistema

### Requisitos de Hardware

- **Mínimo:**
  - 2 GB RAM
  - 2 CPU cores
  - 10 GB de espaço em disco

- **Recomendado:**
  - 4 GB RAM
  - 4 CPU cores
  - 50 GB de espaço em disco

---

## 📦 Instalação

### 1. Clonar/Extrair o Projeto

```bash
cd lenavs-backend
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

Copiar arquivo de exemplo:
```bash
cp .env.example .env
```

Editar `.env` conforme necessário:
```env
PORT=5000
NODE_ENV=development
UPLOAD_DIR=./uploads
OUTPUT_DIR=./outputs
TEMP_DIR=./temp
MAX_FILE_SIZE=500
BASE_URL=http://localhost:5000
```

---

## ⚙️ Configuração

### Estrutura de Diretórios

Os diretórios necessários são criados automaticamente na inicialização:

```
lenavs-backend/
├── uploads/      # Arquivos enviados
│   ├── audio/
│   ├── background/
│   └── lyrics/
├── outputs/      # Vídeos exportados
├── temp/         # Arquivos temporários
└── projects/     # Dados dos projetos
```

### Permissões

Certifique-se de que o servidor tem permissão de escrita:

```bash
chmod -R 755 uploads outputs temp projects
```

---

## 🚀 Execução

### Modo Desenvolvimento

```bash
npm run dev
```

### Modo Produção

```bash
npm start
```

### Verificar Status

Acesse no navegador:
```
http://localhost:5000/health
```

Resposta esperada:
```json
{
  "status": "online",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

---

## 📁 Estrutura do Projeto

```
lenavs-backend/
│
├── server.js                      # Servidor principal
├── package.json                   # Dependências
├── .env                          # Configurações
│
├── routes/                       # Rotas da API
│   ├── uploadRoutes.js          # Upload de arquivos
│   ├── lyricsRoutes.js          # Gerenciamento de letras
│   ├── styleRoutes.js           # Estilos do texto
│   ├── previewRoutes.js         # Preview do karaokê
│   ├── exportRoutes.js          # Exportação de vídeo
│   └── projectRoutes.js         # Gerenciamento de projetos
│
├── services/                     # Lógica de negócio
│   ├── FileUploadService.js     # Gerenciamento de uploads
│   ├── LyricsService.js         # Processamento de letras
│   ├── LyricsSyncService.js     # Sincronização de tempo
│   ├── BackgroundService.js     # Processamento de fundo
│   ├── AudioService.js          # Processamento de áudio
│   ├── StyleService.js          # Estilos e formatação
│   ├── VideoExportService.js    # Exportação de vídeo
│   └── ProjectManager.js        # Gerenciamento de projetos
│
├── utils/                        # Utilitários
│   ├── textProcessor.js         # Processamento de texto
│   ├── pdfProcessor.js          # Extração de PDF
│   ├── docxProcessor.js         # Extração de DOCX
│   ├── encodingFixer.js         # Correção de codificação
│   └── ffmpegUtils.js           # Utilitários FFmpeg
│
├── uploads/                      # Arquivos enviados
├── outputs/                      # Vídeos exportados
├── temp/                         # Arquivos temporários
└── projects/                     # Dados dos projetos
```

---

## 🔌 Endpoints da API

### Base URL
```
http://localhost:5000/api
```

### 📤 Upload (/api/upload)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/complete` | Upload completo (todos os arquivos) |
| POST | `/musica-original` | Upload de música original |
| POST | `/playback` | Upload de playback |
| POST | `/background` | Upload de background |
| POST | `/letra` | Upload de letra |

### 📝 Letras (/api/lyrics)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/:projectId` | Obter todas as estrofes |
| PUT | `/:projectId/verse/:verseIndex` | Atualizar estrofe |
| POST | `/:projectId/verse` | Adicionar estrofe |
| DELETE | `/:projectId/verse/:verseIndex` | Remover estrofe |
| POST | `/:projectId/verse/:verseIndex/sync` | Sincronizar tempo |
| GET | `/:projectId/active` | Obter estrofe ativa |
| PUT | `/:projectId/reorder` | Reordenar estrofes |

### 🎨 Estilos (/api/style)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/:projectId` | Obter estilo |
| PUT | `/:projectId` | Atualizar estilo |
| PUT | `/:projectId/font` | Atualizar fonte |
| PUT | `/:projectId/colors` | Atualizar cores |
| PUT | `/:projectId/formatting` | Atualizar formatação |
| PUT | `/:projectId/alignment` | Atualizar alinhamento |
| POST | `/:projectId/reset` | Resetar estilo |
| GET | `/fonts/available` | Listar fontes disponíveis |
| POST | `/preview` | Preview de estilo |

### 👁️ Preview (/api/preview)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/:projectId` | Obter dados do preview |
| GET | `/:projectId/verse-at-time` | Obter estrofe em tempo específico |
| GET | `/:projectId/audio` | Obter URL do áudio |
| PUT | `/:projectId/audio-type` | Alternar tipo de áudio |
| GET | `/:projectId/background` | Obter background |
| GET | `/:projectId/verses-formatted` | Obter estrofes formatadas |
| POST | `/:projectId/sync-position` | Sincronizar posição |
| GET | `/:projectId/validate` | Validar sincronização |

### 🎬 Exportação (/api/export)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/:projectId` | Iniciar exportação |
| GET | `/:projectId/status/:jobId` | Obter status da exportação |
| GET | `/:projectId/history` | Histórico de exports |
| DELETE | `/:projectId/cancel/:jobId` | Cancelar exportação |
| DELETE | `/:projectId/history/clear` | Limpar histórico |
| GET | `/download/:filename` | Download do vídeo |
| GET | `/options` | Opções de exportação |
| POST | `/:projectId/estimate` | Estimar tempo |

### 📦 Projetos (/api/project)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/create` | Criar projeto |
| GET | `/:projectId` | Obter projeto |
| GET | `/` | Listar todos os projetos |
| PUT | `/:projectId/name` | Atualizar nome |
| POST | `/:projectId/duplicate` | Duplicar projeto |
| DELETE | `/:projectId` | Deletar projeto |
| GET | `/:projectId/status` | Status do projeto |
| GET | `/:projectId/export-data` | Exportar dados (JSON) |
| POST | `/import-data` | Importar dados |
| GET | `/search` | Buscar projetos |

---

## 🌐 Deploy

### Render.com

1. Criar conta no [Render.com](https://render.com)

2. Criar novo **Web Service**

3. Configurar:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node

4. Adicionar variáveis de ambiente:
   ```
   NODE_ENV=production
   PORT=5000
   ```

5. Instalar FFmpeg (adicionar no `render.yaml` ou usar Docker)

### Heroku

1. Instalar Heroku CLI

2. Login e criar app:
   ```bash
   heroku login
   heroku create lenavs-backend
   ```

3. Adicionar buildpack do FFmpeg:
   ```bash
   heroku buildpacks:add --index 1 https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git
   ```

4. Deploy:
   ```bash
   git push heroku main
   ```

### VPS (DigitalOcean, AWS, etc)

1. Instalar Node.js e FFmpeg no servidor

2. Clonar repositório

3. Instalar dependências:
   ```bash
   npm install --production
   ```

4. Usar PM2 para gerenciar o processo:
   ```bash
   npm install -g pm2
   pm2 start server.js --name lenavs-backend
   pm2 save
   pm2 startup
   ```

---

## 📚 Documentação Adicional

- [API_EXAMPLES.md](./API_EXAMPLES.md) - Exemplos práticos de uso da API
- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Guia de integração com frontend
- [QUICKSTART.md](./QUICKSTART.md) - Tutorial rápido
- [DIAGRAMA_DE_ARQUITETURA.md](./DIAGRAMA_DE_ARQUITETURA.md) - Arquitetura do sistema

---

## 🐛 Troubleshooting

### Erro: FFmpeg não encontrado

**Solução:**
```bash
# Verificar instalação
which ffmpeg

# Instalar se necessário
sudo apt install ffmpeg  # Linux
brew install ffmpeg      # macOS
```

### Erro: Permission denied

**Solução:**
```bash
chmod -R 755 uploads outputs temp projects
```

### Erro: Port already in use

**Solução:**
```bash
# Mudar porta no .env
PORT=3000

# Ou matar processo na porta
lsof -ti:5000 | xargs kill -9
```

---

## 🤝 Suporte

Para problemas ou dúvidas:

1. Verificar [Troubleshooting](#-troubleshooting)
2. Consultar documentação adicional
3. Abrir issue no repositório

---

## 📄 Licença

MIT License - Livre para uso pessoal e comercial

---

## 🎉 Créditos

Desenvolvido pela equipe LenaVS

**Tecnologias utilizadas:**
- Node.js + Express
- FFmpeg
- Multer
- Mammoth (DOCX)
- pdf-parse (PDF)
- iconv-lite (Encoding)

---

**© 2024 LenaVS - Todos os direitos reservados**
