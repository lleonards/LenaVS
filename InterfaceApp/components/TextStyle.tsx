
import React from 'react';
import { TextStyleState } from '../types';
import { AlignLeftIcon, AlignCenterIcon, AlignRightIcon } from './Icons';

interface TextStyleProps {
  textStyle: TextStyleState;
  setTextStyle: React.Dispatch<React.SetStateAction<TextStyleState>>;
}

const ColorInput: React.FC<{ label: string, value: string, onChange: (value: string) => void }> = ({ label, value, onChange }) => (
    <div>
        <label className="text-xs text-slate-400 block mb-1">{label}</label>
        <div className="flex items-center bg-slate-700 border border-slate-600 rounded-md">
            <div className="w-8 h-8 flex items-center justify-center">
              <input type="color" value={value} onChange={e => onChange(e.target.value)} className="w-6 h-6 p-0 border-none bg-transparent cursor-pointer" />
            </div>
            <input type="text" value={value.toUpperCase()} onChange={e => onChange(e.target.value)} className="w-full bg-transparent p-2 text-white" />
        </div>
    </div>
);

const TextStyle: React.FC<TextStyleProps> = ({ textStyle, setTextStyle }) => {
    const handleStyleChange = <K extends keyof TextStyleState>(key: K, value: TextStyleState[K]) => {
        setTextStyle(prev => ({ ...prev, [key]: value }));
    };

    const toggleStyle = (key: 'isBold' | 'isItalic' | 'isUnderlined') => {
        setTextStyle(prev => ({...prev, [key]: !prev[key]}));
    }

    const alignmentOptions: { [key in TextStyleState['alignment']]: React.ReactNode } = {
        left: <AlignLeftIcon />,
        center: <AlignCenterIcon />,
        right: <AlignRightIcon />,
    };

    const styleOptions: { key: 'isBold' | 'isItalic' | 'isUnderlined'; label: React.ReactNode }[] = [
        { key: 'isBold', label: <span className="font-bold">B</span> },
        { key: 'isItalic', label: <span className="italic">I</span> },
        { key: 'isUnderlined', label: <span className="underline">U</span> },
    ];


  return (
    <div className="bg-slate-800 p-6 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4">Estilo do Texto</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-slate-400 block mb-1">Fonte</label>
          <select value={textStyle.font} onChange={e => handleStyleChange('font', e.target.value)} className="w-full bg-slate-700 text-white p-2 border border-slate-600 rounded-md h-[42px]">
            <option>Montserrat</option>
            <option>Arial</option>
            <option>Verdana</option>
            <option>Times New Roman</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">Tamanho</label>
            <div className="flex items-center gap-2 bg-slate-700 border border-slate-600 rounded-md p-2 h-[42px]">
                <input 
                    type="range" 
                    min="12" 
                    max="72" 
                    step="1"
                    value={textStyle.size} 
                    onChange={e => handleStyleChange('size', parseInt(e.target.value, 10))} 
                    className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer" 
                />
                <span className="text-white text-sm w-12 text-center">{textStyle.size}px</span>
            </div>
        </div>
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <ColorInput label="Cor do Texto" value={textStyle.textColor} onChange={v => handleStyleChange('textColor', v)} />
          <ColorInput label="Contorno" value={textStyle.outlineColor} onChange={v => handleStyleChange('outlineColor', v)} />
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">Alinhamento</label>
          <div className="flex bg-slate-700 rounded-md border border-slate-600 p-1">
            {Object.entries(alignmentOptions).map(([key, icon]) => (
                <button 
                  key={key} 
                  onClick={() => handleStyleChange('alignment', key as TextStyleState['alignment'])}
                  className={`flex-1 py-2 flex justify-center items-center rounded-md text-sm transition-colors ${textStyle.alignment === key ? 'bg-slate-900 text-white' : 'text-slate-300 hover:bg-slate-600'}`}>
                  {icon}
                </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">Estilo</label>
          <div className="flex bg-slate-700 rounded-md border border-slate-600 p-1">
             {styleOptions.map(({ key, label }) => (
                <button 
                    key={key} 
                    onClick={() => toggleStyle(key)}
                    className={`flex-1 py-1 rounded-md text-sm transition-colors font-semibold ${textStyle[key] ? 'bg-slate-900 text-white' : 'text-slate-300 hover:bg-slate-600'}`}>
                    {label}
                </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextStyle;