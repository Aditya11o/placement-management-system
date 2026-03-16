import api from './api';
import { StudentProfile, ApiResponse, Job, Application } from '../types';

export const studentService = {
    // ... existing methods
    // Jobs
    getEligibleJobs: async (params?: URLSearchParams): Promise<ApiResponse<Job[]>> => {
        const res = await api.get(`/jobs${params ? '?' + params.toString() : ''}`);
        return res.data;
    },

    getJobById: async (id: string): Promise<ApiResponse<Job>> => {
        const res = await api.get(`/jobs/${id}`);
        return res.data;
    },
    
    applyForJob: async (jobId: string) => {
        const res = await api.post('/applications', { job: jobId });
        return res.data;
    },

    // Applications
    getApplications: async (): Promise<ApiResponse<Application[]>> => {
        const res = await api.get('/applications/student');
        return res.data;
    },
    
    respondToOffer: async (id: string, action: 'accept' | 'decline') => {
        const res = await api.post(`/applications/${id}/${action}`);
        return res.data;
    },

    updateApplicationJournal: async (id: string, journalData: { student_notes?: string; checklists?: any[] }) => {
        const res = await api.put(`/applications/${id}/journal`, journalData);
        return res.data;
    },

    // Profile
    getProfile: async (): Promise<ApiResponse<StudentProfile>> => {
        const res = await api.get('/students/profile');
        return res.data;
    },
    
    updateProfile: async (updateData: Partial<StudentProfile>): Promise<ApiResponse<StudentProfile>> => {
        const res = await api.put('/students/profile', updateData);
        return res.data;
    },

    // Upload & Resumes
    uploadProfilePhoto: async (formData: FormData) => {
        const res = await api.post('/upload/profile-photo', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
    },

    uploadResume: async (formData: FormData) => {
        const res = await api.post('/upload/resume', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
    },
    
    getResumes: async () => {
        const res = await api.get('/upload/resumes');
        return res.data;
    },
    
    activateResume: async (id: string) => {
        const res = await api.put(`/upload/resumes/${id}/activate`);
        return res.data;
    },
    
    deleteResume: async (id: string) => {
        const res = await api.delete(`/upload/resumes/${id}`);
        return res.data;
    }
};
