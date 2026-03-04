import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { useQueryClient } from '@tanstack/react-query';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
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

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
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
