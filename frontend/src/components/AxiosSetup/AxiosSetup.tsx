import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { setupInterceptors } from '../../services/api';

/**
 * AxiosSetup must be rendered inside all providers (Router, QueryClientProvider,
 * AuthProvider, ToastProvider). It wires Axios's 401 interceptor to the real
 * React context callbacks — clearing the query cache, logging out, and showing
 * a "session expired" toast — all in one atomic operation.
 *
 * Renders nothing (returns null).
 */
const AxiosSetup = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { logout } = useAuth();
    const { addToast } = useToast();

    useEffect(() => {
        setupInterceptors({
            onUnauthenticated: () => {
                // 1. Stop all active React Query fetches immediately
                queryClient.clear();
                // 2. Clear auth state and token from localStorage
                logout();
                // 3. Show a polite session-expired message
                addToast('Your session has expired. Please sign in again.', 'error', 5000);
                // 4. Redirect to login (using React Router, not hard reload)
                navigate('/login', { replace: true });
            },
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once on mount; the callbacks are stable references from context

    return null;
};

export default AxiosSetup;
