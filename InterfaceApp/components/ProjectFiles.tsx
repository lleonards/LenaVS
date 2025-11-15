
import React from 'react';
import { MusicNoteIcon, InstrumentalIcon, ImageIcon } from './Icons';

interface FileUploadCardProps {
  icon: React.ReactNode;
  title: string;
  accept: string;
  fileUrl: string | null;
  onFileUpload?: (url: string, type?: 'image' | 'video') => void;
}

const FileUploadCard: React.FC<FileUploadCardProps> = ({ icon, title, accept, fileUrl, onFileUpload }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0] && onFileUpload) {
      const file = event.target.files[0];
      const url = URL.createObjectURL(file);
      
      if (accept.includes('video') || accept.includes('image')) {
        const type = file.type.startsWith('image/') ? 'image' : 'video';
        onFileUpload(url, type);
      } else {
        onFileUpload(url);
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-slate-800 p-4 rounded-lg text-center flex flex-col justify-between border border-slate-700 transition-all hover:border-slate-600 hover:shadow-lg">
      <div>
        <div className="bg-black/25 flex items-center justify-center h-28 rounded-md mb-4">
          <div className="text-slate-400">{icon}</div>
        </div>
        <h3 className="text-white font-medium text-sm">{title}</h3>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={accept}
        disabled={!!fileUrl}
      />
      <button
        onClick={handleClick}
        disabled={!!fileUrl}
        className={`mt-4 w-full text-white py-2 rounded-md transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-green-500 disabled:opacity-70 disabled:cursor-not-allowed ${
            fileUrl 
            ? 'bg-green-600 hover:bg-green-700' 
            : 'bg-slate-700 hover:bg-slate-600'
        }`}
      >
        {fileUrl ? 'Arquivo Carregado' : 'Fazer Upload'}
      </button>
    </div>
  );
};

interface ProjectFilesProps {
  originalMusicUrl: string | null;
  instrumentalUrl: string | null;
  backgroundUrl: string | null;
  onOriginalMusicUpload: (url: string) => void;
  onInstrumentalUpload: (url: string) => void;
  onBackgroundUpload: (url: string, type: 'image' | 'video') => void;
}

const ProjectFiles: React.FC<ProjectFilesProps> = ({ 
    originalMusicUrl, 
    instrumentalUrl, 
    backgroundUrl, 
    onOriginalMusicUpload, 
    onInstrumentalUpload, 
    onBackgroundUpload 
}) => {
  return (
    <div className="bg-slate-800 p-6 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4">Arquivos do Projeto</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <FileUploadCard 
            icon={<MusicNoteIcon />} 
            title="Música Original" 
            accept="audio/*" 
            fileUrl={originalMusicUrl}
            onFileUpload={(url) => onOriginalMusicUpload(url)} 
        />
        <FileUploadCard 
            icon={<InstrumentalIcon />} 
            title="Instrumental" 
            accept="audio/*" 
            fileUrl={instrumentalUrl}
            onFileUpload={(url) => onInstrumentalUpload(url)} 
        />
        <FileUploadCard 
            icon={<ImageIcon />} 
            title="Fundo do Video" 
            accept="video/*,image/*" 
            fileUrl={backgroundUrl}
            onFileUpload={(url, type) => onBackgroundUpload(url, type as 'image' | 'video')}
        />
      </div>
    </div>
  );
};

export default ProjectFiles;
