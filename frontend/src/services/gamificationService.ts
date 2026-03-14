import api from './api';

export interface GamificationStats {
    streak: {
        current: number;
        last_activity: string | null;
        longest: number;
    };
    badges: Array<{
        type: string;
        earned_at: string;
    }>;
    points: number;
}

export const gamificationService = {
    getStats: async () => {
        const res = await api.get('/gamification/stats');
        return res.data.data as GamificationStats;
    },

    updateStreak: async () => {
        const res = await api.post('/gamification/update-streak');
        return res.data.data;
    },

    checkBadges: async () => {
        const res = await api.post('/gamification/check-badges');
        return res.data;
    }
};
