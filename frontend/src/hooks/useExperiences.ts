import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  author: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  type: string;
  difficulty: string;
  content: string;
  questions: string[];
  tips: string[];
  isAnonymous: boolean;
  isVerified: boolean;
  authorId: string;
  author: {
    name: string;
    email: string;
  };
  upvotes: string[];
  comments: Comment[];
  createdAt: string;
}

export const useExperiences = (filters = {}) => {
  return useQuery({
    queryKey: ['experiences', filters],
    queryFn: async () => {
      const { data } = await api.get('/experiences', { params: filters });
      return data;
    }
  });
};

export const useExperience = (id: string) => {
  return useQuery({
    queryKey: ['experience', id],
    queryFn: async () => {
      const { data } = await api.get(`/experiences/${id}`);
      return data;
    },
    enabled: !!id
  });
};

export const useCreateExperience = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (experienceData: any) => {
      const { data } = await api.post('/experiences', experienceData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
    }
  });
};

export const useToggleUpvote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/experiences/${id}/upvote`);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
      queryClient.invalidateQueries({ queryKey: ['experience', data.id] });
    }
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const { data } = await api.post(`/experiences/${id}/comments`, { content });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['experience', variables.id] });
    }
  });
};

export const useDeleteExperience = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/experiences/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
    }
  });
};

export const useUpdateExperience = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { data: response } = await api.patch(`/experiences/${id}`, data);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
      queryClient.invalidateQueries({ queryKey: ['experience', data.id] });
    }
  });
};
