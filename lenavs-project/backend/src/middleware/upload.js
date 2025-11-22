const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Criar diretórios se não existirem
const createDirectories = () => {
  const dirs = [
    'uploads/audio',
    'uploads/video',
    'uploads/images',
    'uploads/lyrics',
    'uploads/exports'
  ];

  dirs.forEach(dir => {
    const fullPath = path.join(__dirname, '../../', dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
};

createDirectories();

// Configuração de armazenamento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';
    
    if (file.fieldname === 'originalMusic' || file.fieldname === 'playbackInstrumental') {
      uploadPath += 'audio';
    } else if (file.fieldname === 'background') {
      // Verificar se é imagem ou vídeo
      if (file.mimetype.startsWith('image/')) {
        uploadPath += 'images';
      } else if (file.mimetype.startsWith('video/')) {
        uploadPath += 'video';
      }
    } else if (file.fieldname === 'lyrics') {
      uploadPath += 'lyrics';
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Filtro de tipos de arquivo
const fileFilter = (req, file, cb) => {
  // Formatos de áudio
  const audioFormats = [
    'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 
    'audio/m4a', 'audio/aac', 'audio/flac', 'audio/x-ms-wma'
  ];
  
  // Formatos de vídeo
  const videoFormats = [
    'video/mp4', 'video/mpeg', 'video/quicktime', 
    'video/x-msvideo', 'video/x-matroska'
  ];
  
  // Formatos de imagem
  const imageFormats = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp'
  ];
  
  // Formatos de documento
  const documentFormats = [
    'text/plain', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/pdf'
  ];

  const allowedFormats = [
    ...audioFormats, 
    ...videoFormats, 
    ...imageFormats, 
    ...documentFormats
  ];

  if (allowedFormats.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Formato de arquivo não suportado: ${file.mimetype}`), false);
  }
};

// Configuração do multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 500 * 1024 * 1024 // 500MB padrão
  }
});

// Middleware para múltiplos campos
exports.uploadProjectFiles = upload.fields([
  { name: 'originalMusic', maxCount: 1 },
  { name: 'playbackInstrumental', maxCount: 1 },
  { name: 'background', maxCount: 1 },
  { name: 'lyrics', maxCount: 1 }
]);

// Middleware para upload único
exports.uploadSingle = (fieldName) => upload.single(fieldName);

// Middleware para múltiplos arquivos
exports.uploadMultiple = (fieldName, maxCount) => upload.array(fieldName, maxCount);
