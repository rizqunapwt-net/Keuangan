import { useAuth } from '../contexts/AuthContext';

interface AccessControlProps {
    permission?: string;
    role?: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * AccessControl - Checks permissions or roles to conditionally render children.
 */
const AccessControl: React.FC<AccessControlProps> = ({ permission, role, children, fallback = null }) => {
    const { hasPermission, user } = useAuth();

    if (role && user?.role !== role) {
        return <>{fallback}</>;
    }

    if (permission && !hasPermission(permission)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};

export default AccessControl;
