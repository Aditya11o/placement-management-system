import api from './api';

export interface InterviewRound {
    name: string;
    details: string;
    questions?: string[];
}

export interface InterviewExperience {
    _id: string;
    student: {
        _id: string;
        name: string;
        profile_picture?: string;
    };
    company_name: string;
    role: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    rounds: InterviewRound[];
    verdict: 'Selected' | 'Rejected' | 'Waitlisted' | 'In Progress';
    tips?: string;
    is_anonymous: boolean;
    upvotes: string[];
    view_count: number;
    created_at: string;
}

export interface PrepKit {
    companyName: string;
    experienceCount: number;
    summary: {
        round_patterns: string[];
        master_questions: string[];
        top_tips: string[];
        difficulty_score: number;
        verdict: string;
    } | null;
    experiences: InterviewExperience[];
    message?: string;
}

export const experienceService = {
    getExperiences: async (filters: { company?: string; role?: string; difficulty?: string; page?: number }) => {
        const query = new URLSearchParams(filters as any).toString();
        const res = await api.get(`/experiences?${query}`);
        return res.data;
    },

    shareExperience: async (data: any) => {
        const res = await api.post('/experiences', data);
        return res.data;
    },

    voteExperience: async (id: string) => {
        const res = await api.post(`/experiences/${id}/vote`);
        return res.data;
    },

    getPrepKit: async (companyName: string) => {
        const res = await api.get(`/experiences/prep-kit/${companyName}`);
        return res.data.data as PrepKit;
    }
};
