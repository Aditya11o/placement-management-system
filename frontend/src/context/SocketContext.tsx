import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { useQueryClient } from '@tanstack/react-query';

interface PageUserDetails {
    id: string;
    name: string;
    avatar?: string;
    color?: string; // For generating a unique color for the user
}

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    joinPage: (pathname: string, userDetails: PageUserDetails) => void;
    leavePage: (pathname: string) => void;
    emitCursorMove: (payload: any) => void;
    registerPush: () => Promise<void>;
    pushPermission: NotificationPermission;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const { token, user } = useAuth();
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Only connect if we have a valid auth token and user
        if (!token || !user) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        // Initialize Socket.io client
        // Ensure the URL matches your backend base URL.
        const backendUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

        // Avoid re-creating if we already have a socket for this token
        if (socket && socket.connected && socket.auth && (socket.auth as any).token === token) {
            return;
        }

        const newSocket = io(backendUrl, {
            auth: { token },
            transports: ['websocket'],
            autoConnect: true,
        });
        // ... 
        // (rest of the listeners remain the same, clipped for brevity in diff)
        newSocket.on('connect', () => {
            console.log('Socket.io Connected:', newSocket.id);
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('Socket.io Disconnected');
            setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('Socket.io Connection Error:', error);
            setIsConnected(false);
        });

        setSocket(newSocket);

        // Cleanup on unmount or token change
        return () => {
            newSocket.disconnect();
        };
    }, [token, user?._id, addToast, queryClient]); // Use user._id instead of user object

    // ── Helper Methods ───────────────────────────────────────────────────────

    // Assign a consistent color based on user ID for their avatar/cursor border
    const getColorForUser = (userId: string) => {
        const colors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef'];
        let hash = 0;
        for (let i = 0; i < userId.length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };

    const joinPage = (pathname: string, userDetails: PageUserDetails) => {
        if (!socket || !isConnected) return;
        const color = getColorForUser(userDetails.id);
        socket.emit('join_page', { pathname, userDetails: { ...userDetails, color } });
    };

    const leavePage = (pathname: string) => {
        // Handled automatically by join_page on the backend, or on disconnect.
        // We could explicitly emit a leave_page if needed for faster cleanup.
        if (!socket || !isConnected) return;
        socket.emit('leave_page', { pathname });
    };

    const emitCursorMove = (payload: any) => {
        if (!socket || !isConnected) return;
        socket.emit('cursor_move', payload);
    };

    const [pushPermission, setPushPermission] = useState<NotificationPermission>(
        typeof Notification !== 'undefined' ? Notification.permission : 'default'
    );

    useEffect(() => {
        // Service Worker registration is now handled by vite-plugin-pwa in main.tsx
        // This avoids conflicts between the manual sw.js and the PWA worker.
    }, []);

    const registerPush = async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.warn('Push alerts not supported');
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            setPushPermission(permission);
            if (permission !== 'granted') return;

            const registration = await navigator.serviceWorker.ready;

            // Public VAPID Key from Backend — use env variable with fallback
            const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BFQ7gj5XjSOzVoJ_mIykyBz6pP7tVF7YO5aKpzs_ASGAW8nD_Ae-DBPC4GyAHqGyw2JO0GKbbZCc6LM-IAYfqpM';

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: vapidPublicKey
            });

            // Send subscription to backend
            const { default: api } = await import('../services/api');
            await api.post('/notifications/subscribe', { subscription });
            console.log('Push subscription successful');
            addToast('Desktop notifications enabled!', 'success');
        } catch (err) {
            console.error('Failed to subscribe to push:', err);
            addToast('Failed to enable desktop notifications', 'error');
        }
    };

    return (
        <SocketContext.Provider value={{ socket, isConnected, joinPage, leavePage, emitCursorMove, registerPush, pushPermission }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = (): SocketContextType => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};
