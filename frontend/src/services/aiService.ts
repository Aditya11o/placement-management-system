import api from './api';

export interface NextAction {
    title: string;
    description: string;
    icon: 'Briefcase' | 'Target' | 'Star' | 'Zap';
    link: string;
}

export interface InterviewQuestions {
    technical: string[];
    behavioral: string[];
}

export interface ResumeAnalysis {
    match_score: number;
    verdict: string;
    suggestions: Array<{ original: string; suggested: string }>;
    gaps: string[];
}

export interface InterviewAnalysis {
    star_status: { S: boolean; T: boolean; A: boolean; R: boolean };
    star_feedback: string;
    metrics: {
        confidence: number;
        filler_count: number;
        pace_feedback: string;
    };
}

export interface AutoTuneResult {
    summary: string;
    optimized_sections: Array<{ title: string; bullets: string[] }>;
    recommended_skills: string[];
}

export const aiService = {
    // ... same methods ...
    autoTuneResume: async (data: { jobId: string; resumeVersion: number }) => {
        const res = await api.post('/ai/auto-tune-resume', data);
        return res.data.data as AutoTuneResult;
    },

    getNextActions: async (stats: any) => {
        const res = await api.get('/ai/next-actions', {
            params: { stats: JSON.stringify(stats) }
        });
        return res.data.data as NextAction[];
    },

    getSkillSuggestions: async () => {
        const res = await api.get('/ai/skill-suggestions');
        return res.data.data as string[];
    },

    summarizeExperience: async (experience: any) => {
        const res = await api.post('/ai/summarize-experience', { experience });
        return res.data.data as string;
    },

    generateMockInterview: async (data: { title: string; description?: string; skills?: string[] }) => {
        const res = await api.post('/ai/generate-interview', data);
        return res.data.data as InterviewQuestions;
    },

    analyzeResume: async (data: { title: string; description?: string; skills?: string[] }) => {
        const res = await api.post('/ai/analyze-resume', data);
        return res.data.data as ResumeAnalysis;
    },

    analyzeInterviewResponse: async (data: { question: string; transcript: string }) => {
        const res = await api.post('/ai/analyze-interview-response', data);
        return res.data.data as InterviewAnalysis;
    }
};
