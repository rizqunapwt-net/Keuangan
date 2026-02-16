"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import api from '../utils/api';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    username: string;
    role: string;
    employee?: {
        id: string;
        name: string;
        category: string;
    } | null;
    face_descriptor?: string;
}

interface AuthContextType {
    user: User | null;
    login: (token: string, userData: User) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const token = Cookies.get('token');
            if (token) {
                try {
                    // Fetch fresh user data from the new Laravel backend
                    const response = await api.get('/auth/me');
                    if (response.data.success) {
                        const userData = response.data.data;
                        setUser(userData);
                        localStorage.setItem('user', JSON.stringify(userData));
                    }
                } catch (error: unknown) {
                    console.error("Auth check failed", error);
                    const axiosError = error as { response?: { status: number } };
                    if (axiosError.response?.status === 401) {
                        Cookies.remove('token');
                        localStorage.removeItem('user');
                        setUser(null);
                    } else {
                        // Fallback to localStorage if network fails but token exists
                        const storedUser = localStorage.getItem('user');
                        if (storedUser) setUser(JSON.parse(storedUser));
                    }
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = (token: string, userData: User) => {
        Cookies.set('token', token, { expires: 7 });
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        router.push('/');
    };

    const logout = () => {
        Cookies.remove('token');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
