# 📦 Guia de Instalação - LenaVS

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 16 ou superior)
- **NPM** ou **Yarn**
- **MongoDB** (local ou MongoDB Atlas)
- **FFmpeg** (para processamento de vídeo)

### Instalar FFmpeg

#### Windows
```bash
# Usando Chocolatey
choco install ffmpeg

# Ou baixe diretamente de: https://ffmpeg.org/download.html
```

#### macOS
```bash
brew install ffmpeg
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install ffmpeg
```

## Instalação

### 1. Clone o Repositório
```bash
git clone https://github.com/seu-usuario/lenavs-project.git
cd lenavs-project
```

### 2. Configurar Backend

```bash
cd backend
npm install

# Copiar arquivo de configuração
cp .env.example .env

# Editar .env com suas configurações
nano .env
```

#### Configurar .env
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/lenavs
JWT_SECRET=sua_chave_secreta_super_segura
CORS_ORIGIN=http://localhost:3000
```

### 3. Configurar Frontend

```bash
cd ../frontend
npm install

# Copiar arquivo de configuração
cp .env.example .env

# Editar .env
nano .env
```

#### Configurar .env do Frontend
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Iniciar MongoDB

Se estiver usando MongoDB local:
```bash
mongod
```

Se estiver usando MongoDB Atlas, atualize a MONGODB_URI no .env do backend.

### 5. Iniciar a Aplicação

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

### 6. Acessar a Aplicação

Abra seu navegador em: **http://localhost:3000**

## Solução de Problemas

### Erro: FFmpeg não encontrado
- Certifique-se de que o FFmpeg está instalado e no PATH
- Verifique com: `ffmpeg -version`

### Erro: Não consegue conectar ao MongoDB
- Verifique se o MongoDB está rodando
- Confirme a MONGODB_URI no .env

### Erro: Porta já em uso
- Mude a porta no arquivo .env
- Ou encerre o processo que está usando a porta

### Erro: Module not found
- Delete node_modules e package-lock.json
- Execute `npm install` novamente

## Produção

### Build do Frontend
```bash
cd frontend
npm run build
```

### Configurar Backend para Produção
```bash
cd backend
npm start
```

### Variáveis de Ambiente de Produção
- Defina NODE_ENV=production
- Use uma JWT_SECRET forte
- Configure CORS_ORIGIN apropriadamente
- Use MongoDB Atlas ou servidor MongoDB dedicado

## Docker (Opcional)

Em breve será adicionado um Dockerfile e docker-compose.yml para facilitar o deployment.

## Suporte

Se encontrar problemas, abra uma issue no GitHub ou consulte a documentação completa.
