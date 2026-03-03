import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Typography, Space, Button, Badge, Spin } from 'antd';
import {
    ArrowUpOutlined,
    ArrowDownOutlined,
    DollarOutlined,
    ShoppingCartOutlined,
    ShoppingOutlined,
    CalendarOutlined,
    MoreOutlined,
    FileExcelOutlined,
    RiseOutlined,
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

const { Title, Text } = Typography;

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const DashboardPage: React.FC = () => {
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
            { title: 'Total Penjualan', value: totalSales, icon: <ShoppingCartOutlined />, color: '#0fb9b1', trend: calcTrend(totalSales, prevRevenue) },
            { title: 'Total Pembelian', value: totalPurchases, icon: <ShoppingOutlined />, color: '#f59e0b', trend: calcTrend(totalPurchases, prevRevenue) },
            { title: 'Total Biaya', value: totalExpenses, icon: <DollarOutlined />, color: '#ef4444', trend: calcTrend(totalExpenses, prevExpense) },
            { title: 'Laba Bersih', value: netProfit, icon: <RiseOutlined />, color: '#20bf6b', trend: calcTrend(netProfit, prevNetProfit) },
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
        <div style={{ paddingBottom: 40 }}>
            {/* Header Section */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}
            >
                <div>
                    <Text style={{ color: '#64748b', fontSize: 16, fontWeight: 500 }}>Selamat Siang, Administrator</Text>
                    <Title level={1} style={{ margin: 0, fontWeight: 800, fontSize: 40, color: '#0f172a', letterSpacing: '-1px' }}>
                        Pusat Kontrol <span style={{ color: '#0fb9b1' }}>Finansial</span>
                    </Title>
                </div>
                <Space size="middle">
                    <Button
                        icon={<CalendarOutlined />}
                        size="large"
                        className="glass-effect"
                        style={{ borderRadius: 16, fontWeight: 600 }}
                    >
                        {dayjs().format('MMMM YYYY')}
                    </Button>
                    <Button
                        type="primary"
                        size="large"
                        icon={<FileExcelOutlined />}
                        onClick={() => {
                            const params = new URLSearchParams({
                                start_date: dayjs().startOf('month').format('YYYY-MM-DD'),
                                end_date: dayjs().endOf('month').format('YYYY-MM-DD'),
                            });
                            window.open(`${import.meta.env.VITE_API_URL}/finance/reports/profit-loss/excel?${params.toString()}`, '_blank');
                        }}
                    >
                        Export Laporan
                    </Button>
                </Space>
            </motion.div>

            {/* KPI Cards */}
            <Row gutter={[24, 24]} style={{ marginBottom: 40 }}>
                {stats.map((stat, idx) => (
                    <Col xs={24} sm={12} lg={6} key={idx}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className="premium-card" bodyStyle={{ padding: 28 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                                    <div style={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: 18,
                                        background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}10)`,
                                        color: stat.color,
                                        fontSize: 24,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: `0 8px 16px ${stat.color}10`
                                    }}>
                                        {stat.icon}
                                    </div>
                                    <Badge 
                                        count={stat.trend} 
                                        style={{ 
                                            backgroundColor: stat.trend.startsWith('+') ? '#dcfce7' : '#fee2e2', 
                                            color: stat.trend.startsWith('+') ? '#166534' : '#991b1b',
                                            fontWeight: 700,
                                            padding: '0 8px',
                                            borderRadius: 8
                                        }} 
                                    />
                                </div>
                                <Text style={{ color: '#64748b', fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {stat.title}
                                </Text>
                                <div style={{ marginTop: 8 }}>
                                    <Title level={2} style={{ margin: 0, fontWeight: 800, fontSize: 28, color: '#0f172a' }}>
                                        Rp{stat.value.toLocaleString('id-ID')}
                                    </Title>
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
                                <div style={{ padding: '8px 0' }}>
                                    <Title level={4} style={{ margin: 0, fontWeight: 700 }}>Arus Kas Bulanan</Title>
                                    <Text type="secondary" style={{ fontSize: 13 }}>Perbandingan penjualan vs biaya operasional</Text>
                                </div>
                            }
                            extra={<Button type="text" icon={<MoreOutlined />} style={{ borderRadius: 10 }} />}
                        >
                            <ResponsiveContainer width="100%" height={380}>
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0fb9b1" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#0fb9b1" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} dy={15} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `${v / 1000000}jt`} dx={-10} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: 12 }}
                                        formatter={(v: any) => `Rp${Number(v).toLocaleString('id-ID')}`}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="income"
                                        stroke="#0fb9b1"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorIncome)"
                                        name="Pemasukan"
                                        animationDuration={2000}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="expense"
                                        stroke="#ef4444"
                                        strokeWidth={3}
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
                                <div style={{ padding: '8px 0' }}>
                                    <Title level={4} style={{ margin: 0, fontWeight: 700 }}>Aktivitas Terbaru</Title>
                                    <Text type="secondary" style={{ fontSize: 13 }}>Transaksi masuk & keluar terkini</Text>
                                </div>
                            }
                            bodyStyle={{ padding: '0 24px 24px' }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {recentTransactions.map((tx: any, i) => (
                                    <div key={i} style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 16, 
                                        padding: '20px 0',
                                        borderBottom: i === recentTransactions.length - 1 ? 'none' : '1px solid #f1f5f9'
                                    }}>
                                        <div style={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: 14,
                                            backgroundColor: tx.type === 'SALE' ? '#dcfce7' : tx.type === 'PURCHASE' ? '#fef3c7' : '#fee2e2',
                                            color: tx.type === 'SALE' ? '#10b981' : tx.type === 'PURCHASE' ? '#f59e0b' : '#ef4444',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 18,
                                            flexShrink: 0
                                        }}>
                                            {tx.type === 'SALE' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <Text strong style={{ display: 'block', fontSize: 15, color: '#1e293b' }}>
                                                {tx.type === 'SALE' ? 'Penerimaan Piutang' : tx.type === 'PURCHASE' ? 'Pembayaran Utang' : 'Pengeluaran Biaya'}
                                            </Text>
                                            <Text style={{ color: '#64748b', fontSize: 13 }}>
                                                {tx.description || tx.ref || tx.number || 'Tanpa keterangan'}
                                            </Text>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <Text strong style={{ color: tx.type === 'SALE' ? '#10b981' : '#0f172a', fontSize: 15 }}>
                                                {tx.type === 'SALE' ? '+' : '-'}Rp{(tx.total || tx.amount || 0).toLocaleString('id-ID')}
                                            </Text>
                                            <div style={{ fontSize: 11, color: '#94a3b8' }}>Baru saja</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button block size="large" className="glass-effect" style={{ borderRadius: 14, fontWeight: 700, height: 50, marginTop: 10 }}>
                                Lihat Semua Riwayat
                            </Button>
                        </Card>
                    </motion.div>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardPage;
