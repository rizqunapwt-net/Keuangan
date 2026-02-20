import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from './DashboardPage';

// ── Mocks ──

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../contexts/AuthContext', () => ({
    useAuth: () => ({ user: { name: 'Test User', email: 'test@example.com', role: 'owner', permissions: [], tenant: { id: 1, name: 'Test', subdomain: 'test' } } }),
}));

const mockApiGet = vi.fn();
vi.mock('../api', () => ({
    default: { get: (...args: unknown[]) => mockApiGet(...args) },
}));

// Mock recharts to avoid SVG rendering issues in jsdom
vi.mock('recharts', async () => {
    const React = await import('react');
    const mockComponent = (name: string) =>
        React.forwardRef(({ children, ...props }: Record<string, unknown>, ref: React.Ref<HTMLDivElement>) =>
            React.createElement('div', { ...props, 'data-testid': `mock-${name}`, ref }, children as React.ReactNode));
    return {
        ResponsiveContainer: ({ children }: { children: React.ReactNode }) => React.createElement('div', { 'data-testid': 'responsive-container' }, children),
        AreaChart: mockComponent('area-chart'),
        Area: mockComponent('area'),
        BarChart: mockComponent('bar-chart'),
        Bar: mockComponent('bar'),
        PieChart: mockComponent('pie-chart'),
        Pie: mockComponent('pie'),
        Cell: mockComponent('cell'),
        XAxis: mockComponent('xaxis'),
        YAxis: mockComponent('yaxis'),
        CartesianGrid: mockComponent('cartesian-grid'),
        Tooltip: mockComponent('tooltip'),
        Legend: mockComponent('legend'),
    };
});

// ── Test Data ──

const mockInvoices = [
    { id: 1, type: 'sales', total: 5000000, paidAmount: 5000000, status: 'paid', transDate: '2026-02-01', ref: 'INV-001', contactName: 'PT Maju' },
    { id: 2, type: 'sales', total: 3000000, paidAmount: 1000000, status: 'unpaid', transDate: '2026-02-10', dueDate: '2026-01-15', ref: 'INV-002', contactName: 'CV Jaya' },
    { id: 3, type: 'sales', total: 2000000, paidAmount: 0, status: 'unpaid', transDate: '2026-01-05', dueDate: '2026-03-01', ref: 'INV-003', contactName: 'PT Sukses' },
];

const mockExpenses = [
    { id: 1, amount: 500000, description: 'Listrik', transDate: '2026-02-05', status: 'paid', contactName: 'PLN' },
    { id: 2, amount: 300000, description: 'Internet', transDate: '2026-02-08', status: 'paid', contactName: 'ISP' },
];

const mockBanks = [
    { id: 1, name: 'BCA', balance: 10000000, transactions: [] },
];

const mockPurchases = [
    { id: 1, total: 1500000, paidAmount: 1500000, status: 'paid', transDate: '2026-02-03', ref: 'PO-001', contactName: 'Supplier A' },
    { id: 2, total: 2000000, paidAmount: 500000, status: 'unpaid', transDate: '2026-02-12', ref: 'PO-002', contactName: 'Supplier B' },
];

// ── Helpers ──

function setupApiMock(overrides: Partial<{
    invoices: unknown[];
    expenses: unknown[];
    banks: unknown[];
    purchases: unknown[];
}> = {}) {
    const data = {
        invoices: overrides.invoices ?? mockInvoices,
        expenses: overrides.expenses ?? mockExpenses,
        banks: overrides.banks ?? mockBanks,
        purchases: overrides.purchases ?? mockPurchases,
    };

    mockApiGet.mockImplementation((url: string) => {
        if (url === '/finance/invoices') return Promise.resolve({ data: data.invoices });
        if (url === '/finance/expenses') return Promise.resolve({ data: data.expenses });
        if (url === '/finance/banks') return Promise.resolve({ data: data.banks });
        if (url === '/finance/purchases') return Promise.resolve({ data: data.purchases });
        return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });
}

function renderDashboard() {
    return render(
        <MemoryRouter>
            <DashboardPage />
        </MemoryRouter>,
    );
}

// ── Tests ──

beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
});

describe('DashboardPage', () => {
    describe('Data Fetching', () => {
        it('fetches all 4 API endpoints on mount', async () => {
            setupApiMock();
            renderDashboard();

            await waitFor(() => {
                expect(mockApiGet).toHaveBeenCalledWith('/finance/invoices');
                expect(mockApiGet).toHaveBeenCalledWith('/finance/expenses');
                expect(mockApiGet).toHaveBeenCalledWith('/finance/banks');
                expect(mockApiGet).toHaveBeenCalledWith('/finance/purchases');
            });
        });

        it('handles API failures gracefully', async () => {
            mockApiGet.mockRejectedValue(new Error('Network Error'));
            renderDashboard();

            // Should still render the page structure after error
            await waitFor(() => {
                expect(screen.getByText('Buat Tagihan')).toBeInTheDocument();
            });
            // Table should show empty state (loading finished)
            expect(screen.getByText('Belum ada transaksi')).toBeInTheDocument();
        });
    });

    describe('Welcome Banner', () => {
        it('shows welcome message with user name', async () => {
            setupApiMock();
            renderDashboard();

            await waitFor(() => {
                expect(screen.getByText('Test User')).toBeInTheDocument();
            });
        });

        it('navigates to /faq when "Jadwalkan Sekarang" is clicked', async () => {
            setupApiMock();
            const user = userEvent.setup();
            renderDashboard();

            await waitFor(() => expect(screen.getByText('Jadwalkan Sekarang')).toBeInTheDocument());
            await user.click(screen.getByText('Jadwalkan Sekarang'));
            expect(mockNavigate).toHaveBeenCalledWith('/faq');
        });

        it('hides banner when close button is clicked', async () => {
            setupApiMock();
            const user = userEvent.setup();
            renderDashboard();

            await waitFor(() => expect(screen.getByText('Jadwalkan Sekarang')).toBeInTheDocument());

            // The close button is a button with CloseOutlined icon
            const bannerText = screen.getByText(/Yuk jadwalkan demo gratis/);
            const bannerCard = bannerText.closest('.ant-card') as HTMLElement;
            const closeBtn = within(bannerCard).getAllByRole('button').find(
                btn => btn.querySelector('.anticon-close')
            );
            expect(closeBtn).toBeTruthy();
            await user.click(closeBtn!);

            expect(screen.queryByText(/Yuk jadwalkan demo gratis/)).not.toBeInTheDocument();
        });
    });

    describe('Summary Statistics Cards', () => {
        it('displays all 6 stat cards', async () => {
            setupApiMock();
            renderDashboard();

            await waitFor(() => {
                expect(screen.getByText('Total Penjualan')).toBeInTheDocument();
                expect(screen.getByText('Total Pembelian')).toBeInTheDocument();
                expect(screen.getByText('Total Biaya')).toBeInTheDocument();
                expect(screen.getByText('Laba Bersih')).toBeInTheDocument();
                expect(screen.getByText('Piutang')).toBeInTheDocument();
                expect(screen.getByText('Hutang')).toBeInTheDocument();
            });
        });

        it('navigates to correct routes when stat cards are clicked', async () => {
            setupApiMock();
            const user = userEvent.setup();
            renderDashboard();

            await waitFor(() => expect(screen.getByText('Total Penjualan')).toBeInTheDocument());

            // Click Total Penjualan card
            const salesCard = screen.getByText('Total Penjualan').closest('.ant-card')!;
            await user.click(salesCard);
            expect(mockNavigate).toHaveBeenCalledWith('/sales/invoices');

            mockNavigate.mockClear();

            // Click Total Biaya card
            const expenseCard = screen.getByText('Total Biaya').closest('.ant-card')!;
            await user.click(expenseCard);
            expect(mockNavigate).toHaveBeenCalledWith('/expenses');
        });
    });

    describe('Quick Action Buttons', () => {
        it('renders all 6 quick action buttons', async () => {
            setupApiMock();
            renderDashboard();

            await waitFor(() => {
                expect(screen.getByText('Buat Tagihan')).toBeInTheDocument();
                expect(screen.getByText('Buat Pembelian')).toBeInTheDocument();
                expect(screen.getByText('Tambah Biaya')).toBeInTheDocument();
                expect(screen.getByText('Tambah Produk')).toBeInTheDocument();
                expect(screen.getByText('Tambah Kontak')).toBeInTheDocument();
                expect(screen.getByText('Lihat Laporan')).toBeInTheDocument();
            });
        });

        it('navigates correctly when quick action buttons are clicked', async () => {
            setupApiMock();
            const user = userEvent.setup();
            renderDashboard();

            const routes: Record<string, string> = {
                'Buat Tagihan': '/sales/invoices/add',
                'Buat Pembelian': '/purchases/add',
                'Tambah Biaya': '/expenses/add',
                'Tambah Produk': '/products/add',
                'Tambah Kontak': '/contacts/add',
                'Lihat Laporan': '/reports',
            };

            await waitFor(() => expect(screen.getByText('Buat Tagihan')).toBeInTheDocument());

            for (const [label, route] of Object.entries(routes)) {
                mockNavigate.mockClear();
                await user.click(screen.getByText(label));
                expect(mockNavigate).toHaveBeenCalledWith(route);
            }
        });
    });

    describe('Chart Widget Cards', () => {
        it('renders all chart widget titles', async () => {
            setupApiMock();
            renderDashboard();

            await waitFor(() => {
                expect(screen.getByText('CASH')).toBeInTheDocument();
                expect(screen.getByText('TAGIHAN YANG PERLU KAMU BAYAR')).toBeInTheDocument();
                expect(screen.getByText('BANK ACCOUNT')).toBeInTheDocument();
                expect(screen.getByText('BIAYA BULAN LALU')).toBeInTheDocument();
                expect(screen.getByText('GIRO')).toBeInTheDocument();
            });
        });

        it('shows empty state for biaya when no expenses', async () => {
            setupApiMock({ expenses: [] });
            renderDashboard();

            await waitFor(() => {
                expect(screen.getByText('Belum ada data biaya bulan lalu')).toBeInTheDocument();
            });
        });

        it('navigates to /bank when CASH card is clicked', async () => {
            setupApiMock();
            const user = userEvent.setup();
            renderDashboard();

            await waitFor(() => expect(screen.getByText('CASH')).toBeInTheDocument());

            const cashTitle = screen.getByText('CASH');
            const cashCard = cashTitle.closest('.ant-card')!;
            await user.click(cashCard);
            expect(mockNavigate).toHaveBeenCalledWith('/bank');
        });

        it('navigates to /sales/invoices when TAGIHAN card is clicked', async () => {
            setupApiMock();
            const user = userEvent.setup();
            renderDashboard();

            await waitFor(() => expect(screen.getByText('TAGIHAN YANG PERLU KAMU BAYAR')).toBeInTheDocument());

            const tagihanTitle = screen.getByText('TAGIHAN YANG PERLU KAMU BAYAR');
            const tagihanCard = tagihanTitle.closest('.ant-card')!;
            await user.click(tagihanCard);
            expect(mockNavigate).toHaveBeenCalledWith('/sales/invoices');
        });

        it('navigates to /expenses when BIAYA BULAN LALU card is clicked', async () => {
            setupApiMock();
            const user = userEvent.setup();
            renderDashboard();

            await waitFor(() => expect(screen.getByText('BIAYA BULAN LALU')).toBeInTheDocument());

            const biayaTitle = screen.getByText('BIAYA BULAN LALU');
            const biayaCard = biayaTitle.closest('.ant-card')!;
            await user.click(biayaCard);
            expect(mockNavigate).toHaveBeenCalledWith('/expenses');
        });
    });

    describe('Recent Transactions Table', () => {
        it('shows the Transaksi Terbaru section', async () => {
            setupApiMock();
            renderDashboard();

            await waitFor(() => {
                expect(screen.getByText('Transaksi Terbaru')).toBeInTheDocument();
            });
        });

        it('shows "Lihat Semua" button that navigates to /sales/invoices', async () => {
            setupApiMock();
            const user = userEvent.setup();
            renderDashboard();

            await waitFor(() => expect(screen.getByText('Lihat Semua')).toBeInTheDocument());
            await user.click(screen.getByText('Lihat Semua'));
            expect(mockNavigate).toHaveBeenCalledWith('/sales/invoices');
        });

        it('shows empty text when no transactions', async () => {
            setupApiMock({ invoices: [], expenses: [], purchases: [] });
            renderDashboard();

            await waitFor(() => {
                expect(screen.getByText('Belum ada transaksi')).toBeInTheDocument();
            });
        });
    });

    describe('Footer Links', () => {
        it('renders all 6 footer link cards', async () => {
            setupApiMock();
            renderDashboard();

            await waitFor(() => {
                expect(screen.getByText('Produk')).toBeInTheDocument();
                expect(screen.getByText('Inventori')).toBeInTheDocument();
                expect(screen.getByText('Kas & Bank')).toBeInTheDocument();
                expect(screen.getByText('Aset Tetap')).toBeInTheDocument();
                // "Kontak" appears in both quick actions and footer, just check it exists
                expect(screen.getAllByText('Kontak').length).toBeGreaterThanOrEqual(1);
                expect(screen.getByText('Pengaturan')).toBeInTheDocument();
            });
        });

        it('navigates to /products when Produk card is clicked', async () => {
            setupApiMock();
            const user = userEvent.setup();
            renderDashboard();

            await waitFor(() => expect(screen.getByText('Produk')).toBeInTheDocument());

            const produkText = screen.getByText('Produk');
            const produkCard = produkText.closest('.ant-card')!;
            await user.click(produkCard);
            expect(mockNavigate).toHaveBeenCalledWith('/products');
        });

        it('navigates to /settings when Pengaturan card is clicked', async () => {
            setupApiMock();
            const user = userEvent.setup();
            renderDashboard();

            await waitFor(() => expect(screen.getByText('Pengaturan')).toBeInTheDocument());

            const settingsText = screen.getByText('Pengaturan');
            const settingsCard = settingsText.closest('.ant-card')!;
            await user.click(settingsCard);
            expect(mockNavigate).toHaveBeenCalledWith('/settings');
        });
    });

    describe('Empty Data Handling', () => {
        it('renders all sections with zero/empty data gracefully', async () => {
            setupApiMock({ invoices: [], expenses: [], banks: [], purchases: [] });
            renderDashboard();

            await waitFor(() => {
                // Stats should show with zero values
                expect(screen.getByText('Total Penjualan')).toBeInTheDocument();
                expect(screen.getByText('Laba Bersih')).toBeInTheDocument();
                // Quick actions should still render
                expect(screen.getByText('Buat Tagihan')).toBeInTheDocument();
                // Charts should still render
                expect(screen.getByText('CASH')).toBeInTheDocument();
                // Empty expense message
                expect(screen.getByText('Belum ada data biaya bulan lalu')).toBeInTheDocument();
                // Empty transactions message
                expect(screen.getByText('Belum ada transaksi')).toBeInTheDocument();
            });
        });
    });
});
