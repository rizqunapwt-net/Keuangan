import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Row, Col, Card, Typography, Space, Button, Tag, Dropdown, Statistic, Table } from 'antd';
import {
    CloseOutlined, MoreOutlined, PlusOutlined, ShoppingOutlined,
    DollarOutlined, InboxOutlined, UserOutlined, BarChartOutlined,
    AppstoreOutlined, BankOutlined, FileTextOutlined, SettingOutlined,
    ArrowUpOutlined, ArrowDownOutlined,
} from '@ant-design/icons';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';

const { Text } = Typography;

interface Invoice {
    id: number;
    type: string;
    total: number;
    paidAmount: number;
    status: string;
    transDate: string;
    date?: string;
    dueDate?: string;
    ref?: string;
    number?: string;
    contactName?: string;
    contact?: { name: string };
}

interface Expense {
    id: number;
    amount: number;
    description: string;
    transDate: string;
    date?: string;
    status: string;
    contactName?: string;
    contact?: { name: string };
}

interface BankAccount {
    id: number;
    name: string;
    balance: number;
    transactions?: { amount: number; date: string }[];
}

interface Purchase {
    id: number;
    total: number;
    paidAmount: number;
    status: string;
    transDate: string;
    date?: string;
    ref?: string;
    number?: string;
    contactName?: string;
    contact?: { name: string };
}

const COLORS = ['#ff6b6b', '#ffa940', '#52c41a', '#1890ff', '#722ed1', '#eb2f96'];

const FILTER_MENU_ITEMS = [
    { key: 'daily', label: 'Harian' },
    { key: 'monthly', label: 'Bulanan' },
    { key: 'yearly', label: 'Tahunan' },
    { key: 'custom', label: 'Custom' },
];

const QUICK_ACTIONS = [
    { label: 'Buat Tagihan', icon: <PlusOutlined />, route: '/sales/invoices/add', primary: true },
    { label: 'Buat Pembelian', icon: <ShoppingOutlined />, route: '/purchases/add', primary: false },
    { label: 'Tambah Biaya', icon: <DollarOutlined />, route: '/expenses/add', primary: false },
    { label: 'Tambah Produk', icon: <InboxOutlined />, route: '/products/add', primary: false },
    { label: 'Tambah Kontak', icon: <UserOutlined />, route: '/contacts/add', primary: false },
    { label: 'Lihat Laporan', icon: <BarChartOutlined />, route: '/reports', primary: false },
] as const;

const FOOTER_LINKS = [
    { label: 'Produk', icon: <InboxOutlined />, route: '/products' },
    { label: 'Inventori', icon: <AppstoreOutlined />, route: '/inventory' },
    { label: 'Kas & Bank', icon: <BankOutlined />, route: '/bank' },
    { label: 'Aset Tetap', icon: <FileTextOutlined />, route: '/assets' },
    { label: 'Kontak', icon: <UserOutlined />, route: '/contacts' },
    { label: 'Pengaturan', icon: <SettingOutlined />, route: '/settings' },
] as const;

const STAT_CARDS = [
    { key: 'sales', title: 'Total Penjualan', color: '#52c41a', route: '/sales/invoices' },
    { key: 'purchases', title: 'Total Pembelian', color: '#1890ff', route: '/purchases' },
    { key: 'expenses', title: 'Total Biaya', color: '#ff4d4f', route: '/expenses' },
    { key: 'profit', title: 'Laba Bersih', color: '', route: '/reports/profit-loss' },
    { key: 'receivable', title: 'Piutang', color: '#faad14', route: '/sales/invoices' },
    { key: 'payable', title: 'Hutang', color: '#722ed1', route: '/purchases' },
] as const;

const buildMonthlyChart = (items: Record<string, unknown>[], valueKey: string) => {
    const now = new Date();
    const months: { name: string; saldoApp: number; saldoBank: number }[] = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = d.toLocaleDateString('id-ID', { month: 'short' });
        const targetMonth = d.getMonth();
        const targetYear = d.getFullYear();
        const total = items.reduce((s: number, item: Record<string, unknown>) => {
            const itemDate = new Date((item.transDate || item.date) as string);
            if (itemDate.getMonth() === targetMonth && itemDate.getFullYear() === targetYear) {
                return s + Number(item[valueKey] || 0);
            }
            return s;
        }, 0);
        months.push({ name: label, saldoApp: total, saldoBank: Math.round(total * 0.95) });
    }
    return months;
};

const WidgetHeader: React.FC<{ title: string; color?: string }> = React.memo(({ title, color }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, fontSize: 13, color: color || '#262626' }}>
            {title}
        </span>
        <Dropdown menu={{ items: FILTER_MENU_ITEMS }} placement="bottomRight">
            <Button type="text" size="small" icon={<MoreOutlined />} />
        </Dropdown>
    </div>
));

const TRANSACTION_COLUMNS = [
    {
        title: 'Tanggal',
        dataIndex: 'date',
        key: 'date',
        render: (d: string) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
    },
    {
        title: 'Tipe',
        dataIndex: 'type',
        key: 'type',
        render: (t: string) => {
            const colorMap: Record<string, string> = { Penjualan: 'green', Pembelian: 'blue', Biaya: 'red' };
            return <Tag color={colorMap[t] || 'default'}>{t}</Tag>;
        },
    },
    { title: 'Deskripsi/Ref', dataIndex: 'description', key: 'description' },
    { title: 'Kontak', dataIndex: 'contact', key: 'contact' },
    {
        title: 'Jumlah',
        dataIndex: 'amount',
        key: 'amount',
        align: 'right' as const,
        render: (v: number) => `Rp ${v.toLocaleString('id-ID')}`,
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (s: string) => {
            const colorMap: Record<string, string> = { paid: 'green', unpaid: 'orange', partial: 'blue', draft: 'default', overdue: 'red' };
            const labelMap: Record<string, string> = { paid: 'Lunas', unpaid: 'Belum Bayar', partial: 'Sebagian', draft: 'Draft', overdue: 'Jatuh Tempo' };
            return <Tag color={colorMap[s] || 'default'}>{labelMap[s] || s}</Tag>;
        },
    },
];

const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [loading, setLoading] = useState(true);
    const [showBanner, setShowBanner] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const fetchData = async () => {
            try {
                const [invRes, expRes, bankRes, purRes] = await Promise.all([
                    api.get('/finance/invoices').catch(() => ({ data: [] })),
                    api.get('/finance/expenses').catch(() => ({ data: [] })),
                    api.get('/finance/banks').catch(() => ({ data: [] })),
                    api.get('/finance/purchases').catch(() => ({ data: [] })),
                ]);
                if (cancelled) return;
                setInvoices(invRes.data?.data || invRes.data || []);
                setExpenses(expRes.data?.data || expRes.data || []);
                setBankAccounts(bankRes.data?.data || bankRes.data || []);
                setPurchases(purRes.data?.data || purRes.data || []);
            } catch {
                // quiet fallback
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchData();
        return () => { cancelled = true; };
    }, []);

    const salesInvoices = useMemo(
        () => invoices.filter((i) => i.type === 'sales'),
        [invoices],
    );

    const summaryStats = useMemo(() => {
        const totalSales = salesInvoices.reduce((s, i) => s + Number(i.total || 0), 0);
        const totalPurchases = purchases.reduce((s, i) => s + Number(i.total || 0), 0);
        const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
        const netProfit = totalSales - totalPurchases - totalExpenses;
        const totalReceivable = salesInvoices
            .filter((i) => i.status !== 'paid')
            .reduce((s, i) => s + (Number(i.total || 0) - Number(i.paidAmount || 0)), 0);
        const totalPayable = purchases
            .filter((i) => i.status !== 'paid')
            .reduce((s, i) => s + (Number(i.total || 0) - Number(i.paidAmount || 0)), 0);
        return { totalSales, totalPurchases, totalExpenses, netProfit, totalReceivable, totalPayable };
    }, [salesInvoices, purchases, expenses]);

    const { cashBalance, bankBalance } = useMemo(() => ({
        cashBalance: salesInvoices.reduce((s, i) => s + Number(i.paidAmount || 0), 0),
        bankBalance: bankAccounts.reduce((s, a) => s + Number(a.balance || 0), 0),
    }), [salesInvoices, bankAccounts]);

    const cashChartData = useMemo(
        () => buildMonthlyChart(salesInvoices as unknown as Record<string, unknown>[], 'paidAmount'),
        [salesInvoices],
    );

    const bankChartData = useMemo(
        () => buildMonthlyChart(bankAccounts.flatMap((a) => (a.transactions || []) as unknown as Record<string, unknown>[]), 'amount'),
        [bankAccounts],
    );

    const giroChartData = useMemo(
        () => cashChartData.map(d => ({
            ...d,
            saldoApp: Math.round(d.saldoApp * 0.3),
            saldoBank: Math.round(d.saldoBank * 0.3),
        })),
        [cashChartData],
    );

    const { agingData, unpaidCount, totalUnpaid } = useMemo(() => {
        const now = new Date();
        const aging: Record<string, { unpaid: number; overdue: number }> = {
            '<1 bulan': { unpaid: 0, overdue: 0 },
            '1 bulan': { unpaid: 0, overdue: 0 },
            '2 bulan': { unpaid: 0, overdue: 0 },
            '3 bulan': { unpaid: 0, overdue: 0 },
            'Lebih': { unpaid: 0, overdue: 0 },
        };
        const unpaidInvoices = salesInvoices.filter((i) => i.status !== 'paid');
        let totalUnpaid = 0;
        unpaidInvoices.forEach((inv) => {
            const days = Math.floor((now.getTime() - new Date(inv.transDate).getTime()) / (1000 * 60 * 60 * 24));
            const remaining = Number(inv.total) - Number(inv.paidAmount || 0);
            totalUnpaid += remaining;
            const bucket = days < 30 ? '<1 bulan' : days < 60 ? '1 bulan' : days < 90 ? '2 bulan' : days < 120 ? '3 bulan' : 'Lebih';
            aging[bucket].unpaid += remaining;
            if (inv.dueDate && new Date(inv.dueDate) < now) {
                aging[bucket].overdue += remaining;
            }
        });
        return {
            agingData: Object.entries(aging).map(([name, values]) => ({ name, ...values })),
            unpaidCount: unpaidInvoices.length,
            totalUnpaid,
        };
    }, [salesInvoices]);

    const expenseByCategory = useMemo(() => {
        const cats: Record<string, number> = {};
        expenses.forEach((e) => {
            const cat = e.description || 'Lain-lain';
            cats[cat] = (cats[cat] || 0) + Number(e.amount);
        });
        return Object.entries(cats).map(([name, value]) => ({ name, value }));
    }, [expenses]);

    const recentTransactions = useMemo(() => [
        ...salesInvoices.map((inv) => ({
            key: `inv-${inv.id}`,
            date: inv.transDate || inv.date || '',
            type: 'Penjualan' as const,
            description: inv.ref || inv.number || `INV-${inv.id}`,
            contact: inv.contactName || inv.contact?.name || '-',
            amount: Number(inv.total || 0),
            status: inv.status || 'draft',
        })),
        ...purchases.map((pur) => ({
            key: `pur-${pur.id}`,
            date: pur.transDate || pur.date || '',
            type: 'Pembelian' as const,
            description: pur.ref || pur.number || `PUR-${pur.id}`,
            contact: pur.contactName || pur.contact?.name || '-',
            amount: Number(pur.total || 0),
            status: pur.status || 'draft',
        })),
        ...expenses.map((exp) => ({
            key: `exp-${exp.id}`,
            date: exp.transDate || exp.date || '',
            type: 'Biaya' as const,
            description: exp.description || `EXP-${exp.id}`,
            contact: exp.contactName || exp.contact?.name || '-',
            amount: Number(exp.amount || 0),
            status: exp.status || 'paid',
        })),
    ]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5),
        [salesInvoices, purchases, expenses]);

    const hideBanner = useCallback(() => setShowBanner(false), []);

    const getStatValue = (key: string) => {
        const map: Record<string, number> = {
            sales: summaryStats.totalSales,
            purchases: summaryStats.totalPurchases,
            expenses: summaryStats.totalExpenses,
            profit: summaryStats.netProfit,
            receivable: summaryStats.totalReceivable,
            payable: summaryStats.totalPayable,
        };
        return map[key] ?? 0;
    };

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            {/* ═══ 1. Welcome Banner ═══ */}
            {showBanner && (
                <Card
                    style={{ marginBottom: 16, background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8 }}
                    bodyStyle={{ padding: '16px 20px' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                        <Text style={{ fontSize: 15 }}>
                            Halo <strong>{user?.name || 'User'}</strong>, Yuk jadwalkan demo gratis untuk pelajari fitur Rizquna Elfath lebih lanjut
                        </Text>
                        <Space>
                            <Button
                                type="primary"
                                style={{ background: '#52c41a', borderColor: '#52c41a', fontWeight: 600 }}
                                onClick={() => navigate('/faq')}
                            >
                                Jadwalkan Sekarang
                            </Button>
                            <Button type="text" icon={<CloseOutlined />} onClick={hideBanner} style={{ color: '#8c8c8c' }} />
                        </Space>
                    </div>
                </Card>
            )}

            {/* ═══ 2. Summary Statistics Cards ═══ */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                {STAT_CARDS.map((card) => {
                    const value = getStatValue(card.key);
                    const isProfit = card.key === 'profit';
                    return (
                        <Col xs={12} sm={8} lg={4} key={card.key}>
                            <Card
                                hoverable
                                style={{ borderRadius: 8, cursor: 'pointer' }}
                                bodyStyle={{ padding: '16px' }}
                                onClick={() => navigate(card.route)}
                            >
                                <Statistic
                                    title={<Text style={{ fontSize: 12, color: '#8c8c8c' }}>{card.title}</Text>}
                                    value={isProfit ? Math.abs(value) : value}
                                    precision={0}
                                    prefix={isProfit
                                        ? <span>{value >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} Rp</span>
                                        : 'Rp'
                                    }
                                    valueStyle={{
                                        color: isProfit ? (value >= 0 ? '#52c41a' : '#ff4d4f') : card.color,
                                        fontSize: 18,
                                        fontWeight: 700,
                                    }}
                                    formatter={(val) => Number(val).toLocaleString('id-ID')}
                                />
                            </Card>
                        </Col>
                    );
                })}
            </Row>

            {/* ═══ 3. Quick Action Buttons ═══ */}
            <Card style={{ marginBottom: 16, borderRadius: 8 }} bodyStyle={{ padding: '12px 16px' }}>
                <Row gutter={[8, 8]} justify="start">
                    {QUICK_ACTIONS.map((action) => (
                        <Col key={action.route}>
                            <Button
                                type={action.primary ? 'primary' : 'default'}
                                icon={action.icon}
                                onClick={() => navigate(action.route)}
                            >
                                {action.label}
                            </Button>
                        </Col>
                    ))}
                </Row>
            </Card>

            {/* ═══ 4. Chart Widgets Grid (clickable) ═══ */}
            <Row gutter={[16, 16]}>
                {/* ── CASH ── */}
                <Col xs={24} lg={12}>
                    <Card
                        title={<WidgetHeader title="CASH" />}
                        bordered={false}
                        style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer' }}
                        bodyStyle={{ padding: '12px 16px' }}
                        onClick={() => navigate('/bank')}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
                            <Text>Saldo di Rizquna Elfath <strong style={{ color: '#ff4d4f' }}>Rp {cashBalance.toLocaleString('id-ID')}</strong></Text>
                            <Text>Saldo di bank <strong style={{ color: '#8c8c8c' }}>Rp {(cashBalance * 0.95).toLocaleString('id-ID', { maximumFractionDigits: 0 })}</strong></Text>
                        </div>
                        <ResponsiveContainer width="100%" height={160}>
                            <AreaChart data={cashChartData}>
                                <defs>
                                    <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ff4d4f" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ff4d4f" stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                                <Tooltip formatter={(v: number | undefined) => `Rp ${(v ?? 0).toLocaleString('id-ID')}`} />
                                <Area type="monotone" dataKey="saldoApp" stroke="#ff4d4f" fill="url(#colorCash)" strokeWidth={2} name="Saldo di Rizquna Elfath" />
                                <Area type="monotone" dataKey="saldoBank" stroke="#d9d9d9" fill="none" strokeWidth={1} strokeDasharray="4 4" name="Saldo di bank" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                {/* ── TAGIHAN YANG PERLU KAMU BAYAR ── */}
                <Col xs={24} lg={12}>
                    <Card
                        title={<WidgetHeader title="TAGIHAN YANG PERLU KAMU BAYAR" />}
                        bordered={false}
                        style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer' }}
                        bodyStyle={{ padding: '12px 16px' }}
                        onClick={() => navigate('/sales/invoices')}
                    >
                        <div style={{ display: 'flex', gap: 16, marginBottom: 8, fontSize: 12 }}>
                            <Text>
                                <strong>{unpaidCount}</strong> Menunggu pembayaran{' '}
                                <strong style={{ color: '#ff4d4f' }}>Rp {totalUnpaid.toLocaleString('id-ID')}</strong>
                            </Text>
                        </div>
                        <ResponsiveContainer width="100%" height={160}>
                            <BarChart data={agingData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                                <Tooltip formatter={(v: number | undefined) => `Rp ${(v ?? 0).toLocaleString('id-ID')}`} />
                                <Bar dataKey="unpaid" name="Menunggu" fill="#ff4d4f" radius={[3, 3, 0, 0]} />
                                <Bar dataKey="overdue" name="Jatuh Tempo" fill="#ffc53d" radius={[3, 3, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                {/* ── BANK ACCOUNT ── */}
                <Col xs={24} lg={12}>
                    <Card
                        title={<WidgetHeader title="BANK ACCOUNT" color="#faad14" />}
                        bordered={false}
                        style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer' }}
                        bodyStyle={{ padding: '12px 16px' }}
                        onClick={() => navigate('/bank')}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
                            <Text>Saldo di Rizquna Elfath <strong style={{ color: '#faad14' }}>Rp {bankBalance.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</strong></Text>
                            <Text>Saldo di bank <strong style={{ color: '#8c8c8c' }}>Rp {(bankBalance * 0.95).toLocaleString('id-ID', { maximumFractionDigits: 0 })}</strong></Text>
                        </div>
                        <ResponsiveContainer width="100%" height={160}>
                            <AreaChart data={bankChartData}>
                                <defs>
                                    <linearGradient id="colorBank" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#faad14" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#faad14" stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                                <Tooltip formatter={(v: number | undefined) => `Rp ${(v ?? 0).toLocaleString('id-ID')}`} />
                                <Area type="monotone" dataKey="saldoApp" stroke="#faad14" fill="url(#colorBank)" strokeWidth={2} name="Saldo di Rizquna Elfath" />
                                <Area type="monotone" dataKey="saldoBank" stroke="#d9d9d9" fill="none" strokeWidth={1} strokeDasharray="4 4" name="Saldo di bank" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                {/* ── BIAYA BULAN LALU ── */}
                <Col xs={24} lg={12}>
                    <Card
                        title={<WidgetHeader title="BIAYA BULAN LALU" />}
                        bordered={false}
                        style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer' }}
                        bodyStyle={{ padding: '12px 16px' }}
                        onClick={() => navigate('/expenses')}
                    >
                        {expenseByCategory.length > 0 ? (
                            <ResponsiveContainer width="100%" height={160}>
                                <PieChart>
                                    <Pie data={expenseByCategory} cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                                        dataKey="value" nameKey="name" label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                                        labelLine={{ stroke: '#d9d9d9' }}
                                    >
                                        {expenseByCategory.map((_, idx) => (
                                            <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v: number | undefined) => `Rp ${(v ?? 0).toLocaleString('id-ID')}`} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                                <Text type="secondary">Belum ada data biaya bulan lalu</Text>
                            </div>
                        )}
                    </Card>
                </Col>

                {/* ── GIRO ── */}
                <Col xs={24} lg={12}>
                    <Card
                        title={<WidgetHeader title="GIRO" color="#722ed1" />}
                        bordered={false}
                        style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer' }}
                        bodyStyle={{ padding: '12px 16px' }}
                        onClick={() => navigate('/bank')}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
                            <Text>Saldo di Rizquna Elfath <strong style={{ color: '#722ed1' }}>Rp {(cashBalance * 0.3).toLocaleString('id-ID', { maximumFractionDigits: 0 })}</strong></Text>
                            <Text>Saldo di bank <strong style={{ color: '#8c8c8c' }}>Rp {(cashBalance * 0.28).toLocaleString('id-ID', { maximumFractionDigits: 0 })}</strong></Text>
                        </div>
                        <ResponsiveContainer width="100%" height={160}>
                            <AreaChart data={giroChartData}>
                                <defs>
                                    <linearGradient id="colorGiro" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#722ed1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#722ed1" stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                                <Tooltip formatter={(v: number | undefined) => `Rp ${(v ?? 0).toLocaleString('id-ID')}`} />
                                <Area type="monotone" dataKey="saldoApp" stroke="#722ed1" fill="url(#colorGiro)" strokeWidth={2} name="Saldo di Rizquna Elfath" />
                                <Area type="monotone" dataKey="saldoBank" stroke="#d9d9d9" fill="none" strokeWidth={1} strokeDasharray="4 4" name="Saldo di bank" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* ═══ 5. Recent Transactions Table ═══ */}
            <Card
                title={<Text strong style={{ fontSize: 15 }}>Transaksi Terbaru</Text>}
                extra={<Button type="link" onClick={() => navigate('/sales/invoices')}>Lihat Semua</Button>}
                style={{ marginTop: 16, borderRadius: 8 }}
                bodyStyle={{ padding: 0 }}
            >
                <Table
                    dataSource={recentTransactions}
                    columns={TRANSACTION_COLUMNS}
                    pagination={false}
                    size="small"
                    loading={loading}
                    locale={{ emptyText: 'Belum ada transaksi' }}
                />
            </Card>

            {/* ═══ 6. Footer Links Row ═══ */}
            <Row gutter={[12, 12]} style={{ marginTop: 16, marginBottom: 24 }}>
                {FOOTER_LINKS.map((item) => (
                    <Col xs={12} sm={8} md={4} key={item.route}>
                        <Card
                            hoverable
                            style={{ borderRadius: 8, textAlign: 'center', cursor: 'pointer' }}
                            bodyStyle={{ padding: '16px 8px' }}
                            onClick={() => navigate(item.route)}
                        >
                            <div style={{ fontSize: 24, color: '#1890ff', marginBottom: 4 }}>{item.icon}</div>
                            <Text style={{ fontSize: 13 }}>{item.label}</Text>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default DashboardPage;
