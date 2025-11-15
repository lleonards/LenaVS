import React from 'react';

export const MusicNoteIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V3h2V1h-4z"/>
    </svg>
);


export const InstrumentalIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M10,2A2,2,0,0,0,8,4V14.26A4,4,0,1,0,10,18V10H16V14.26A4,4,0,1,0,18,18V4A2,2,0,0,0,16,2H10Z" />
    </svg>
);

export const ImageIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
);

export const PlayIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"></path></svg>
);

export const PauseIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 6a1 1 0 00-1 1v6a1 1 0 102 0V7a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v6a1 1 0 102 0V7a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
);

export const TrashIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
);

export const SaveIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
);

export const ShareIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8m-4-6l-4-4m0 0L8 6m4-4v12"></path></svg>
);

export const VolumeIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 2a6 6 0 00-6 6v3.586l-1.707 1.707A1 1 0 003 15v1a1 1 0 001 1h12a1 1 0 001-1v-1a1 1 0 00-.293-.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path></svg>
);

export const ExpandIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5v4m0 0h-4"></path></svg>
);

export const Logo: React.FC<{ className?: string }> = ({ className = "h-8 w-auto" }) => (
    <svg className={className} viewBox="0 0 135 40" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMid meet">
      <defs>
        <style>
          {`.logo-font { font-family: 'Montserrat', sans-serif; font-size: 26px; font-weight: 800; letter-spacing: -1px; }`}
        </style>
      </defs>
      <rect width="135" height="40" rx="8" fill="black" />
      <text x="50%" y="29" textAnchor="middle" className="logo-font">
          <tspan fill="white">Lena</tspan><tspan fill="#FF7043">VS</tspan>
      </text>
    </svg>
);

export const AlignLeftIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 4H21V6H3V4ZM3 9H15V11H3V9ZM3 14H21V16H3V14ZM3 19H15V21H3V19Z" />
    </svg>
);

export const AlignCenterIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 4H21V6H3V4ZM7 9H17V11H7V9ZM3 14H21V16H3V14ZM7 19H17V21H7V19Z" />
    </svg>
);

export const AlignRightIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 4H21V6H3V4ZM9 9H21V11H9V9ZM3 14H21V16H3V14ZM9 19H21V21H9V19Z" />
    </svg>
);

export const SkipBackwardIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M8.445 14.832A1 1 0 0010 14V6a1 1 0 00-1.555-.832L6 6.832V6a1 1 0 00-2 0v8a1 1 0 002 0v-1.168l2.445 1.001zM12 6a1 1 0 00-1 1v6a1 1 0 102 0V7a1 1 0 00-1-1z"></path></svg>
);

export const SkipForwardIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M11.555 5.168A1 1 0 0010 6v8a1 1 0 001.555.832L14 13.168V14a1 1 0 002 0V6a1 1 0 00-2 0v1.168l-2.445-1.001zM8 6a1 1 0 00-1.555-.832L4 6.832V6a1 1 0 00-2 0v8a1 1 0 002 0v-1.168l2.445 1.001A1 1 0 008 14V6z"></path></svg>
);
