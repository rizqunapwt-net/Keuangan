import React from 'react';

interface AccessControlProps {
    permission: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * Simplified AccessControl — single admin role means all authenticated users
 * have full access. This component always renders children.
 */
const AccessControl: React.FC<AccessControlProps> = ({ children }) => {
    return <>{children}</>;
};

export default AccessControl;
