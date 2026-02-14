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
                    // Validate token and get user data if API supports it
                    // For now, we'll rely on stored local storage or decoding, 
                    // but ideally we call /auth/me. 
                    // The backend doesn't explicitly have /auth/me in index.js but auth.js might.
                    // Let's assume we persisted user in localStorage for simplicity in this MVP 
                    // or we can blindly trust the token until a 401 happens.

                    // Better approach: fetch user profile if possible. 
                    // Looking at backend code, there is no /auth/me.
                    // We will store user info in localStorage during login for persistence.
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) {
                        setUser(JSON.parse(storedUser));
                    }
                } catch (error) {
                    console.error("Auth check failed", error);
                    Cookies.remove('token');
                    localStorage.removeItem('user');
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
