import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

interface UserProfile {
    id: number;
    email: string;
    name: string;
    username: string;
    role: string;
    permissions: string[];
    tenant: {
        id: number;
        name: string;
        subdomain: string;
    };
    employee?: {
        id: number;
        name: string;
        category: string;
    } | null;
}

interface AuthContextType {
    user: UserProfile | null;
    loading: boolean;
    hasPermission: (permission: string) => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Map Laravel/Spatie roles to Kledo-style permissions
const ROLE_PERMISSIONS: Record<string, string[]> = {
    ADMIN: [
        'invoices_read', 'invoices_write', 'purchases_read', 'purchases_write',
        'expenses_read', 'expenses_write', 'products_read', 'products_write',
        'contacts_read', 'contacts_write', 'bank_read', 'bank_write',
        'accounts_read', 'accounts_write', 'assets_read', 'assets_write',
        'payroll_read', 'payroll_write', 'warehouse_read', 'warehouse_write',
        'report_financial', 'settings_read', 'settings_write',
        'hr_read', 'hr_write', 'publishing_read', 'publishing_write',
    ],
    OWNER: [
        'invoices_read', 'invoices_write', 'purchases_read', 'purchases_write',
        'expenses_read', 'expenses_write', 'products_read', 'products_write',
        'contacts_read', 'contacts_write', 'bank_read', 'bank_write',
        'accounts_read', 'accounts_write', 'assets_read', 'assets_write',
        'payroll_read', 'payroll_write', 'warehouse_read', 'warehouse_write',
        'report_financial', 'settings_read', 'settings_write',
        'hr_read', 'hr_write', 'publishing_read', 'publishing_write',
    ],
    HR: ['hr_read', 'hr_write', 'payroll_read', 'payroll_write', 'report_financial'],
    FINANCE: [
        'invoices_read', 'invoices_write', 'purchases_read', 'purchases_write',
        'expenses_read', 'expenses_write', 'bank_read', 'bank_write',
        'accounts_read', 'accounts_write', 'payroll_read', 'payroll_write',
        'report_financial',
    ],
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check URL for token parameter (passed from main NRE login)
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('token');
        if (urlToken) {
            localStorage.setItem('token', urlToken);
            // Clean token from URL to prevent leaks
            window.history.replaceState({}, '', window.location.pathname);
        }
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await api.get('/hr/auth/me');
            // Laravel returns { success: true, data: { ... } }
            const userData = response.data.success ? response.data.data : response.data;
            const role = (userData.role || '').toUpperCase();
            const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS['ADMIN'] || [];

            setUser({
                id: userData.id,
                email: userData.email || '',
                name: userData.name || userData.username || '',
                username: userData.username || '',
                role: role,
                permissions,
                tenant: {
                    id: 1,
                    name: 'PT New Rizquna Elfath',
                    subdomain: 'nre',
                },
                employee: userData.employee || null,
            });
        } catch {
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const hasPermission = (permission: string) => {
        if (!user) return false;
        if (user.role === 'OWNER' || user.role === 'ADMIN') return true;
        return user.permissions.includes(permission);
    };

    const logout = async () => {
        try {
            await api.post('/hr/auth/logout');
        } catch {
            // Token may already be expired
        }
        localStorage.removeItem('token');
        setUser(null);
        // Stay within React SPA
        window.location.href = '/admin/login';
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
