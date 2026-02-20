import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AccessControlProps {
    permission: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * Component to conditionally render children based on user permissions.
 */
const AccessControl: React.FC<AccessControlProps> = ({ permission, children, fallback = null }) => {
    const { hasPermission, loading } = useAuth();

    if (loading) return null;

    if (hasPermission(permission)) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
};

export default AccessControl;
