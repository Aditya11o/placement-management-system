import { useQuery } from '@tanstack/react-query';
import api from '../api';

export const useStudentDashboard = () => {
  return useQuery({
    queryKey: ['dashboard', 'student'],
    queryFn: async () => {
      const { data } = await api.get('/students/dashboard');
      return data;
    },
    staleTime: 60 * 1000, // 1 minute
  });
};
export const useSkillGap = () => {
  return useQuery({
    queryKey: ['dashboard', 'skill-gap'],
    queryFn: async () => {
      const { data } = await api.get('/students/skill-gap');
      return data;
    },
    staleTime: 60 * 1000,
  });
};
