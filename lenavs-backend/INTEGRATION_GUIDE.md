# 🔗 Integration Guide - LenaVS Backend

Guia completo para integração do backend LenaVS com qualquer frontend (React, Vue, Angular, IA Studio, etc).

---

## 📋 Visão Geral

O LenaVS Backend foi projetado para ser **completamente agnóstico de frontend**, funcionando perfeitamente com:

- ✅ React / Next.js
- ✅ Vue.js / Nuxt.js
- ✅ Angular
- ✅ Svelte
- ✅ IA Studio
- ✅ Qualquer framework que faça requisições HTTP

---

## 🏗️ Arquitetura de Integração

```
┌─────────────────────┐
│                     │
│   FRONTEND          │
│   (React/Vue/etc)   │
│                     │
└──────────┬──────────┘
           │ HTTP/HTTPS
           │ (JSON)
┌──────────▼──────────┐
│                     │
│   LenaVS Backend    │
│   Express API       │
│                     │
└──────────┬──────────┘
           │
    ┌──────┴──────┐
    │             │
┌───▼───┐   ┌────▼────┐
│       │   │         │
│FFmpeg │   │ Storage │
│       │   │         │
└───────┘   └─────────┘
```

---

## 🚀 Setup Inicial

### 1. Configurar Base URL

Crie um arquivo de configuração no seu frontend:

```javascript
// config/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default API_BASE_URL;
```

### 2. Criar Serviço de API

```javascript
// services/api.js
import axios from 'axios';
import API_BASE_URL from '../config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
```

---

## 📦 Módulos de Integração

### Módulo de Projetos

```javascript
// services/projectService.js
import api from './api';

export const projectService = {
  // Criar projeto
  create: async (nomeProjeto) => {
    const response = await api.post('/project/create', { nomeProjeto });
    return response.data;
  },

  // Obter projeto
  get: async (projectId) => {
    const response = await api.get(`/project/${projectId}`);
    return response.data;
  },

  // Listar projetos
  list: async () => {
    const response = await api.get('/project');
    return response.data;
  },

  // Atualizar nome
  updateName: async (projectId, nomeProjeto) => {
    const response = await api.put(`/project/${projectId}/name`, { nomeProjeto });
    return response.data;
  },

  // Deletar projeto
  delete: async (projectId) => {
    const response = await api.delete(`/project/${projectId}`);
    return response.data;
  },

  // Obter status
  getStatus: async (projectId) => {
    const response = await api.get(`/project/${projectId}/status`);
    return response.data;
  }
};
```

### Módulo de Upload

```javascript
// services/uploadService.js
import axios from 'axios';
import API_BASE_URL from '../config/api';

export const uploadService = {
  // Upload completo
  uploadComplete: async (files, onProgress) => {
    const formData = new FormData();
    
    if (files.musicaOriginal) formData.append('musicaOriginal', files.musicaOriginal);
    if (files.playback) formData.append('playback', files.playback);
    if (files.background) formData.append('background', files.background);
    if (files.letra) formData.append('letra', files.letra);
    if (files.letraTexto) formData.append('letraTexto', files.letraTexto);
    if (files.nomeProjeto) formData.append('nomeProjeto', files.nomeProjeto);

    const response = await axios.post(`${API_BASE_URL}/upload/complete`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        if (onProgress) onProgress(percent);
      }
    });

    return response.data;
  },

  // Upload de playback
  uploadPlayback: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('playback', file);

    const response = await axios.post(`${API_BASE_URL}/upload/playback`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        if (onProgress) onProgress(percent);
      }
    });

    return response.data;
  },

  // Upload de background
  uploadBackground: async (file, audioDuration, onProgress) => {
    const formData = new FormData();
    formData.append('background', file);
    formData.append('audioDuration', audioDuration);

    const response = await axios.post(`${API_BASE_URL}/upload/background`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        if (onProgress) onProgress(percent);
      }
    });

    return response.data;
  },

  // Upload de letra
  uploadLyrics: async (textOrFile) => {
    if (typeof textOrFile === 'string') {
      const response = await axios.post(`${API_BASE_URL}/upload/letra`, {
        letraTexto: textOrFile
      });
      return response.data;
    } else {
      const formData = new FormData();
      formData.append('letra', textOrFile);

      const response = await axios.post(`${API_BASE_URL}/upload/letra`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    }
  }
};
```

### Módulo de Letras

```javascript
// services/lyricsService.js
import api from './api';

export const lyricsService = {
  // Obter todas as estrofes
  getVerses: async (projectId) => {
    const response = await api.get(`/lyrics/${projectId}`);
    return response.data;
  },

  // Atualizar estrofe
  updateVerse: async (projectId, verseIndex, verseData) => {
    const response = await api.put(
      `/lyrics/${projectId}/verse/${verseIndex}`,
      verseData
    );
    return response.data;
  },

  // Adicionar estrofe
  addVerse: async (projectId, verseData) => {
    const response = await api.post(`/lyrics/${projectId}/verse`, verseData);
    return response.data;
  },

  // Remover estrofe
  removeVerse: async (projectId, verseIndex) => {
    const response = await api.delete(`/lyrics/${projectId}/verse/${verseIndex}`);
    return response.data;
  },

  // Sincronizar tempo (botão "agora")
  syncTime: async (projectId, verseIndex, currentTime, type) => {
    const response = await api.post(
      `/lyrics/${projectId}/verse/${verseIndex}/sync`,
      { currentTime, type }
    );
    return response.data;
  },

  // Obter estrofe ativa
  getActiveVerse: async (projectId, currentTime) => {
    const response = await api.get(
      `/lyrics/${projectId}/active?currentTime=${currentTime}`
    );
    return response.data;
  },

  // Reordenar estrofes
  reorder: async (projectId, verses) => {
    const response = await api.put(`/lyrics/${projectId}/reorder`, { verses });
    return response.data;
  }
};
```

### Módulo de Estilos

```javascript
// services/styleService.js
import api from './api';

export const styleService = {
  // Obter estilo
  getStyle: async (projectId) => {
    const response = await api.get(`/style/${projectId}`);
    return response.data;
  },

  // Atualizar estilo completo
  updateStyle: async (projectId, styleData) => {
    const response = await api.put(`/style/${projectId}`, styleData);
    return response.data;
  },

  // Atualizar fonte
  updateFont: async (projectId, fontData) => {
    const response = await api.put(`/style/${projectId}/font`, fontData);
    return response.data;
  },

  // Atualizar cores
  updateColors: async (projectId, colorData) => {
    const response = await api.put(`/style/${projectId}/colors`, colorData);
    return response.data;
  },

  // Atualizar formatação
  updateFormatting: async (projectId, formattingData) => {
    const response = await api.put(`/style/${projectId}/formatting`, formattingData);
    return response.data;
  },

  // Atualizar alinhamento
  updateAlignment: async (projectId, alignment) => {
    const response = await api.put(`/style/${projectId}/alignment`, { alignment });
    return response.data;
  },

  // Resetar estilo
  reset: async (projectId) => {
    const response = await api.post(`/style/${projectId}/reset`);
    return response.data;
  },

  // Obter fontes disponíveis
  getAvailableFonts: async () => {
    const response = await api.get('/style/fonts/available');
    return response.data;
  }
};
```

### Módulo de Preview

```javascript
// services/previewService.js
import api from './api';

export const previewService = {
  // Obter dados do preview
  getPreviewData: async (projectId) => {
    const response = await api.get(`/preview/${projectId}`);
    return response.data;
  },

  // Obter estrofe em tempo específico
  getVerseAtTime: async (projectId, time) => {
    const response = await api.get(
      `/preview/${projectId}/verse-at-time?time=${time}`
    );
    return response.data;
  },

  // Obter áudio
  getAudio: async (projectId, type = 'auto') => {
    const response = await api.get(
      `/preview/${projectId}/audio?type=${type}`
    );
    return response.data;
  },

  // Alternar tipo de áudio
  switchAudioType: async (projectId, audioType) => {
    const response = await api.put(
      `/preview/${projectId}/audio-type`,
      { audioType }
    );
    return response.data;
  },

  // Obter background
  getBackground: async (projectId) => {
    const response = await api.get(`/preview/${projectId}/background`);
    return response.data;
  },

  // Validar sincronização
  validate: async (projectId) => {
    const response = await api.get(`/preview/${projectId}/validate`);
    return response.data;
  }
};
```

### Módulo de Exportação

```javascript
// services/exportService.js
import api from './api';

export const exportService = {
  // Iniciar exportação
  startExport: async (projectId, format, quality) => {
    const response = await api.post(`/export/${projectId}`, {
      format,
      quality
    });
    return response.data;
  },

  // Obter status da exportação
  getStatus: async (projectId, jobId) => {
    const response = await api.get(`/export/${projectId}/status/${jobId}`);
    return response.data;
  },

  // Monitorar progresso (polling)
  monitorProgress: (projectId, jobId, onProgress, onComplete, onError) => {
    const interval = setInterval(async () => {
      try {
        const response = await api.get(`/export/${projectId}/status/${jobId}`);
        const { data } = response.data;

        onProgress(data.progress, data.message);

        if (data.status === 'completed') {
          clearInterval(interval);
          onComplete(data);
        } else if (data.status === 'error') {
          clearInterval(interval);
          onError(data.message);
        }
      } catch (error) {
        clearInterval(interval);
        onError(error.message);
      }
    }, 2000);

    return () => clearInterval(interval); // Função de cleanup
  },

  // Obter opções de exportação
  getOptions: async () => {
    const response = await api.get('/export/options');
    return response.data;
  },

  // Estimar tempo de exportação
  estimateTime: async (projectId, quality) => {
    const response = await api.post(`/export/${projectId}/estimate`, {
      quality
    });
    return response.data;
  }
};
```

---

## 🎯 Exemplo Completo: React Component

```jsx
// components/KaraokeEditor.jsx
import React, { useState, useEffect } from 'react';
import {
  projectService,
  uploadService,
  lyricsService,
  styleService,
  previewService,
  exportService
} from '../services';

function KaraokeEditor() {
  const [projectId, setProjectId] = useState(null);
  const [project, setProject] = useState(null);
  const [verses, setVerses] = useState([]);
  const [style, setStyle] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeVerse, setActiveVerse] = useState(null);
  const [exportProgress, setExportProgress] = useState(0);

  // Criar novo projeto
  const handleCreateProject = async () => {
    try {
      const response = await projectService.create('Novo Projeto');
      setProjectId(response.data.projectId);
      setProject(response.data);
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
    }
  };

  // Upload de arquivos
  const handleUpload = async (files) => {
    try {
      const response = await uploadService.uploadComplete(files, (percent) => {
        console.log(`Upload: ${percent}%`);
      });
      
      setVerses(response.data.lyrics.verses);
      alert('Upload concluído!');
    } catch (error) {
      console.error('Erro no upload:', error);
    }
  };

  // Atualizar estrofe ativa baseado no tempo
  useEffect(() => {
    if (!projectId) return;

    const updateActiveVerse = async () => {
      try {
        const response = await lyricsService.getActiveVerse(projectId, currentTime);
        setActiveVerse(response.data.activeVerse);
      } catch (error) {
        console.error('Erro ao obter estrofe ativa:', error);
      }
    };

    updateActiveVerse();
  }, [projectId, currentTime]);

  // Sincronizar tempo (botão "agora")
  const handleSyncTime = async (verseIndex, type) => {
    try {
      await lyricsService.syncTime(projectId, verseIndex, currentTime, type);
      // Recarregar estrofes
      const response = await lyricsService.getVerses(projectId);
      setVerses(response.data.verses);
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
    }
  };

  // Exportar vídeo
  const handleExport = async () => {
    try {
      const response = await exportService.startExport(projectId, 'mp4', '1080p');
      const { jobId } = response.data;

      // Monitorar progresso
      const cleanup = exportService.monitorProgress(
        projectId,
        jobId,
        (progress, message) => {
          setExportProgress(progress);
          console.log(message);
        },
        (data) => {
          alert('Exportação concluída!');
          window.open(data.outputUrl, '_blank');
        },
        (error) => {
          alert(`Erro: ${error}`);
        }
      );

      // Cleanup ao desmontar
      return cleanup;
    } catch (error) {
      console.error('Erro ao exportar:', error);
    }
  };

  return (
    <div>
      <h1>Editor de Karaokê</h1>

      {!projectId ? (
        <button onClick={handleCreateProject}>Criar Projeto</button>
      ) : (
        <>
          <h2>Projeto: {project?.nomeProjeto}</h2>

          {/* Estrofes */}
          <div>
            {verses.map((verse, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: activeVerse?.index === index ? '#ffffaa' : '#fff'
                }}
              >
                <p>{verse.text}</p>
                <div>
                  <span>{verse.timeStart} - {verse.timeEnd}</span>
                  <button onClick={() => handleSyncTime(index, 'start')}>
                    Início Agora
                  </button>
                  <button onClick={() => handleSyncTime(index, 'end')}>
                    Fim Agora
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Exportação */}
          <div>
            <button onClick={handleExport}>Exportar Vídeo</button>
            {exportProgress > 0 && (
              <progress value={exportProgress} max={100} />
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default KaraokeEditor;
```

---

## 🔐 Segurança e CORS

### Configurar CORS no Backend

O backend já vem com CORS habilitado, mas você pode personalizar:

```javascript
// server.js
import cors from 'cors';

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://seu-frontend.com'
  ],
  credentials: true
}));
```

### Headers de Segurança

```javascript
// Adicionar headers de segurança
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});
```

---

## 🎨 Estado Global (Context API / Redux)

### Exemplo com Context API

```jsx
// context/KaraokeContext.jsx
import React, { createContext, useContext, useState } from 'react';

const KaraokeContext = createContext();

export function KaraokeProvider({ children }) {
  const [projectId, setProjectId] = useState(null);
  const [verses, setVerses] = useState([]);
  const [style, setStyle] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);

  return (
    <KaraokeContext.Provider
      value={{
        projectId,
        setProjectId,
        verses,
        setVerses,
        style,
        setStyle,
        currentTime,
        setCurrentTime
      }}
    >
      {children}
    </KaraokeContext.Provider>
  );
}

export const useKaraoke = () => useContext(KaraokeContext);
```

---

## 📱 Integração Mobile (React Native)

```javascript
// services/api.native.js
import axios from 'axios';

const API_BASE_URL = 'https://seu-backend.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000
});

// Mesmos serviços funcionam!
export { projectService, uploadService, lyricsService };
```

---

## 🌐 Deploy e URLs

### Desenvolvimento
```javascript
const API_URL = 'http://localhost:5000/api';
```

### Produção
```javascript
const API_URL = 'https://api.lenavs.com/api';
```

### Variáveis de Ambiente
```bash
# .env.local (Frontend)
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=ws://localhost:5000
```

---

## ✅ Checklist de Integração

- [ ] API Base URL configurada
- [ ] Serviços criados (project, upload, lyrics, style, preview, export)
- [ ] Tratamento de erros implementado
- [ ] CORS configurado
- [ ] Upload com progresso funcionando
- [ ] Preview em tempo real implementado
- [ ] Sincronização de tempo funcional
- [ ] Exportação com monitoramento de progresso
- [ ] Testes E2E realizados

---

**© 2024 LenaVS - Integration Guide**
