import { create } from 'zustand';

export interface VerseStyle {
  font: string;
  fontSize: number;
  textColor: string;
  outlineColor: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  alignment: 'left' | 'center' | 'right';
}

export interface Verse {
  text: string;
  startTime: string;
  endTime: string;
  style: VerseStyle;
  order: number;
}

export interface GlobalStyle extends VerseStyle {
  transition: 'fade' | 'slide' | 'none';
}

export interface Project {
  _id?: string;
  name: string;
  originalMusic?: {
    filename: string;
    path: string;
    duration: number;
  };
  playbackInstrumental?: {
    filename: string;
    path: string;
    duration: number;
  };
  background?: {
    filename: string;
    path: string;
    type: 'image' | 'video';
  };
  lyrics: {
    text: string;
    verses: Verse[];
  };
  globalStyle: GlobalStyle;
  exportSettings: {
    format: 'mp4' | 'mov' | 'avi';
    resolution: string;
    fps: number;
  };
  isPublic: boolean;
  status: 'draft' | 'processing' | 'completed' | 'error';
}

interface ProjectState {
  currentProject: Project | null;
  projects: Project[];
  setCurrentProject: (project: Project | null) => void;
  updateProject: (project: Partial<Project>) => void;
  addVerse: (verse: Verse) => void;
  updateVerse: (index: number, verse: Partial<Verse>) => void;
  removeVerse: (index: number) => void;
  updateGlobalStyle: (style: Partial<GlobalStyle>) => void;
  setProjects: (projects: Project[]) => void;
}

const defaultGlobalStyle: GlobalStyle = {
  font: 'Montserrat',
  fontSize: 48,
  textColor: '#FFFFFF',
  outlineColor: '#000000',
  bold: false,
  italic: false,
  underline: false,
  alignment: 'center',
  transition: 'fade',
};

export const useProjectStore = create<ProjectState>((set) => ({
  currentProject: null,
  projects: [],
  
  setCurrentProject: (project) => set({ currentProject: project }),
  
  updateProject: (updates) =>
    set((state) => ({
      currentProject: state.currentProject
        ? { ...state.currentProject, ...updates }
        : null,
    })),
  
  addVerse: (verse) =>
    set((state) => {
      if (!state.currentProject) return state;
      return {
        currentProject: {
          ...state.currentProject,
          lyrics: {
            ...state.currentProject.lyrics,
            verses: [...state.currentProject.lyrics.verses, verse],
          },
        },
      };
    }),
  
  updateVerse: (index, verseUpdates) =>
    set((state) => {
      if (!state.currentProject) return state;
      const verses = [...state.currentProject.lyrics.verses];
      verses[index] = { ...verses[index], ...verseUpdates };
      return {
        currentProject: {
          ...state.currentProject,
          lyrics: {
            ...state.currentProject.lyrics,
            verses,
          },
        },
      };
    }),
  
  removeVerse: (index) =>
    set((state) => {
      if (!state.currentProject) return state;
      const verses = state.currentProject.lyrics.verses.filter((_, i) => i !== index);
      return {
        currentProject: {
          ...state.currentProject,
          lyrics: {
            ...state.currentProject.lyrics,
            verses,
          },
        },
      };
    }),
  
  updateGlobalStyle: (styleUpdates) =>
    set((state) => {
      if (!state.currentProject) return state;
      return {
        currentProject: {
          ...state.currentProject,
          globalStyle: {
            ...state.currentProject.globalStyle,
            ...styleUpdates,
          },
        },
      };
    }),
  
  setProjects: (projects) => set({ projects }),
}));

export { defaultGlobalStyle };
