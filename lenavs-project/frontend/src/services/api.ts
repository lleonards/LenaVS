import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Serviços de autenticação
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (name: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Serviços de projetos
export const projectService = {
  getProjects: async (page = 1, limit = 10, search = '') => {
    const response = await api.get('/projects', { params: { page, limit, search } });
    return response.data;
  },
  
  getProject: async (id: string) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },
  
  createProject: async (name: string) => {
    const response = await api.post('/projects', { name });
    return response.data;
  },
  
  updateProject: async (id: string, data: any) => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  },
  
  deleteProject: async (id: string) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },
  
  updateVerses: async (id: string, verses: any[]) => {
    const response = await api.put(`/projects/${id}/verses`, { verses });
    return response.data;
  },
  
  updateGlobalStyle: async (id: string, globalStyle: any) => {
    const response = await api.put(`/projects/${id}/style`, { globalStyle });
    return response.data;
  },
  
  getRecentProjects: async () => {
    const response = await api.get('/projects/recent');
    return response.data;
  },
};

// Serviços de upload
export const uploadService = {
  uploadProjectFiles: async (files: FormData) => {
    const response = await api.post('/upload/project-files', files, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  uploadAudio: async (file: File) => {
    const formData = new FormData();
    formData.append('audio', file);
    const response = await api.post('/upload/audio', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

// Serviços de biblioteca
export const libraryService = {
  getLibraryItems: async (page = 1, limit = 20) => {
    const response = await api.get('/library', { params: { page, limit } });
    return response.data;
  },
  
  getLibraryItemsByType: async (type: string, page = 1, limit = 20) => {
    const response = await api.get(`/library/type/${type}`, { params: { page, limit } });
    return response.data;
  },
  
  createLibraryItem: async (data: any) => {
    const response = await api.post('/library', data);
    return response.data;
  },
  
  getCommunityResources: async (page = 1, limit = 20, type?: string) => {
    const response = await api.get('/library/community/public', { 
      params: { page, limit, type } 
    });
    return response.data;
  },
};

// Serviços de exportação
export const exportService = {
  exportVideo: async (projectId: string) => {
    const response = await api.post(`/export/${projectId}`);
    return response.data;
  },
  
  getExportStatus: async (projectId: string) => {
    const response = await api.get(`/export/status/${projectId}`);
    return response.data;
  },
  
  downloadVideo: async (projectId: string) => {
    const response = await api.get(`/export/download/${projectId}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
