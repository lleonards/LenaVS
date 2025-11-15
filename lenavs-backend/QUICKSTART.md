# ⚡ Quick Start - LenaVS Backend

Tutorial rápido para começar a usar o LenaVS Backend em 5 minutos!

---

## 🚀 Início Rápido

### 1. Instalar Dependências (2 minutos)

```bash
# Verificar Node.js
node --version  # Deve ser >= v18.0.0

# Verificar FFmpeg
ffmpeg -version

# Se FFmpeg não estiver instalado:
# Ubuntu/Debian
sudo apt install ffmpeg

# macOS
brew install ffmpeg

# Windows: baixar de https://ffmpeg.org/download.html
```

### 2. Configurar Projeto (1 minuto)

```bash
cd lenavs-backend

# Instalar pacotes
npm install

# Copiar configurações
cp .env.example .env
```

### 3. Iniciar Servidor (30 segundos)

```bash
npm start
```

Aguarde ver:
```
╔═══════════════════════════════════════╗
║                                       ║
║         🎤 LenaVS Backend API 🎤      ║
║                                       ║
║  Status: ✅ Online                    ║
║  Porta: 5000                          ║
║  Ambiente: development                ║
║                                       ║
╚═══════════════════════════════════════╝
```

### 4. Testar API (30 segundos)

Abra no navegador:
```
http://localhost:5000/health
```

Deve retornar:
```json
{
  "status": "online",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

---

## 📝 Primeiro Projeto em 2 Minutos

### Usando cURL

```bash
# 1. Criar projeto
curl -X POST http://localhost:5000/api/project/create \
  -H "Content-Type: application/json" \
  -d '{"nomeProjeto": "Meu Primeiro Karaokê"}'

# Guarde o projectId retornado

# 2. Upload de letra (exemplo)
curl -X POST http://localhost:5000/api/upload/letra \
  -H "Content-Type: application/json" \
  -d '{"letraTexto": "Primeira estrofe\nDa minha música\n\nSegunda estrofe\nAqui"}'

# 3. Listar estrofes
curl http://localhost:5000/api/lyrics/SEU_PROJECT_ID
```

### Usando Postman/Insomnia

1. **Criar Projeto**
   - Método: `POST`
   - URL: `http://localhost:5000/api/project/create`
   - Body (JSON):
     ```json
     {
       "nomeProjeto": "Meu Primeiro Karaokê"
     }
     ```

2. **Upload Completo**
   - Método: `POST`
   - URL: `http://localhost:5000/api/upload/complete`
   - Body (form-data):
     - `playback`: [arquivo de áudio]
     - `background`: [arquivo de vídeo/imagem]
     - `letraTexto`: "Letra da música aqui..."
     - `nomeProjeto`: "Meu Projeto"

3. **Verificar Estrofes**
   - Método: `GET`
   - URL: `http://localhost:5000/api/lyrics/[PROJECT_ID]`

---

## 🎯 Fluxo Básico

### Passo a Passo Completo

```javascript
// 1. Criar projeto
const createResponse = await fetch('http://localhost:5000/api/project/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nomeProjeto: 'Teste' })
});
const { projectId } = (await createResponse.json()).data;

// 2. Upload de arquivos
const formData = new FormData();
formData.append('playback', playbackFile);
formData.append('background', backgroundFile);
formData.append('letraTexto', 'Minha letra...');
formData.append('nomeProjeto', 'Teste');

await fetch('http://localhost:5000/api/upload/complete', {
  method: 'POST',
  body: formData
});

// 3. Editar estrofe
await fetch(`http://localhost:5000/api/lyrics/${projectId}/verse/0`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'Primeira estrofe editada',
    timeStart: '00:00',
    timeEnd: '00:10'
  })
});

// 4. Atualizar estilo
await fetch(`http://localhost:5000/api/style/${projectId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fontFamily: 'Arial',
    fontSize: 48,
    textColor: '#FFFFFF',
    outlineColor: '#000000',
    bold: true
  })
});

// 5. Exportar vídeo
const exportResponse = await fetch(`http://localhost:5000/api/export/${projectId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    format: 'mp4',
    quality: '1080p'
  })
});
const { jobId } = (await exportResponse.json()).data;

// 6. Monitorar progresso
setInterval(async () => {
  const status = await fetch(
    `http://localhost:5000/api/export/${projectId}/status/${jobId}`
  );
  const { data } = await status.json();
  
  console.log(`Progresso: ${data.progress}%`);
  
  if (data.status === 'completed') {
    console.log('Download:', data.outputUrl);
  }
}, 2000);
```

---

## 🎨 Exemplo HTML Simples

Copie e cole em um arquivo HTML:

```html
<!DOCTYPE html>
<html>
<head>
  <title>LenaVS - Quick Test</title>
  <style>
    body { font-family: Arial; padding: 20px; }
    button { padding: 10px; margin: 5px; }
    textarea { width: 100%; height: 150px; }
  </style>
</head>
<body>
  <h1>🎤 LenaVS Quick Test</h1>
  
  <div>
    <h3>1. Criar Projeto</h3>
    <input type="text" id="projectName" placeholder="Nome do projeto" />
    <button onclick="createProject()">Criar</button>
    <p>Project ID: <strong id="projectId">-</strong></p>
  </div>

  <div>
    <h3>2. Adicionar Letra</h3>
    <textarea id="lyrics" placeholder="Digite a letra aqui..."></textarea>
    <button onclick="uploadLyrics()">Enviar Letra</button>
  </div>

  <div>
    <h3>3. Listar Estrofes</h3>
    <button onclick="listVerses()">Listar</button>
    <div id="versesList"></div>
  </div>

  <script>
    const API_URL = 'http://localhost:5000/api';
    let currentProjectId = null;

    async function createProject() {
      const name = document.getElementById('projectName').value;
      
      const response = await fetch(`${API_URL}/project/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomeProjeto: name || 'Projeto Teste' })
      });
      
      const data = await response.json();
      currentProjectId = data.data.projectId;
      
      document.getElementById('projectId').textContent = currentProjectId;
      alert('Projeto criado!');
    }

    async function uploadLyrics() {
      if (!currentProjectId) {
        alert('Crie um projeto primeiro!');
        return;
      }

      const lyrics = document.getElementById('lyrics').value;
      
      const response = await fetch(`${API_URL}/upload/letra`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ letraTexto: lyrics })
      });
      
      const data = await response.json();
      alert(`Letra enviada! ${data.data.verses.length} estrofes criadas.`);
    }

    async function listVerses() {
      if (!currentProjectId) {
        alert('Crie um projeto primeiro!');
        return;
      }

      const response = await fetch(`${API_URL}/lyrics/${currentProjectId}`);
      const data = await response.json();
      
      const list = document.getElementById('versesList');
      list.innerHTML = '<ul>' + 
        data.data.verses.map((v, i) => 
          `<li><strong>Estrofe ${i+1}:</strong> ${v.text.substring(0, 50)}...</li>`
        ).join('') + 
        '</ul>';
    }
  </script>
</body>
</html>
```

Salve como `test.html` e abra no navegador!

---

## 🧪 Testes Rápidos

### Teste 1: Health Check
```bash
curl http://localhost:5000/health
```
✅ Deve retornar status online

### Teste 2: Criar Projeto
```bash
curl -X POST http://localhost:5000/api/project/create \
  -H "Content-Type: application/json" \
  -d '{"nomeProjeto": "Teste"}'
```
✅ Deve retornar projectId

### Teste 3: Listar Projetos
```bash
curl http://localhost:5000/api/project
```
✅ Deve retornar lista de projetos

### Teste 4: Opções de Exportação
```bash
curl http://localhost:5000/api/export/options
```
✅ Deve retornar formatos e qualidades disponíveis

---

## 🔧 Troubleshooting Rápido

### Servidor não inicia?
```bash
# Verificar porta
lsof -i :5000

# Mudar porta
echo "PORT=3000" >> .env
npm start
```

### FFmpeg não encontrado?
```bash
# Verificar
which ffmpeg

# Instalar
sudo apt install ffmpeg  # Linux
brew install ffmpeg      # macOS
```

### Erro de permissão?
```bash
chmod -R 755 uploads outputs temp projects
```

---

## 🎓 Próximos Passos

1. ✅ Servidor funcionando
2. 📚 Ler [API_EXAMPLES.md](./API_EXAMPLES.md) para exemplos detalhados
3. 🔗 Ler [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) para integração com frontend
4. 🏗️ Ler [DIAGRAMA_DE_ARQUITETURA.md](./DIAGRAMA_DE_ARQUITETURA.md) para entender a arquitetura

---

## 💡 Dicas

- Use **Postman** ou **Insomnia** para testar a API
- Consulte o **README.md** para documentação completa
- Todos os endpoints retornam JSON
- Arquivos de teste estão em `/uploads/`
- Vídeos exportados ficam em `/outputs/`

---

## 🎉 Pronto!

Seu backend LenaVS está funcionando!

**Teste agora:**
```
http://localhost:5000
```

---

**© 2024 LenaVS - Quick Start Guide**
