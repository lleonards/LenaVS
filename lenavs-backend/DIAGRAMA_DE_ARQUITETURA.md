# 🏗️ Diagrama de Arquitetura - LenaVS Backend

Documentação completa da arquitetura do sistema LenaVS Backend.

---

## 📊 Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                        FRONTEND LAYER                           │
│         (React, Vue, Angular, IA Studio, etc)                   │
│                                                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP/HTTPS (REST API)
                         │ JSON
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                                                                 │
│                    API LAYER (Express.js)                       │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  Upload  │  │  Lyrics  │  │  Style   │  │  Preview │      │
│  │  Routes  │  │  Routes  │  │  Routes  │  │  Routes  │      │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘      │
│       │             │             │             │              │
│  ┌────▼─────┐  ┌────▼─────┐  ┌────▼─────┐  ┌────▼─────┐      │
│  │  Export  │  │ Project  │  │   CORS   │  │  Error   │      │
│  │  Routes  │  │  Routes  │  │Middleware│  │ Handler  │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│                                                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                                                                 │
│                   SERVICE LAYER (Business Logic)                │
│                                                                 │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │   File      │ │    Lyrics    │ │   Lyrics     │            │
│  │   Upload    │ │   Service    │ │    Sync      │            │
│  │   Service   │ │              │ │   Service    │            │
│  └─────────────┘ └──────────────┘ └──────────────┘            │
│                                                                 │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ Background  │ │    Audio     │ │    Style     │            │
│  │  Service    │ │   Service    │ │   Service    │            │
│  └─────────────┘ └──────────────┘ └──────────────┘            │
│                                                                 │
│  ┌─────────────┐ ┌──────────────┐                              │
│  │Video Export │ │   Project    │                              │
│  │  Service    │ │   Manager    │                              │
│  └─────────────┘ └──────────────┘                              │
│                                                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                                                                 │
│                 UTILITY LAYER (Helper Functions)                │
│                                                                 │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │    Text     │ │     PDF      │ │    DOCX      │            │
│  │  Processor  │ │  Processor   │ │  Processor   │            │
│  └─────────────┘ └──────────────┘ └──────────────┘            │
│                                                                 │
│  ┌─────────────┐ ┌──────────────┐                              │
│  │  Encoding   │ │   FFmpeg     │                              │
│  │   Fixer     │ │    Utils     │                              │
│  └─────────────┘ └──────────────┘                              │
│                                                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                                                                 │
│              EXTERNAL DEPENDENCIES & STORAGE                    │
│                                                                 │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │   FFmpeg    │ │  FileSystem  │ │   Multer     │            │
│  │  (Processing│ │  (Storage)   │ │  (Uploads)   │            │
│  │   Video)    │ │              │ │              │            │
│  └─────────────┘ └──────────────┘ └──────────────┘            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Fluxo de Dados

### 1. Upload de Arquivos

```
Usuario → Frontend → API (uploadRoutes)
                         │
                         ▼
                  Multer (validate & store)
                         │
                         ▼
           ┌─────────────┴──────────────┐
           │                            │
           ▼                            ▼
    AudioService                 BackgroundService
    (extract info)               (process video/image)
           │                            │
           └─────────────┬──────────────┘
                         │
                         ▼
                  LyricsService
                  (extract & parse)
                         │
                         ▼
                  ProjectManager
                  (save project.json)
                         │
                         ▼
                  Response → Frontend
```

### 2. Sincronização de Letras

```
Usuario → Frontend → API (lyricsRoutes)
                         │
                         ▼
                  LyricsSyncService
                  (parse & validate timing)
                         │
                         ▼
                  ProjectManager
                  (update project)
                         │
                         ▼
                  Response → Frontend
```

### 3. Aplicação de Estilos

```
Usuario → Frontend → API (styleRoutes)
                         │
                         ▼
                  StyleService
                  (validate & generate CSS/FFmpeg filters)
                         │
                         ▼
                  ProjectManager
                  (update project style)
                         │
                         ▼
                  Response → Frontend
```

### 4. Exportação de Vídeo

```
Usuario → Frontend → API (exportRoutes)
                         │
                         ▼
                  VideoExportService
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
    BackgroundService        LyricsSyncService
    (prepare background)     (generate subtitles)
              │                     │
              └──────────┬──────────┘
                         │
                         ▼
                    FFmpeg Process
             (combine video + audio + subs)
                         │
                         ▼
                  Output File (.mp4/.mov/.avi)
                         │
                         ▼
                  Response (jobId) → Frontend
                         │
                         ▼
                  Polling (status updates)
```

---

## 📦 Estrutura de Módulos

### Camada de Rotas (Routes)

| Rota | Responsabilidade |
|------|-----------------|
| `uploadRoutes.js` | Gerenciar uploads de arquivos (áudio, vídeo, letra) |
| `lyricsRoutes.js` | CRUD de estrofes e sincronização |
| `styleRoutes.js` | Gerenciamento de estilos de texto |
| `previewRoutes.js` | Dados para preview em tempo real |
| `exportRoutes.js` | Exportação e monitoramento de vídeos |
| `projectRoutes.js` | Gerenciamento de projetos |

### Camada de Serviços (Services)

| Serviço | Responsabilidade |
|---------|-----------------|
| `FileUploadService` | Operações de arquivo (salvar, deletar, copiar) |
| `LyricsService` | Extração e processamento de letras |
| `LyricsSyncService` | Sincronização temporal de estrofes |
| `BackgroundService` | Processamento de vídeos/imagens de fundo |
| `AudioService` | Processamento de áudio (info, conversão, corte) |
| `StyleService` | Validação e geração de estilos |
| `VideoExportService` | Exportação completa de vídeos |
| `ProjectManager` | Persistência e gerenciamento de projetos |

### Camada de Utilitários (Utils)

| Utilitário | Responsabilidade |
|------------|-----------------|
| `textProcessor.js` | Normalização e processamento de texto |
| `pdfProcessor.js` | Extração de texto de PDFs |
| `docxProcessor.js` | Extração de texto de DOCX |
| `encodingFixer.js` | Correção automática de codificação |
| `ffmpegUtils.js` | Helpers para operações FFmpeg |

---

## 🔄 Ciclo de Vida de um Projeto

```
1. CRIAÇÃO
   ├── Usuario cria projeto
   ├── Backend gera UUID
   └── Cria arquivo projects/{id}.json

2. UPLOAD
   ├── Usuario faz upload de arquivos
   ├── Multer valida e salva em uploads/
   ├── Serviços processam arquivos
   ├── Letra é dividida em estrofes
   └── Projeto é atualizado

3. EDIÇÃO
   ├── Usuario edita estrofes
   ├── Usuario sincroniza tempos
   ├── Usuario aplica estilos
   └── Cada mudança atualiza project.json

4. PREVIEW
   ├── Frontend solicita dados
   ├── Backend retorna URLs de mídia
   ├── Backend calcula estrofe ativa
   └── Preview renderiza em tempo real

5. EXPORTAÇÃO
   ├── Usuario solicita exportação
   ├── Backend cria job assíncrono
   ├── FFmpeg processa vídeo
   ├── Frontend faz polling de status
   └── Vídeo fica disponível em outputs/

6. DOWNLOAD
   └── Usuario baixa vídeo final
```

---

## 💾 Modelo de Dados

### Estrutura de Projeto (project.json)

```json
{
  "projectId": "uuid-v4",
  "nomeProjeto": "Nome do Projeto",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "activeAudioType": "playback",
  
  "files": {
    "musicaOriginal": {
      "path": "./uploads/audio/file.mp3",
      "filename": "file.mp3",
      "url": "/uploads/audio/file.mp3",
      "duration": 180.5,
      "format": "mp3"
    },
    "playback": {
      "path": "./uploads/audio/playback.mp3",
      "filename": "playback.mp3",
      "url": "/uploads/audio/playback.mp3",
      "duration": 180.5,
      "format": "mp3"
    },
    "background": {
      "path": "./uploads/background/bg.mp4",
      "filename": "bg.mp4",
      "url": "/uploads/background/bg.mp4",
      "type": "video",
      "duration": 180.5,
      "resolution": "1920x1080"
    }
  },
  
  "lyrics": {
    "text": "Texto completo da letra...",
    "source": "file",
    "verses": [
      {
        "text": "Primeira estrofe\nCom várias linhas",
        "timeStart": "00:00",
        "timeEnd": "00:15"
      },
      {
        "text": "Segunda estrofe",
        "timeStart": "00:16",
        "timeEnd": "00:30"
      }
    ]
  },
  
  "style": {
    "fontFamily": "Arial",
    "fontSize": 48,
    "textColor": "#FFFFFF",
    "outlineColor": "#000000",
    "outlineWidth": 2,
    "bold": false,
    "italic": false,
    "underline": false,
    "alignment": "center",
    "shadowEnabled": true,
    "shadowColor": "#000000",
    "shadowOffsetX": 2,
    "shadowOffsetY": 2,
    "shadowBlur": 4
  }
}
```

---

## 🔐 Segurança

### Validações Implementadas

1. **Upload de Arquivos**
   - Validação de tipo de arquivo (extensão)
   - Limite de tamanho (500MB padrão)
   - Sanitização de nome de arquivo

2. **Dados de Entrada**
   - Validação de formato de tempo (mm:ss)
   - Validação de cores hexadecimais
   - Validação de tipos de dados

3. **Projeto**
   - UUID para IDs (não sequencial)
   - Isolamento de projetos por ID
   - Verificação de existência antes de operações

4. **Codificação**
   - Detecção automática de encoding
   - Suporte a UTF-8, ISO-8859-1, Windows-1252
   - Prevenção de caracteres corrompidos

---

## ⚡ Performance

### Otimizações Implementadas

1. **Processamento Assíncrono**
   - Exportação de vídeo em background
   - Não bloqueia outras requisições

2. **Streams**
   - Upload de arquivos em stream
   - Processamento de áudio/vídeo em stream

3. **Cache**
   - Informações de áudio/vídeo em cache no projeto
   - Evita reprocessamento desnecessário

4. **Validação Prévia**
   - Validação de dados antes de processar
   - Retorno rápido de erros

---

## 🔧 Escalabilidade

### Horizontal Scaling

```
┌────────────┐
│Load Balancer│
└──────┬──────┘
       │
   ┌───┴───┬───────┬───────┐
   │       │       │       │
┌──▼──┐ ┌──▼──┐ ┌──▼──┐ ┌──▼──┐
│API 1│ │API 2│ │API 3│ │API N│
└──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘
   │       │       │       │
   └───┬───┴───────┴───────┘
       │
┌──────▼──────┐
│Shared Storage│
│  (NFS/S3)   │
└─────────────┘
```

### Recomendações para Produção

1. **Storage Compartilhado**
   - Usar NFS, S3 ou similar para `/uploads` e `/outputs`
   - Garantir que todas as instâncias acessem os mesmos arquivos

2. **Queue System**
   - Implementar fila (Redis, RabbitMQ) para jobs de exportação
   - Separar workers de exportação da API

3. **Database**
   - Migrar de arquivos JSON para banco de dados (MongoDB, PostgreSQL)
   - Melhor desempenho para muitos projetos

4. **CDN**
   - Servir vídeos exportados via CDN
   - Reduzir carga no servidor

---

## 📊 Monitoramento

### Métricas Importantes

- Tempo de resposta das APIs
- Taxa de sucesso/falha de uploads
- Taxa de sucesso/falha de exportações
- Uso de disco (uploads, outputs, temp)
- Uso de CPU/RAM durante exportação
- Número de projetos ativos

### Logs

- Erros de processamento
- Uploads concluídos
- Exportações concluídas/falhadas
- Requisições lentas (>5s)

---

## 🚀 Deploy Architecture

### Render.com (Recomendado para MVP)

```
┌─────────────────┐
│  Render.com     │
│                 │
│  ┌───────────┐  │
│  │ Web Service│ │
│  │ (Node.js)  │ │
│  └─────┬──────┘  │
│        │         │
│  ┌─────▼──────┐  │
│  │  FFmpeg    │  │
│  │(Buildpack) │  │
│  └────────────┘  │
│                 │
│  ┌────────────┐  │
│  │   Disk     │  │
│  │  Storage   │  │
│  └────────────┘  │
└─────────────────┘
```

### AWS (Produção)

```
┌──────────────────────────────────┐
│            AWS Cloud             │
│                                  │
│  ┌──────────┐   ┌────────────┐  │
│  │   ALB    │───│    ECS     │  │
│  │(LoadBal) │   │ (Containers)│  │
│  └──────────┘   └─────┬──────┘  │
│                       │          │
│  ┌────────────┐  ┌───▼──────┐  │
│  │    S3      │  │   RDS    │  │
│  │ (Storage)  │  │(Database)│  │
│  └────────────┘  └──────────┘  │
│                                  │
│  ┌────────────┐  ┌──────────┐  │
│  │CloudFront  │  │   SQS    │  │
│  │   (CDN)    │  │ (Queue)  │  │
│  └────────────┘  └──────────┘  │
└──────────────────────────────────┘
```

---

## 🧪 Testing Architecture

```
┌─────────────────┐
│  Unit Tests     │
│  (Services)     │
└────────┬────────┘
         │
┌────────▼────────┐
│Integration Tests│
│   (Routes)      │
└────────┬────────┘
         │
┌────────▼────────┐
│  E2E Tests      │
│ (Full Flow)     │
└─────────────────┘
```

---

## 📚 Dependências Principais

| Dependência | Versão | Propósito |
|------------|--------|-----------|
| express | ^4.18.2 | Framework web |
| multer | ^1.4.5-lts.1 | Upload de arquivos |
| fluent-ffmpeg | ^2.1.2 | Wrapper para FFmpeg |
| mammoth | ^1.6.0 | Processar DOCX |
| pdf-parse | ^1.1.1 | Processar PDF |
| iconv-lite | ^0.6.3 | Conversão de encoding |
| uuid | ^9.0.1 | Geração de IDs |
| cors | ^2.8.5 | CORS middleware |
| dotenv | ^16.3.1 | Variáveis de ambiente |

---

**© 2024 LenaVS - Documentação de Arquitetura**
