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
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await api.get('/auth/me');
            setUser(response.data.data?.user || response.data.user || response.data);
        } catch {
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // Single role: admin. All logged-in users have full access.
    const hasPermission = (_permission: string) => {
        return !!user;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/login';
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
