import { create } from 'zustand';
import api from '../api/client';
export interface Resume {
  id: string; file_name: string; file_size: number;
  ats_score: number; status: string; created_at: string;
  ats_details?: any; parsed_sections?: any;
}
interface ResumeState {
  resumes: Resume[]; currentResume: Resume | null;
  isUploading: boolean; isLoading: boolean;
  uploadResume: (file: File) => Promise<any>;
  fetchResumes: () => Promise<void>;
  fetchResume: (id: string) => Promise<void>;
  deleteResume: (id: string) => Promise<void>;
}
export const useResumeStore = create<ResumeState>((set) => ({
  resumes: [], currentResume: null, isUploading: false, isLoading: false,
  uploadResume: async (file) => {
    set({ isUploading: true });
    try {
      const form = new FormData();
      form.append('resume', file);
      const { data } = await api.post('/api/resumes', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      const resume = { ...data.data.resume, ats_details: data.data.ats };
      set((s) => ({ resumes: [resume, ...s.resumes] }));
      return data.data;
    } finally { set({ isUploading: false }); }
  },
  fetchResumes: async () => {
    set({ isLoading: true });
    try { const { data } = await api.get('/api/resumes'); set({ resumes: data.data }); }
    finally { set({ isLoading: false }); }
  },
  fetchResume: async (id) => {
    const { data } = await api.get(`/api/resumes/${id}`);
    set({ currentResume: data.data });
  },
  deleteResume: async (id) => {
    await api.delete(`/api/resumes/${id}`);
    set((s) => ({ resumes: s.resumes.filter((r) => r.id !== id) }));
  },
}));
