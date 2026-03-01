import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AccessControlProps {
  permission: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const AccessControl: React.FC<AccessControlProps> = ({ permission, children, fallback = null }) => {
  const { hasPermission } = useAuth();
  const permissions = Array.isArray(permission) ? permission : [permission];
  const allowed = permissions.every((item) => hasPermission(item));

  return allowed ? <>{children}</> : <>{fallback}</>;
};

export default AccessControl;
