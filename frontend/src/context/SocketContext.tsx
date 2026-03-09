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
        // Ensure the URL matches your backend base URL. The api interceptor uses Vite env vars.
        const backendUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

        const newSocket = io(backendUrl, {
            auth: { token },
            transports: ['websocket'],
            autoConnect: true,
        });

        // Event: Connected successfully
        newSocket.on('connect', () => {
            console.log('Socket.io Connected:', newSocket.id);
            setIsConnected(true);
        });

        // Event: Server confirmed authentication
        newSocket.on('connected', (data: { message?: string, userId?: string, role?: string }) => {
            console.log('Socket.io Authenticated:', data);
        });

        // Event: New Notification
        newSocket.on('new_notification', (data: { message?: string, target_id?: string }) => {
            console.log('Real-time Notification Received:', data);

            // 1. Pop a success/info toast
            addToast(data.message || 'You have a new notification!', 'info', 5000);

            // 2. Instantly invalidate the React Query cache so the Bell badge increments
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        });

        // Event: New Announcement
        newSocket.on('new_announcement', (data: { title: string, message: string }) => {
            console.log('Real-time Announcement Received:', data);
            addToast(`📢 ${data.title}`, 'info', 6000);
            queryClient.invalidateQueries({ queryKey: ['adminAnnouncements'] });
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
        });

        // Event: Notification Received
        newSocket.on('notification', (data: any) => {
            console.log('Real-time Notification Received:', data);

            // Handle Audio Alert
            const soundEnabled = localStorage.getItem('pms_notification_sound') !== 'false';
            const isDndMode = localStorage.getItem('pms_notification_dnd') === 'true';

            if (soundEnabled && !isDndMode) {
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3'); // Subtle notification ping
                audio.play().catch(e => console.warn('Audio playback inhibited by browser:', e));
            }

            // Interactive Action: Mark as Read directly from Toast
            const action = data._id ? {
                label: 'Mark as Read',
                onClick: async () => {
                    try {
                        const { default: api } = await import('../services/api');
                        await api.put(`/notifications/${data._id}/read`);
                        queryClient.invalidateQueries({ queryKey: ['notifications'] });
                    } catch (err) {
                        console.error('Failed to mark as read from toast', err);
                    }
                }
            } : undefined;

            addToast(data.message, data.type?.toLowerCase() as any || 'info', 6000, action);
            // Invalidate the notifications query to update UI/counter
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        });

        // Event: Admin Pulse (Real-time Audit logs)
        newSocket.on('admin_pulse', (data: any) => {
            console.log('Real-time Admin Pulse Received:', data);
            // Invalidate the pulse feed query so other admin components stay in sync
            queryClient.invalidateQueries({ queryKey: ['adminPulseFeed'] });
        });

        // Event: Cross-tab Synchronization (Multi-tab)
        newSocket.on('sync_notification_read', () => {
            console.log('Multi-tab: Notification read sync');
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        });

        newSocket.on('sync_notification_deleted', () => {
            console.log('Multi-tab: Notification deleted sync');
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        });

        newSocket.on('sync_all_read', () => {
            console.log('Multi-tab: Mark all as read sync');
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        });

        newSocket.on('sync_all_cleared', () => {
            console.log('Multi-tab: Clear all sync');
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        });

        // Event: Disconnected
        newSocket.on('disconnect', () => {
            console.log('Socket.io Disconnected');
            setIsConnected(false);
        });

        // Event: Connection Error
        newSocket.on('connect_error', (error) => {
            console.error('Socket.io Connection Error:', error);
            setIsConnected(false);
        });

        setSocket(newSocket);

        // Cleanup on unmount or token change
        return () => {
            newSocket.disconnect();
        };
    }, [token, user, addToast, queryClient]);

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
        // Register Service Worker on mount
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then((registration) => {
                console.log('Service Worker registered with scope:', registration.scope);
            }).catch((error) => {
                console.error('Service Worker registration failed:', error);
            });
        }
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

            // Public VAPID Key from Backend
            const vapidPublicKey = 'BFQ7gj5XjSOzVoJ_mIykyBz6pP7tVF7YO5aKpzs_ASGAW8nD_Ae-DBPC4GyAHqGyw2JO0GKbbZCc6LM-IAYfqpM';

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
