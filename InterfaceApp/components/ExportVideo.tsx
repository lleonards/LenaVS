
import React from 'react';

const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

const ExportVideo: React.FC<{ duration: number }> = ({ duration }) => {
  return (
    <div className="bg-slate-800 p-6 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4">Exportar Vídeo</h2>
      <p className="text-sm text-slate-400 mb-4">
        Gere o vídeo karaokê final com letras em blocos/estrofes.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="text-xs text-slate-400 block mb-1">Formato</label>
          <select className="w-full bg-slate-700 text-white p-2 border border-slate-600 rounded-md">
            <option>MP4</option>
            <option>MOV</option>
            <option>AVI</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">Qualidade</label>
          <select defaultValue="1080p" className="w-full bg-slate-700 text-white p-2 border border-slate-600 rounded-md">
            <option>480p</option>
            <option>720p</option>
            <option>1080p</option>
            <option>4K</option>
          </select>
        </div>
        <div>
            <label className="text-xs text-slate-400 block mb-1">Duração</label>
            <div className="w-full bg-slate-700 text-white p-2 border border-slate-600 rounded-md h-[42px] flex items-center">
                {formatDuration(duration)}
            </div>
        </div>
      </div>
      <button className="w-full bg-green-600 text-white font-bold py-3 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
        <span>Download</span>
      </button>
    </div>
  );
};

export default ExportVideo;
