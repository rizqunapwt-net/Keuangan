import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Typography, Button, Badge, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
    ArrowUpOutlined,
    ArrowDownOutlined,
    DollarOutlined,
    ShoppingCartOutlined,
    ShoppingOutlined,
    CalendarOutlined,
    MoreOutlined,
    RiseOutlined,
    RocketOutlined,
} from '@ant-design/icons';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import api from '../api';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { fmtRpCompact } from '../utils/formatters';

const { Title, Text } = Typography;

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        invoices: [],
        purchases: [],
        expenses: [],
    });
    const [monthlyData, setMonthlyData] = useState<any[]>([]);
    const [prevMonthSummary, setPrevMonthSummary] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentYear = dayjs().year();
                const prevMonth = dayjs().subtract(1, 'month');
                const [invRes, purRes, expRes, monthlyRes, prevSummaryRes] = await Promise.all([
                    api.get('/finance/invoices').catch(() => ({ data: [] })),
                    api.get('/finance/purchases').catch(() => ({ data: [] })),
                    api.get('/finance/expenses').catch(() => ({ data: [] })),
                    api.get('/finance/reports/monthly', { params: { year: currentYear } }).catch(() => ({ data: [] })),
                    api.get('/finance/reports/profit-loss', {
                        params: {
                            start_date: prevMonth.startOf('month').format('YYYY-MM-DD'),
                            end_date: prevMonth.endOf('month').format('YYYY-MM-DD'),
                        }
                    }).catch(() => ({ data: null })),
                ]);
                const unwrap = (res: any) => {
                    const d = res.data?.data ?? res.data ?? [];
                    return Array.isArray(d) ? d : (Array.isArray(d?.data) ? d.data : []);
                };
                setData({
                    invoices: unwrap(invRes),
                    purchases: unwrap(purRes),
                    expenses: unwrap(expRes),
                });
                const rawMonthly = Array.isArray(monthlyRes.data) ? monthlyRes.data : (monthlyRes.data?.data ?? []);
                setMonthlyData(rawMonthly);
                const prevData = prevSummaryRes.data?.data ?? prevSummaryRes.data ?? null;
                setPrevMonthSummary(prevData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const stats = useMemo(() => {
        const totalSales = data.invoices.reduce((acc, curr: any) => acc + (Number(curr.total || curr.total_amount) || 0), 0);
        const totalPurchases = data.purchases.reduce((acc, curr: any) => acc + (Number(curr.total || curr.total_amount) || 0), 0);
        const totalExpenses = data.expenses.reduce((acc, curr: any) => acc + (Number(curr.amount) || 0), 0);
        const netProfit = totalSales - totalPurchases - totalExpenses;

        const calcTrend = (current: number, previous: number | null): string => {
            if (!previous || previous === 0) return current > 0 ? '+100%' : '0%';
            const pct = ((current - previous) / Math.abs(previous)) * 100;
            return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
        };

        const prevRevenue = prevMonthSummary ? Number(prevMonthSummary.revenues?.total ?? prevMonthSummary.monthly_revenue ?? 0) : null;
        const prevExpense = prevMonthSummary ? Number(prevMonthSummary.expenses?.total ?? prevMonthSummary.monthly_expenses ?? 0) : null;
        const prevNetProfit = prevMonthSummary ? Number(prevMonthSummary.net_profit ?? 0) : null;

        return [
            { title: 'TOTAL PENJUALAN', value: totalSales, icon: <ShoppingCartOutlined />, color: '#0fb9b1', trend: calcTrend(totalSales, prevRevenue) },
            { title: 'TOTAL PEMBELIAN', value: totalPurchases, icon: <ShoppingOutlined />, color: '#f59e0b', trend: calcTrend(totalPurchases, prevRevenue) },
            { title: 'TOTAL BIAYA', value: totalExpenses, icon: <DollarOutlined />, color: '#ef4444', trend: calcTrend(totalExpenses, prevExpense) },
            { title: 'LABA BERSIH', value: netProfit, icon: <RiseOutlined />, color: '#20bf6b', trend: calcTrend(netProfit, prevNetProfit) },
        ];
    }, [data, prevMonthSummary]);

    const chartData = useMemo(() => {
        if (monthlyData.length === 0) {
            return MONTH_NAMES.map((name) => ({ name, income: 0, expense: 0 }));
        }
        return monthlyData.map((item: any) => ({
            name: MONTH_NAMES[Number(item.month) - 1] || `B${item.month}`,
            income: Number(item.income) || 0,
            expense: Number(item.expense) || 0,
        }));
    }, [monthlyData]);

    const recentTransactions = useMemo(() => {
        return [
            ...data.invoices.map((i: any) => ({ ...i, type: 'SALE' })),
            ...data.purchases.map((p: any) => ({ ...p, type: 'PURCHASE' })),
            ...data.expenses.map((e: any) => ({ ...e, type: 'EXPENSE' })),
        ].sort((a, b) => {
            const dateA = a.transDate || a.date || a.expense_date || a.order_date;
            const dateB = b.transDate || b.date || b.expense_date || b.order_date;
            return dayjs(dateB).unix() - dayjs(dateA).unix();
        }).slice(0, 6);
    }, [data]);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Spin size="large" tip="Memuat Dashboard..." />
        </div>
    );

    return (
        <div style={{ paddingBottom: 40, fontFamily: "'Poppins', sans-serif" }}>
            
            {/* Fillow-style Header with Dates */}
            <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={3} style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.3px' }}>Dashboard</Title>
                <div style={{ background: '#fff', padding: '8px 16px', borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <CalendarOutlined style={{ color: '#0fb9b1' }} />
                    <Text strong style={{ fontSize: 13, color: '#333' }}>{dayjs().format('DD MMMM YYYY')}</Text>
                </div>
            </div>

            {/* Fillow-style Hero Banner */}
            <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: 32 }}
            >
                <Card 
                    style={{ 
                        borderRadius: 24, 
                        background: 'linear-gradient(135deg, #0fb9b1 0%, #20bf6b 100%)',
                        border: 'none',
                        position: 'relative',
                        overflow: 'hidden',
                        padding: '12px 0'
                    }}
                >
                    <div style={{ 
                        position: 'absolute', right: '-40px', bottom: '-40px', opacity: 0.15, fontSize: 240, color: 'white', transform: 'rotate(-15deg)'
                    }}>
                        <RocketOutlined />
                    </div>
                    <Row align="middle" gutter={40} style={{ padding: '24px 40px' }}>
                        <Col xs={24} md={16}>
                            <Title level={2} style={{ color: 'white', margin: 0, fontWeight: 800, fontSize: 32, letterSpacing: '-0.5px' }}>
                                Selamat Datang Kembali!
                            </Title>
                            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, display: 'block', marginTop: 8, maxWidth: 500, lineHeight: 1.6 }}>
                                Pantau kesehatan finansial Rizquna Kasir Anda dalam satu tampilan cerdas. Semua data diperbarui secara real-time.
                            </Text>
                            <div style={{ marginTop: 24 }}>
                            </div>
                        </Col>
                    </Row>
                </Card>
            </motion.div>

            {/* KPI Cards — Fillow Style (Spacious & Soft) */}
            <Row gutter={[24, 24]} style={{ marginBottom: 40 }}>
                {stats.map((stat, idx) => (
                    <Col xs={24} sm={12} lg={6} key={idx}>
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + (idx * 0.1) }}
                            onClick={() => {
                                if (stat.title === 'LABA BERSIH') navigate('/reports/profit-loss');
                                if (stat.title === 'TOTAL PENJUALAN') navigate('/finance/invoices');
                                if (stat.title === 'TOTAL PEMBELIAN') navigate('/finance/debts');
                                if (stat.title === 'TOTAL BIAYA') navigate('/finance/expenses');
                            }}
                            style={{ cursor: 'pointer' }}
                        >
                            <Card className="premium-card" style={{ borderRadius: 20 }} bodyStyle={{ padding: '30px 24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                                    <div style={{
                                        width: 52,
                                        height: 52,
                                        borderRadius: 16,
                                        background: `${stat.color}10`,
                                        color: stat.color,
                                        fontSize: 22,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        {stat.icon}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <Text style={{ color: '#aaa', fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', display: 'block' }}>
                                            {stat.title}
                                        </Text>
                                        <Title level={3} style={{ margin: 0, fontWeight: 800, fontSize: 22, color: '#333', marginTop: 2 }}>
                                            Rp{(stat.value > 1000000 ? (stat.value / 1000000).toFixed(1) + ' jt' : fmtRpCompact(stat.value).slice(2))}
                                        </Title>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f8f8f8', paddingTop: 12 }}>
                                    <Badge 
                                        count={stat.trend} 
                                        style={{ 
                                            backgroundColor: stat.trend.startsWith('+') ? '#dcfce7' : '#fee2e2', 
                                            color: stat.trend.startsWith('+') ? '#10b981' : '#ef4444',
                                            fontWeight: 700,
                                            padding: '0 8px',
                                            borderRadius: 8,
                                            fontSize: 11,
                                            boxShadow: 'none',
                                            border: 'none'
                                        }} 
                                    />
                                    <Text style={{ fontSize: 11, color: '#ccc', fontWeight: 500 }}>Bulan lalu</Text>
                                </div>
                            </Card>
                        </motion.div>
                    </Col>
                ))}
            </Row>

            <Row gutter={[24, 24]}>
                {/* Visual Chart */}
                <Col xs={24} lg={16}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card
                            className="premium-card"
                            title={
                                <div style={{ padding: '12px 0' }}>
                                    <Title level={4} style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.3px' }}>Statistik Proyek & Arus Kas</Title>
                                    <Text type="secondary" style={{ fontSize: 13, color: '#aaa', fontWeight: 500 }}>Perbandingan performa finansial bulanan</Text>
                                </div>
                            }
                            extra={<Button type="text" icon={<MoreOutlined />} style={{ borderRadius: 10 }} />}
                        >
                            <ResponsiveContainer width="100%" height={400}>
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0fb9b1" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#0fb9b1" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#bbb', fontSize: 11, fontWeight: 600 }} dy={15} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#bbb', fontSize: 11 }} tickFormatter={(v) => `${v / 1000000}jt`} dx={-10} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 15px 35px rgba(0,0,0,0.1)', padding: 12, fontFamily: "'Poppins', sans-serif" }}
                                        formatter={(v: any) => fmtRpCompact(v)}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="income"
                                        stroke="#0fb9b1"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorIncome)"
                                        name="Pemasukan"
                                        animationDuration={2000}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="expense"
                                        stroke="#ef4444"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorExpense)"
                                        name="Pengeluaran"
                                        animationDuration={2000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Card>
                    </motion.div>
                </Col>

                {/* Activity List */}
                <Col xs={24} lg={8}>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        style={{ height: '100%' }}
                    >
                        <Card
                            className="premium-card"
                            title={
                                <div style={{ padding: '12px 0' }}>
                                    <Title level={4} style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.3px' }}>Aktivitas Terbaru</Title>
                                    <Text type="secondary" style={{ fontSize: 13, color: '#aaa', fontWeight: 500 }}>History transaksi real-time</Text>
                                </div>
                            }
                        >
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {recentTransactions.map((tx: any, i) => (
                                    <div key={i} style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 16, 
                                        padding: '16px 0',
                                        borderBottom: i === recentTransactions.length - 1 ? 'none' : '1px solid #f8f8f8'
                                    }}>
                                        <div style={{
                                            width: 42,
                                            height: 42,
                                            borderRadius: 14,
                                            backgroundColor: tx.type === 'SALE' ? 'rgba(16, 185, 129, 0.1)' : tx.type === 'PURCHASE' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            color: tx.type === 'SALE' ? '#10b981' : tx.type === 'PURCHASE' ? '#f59e0b' : '#ef4444',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 16,
                                            flexShrink: 0
                                        }}>
                                            {tx.type === 'SALE' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <Text strong style={{ display: 'block', fontSize: 14, color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {tx.type === 'SALE' ? 'Penerimaan Piutang' : tx.type === 'PURCHASE' ? 'Pembayaran Utang' : 'Pengeluaran Biaya'}
                                            </Text>
                                            <Text style={{ color: '#aaa', fontSize: 11, fontWeight: 500 }}>
                                                {dayjs(tx.transDate || tx.date || tx.expense_date || tx.order_date).format('DD MMM, HH:mm')}
                                            </Text>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <Text strong style={{ color: tx.type === 'SALE' ? '#10b981' : '#333', fontSize: 14 }}>
                                                {tx.type === 'SALE' ? '+' : '-'}{fmtRpCompact(tx.total || tx.amount || 0)}
                                            </Text>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button block size="large" style={{ borderRadius: 14, fontWeight: 700, height: 48, marginTop: 16, background: '#fcfcfc', color: '#666', border: '1px solid #eee' }}>
                                LIHAT SEMUA RIWAYAT
                            </Button>
                        </Card>
                    </motion.div>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardPage;
