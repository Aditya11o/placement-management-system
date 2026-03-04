
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader/Loader';

export const ProtectedRoute = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) return <Loader fullScreen />;

    // If not logged in, redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Render child routes
    return <Outlet />;
};

export const RoleRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
    const { user, isLoading } = useAuth();

    if (isLoading) return <Loader fullScreen />;

    // User must be logged in and their role must be in the allowedRoles array
    if (!user || typeof user.role !== 'string' || !allowedRoles.includes(user.role)) {
        // If logged in but wrong role, push them to a generic unauthorized page or their own dashboard
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};
