import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { useNotification } from '../context/NotificationContext';

export interface WatchlistItem {
  _id: string;
  jobId: string;
  title: string;
  companyName: string;
  location: string;
  salary: string;
  type: string;
  deadline: string;
  status: string;
  matchScore: number;
  isWatched: boolean;
  skills: string[];
}

export const useWatchlist = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();

  const { data: watchlist = [], isLoading } = useQuery({
    queryKey: ['watchlist'],
    queryFn: async () => {
      const { data } = await api.get('/jobs/watchlist');
      return data;
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { data } = await api.post(`/jobs/watchlist/${jobId}`);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      showSuccess(data.saved ? 'Job saved to watchlist' : 'Job removed from watchlist', 'Watchlist');
    },
    onError: (error: any) => {
      showError(error.response?.data?.message || 'Failed to update watchlist', 'Watchlist Error');
    }
  });

  return {
    watchlist,
    isLoading,
    toggleWatchlist: toggleMutation.mutate,
    isToggling: toggleMutation.isPending
  };
};
