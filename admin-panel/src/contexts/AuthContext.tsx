import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

interface UserProfile {
    id: number;
    email: string;
    name: string;
    role: string;
    roles: string[];
    permissions: string[];
    role_label: string;
    tenant: {
        id: number;
        name: string;
        subdomain: string;
    };
}

interface AuthContextType {
    user: UserProfile | null;
    loading: boolean;
    hasPermission: (permission: string) => boolean;
    isAdmin: () => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/auth/me');
            setUser(response.data.data?.user || response.data.user || response.data);
        } catch {
            // Session expired or user not authenticated
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const isAdmin = () => user?.role === 'Admin';

    // Granular permission check
    const hasPermission = (permission: string) => {
        if (!user) return false;
        // Admin has ALL access bypass
        if (user.role === 'Admin') return true;
        
        return user.permissions?.includes(permission) || false;
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch {
            // Continue even if logout fails
        } finally {
            localStorage.removeItem('access_token');
            setUser(null);
            window.location.href = '/admin/login';
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, hasPermission, isAdmin, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
