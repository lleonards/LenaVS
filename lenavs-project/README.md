# 🎯 LenaVS - Ferramenta de Geração de Vídeos Karaokê

## 📋 Descrição do Projeto

LenaVS é uma ferramenta completa para criação de vídeos karaokê com sincronização de letras, estilos personalizados por estrofe e exportação em múltiplos formatos.

## 🚀 Tecnologias Utilizadas

### Frontend
- **React.js** com TypeScript
- **Material-UI** para componentes
- **Wavesurfer.js** para visualização de áudio
- **React Player** para preview de vídeo

### Backend
- **Node.js** com Express
- **FFmpeg** para processamento de vídeo/áudio
- **Multer** para upload de arquivos
- **MongoDB** para armazenamento de dados

## 📦 Estrutura do Projeto

```
lenavs-project/
├── frontend/                 # Aplicação React
│   ├── public/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── pages/           # Páginas da aplicação
│   │   ├── services/        # Serviços de API
│   │   ├── styles/          # Estilos globais
│   │   └── types/           # Tipos TypeScript
│   └── package.json
├── backend/                  # API Node.js
│   ├── src/
│   │   ├── controllers/     # Controladores
│   │   ├── models/          # Modelos de dados
│   │   ├── routes/          # Rotas da API
│   │   ├── services/        # Lógica de negócio
│   │   └── utils/           # Utilitários
│   └── package.json
└── README.md
```

## 🔧 Instalação

### Pré-requisitos
- Node.js 16+ 
- NPM ou Yarn
- FFmpeg instalado no sistema
- MongoDB (local ou cloud)

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Configure as variáveis de ambiente no .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## ⚙️ Configuração

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lenavs
UPLOAD_PATH=./uploads
JWT_SECRET=seu_segredo_aqui
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## 📚 Funcionalidades

### 1. 🟩 Upload de Arquivos
- **Música Original**: mp3, wav, ogg, m4a, aac, flac, wma
- **Playback Instrumental**: mp3, wav, ogg, m4a, aac, flac, wma
- **Background**: jpg, jpeg, png, mp4, mov, avi, mkv
- **Letra**: txt, docx, pdf ou texto manual

### 2. 🟦 Editor de Letras
- Controle individual de estilo por estrofe
- Sincronização precisa com botões "Agora" e "Play"
- Estilos configuráveis: fonte, tamanho, cor, contorno, alinhamento
- Gerenciamento de estrofes (adicionar/remover)

### 3. 🟨 Preview
- Player integrado com visualização em tempo real
- Alternância entre música original e playback
- Exibição de letras sincronizadas com estilos

### 4. 🟧 Estilo Global
- Definição de estilos padrão
- Transições entre estrofes
- Aplicação rápida em novas estrofes

### 5. 📤 Exportação
- Formatos: MP4, MOV, AVI
- Nome customizável do projeto
- Processamento com FFmpeg

## 🎨 Menu e Navegação

### ❓ Ajuda
- Tutorial de Início Rápido
- Documentação Completa
- FAQ
- Relatar Erro/Feedback
- Sobre o LenaVS

### 📂 Projetos
- Novo Projeto
- Abrir Projeto
- Salvar Projeto
- Salvar Como
- Gerenciar Projetos
- Projetos Recentes

### 📚 Biblioteca
- Minhas Músicas
- Meus Fundos de Vídeo
- Estilos Salvos
- Importar Recursos
- Recursos da Comunidade
- Gerenciar Visibilidade

## 🎯 Regras de Processamento

### Background de Vídeo
- **Maior que áudio**: Corta para duração do áudio
- **Menor que áudio**: Loop automático

### Background de Imagem
- Transformado em vídeo fixo com duração do áudio

### Preservação de Texto
- Todos os caracteres acentuados preservados (é, á, ç, ã, õ, â, ê, ô)

## 🚀 Como Usar

1. **Criar Novo Projeto**: Dê um nome ao seu projeto
2. **Upload de Arquivos**: Carregue música, playback, background e letra
3. **Editar Letras**: Divida em estrofes e sincronize com o áudio
4. **Aplicar Estilos**: Personalize cada estrofe individualmente
5. **Preview**: Visualize o resultado em tempo real
6. **Exportar**: Gere o vídeo final no formato desejado

## 📄 Licença

MIT License - Veja o arquivo LICENSE para mais detalhes

## 👥 Contribuindo

Contribuições são bem-vindas! Por favor, leia CONTRIBUTING.md para detalhes

## 📞 Suporte

Para suporte, envie um email para suporte@lenavs.com ou abra uma issue no GitHub

---

**Desenvolvido com ❤️ pela equipe LenaVS**
