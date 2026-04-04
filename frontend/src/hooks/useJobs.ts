import { useQuery } from '@tanstack/react-query';
import api from '../api';

export const useJobs = (jobType?: string) => {
  return useQuery({
    queryKey: ['jobs', jobType],
    queryFn: async () => {
      const { data } = await api.get('/jobs', {
        params: { jobType: jobType === 'All Job Types' ? undefined : jobType, limit: 0 },
      });
      return data?.data || data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
