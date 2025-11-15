# 📖 API Examples - LenaVS Backend

Exemplos práticos de uso da API do LenaVS Backend.

---

## 🚀 Fluxo Completo

### 1. Criar Projeto

```javascript
const createProject = async () => {
  const response = await fetch('http://localhost:5000/api/project/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nomeProjeto: 'Minha Música'
    })
  });

  const data = await response.json();
  console.log('Project ID:', data.data.projectId);
  return data.data.projectId;
};
```

### 2. Upload Completo

```javascript
const uploadFiles = async (projectId) => {
  const formData = new FormData();
  
  // Adicionar arquivos
  formData.append('playback', playbackFile); // File object
  formData.append('background', backgroundFile); // File object
  formData.append('letraTexto', 'Letra da música aqui...');
  formData.append('nomeProjeto', 'Minha Música');

  const response = await fetch('http://localhost:5000/api/upload/complete', {
    method: 'POST',
    body: formData
  });

  const data = await response.json();
  console.log('Upload concluído:', data);
  return data;
};
```

### 3. Editar Estrofe

```javascript
const editVerse = async (projectId, verseIndex) => {
  const response = await fetch(
    `http://localhost:5000/api/lyrics/${projectId}/verse/${verseIndex}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: 'Nova estrofe aqui',
        timeStart: '00:30',
        timeEnd: '00:45'
      })
    }
  );

  const data = await response.json();
  console.log('Estrofe atualizada:', data);
};
```

### 4. Sincronizar Tempo (Botão "Agora")

```javascript
const syncTime = async (projectId, verseIndex, currentTime, type) => {
  const response = await fetch(
    `http://localhost:5000/api/lyrics/${projectId}/verse/${verseIndex}/sync`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        currentTime: currentTime, // Em segundos
        type: type // 'start' ou 'end'
      })
    }
  );

  const data = await response.json();
  console.log('Tempo sincronizado:', data);
};
```

### 5. Atualizar Estilo

```javascript
const updateStyle = async (projectId) => {
  const response = await fetch(
    `http://localhost:5000/api/style/${projectId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fontFamily: 'Montserrat',
        fontSize: 52,
        textColor: '#FFFFFF',
        outlineColor: '#000000',
        outlineWidth: 3,
        bold: true,
        italic: false,
        underline: false,
        alignment: 'center',
        shadowEnabled: true
      })
    }
  );

  const data = await response.json();
  console.log('Estilo atualizado:', data);
};
```

### 6. Obter Estrofe Ativa no Preview

```javascript
const getActiveVerse = async (projectId, currentTime) => {
  const response = await fetch(
    `http://localhost:5000/api/preview/${projectId}/verse-at-time?time=${currentTime}`
  );

  const data = await response.json();
  
  if (data.data.hasActiveVerse) {
    console.log('Estrofe ativa:', data.data.activeVerse.text);
  } else {
    console.log('Nenhuma estrofe ativa neste momento');
  }
};
```

### 7. Exportar Vídeo

```javascript
const exportVideo = async (projectId, format, quality) => {
  // Iniciar exportação
  const response = await fetch(
    `http://localhost:5000/api/export/${projectId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        format: format, // 'mp4', 'mov', 'avi'
        quality: quality // '480p', '720p', '1080p', '4k'
      })
    }
  );

  const data = await response.json();
  const jobId = data.data.jobId;
  
  // Monitorar progresso
  const checkProgress = setInterval(async () => {
    const statusResponse = await fetch(
      `http://localhost:5000/api/export/${projectId}/status/${jobId}`
    );
    
    const statusData = await statusResponse.json();
    
    console.log(`Progresso: ${statusData.data.progress}%`);
    console.log(`Mensagem: ${statusData.data.message}`);
    
    if (statusData.data.status === 'completed') {
      clearInterval(checkProgress);
      console.log('Download URL:', statusData.data.outputUrl);
      window.location.href = statusData.data.outputUrl;
    } else if (statusData.data.status === 'error') {
      clearInterval(checkProgress);
      console.error('Erro na exportação:', statusData.data.message);
    }
  }, 2000); // Verificar a cada 2 segundos
};
```

---

## 📤 Exemplos de Upload

### Upload Individual de Playback

```javascript
const uploadPlayback = async () => {
  const formData = new FormData();
  formData.append('playback', playbackFile);

  const response = await fetch('http://localhost:5000/api/upload/playback', {
    method: 'POST',
    body: formData
  });

  const data = await response.json();
  console.log('Playback info:', data.data);
};
```

### Upload de Background

```javascript
const uploadBackground = async (audioDuration) => {
  const formData = new FormData();
  formData.append('background', backgroundFile);
  formData.append('audioDuration', audioDuration);

  const response = await fetch('http://localhost:5000/api/upload/background', {
    method: 'POST',
    body: formData
  });

  const data = await response.json();
  console.log('Background info:', data.data);
};
```

### Upload de Letra (Texto)

```javascript
const uploadLyrics = async () => {
  const response = await fetch('http://localhost:5000/api/upload/letra', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      letraTexto: `Primeira estrofe aqui
      Com várias linhas

      Segunda estrofe aqui
      Separada por linha em branco`
    })
  });

  const data = await response.json();
  console.log('Estrofes:', data.data.verses);
};
```

---

## 📝 Exemplos de Gerenciamento de Letras

### Adicionar Nova Estrofe

```javascript
const addVerse = async (projectId) => {
  const response = await fetch(
    `http://localhost:5000/api/lyrics/${projectId}/verse`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: 'Nova estrofe',
        timeStart: '01:00',
        timeEnd: '01:15',
        position: 2 // Inserir na posição 2 (opcional)
      })
    }
  );

  const data = await response.json();
  console.log('Estrofe adicionada:', data);
};
```

### Remover Estrofe

```javascript
const removeVerse = async (projectId, verseIndex) => {
  const response = await fetch(
    `http://localhost:5000/api/lyrics/${projectId}/verse/${verseIndex}`,
    {
      method: 'DELETE'
    }
  );

  const data = await response.json();
  console.log('Estrofe removida:', data);
};
```

### Reordenar Estrofes

```javascript
const reorderVerses = async (projectId, newOrder) => {
  const response = await fetch(
    `http://localhost:5000/api/lyrics/${projectId}/reorder`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        verses: newOrder // Array de estrofes na nova ordem
      })
    }
  );

  const data = await response.json();
  console.log('Estrofes reordenadas:', data);
};
```

---

## 🎨 Exemplos de Estilo

### Atualizar Apenas Fonte

```javascript
const updateFont = async (projectId) => {
  const response = await fetch(
    `http://localhost:5000/api/style/${projectId}/font`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fontFamily: 'Roboto',
        fontSize: 56
      })
    }
  );

  const data = await response.json();
  console.log('Fonte atualizada:', data);
};
```

### Atualizar Apenas Cores

```javascript
const updateColors = async (projectId) => {
  const response = await fetch(
    `http://localhost:5000/api/style/${projectId}/colors`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        textColor: '#FFD700',
        outlineColor: '#000000'
      })
    }
  );

  const data = await response.json();
  console.log('Cores atualizadas:', data);
};
```

### Obter Fontes Disponíveis

```javascript
const getAvailableFonts = async () => {
  const response = await fetch(
    'http://localhost:5000/api/style/fonts/available'
  );

  const data = await response.json();
  console.log('Fontes disponíveis:', data.data);
};
```

---

## 👁️ Exemplos de Preview

### Alternar Entre Original e Playback

```javascript
const switchAudio = async (projectId, audioType) => {
  const response = await fetch(
    `http://localhost:5000/api/preview/${projectId}/audio-type`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        audioType: audioType // 'original' ou 'playback'
      })
    }
  );

  const data = await response.json();
  console.log('Áudio alternado:', data);
};
```

### Validar Projeto

```javascript
const validateProject = async (projectId) => {
  const response = await fetch(
    `http://localhost:5000/api/preview/${projectId}/validate`
  );

  const data = await response.json();
  
  if (data.data.readyToExport) {
    console.log('Projeto pronto para exportar!');
  } else {
    console.log('Itens pendentes:');
    if (!data.data.hasPlayback) console.log('- Adicionar playback');
    if (!data.data.hasBackground) console.log('- Adicionar background');
    if (!data.data.allVersesTimed) console.log('- Sincronizar todas as estrofes');
  }
};
```

---

## 📦 Exemplos de Gerenciamento de Projetos

### Listar Todos os Projetos

```javascript
const listProjects = async () => {
  const response = await fetch('http://localhost:5000/api/project');
  const data = await response.json();
  
  data.data.projects.forEach(project => {
    console.log(`${project.nomeProjeto} - ${project.projectId}`);
  });
};
```

### Duplicar Projeto

```javascript
const duplicateProject = async (projectId) => {
  const response = await fetch(
    `http://localhost:5000/api/project/${projectId}/duplicate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nomeProjeto: 'Cópia do Projeto'
      })
    }
  );

  const data = await response.json();
  console.log('Novo projeto:', data.data.projectId);
};
```

### Exportar Dados do Projeto (JSON)

```javascript
const exportProjectData = async (projectId) => {
  const response = await fetch(
    `http://localhost:5000/api/project/${projectId}/export-data`
  );

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'projeto.json';
  a.click();
};
```

---

## 🔍 Exemplo Completo: React Component

```jsx
import React, { useState, useEffect } from 'react';

function KaraokeEditor() {
  const [projectId, setProjectId] = useState(null);
  const [verses, setVerses] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeVerse, setActiveVerse] = useState(null);

  // Criar projeto
  const createProject = async () => {
    const response = await fetch('http://localhost:5000/api/project/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nomeProjeto: 'Novo Projeto' })
    });
    const data = await response.json();
    setProjectId(data.data.projectId);
  };

  // Carregar estrofes
  const loadVerses = async () => {
    if (!projectId) return;
    
    const response = await fetch(`http://localhost:5000/api/lyrics/${projectId}`);
    const data = await response.json();
    setVerses(data.data.verses);
  };

  // Atualizar estrofe ativa
  useEffect(() => {
    const updateActiveVerse = async () => {
      if (!projectId) return;
      
      const response = await fetch(
        `http://localhost:5000/api/preview/${projectId}/verse-at-time?time=${currentTime}`
      );
      const data = await response.json();
      setActiveVerse(data.data.activeVerse);
    };

    updateActiveVerse();
  }, [projectId, currentTime]);

  // Sincronizar tempo
  const syncTime = async (verseIndex, type) => {
    const response = await fetch(
      `http://localhost:5000/api/lyrics/${projectId}/verse/${verseIndex}/sync`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentTime, type })
      }
    );
    const data = await response.json();
    loadVerses(); // Recarregar estrofes
  };

  return (
    <div>
      <h1>Editor de Karaokê</h1>
      
      {!projectId ? (
        <button onClick={createProject}>Criar Projeto</button>
      ) : (
        <div>
          <h2>Estrofes:</h2>
          {verses.map((verse, index) => (
            <div key={index} className={activeVerse?.index === index ? 'active' : ''}>
              <p>{verse.text}</p>
              <span>{verse.timeStart} - {verse.timeEnd}</span>
              <button onClick={() => syncTime(index, 'start')}>Início Agora</button>
              <button onClick={() => syncTime(index, 'end')}>Fim Agora</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default KaraokeEditor;
```

---

## 🎯 Dicas e Boas Práticas

### 1. Sempre Verificar Erros

```javascript
const safeRequest = async (url, options) => {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Erro desconhecido');
    }
    
    return data;
  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error;
  }
};
```

### 2. Usar Debounce para Auto-save

```javascript
let saveTimeout;

const autoSave = (projectId, data) => {
  clearTimeout(saveTimeout);
  
  saveTimeout = setTimeout(async () => {
    await fetch(`http://localhost:5000/api/project/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    console.log('Auto-save concluído');
  }, 1000); // Salvar após 1 segundo sem mudanças
};
```

### 3. Upload com Progresso

```javascript
const uploadWithProgress = (file, onProgress) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        onProgress(percentComplete);
      }
    });
    
    xhr.addEventListener('load', () => {
      resolve(JSON.parse(xhr.responseText));
    });
    
    xhr.addEventListener('error', reject);
    
    const formData = new FormData();
    formData.append('playback', file);
    
    xhr.open('POST', 'http://localhost:5000/api/upload/playback');
    xhr.send(formData);
  });
};
```

---

**© 2024 LenaVS - Documentação da API**
