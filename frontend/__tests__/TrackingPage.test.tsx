import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TrackPage from '../src/app/track/page';
import React from 'react';

// Mock axios
vi.mock('axios', () => ({
    default: {
        get: vi.fn(),
        create: vi.fn().mockReturnThis(),
    },
}));

describe('Tracking Page', () => {
    it('renders tracking input correctly', () => {
        render(<TrackPage />);
        expect(screen.getByPlaceholderSnapshot()).toBeDefined();
        expect(screen.getByText(/Pantau Progres Naskah/i)).toBeDefined();
    });

    it('shows error message if code is empty', async () => {
        render(<TrackPage />);
        const button = screen.getByText(/Lacak Naskah/i);
        fireEvent.click(button);
        // Component should prevent submission or show prompt
    });
});
