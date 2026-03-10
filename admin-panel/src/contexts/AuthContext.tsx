import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

interface UserProfile {
    id: number;
    email: string;
    name: string;
    role: string;
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

    // Single role: admin. All logged-in users have full access.
    const hasPermission = (_permission: string) => {
        return !!user;
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch {
            // Continue even if logout fails
        } finally {
            localStorage.removeItem('access_token');
            setUser(null);
            window.location.href = '/login';
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, hasPermission, logout }}>
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
