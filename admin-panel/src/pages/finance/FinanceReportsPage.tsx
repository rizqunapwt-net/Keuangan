import React, { useState } from 'react';
import { Card, Typography, Tabs, DatePicker, Table, Tag } from 'antd';
import { BarChartOutlined, LineChartOutlined, PieChartOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import dayjs from 'dayjs';
import { fmtRp } from '../../utils/formatters';
import PageHeader from '../../components/PageHeader';
import { motion } from 'framer-motion';

const { Text } = Typography;

const FinanceReportsPage: React.FC = () => {
    const [dailyMonth, setDailyMonth] = useState(dayjs());
    const [monthlyYear, setMonthlyYear] = useState(dayjs());

    const { data: dailyData = [], isLoading: loadingDaily } = useQuery({
        queryKey: ['reports', 'daily', dailyMonth.format('YYYY-MM')],
        queryFn: async () => {
            const res = await api.get('/finance/reports/daily', {
                params: { month: dailyMonth.month() + 1, year: dailyMonth.year() }
            });
            const d = res.data?.data || res.data || [];
            return Array.isArray(d) ? d : [];
        }
    });

    const { data: monthlyData = [], isLoading: loadingMonthly } = useQuery({
        queryKey: ['reports', 'monthly', monthlyYear.format('YYYY')],
        queryFn: async () => {
            const res = await api.get('/finance/reports/monthly', {
                params: { year: monthlyYear.year() }
            });
            const d = res.data?.data || res.data || [];
            return Array.isArray(d) ? d : [];
        }
    });

    const { data: yearlyData = [], isLoading: loadingYearly } = useQuery({
        queryKey: ['reports', 'yearly'],
        queryFn: async () => {
            const res = await api.get('/finance/reports/yearly');
            const d = res.data?.data || res.data || [];
            return Array.isArray(d) ? d : [];
        }
    });

    const columns = (type: 'date' | 'month' | 'year') => [
        { 
            title: type === 'date' ? 'TANGGAL' : type === 'month' ? 'BULAN' : 'TAHUN', 
            dataIndex: type, 
            key: type,
            render: (v: any) => (
                <Text strong style={{ fontSize: 13, color: '#475569' }}>
                    {type === 'date' ? dayjs(v).format('DD MMM YYYY') : 
                     type === 'month' ? dayjs().month(Number(v) - 1).format('MMMM') : v}
                </Text>
            )
        },
        {
            title: 'PEMASUKAN',
            dataIndex: 'income',
            key: 'income',
            align: 'right' as const,
            render: (v: number) => <Text style={{ color: '#10b981', fontWeight: 600, fontSize: 13 }}>{fmtRp(v)}</Text>
        },
        {
            title: 'PENGELUARAN',
            dataIndex: 'expense',
            key: 'expense',
            align: 'right' as const,
            render: (v: number) => <Text style={{ color: '#ef4444', fontWeight: 600, fontSize: 13 }}>{fmtRp(v)}</Text>
        },
        {
            title: 'SELISIH (LABA/RUGI)',
            key: 'diff',
            align: 'right' as const,
            render: (_: any, record: any) => {
                const diff = Number(record.income) - Number(record.expense);
                return (
                    <Tag bordered={false} style={{ 
                        backgroundColor: diff >= 0 ? '#f0fdf4' : '#fef2f2', 
                        color: diff >= 0 ? '#10b981' : '#ef4444',
                        fontWeight: 700,
                        fontSize: 12,
                        borderRadius: 6,
                        margin: 0,
                        padding: '2px 10px'
                    }}>
                        {fmtRp(diff)}
                    </Tag>
                );
            }
        },
    ];

    const tabItems = [
        { 
            key: 'daily', 
            label: 'HARIAN', 
            icon: <PieChartOutlined />,
            children: (
                <div style={{ padding: '8px 4px' }}>
                    <div style={{ marginBottom: 24, padding: '0 4px' }}>
                        <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 8, textTransform: 'uppercase' }}>PILIH BULAN</Text>
                        <DatePicker picker="month" value={dailyMonth} onChange={(v) => v && setDailyMonth(v)} allowClear={false} style={{ borderRadius: 10, height: 40, width: 220 }} />
                    </div>
                    <Table columns={columns('date')} dataSource={dailyData} loading={loadingDaily} pagination={false} rowKey="date" size="middle" />
                </div>
            )
        },
        { 
            key: 'monthly', 
            label: 'BULANAN', 
            icon: <BarChartOutlined />,
            children: (
                <div style={{ padding: '8px 4px' }}>
                    <div style={{ marginBottom: 24, padding: '0 4px' }}>
                        <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 8, textTransform: 'uppercase' }}>PILIH TAHUN</Text>
                        <DatePicker picker="year" value={monthlyYear} onChange={(v) => v && setMonthlyYear(v)} allowClear={false} style={{ borderRadius: 10, height: 40, width: 220 }} />
                    </div>
                    <Table columns={columns('month')} dataSource={monthlyData} loading={loadingMonthly} pagination={false} rowKey="month" size="middle" />
                </div>
            )
        },
        { 
            key: 'yearly', 
            label: 'TAHUNAN', 
            icon: <LineChartOutlined />,
            children: (
                <div style={{ padding: '24px 4px 8px' }}>
                    <Table columns={columns('year')} dataSource={yearlyData} loading={loadingYearly} pagination={false} rowKey="year" size="middle" />
                </div>
            )
        },
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            style={{ fontFamily: "'Poppins', sans-serif" }}
        >
            <PageHeader
                title="Laporan Kas"
                description="Rekapitulasi data pemasukan dan pengeluaran secara periodik."
                breadcrumb={[{ label: 'LAPORAN' }, { label: 'KAS' }]}
            />

            <Card className="premium-card" style={{ borderRadius: 24 }} bodyStyle={{ padding: 0 }}>
                <div style={{ padding: '0 24px' }}>
                    <Tabs 
                        defaultActiveKey="daily" 
                        items={tabItems} 
                        className="premium-tabs"
                        style={{ padding: '12px 0' }}
                    />
                </div>
            </Card>
        </motion.div>
    );
};

export default FinanceReportsPage;
