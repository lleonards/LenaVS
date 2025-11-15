
import React, { useState, useRef, useEffect } from 'react';
import { Stanza } from '../types';
import { PlayIcon, TrashIcon } from './Icons';

interface LyricsEditorProps {
  stanzas: Stanza[];
  setStanzas: React.Dispatch<React.SetStateAction<Stanza[]>>;
  lyricsLoaded: boolean;
  onLyricsLoad: (stanzas: Stanza[]) => void;
  setCurrentTime: (time: number) => void;
}

const formatTime = (timeInSeconds: number) => {
    const totalSeconds = Math.round(timeInSeconds);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const parseTime = (timeStr: string): number => {
    if (!timeStr) return 0;
    if (timeStr.includes(':')) {
        const parts = timeStr.split(':');
        const minutes = parseInt(parts[0], 10);
        const seconds = parseInt(parts[1], 10);
        if (isNaN(minutes) || isNaN(seconds)) return 0;
        return minutes * 60 + seconds;
    }
    const seconds = parseInt(timeStr, 10);
    if (isNaN(seconds)) return 0;
    return seconds;
};

const LyricsPrompt: React.FC<{ onLyricsSubmit: (text: string) => void }> = ({ onLyricsSubmit }) => {
    const [pastedText, setPastedText] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                onLyricsSubmit(text);
            };
            reader.readAsText(file);
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };
    
    const handlePasteAndSubmit = () => {
        if(pastedText.trim()){
            onLyricsSubmit(pastedText);
        }
    }

    return (
        <div className="text-center py-10 px-6 border-2 border-dashed border-slate-600 rounded-lg">
            <p className="text-slate-400 mb-6">Envie ou cole a letra da música para começar a edição.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".txt,.doc,.docx,.pdf" />
                <button onClick={handleImportClick} className="bg-slate-600 text-white px-4 py-2 rounded-md hover:bg-slate-500 transition-colors">
                    Importar .txt
                </button>
                <div className="flex gap-2">
                    <textarea 
                        value={pastedText}
                        onChange={(e) => setPastedText(e.target.value)}
                        placeholder="Ou cole a letra aqui..."
                        className="bg-slate-700 text-white w-full sm:w-64 p-2 border border-slate-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                        rows={1}
                    ></textarea>
                     <button onClick={handlePasteAndSubmit} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                        Enviar
                    </button>
                </div>
            </div>
        </div>
    );
}

const StanzaEditor: React.FC<{
  stanza: Stanza;
  index: number;
  updateStanza: (id: number, field: keyof Stanza, value: string | number) => void;
  removeStanza: (id: number) => void;
  setCurrentTime: (time: number) => void;
}> = ({ stanza, index, updateStanza, removeStanza, setCurrentTime }) => {
  const lineCount = stanza.text.split('\n').length;
  const duration = stanza.endTime - stanza.startTime;

  const [startTimeStr, setStartTimeStr] = useState(formatTime(stanza.startTime));
  const [endTimeStr, setEndTimeStr] = useState(formatTime(stanza.endTime));

  useEffect(() => {
    setStartTimeStr(formatTime(stanza.startTime));
  }, [stanza.startTime]);

  useEffect(() => {
    setEndTimeStr(formatTime(stanza.endTime));
  }, [stanza.endTime]);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'startTime' | 'endTime') => {
    if (field === 'startTime') {
      setStartTimeStr(e.target.value);
    } else {
      setEndTimeStr(e.target.value);
    }
  };

  const handleTimeBlur = (field: 'startTime' | 'endTime') => {
    const timeStr = field === 'startTime' ? startTimeStr : endTimeStr;
    const newTimeInSeconds = parseTime(timeStr);
    updateStanza(stanza.id, field, newTimeInSeconds);
  };

  return (
    <div className="bg-slate-700 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold text-white">Estrofe {index + 1}</h4>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentTime(stanza.startTime)} className="text-slate-400 hover:text-white transition-colors"><PlayIcon className="w-6 h-6" /></button>
          <button onClick={() => removeStanza(stanza.id)} className="text-slate-400 hover:text-red-500 transition-colors"><TrashIcon /></button>
        </div>
      </div>
      <textarea
        value={stanza.text}
        onChange={(e) => updateStanza(stanza.id, 'text', e.target.value)}
        className="w-full bg-slate-900 text-slate-300 p-2 border border-slate-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
        rows={4}
      />
      <div className="grid grid-cols-2 gap-4 mt-2">
        <div>
          <label className="text-xs text-slate-400">Início no Playback (mm:ss)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={startTimeStr}
              onChange={(e) => handleTimeChange(e, 'startTime')}
              onBlur={() => handleTimeBlur('startTime')}
              className="w-full bg-slate-900 text-slate-300 p-2 border border-slate-600 rounded-md"
              placeholder="mm:ss"
            />
            <button onClick={() => setCurrentTime(stanza.startTime)} className="bg-slate-600 text-white px-4 text-sm rounded-md hover:bg-slate-500">Agora</button>
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-400">Fim no Playback (mm:ss)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={endTimeStr}
              onChange={(e) => handleTimeChange(e, 'endTime')}
              onBlur={() => handleTimeBlur('endTime')}
              className="w-full bg-slate-900 text-slate-300 p-2 border border-slate-600 rounded-md"
              placeholder="mm:ss"
            />
            <button onClick={() => setCurrentTime(stanza.endTime)} className="bg-slate-600 text-white px-4 text-sm rounded-md hover:bg-slate-500">Agora</button>
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-2">Duração no playback: {duration.toFixed(1)}s | {lineCount} linhas</p>
    </div>
  );
};

const LyricsEditor: React.FC<LyricsEditorProps> = ({ stanzas, setStanzas, lyricsLoaded, onLyricsLoad, setCurrentTime }) => {
  const parseAndSetStanzas = (text: string) => {
    const stanzasArray = text.split(/\n\s*\n/).map((stanzaText, index) => {
        const prevEndTime = index > 0 ? (stanzas[index-1] ? stanzas[index-1].endTime : index * 10) : 0;
        const duration = stanzaText.split('\n').length * 3.5;
        return {
            id: Date.now() + index,
            text: stanzaText.trim(),
            startTime: prevEndTime + 1,
            endTime: prevEndTime + 1 + Math.max(2, duration),
        }
    });
    onLyricsLoad(stanzasArray);
  };

  const addStanza = () => {
    const lastStanza = stanzas[stanzas.length - 1];
    const newStartTime = lastStanza ? lastStanza.endTime + 1 : 0;
    const newStanza: Stanza = {
      id: Date.now(),
      text: 'Nova estrofe...',
      startTime: newStartTime,
      endTime: newStartTime + 10,
    };
    setStanzas([...stanzas, newStanza]);
  };

  const removeStanza = (id: number) => {
    setStanzas(stanzas.filter((s) => s.id !== id));
  };

  const updateStanza = (id: number, field: keyof Stanza, value: string | number) => {
    setStanzas(
      stanzas.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Editor de Letras</h2>
        {lyricsLoaded && (
            <div className="flex gap-2">
                <button className="bg-slate-600 text-white px-4 py-2 rounded-md hover:bg-slate-500 transition-colors text-sm">Importar .txt</button>
                <button onClick={addStanza} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm">Adicionar Estrofe</button>
            </div>
        )}
      </div>
      
      {!lyricsLoaded ? (
        <LyricsPrompt onLyricsSubmit={parseAndSetStanzas} />
      ) : (
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {stanzas.map((stanza, index) => (
            <StanzaEditor
              key={stanza.id}
              stanza={stanza}
              index={index}
              updateStanza={updateStanza}
              removeStanza={removeStanza}
              setCurrentTime={setCurrentTime}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LyricsEditor;
