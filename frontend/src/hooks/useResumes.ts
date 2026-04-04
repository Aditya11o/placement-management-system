import { useQuery } from '@tanstack/react-query';
import api from '../api';

export const useResumes = () => {
  return useQuery({
    queryKey: ['resumes'],
    queryFn: async () => {
      const { data } = await api.get('/students/resumes');
      return data;
    },
    staleTime: 5 * 60 * 1000, 
  });
};
