import { useQuery } from '@tanstack/react-query';
import api from '../api';

export const useMyApplications = () => {
  return useQuery({
    queryKey: ['applications', 'my'],
    queryFn: async () => {
      const { data } = await api.get('/applications/my', { params: { limit: 0 } });
      return data?.data || data;
    },
    staleTime: 60 * 1000, // 1 minute
  });
};
