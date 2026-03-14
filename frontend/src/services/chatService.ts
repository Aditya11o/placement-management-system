import api from './api';

export interface Message {
    _id: string;
    conversation_id: string;
    sender_id: string;
    sender_model: 'Student' | 'Recruiter';
    text?: string;
    message_type: 'TEXT' | 'FILE';
    file_url?: string;
    is_read: boolean;
    sent_at: string;
}

export interface Conversation {
    _id: string;
    student_id: any;
    recruiter_id: any;
    application_id: string;
    job_id: any;
    last_message?: {
        text: string;
        sender_id: string;
        sent_at: string;
    };
    unread_count_student: number;
    unread_count_recruiter: number;
}

const chatService = {
    initiateChat: async (applicationId: string) => {
        const res = await api.post('/chat/initiate', { applicationId });
        return res.data;
    },

    getConversations: async () => {
        const res = await api.get('/chat/conversations');
        return res.data;
    },

    getMessages: async (conversationId: string) => {
        const res = await api.get(`/chat/conversations/${conversationId}/messages`);
        return res.data;
    },

    sendMessage: async (conversationId: string, payload: { text?: string; message_type?: 'TEXT' | 'FILE'; file_url?: string }) => {
        const res = await api.post(`/chat/conversations/${conversationId}/messages`, payload);
        return res.data;
    },

    getOnlineStatus: async (userId: string) => {
        const res = await api.get(`/chat/online-status/${userId}`);
        return res.data;
    }
};

export default chatService;
