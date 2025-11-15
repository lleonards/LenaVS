
import React, { useEffect, useRef, useState } from 'react';
import { Stanza, TextStyleState } from '../types';
import { SkipBackwardIcon, SkipForwardIcon, PlayIcon, PauseIcon, MusicNoteIcon } from './Icons';

type AudioSource = 'original' | 'instrumental';
type BackgroundType = 'image' | 'video';

interface PreviewProps {
  stanzas: Stanza[];
  currentTime: number;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
  totalDuration: number;
  setTotalDuration: React.Dispatch<React.SetStateAction<number>>;
  textStyle: TextStyleState;
  originalMusicUrl: string | null;
  instrumentalUrl: string | null;
  activeAudio: AudioSource;
  setActiveAudio: React.Dispatch<React.SetStateAction<AudioSource>>;
  backgroundUrl: string | null;
  backgroundType: BackgroundType | null;
}

const Preview: React.FC<PreviewProps> = ({ 
  stanzas, 
  currentTime, 
  setCurrentTime, 
  totalDuration,
  setTotalDuration, 
  textStyle,
  originalMusicUrl,
  instrumentalUrl,
  activeAudio,
  setActiveAudio,
  backgroundUrl,
  backgroundType
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const activeStanza = stanzas.find(s => currentTime >= s.startTime && currentTime < s.endTime);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const audioUrl = activeAudio === 'original' ? originalMusicUrl : instrumentalUrl;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audioUrl && audio.src !== audioUrl) {
      const storedTime = audio.currentTime;
      const wasPlaying = !audio.paused;
      
      setIsPlaying(false);
      audio.src = audioUrl;
      audio.load();

      const handleCanPlay = () => {
        audio.currentTime = storedTime;
        if (wasPlaying) {
          audio.play().catch(e => console.error("Error resuming play:", e));
        }
        audio.removeEventListener('canplay', handleCanPlay);
      };
      audio.addEventListener('canplay', handleCanPlay);

    } else if (!audioUrl) {
      audio.src = '';
    }
  }, [audioUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (video && backgroundType === 'video' && backgroundUrl) {
      if (video.src !== backgroundUrl) {
        video.src = backgroundUrl;
        video.load();
      }
    }
  }, [backgroundUrl, backgroundType]);

  useEffect(() => {
    const audio = audioRef.current;
    const video = videoRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (video && Math.abs(video.currentTime - audio.currentTime) > 0.15) {
          video.currentTime = audio.currentTime;
      }
    };
    const handleLoadedMetadata = () => {
        if (isFinite(audio.duration)) {
          setTotalDuration(audio.duration);
        }
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
        setIsPlaying(false);
        if (video) video.pause();
    }

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [setCurrentTime, setTotalDuration]);

  const handleSeek = (event: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const video = videoRef.current;
    if (progressBarRef.current && audio && isFinite(totalDuration) && totalDuration > 0) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const width = rect.width;
      const newTime = (clickX / width) * totalDuration;
      const clampedTime = Math.max(0, Math.min(newTime, totalDuration));
      audio.currentTime = clampedTime;
      if (video) video.currentTime = clampedTime;
      setCurrentTime(clampedTime);
    }
  };

  const getPreviewTextStyle = () => {
      const style: React.CSSProperties = {
          fontFamily: textStyle.font,
          fontSize: `${textStyle.size}px`,
          color: textStyle.textColor,
          textAlign: textStyle.alignment,
          fontWeight: textStyle.isBold ? 'bold' : 'normal',
          fontStyle: textStyle.isItalic ? 'italic' : 'normal',
          textDecoration: textStyle.isUnderlined ? 'underline' : 'none',
          textShadow: `${textStyle.outlineColor} 1px 1px 1px, ${textStyle.outlineColor} -1px 1px 1px, ${textStyle.outlineColor} 1px -1px 1px, ${textStyle.outlineColor} -1px -1px 1px`,
          transition: 'color 0.2s ease-in-out',
      };
      return style;
  };

  const handlePlayPause = () => {
    const audio = audioRef.current;
    const video = videoRef.current;
    if (!audio || !audioUrl) return;

    if (isPlaying) {
      audio.pause();
      if (video) video.pause();
    } else {
      if (audio.currentTime >= totalDuration) {
        audio.currentTime = 0;
        setCurrentTime(0);
        if (video) video.currentTime = 0;
      }
      audio.play().catch(e => console.error("Error playing audio:", e));
      if (video) video.play().catch(e => console.error("Error playing video:", e));
    }
  };

  const handleSkip = (amount: number) => {
    const audio = audioRef.current;
    const video = videoRef.current;
    if (!audio || !isFinite(totalDuration)) return;

    const newTime = Math.max(0, Math.min(audio.currentTime + amount, totalDuration));
    audio.currentTime = newTime;
    if (video) {
        video.currentTime = newTime;
    }
    setCurrentTime(newTime);
  };

  const formatTime = (timeInSeconds: number) => {
    const time = isFinite(timeInSeconds) ? timeInSeconds : 0;
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (isFinite(totalDuration) && totalDuration > 0) ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className="bg-slate-800 p-2 sm:p-4 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4 px-2 sm:px-0">Preview do Karaokê</h2>
      <div className="aspect-video bg-black rounded-md flex items-center justify-center p-4 relative overflow-hidden">
          <audio ref={audioRef} className="hidden" />

          {backgroundType === 'image' && backgroundUrl && (
            <img src={backgroundUrl} className="absolute top-0 left-0 w-full h-full object-cover" alt="Background" />
          )}
          {backgroundType === 'video' && backgroundUrl && (
            <video ref={videoRef} muted className="absolute top-0 left-0 w-full h-full object-cover" />
          )}

          <div className="text-center relative z-10">
              {activeStanza ? (
                  activeStanza.text.split('\n').map((line, index) => (
                      <p key={index} style={getPreviewTextStyle()}>
                          {line || '\u00A0' /* Non-breaking space for empty lines */}
                      </p>
                  ))
              ) : (
                  <p className="text-slate-500">{!audioUrl ? "Faça upload de um áudio para começar" : "Pressione play para iniciar"}</p>
              )}
          </div>
      </div>
      <div className="mt-4 flex justify-center gap-2">
        <button
          onClick={() => setActiveAudio('original')}
          disabled={!originalMusicUrl}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            activeAudio === 'original'
              ? 'bg-slate-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <MusicNoteIcon className="w-4 h-4" />
          Música Original
        </button>
        <button
          onClick={() => setActiveAudio('instrumental')}
          disabled={!instrumentalUrl}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            activeAudio === 'instrumental'
              ? 'bg-slate-900 text-white shadow-lg'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <MusicNoteIcon className="w-4 h-4" />
          Playback
        </button>
      </div>

      <div className="mt-4 px-2 sm:px-0">
        <div className="flex items-center gap-4 text-slate-400 mb-2">
            <span className="text-xs font-mono">{formatTime(currentTime)}</span>
            <div ref={progressBarRef} onClick={handleSeek} className="w-full bg-slate-600 h-1.5 rounded-full cursor-pointer">
                <div className="bg-green-500 h-full rounded-full relative" style={{ width: `${progressPercentage}%` }}>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full shadow"></div>
                </div>
            </div>
            <span className="text-xs font-mono">{formatTime(totalDuration)}</span>
        </div>
        <div className="flex justify-center items-center gap-4">
              <button onClick={() => handleSkip(-5)} disabled={!audioUrl} className="text-slate-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-md hover:bg-slate-700">
                <SkipBackwardIcon />
              </button>
              <button onClick={handlePlayPause} disabled={!audioUrl} className="p-2 bg-slate-900 rounded-full hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {isPlaying ? <PauseIcon className="w-8 h-8 text-white" /> : <PlayIcon className="w-8 h-8 text-white" />}
              </button>
              <button onClick={() => handleSkip(5)} disabled={!audioUrl} className="text-slate-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-md hover:bg-slate-700">
                <SkipForwardIcon />
              </button>
        </div>
      </div>
    </div>
  );
};

export default Preview;
