import { useState, useEffect } from 'react';
import axios from 'axios';

export interface AuditLog {
  id: string;
  _id: string;
  action: string;
  type: string;
  targetId?: string;
  targetType?: string;
  details?: string;
  createdAt: string;
}

export const useAuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/audit/my?limit=10');
      setLogs(data.logs || []);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return { logs, loading, error, refetch: fetchLogs };
};
