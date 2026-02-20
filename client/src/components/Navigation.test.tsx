import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Navigation from './Navigation';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

// Mock the hooks
vi.mock('@/context/AuthContext');
vi.mock('next/navigation');

describe('Navigation Component', () => {
    it('should not render if not authenticated', () => {
        (useAuth as any).mockReturnValue({ isAuthenticated: false, user: null });
        (usePathname as any).mockReturnValue('/');

        const { container } = render(<Navigation />);
        expect(container.firstChild).toBeNull();
    });

    it('should not render on login page', () => {
        (useAuth as any).mockReturnValue({ isAuthenticated: true, user: { role: 'KARYAWAN' } });
        (usePathname as any).mockReturnValue('/login');

        const { container } = render(<Navigation />);
        expect(container.firstChild).toBeNull();
    });

    it('should render Profile link for KARYAWAN', () => {
        (useAuth as any).mockReturnValue({ isAuthenticated: true, user: { role: 'KARYAWAN' } });
        (usePathname as any).mockReturnValue('/');

        render(<Navigation />);
        expect(screen.getByText('Beranda')).toBeDefined();
        expect(screen.getByText('Profil')).toBeDefined();
        expect(screen.queryByText('Admin')).toBeNull();
    });

    it('should render Admin link for ADMIN role', () => {
        (useAuth as any).mockReturnValue({ isAuthenticated: true, user: { role: 'ADMIN' } });
        (usePathname as any).mockReturnValue('/');

        render(<Navigation />);
        expect(screen.getByText('Admin')).toBeDefined();
        expect(screen.queryByText('Profil')).toBeNull();
    });
});
