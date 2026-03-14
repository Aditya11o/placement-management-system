import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

export interface PresenceUser {
    id: string;
    name: string;
    email: string;
}

export const usePresence = () => {
    const { socket, isConnected } = useSocket();
    const { user } = useAuth();
    const location = useLocation();
    const [activeUsers, setActiveUsers] = useState<PresenceUser[]>([]);

    useEffect(() => {
        // We only want to track presence if we're connected and authenticated
        if (!socket || !isConnected || !user) return;

        // Skip tracking presence for non-admin general routes if desired, but here we track all
        const presencePayload = {
            pathname: location.pathname,
            userDetails: {
                // Handle different ID fields historically used
                id: user._id,
                name: user.name,
                email: user.email,
            }
        };

        // Notify backend we joined a new page
        socket.emit('join_page', presencePayload);

        const handlePresenceUpdate = (users: PresenceUser[]) => {
            // Filter ourselves out of the presence list
            const myId = user._id;
            const otherUsers = users.filter(u => u.id !== myId);
            setActiveUsers(otherUsers);
        };

        socket.on('page_presence_update', handlePresenceUpdate);

        // Cleanup
        return () => {
            socket.off('page_presence_update', handlePresenceUpdate);
        };
    }, [socket, isConnected, location.pathname, user]);

    return { activeUsers };
};
