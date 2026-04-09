import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { toast } from 'react-hot-toast';

export const useMyApplications = (status?: string) => {
  return useQuery({
    queryKey: ['applications', 'my', status],
    queryFn: async () => {
      const { data } = await api.get('/applications/my', { 
        params: { status, limit: 100 } 
      });
      return data?.data || data;
    },
    staleTime: 60 * 1000,
  });
};

export const useCheckEligibility = (jobId: string) => {
  return useQuery({
    queryKey: ['eligibility', jobId],
    queryFn: async () => {
      if (!jobId) return null;
      const { data } = await api.get(`/applications/check-eligibility/${jobId}`);
      return data;
    },
    enabled: !!jobId,
  });
};

export const useApplyForJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ jobId, data }: { jobId: string; data: any }) => {
      const resp = await api.post(`/applications/${jobId}`, data);
      return resp.data;
    },
    onSuccess: (_, { jobId }) => {
      toast.success('Application submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['eligibility', jobId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    }
  });
};

export const useSaveDraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ jobId, data }: { jobId: string; data: any }) => {
      const resp = await api.post(`/applications/${jobId}/draft`, data);
      return resp.data;
    },
    onSuccess: (_, { jobId }) => {
      toast.success('Draft saved successfully');
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['eligibility', jobId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save draft');
    }
  });
};
