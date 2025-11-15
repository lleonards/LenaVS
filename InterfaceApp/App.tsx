
import React from 'react';
import Header from './components/Header';
import ProjectFiles from './components/ProjectFiles';
import LyricsEditor from './components/LyricsEditor';
import Preview from './components/Preview';
import TextStyle from './components/TextStyle';
import ExportVideo from './components/ExportVideo';
import { Stanza, TextStyleState } from './types';

type AudioSource = 'original' | 'instrumental';
type BackgroundType = 'image' | 'video';

const App: React.FC = () => {
  const [stanzas, setStanzas] = React.useState<Stanza[]>([]);
  const [lyricsLoaded, setLyricsLoaded] = React.useState<boolean>(false);
  const [currentTime, setCurrentTime] = React.useState<number>(0);
  const [totalDuration, setTotalDuration] = React.useState<number>(0);
  const [textStyle, setTextStyle] = React.useState<TextStyleState>({
    font: 'Montserrat',
    size: 24,
    textColor: '#FFFFFF',
    highlightColor: '#FF7043',
    outlineColor: '#000000',
    alignment: 'center',
    isBold: false,
    isItalic: false,
    isUnderlined: false,
  });

  const [originalMusicUrl, setOriginalMusicUrl] = React.useState<string | null>(null);
  const [instrumentalUrl, setInstrumentalUrl] = React.useState<string | null>(null);
  const [activeAudio, setActiveAudio] = React.useState<AudioSource>('instrumental');

  const [backgroundUrl, setBackgroundUrl] = React.useState<string | null>(null);
  const [backgroundType, setBackgroundType] = React.useState<BackgroundType | null>(null);


  const handleLyricsLoad = (newStanzas: Stanza[]) => {
    setStanzas(newStanzas);
    setLyricsLoaded(true);
  };

  const handleBackgroundUpload = (url: string, type: BackgroundType) => {
    setBackgroundUrl(url);
    setBackgroundType(type);
  };
  
  return (
    <div className="min-h-screen bg-slate-900 text-slate-300">
      <Header />
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-3 flex flex-col gap-8">
            <ProjectFiles 
              originalMusicUrl={originalMusicUrl}
              instrumentalUrl={instrumentalUrl}
              backgroundUrl={backgroundUrl}
              onOriginalMusicUpload={setOriginalMusicUrl}
              onInstrumentalUpload={setInstrumentalUrl}
              onBackgroundUpload={handleBackgroundUpload}
            />
            <LyricsEditor 
              stanzas={stanzas}
              setStanzas={setStanzas}
              lyricsLoaded={lyricsLoaded}
              onLyricsLoad={handleLyricsLoad}
              setCurrentTime={setCurrentTime}
            />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <Preview 
              stanzas={stanzas} 
              currentTime={currentTime}
              setCurrentTime={setCurrentTime}
              totalDuration={totalDuration}
              setTotalDuration={setTotalDuration}
              textStyle={textStyle}
              originalMusicUrl={originalMusicUrl}
              instrumentalUrl={instrumentalUrl}
              activeAudio={activeAudio}
              setActiveAudio={setActiveAudio}
              backgroundUrl={backgroundUrl}
              backgroundType={backgroundType}
            />
            <TextStyle textStyle={textStyle} setTextStyle={setTextStyle} />
            <ExportVideo duration={totalDuration} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
