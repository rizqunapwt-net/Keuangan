import React, { useState } from 'react';
import { Table, Card, Typography, Breadcrumb, Tabs, DatePicker } from 'antd';
import { BarChartOutlined, LineChartOutlined, PieChartOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import dayjs from 'dayjs';
import { fmtRp } from '../../utils/formatters';

const { Title, Text } = Typography;

const FinanceReportsPage: React.FC = () => {
    const [dailyMonth, setDailyMonth] = useState(dayjs());
    const [monthlyYear, setMonthlyYear] = useState(dayjs());

    const { data: dailyData = [], isLoading: loadingDaily } = useQuery({
        queryKey: ['reports', 'daily', dailyMonth.format('YYYY-MM')],
        queryFn: async () => {
            const res = await api.get('/finance/reports/daily', {
                params: { month: dailyMonth.month() + 1, year: dailyMonth.year() }
            });
            return res.data || [];
        }
    });

    const { data: monthlyData = [], isLoading: loadingMonthly } = useQuery({
        queryKey: ['reports', 'monthly', monthlyYear.format('YYYY')],
        queryFn: async () => {
            const res = await api.get('/finance/reports/monthly', {
                params: { year: monthlyYear.year() }
            });
            return res.data || [];
        }
    });

    const { data: yearlyData = [], isLoading: loadingYearly } = useQuery({
        queryKey: ['reports', 'yearly'],
        queryFn: async () => {
            const res = await api.get('/finance/reports/yearly');
            return res.data || [];
        }
    });

    const renderDaily = () => (
        <div>
            <div style={{ marginBottom: 16 }}>
                <DatePicker
                    picker="month"
                    value={dailyMonth}
                    onChange={(v) => v && setDailyMonth(v)}
                    allowClear={false}
                />
            </div>
            <Table
                columns={[
                    { title: 'Tanggal', dataIndex: 'date', key: 'date', render: (v) => dayjs(v).format('DD/MM/YYYY') },
                    {
                        title: 'Pemasukan',
                        dataIndex: 'income',
                        key: 'income',
                        align: 'right',
                        render: (v) => <Text type="success">{fmtRp(v)}</Text>
                    },
                    {
                        title: 'Pengeluaran',
                        dataIndex: 'expense',
                        key: 'expense',
                        align: 'right',
                        render: (v) => <Text type="danger">{fmtRp(v)}</Text>
                    },
                    {
                        title: 'Selisih',
                        key: 'diff',
                        align: 'right',
                        render: (_, record: any) => {
                            const diff = Number(record.income) - Number(record.expense);
                            return <Text strong type={diff >= 0 ? 'success' : 'danger'}>{fmtRp(diff)}</Text>
                        }
                    },
                ]}
                dataSource={dailyData}
                loading={loadingDaily}
                pagination={false}
                rowKey="date"
            />
        </div>
    );

    const renderMonthly = () => (
        <div>
            <div style={{ marginBottom: 16 }}>
                <DatePicker
                    picker="year"
                    value={monthlyYear}
                    onChange={(v) => v && setMonthlyYear(v)}
                    allowClear={false}
                />
            </div>
            <Table
                columns={[
                    {
                        title: 'Bulan',
                        dataIndex: 'month',
                        key: 'month',
                        render: (v) => dayjs().month(Number(v) - 1).format('MMMM')
                    },
                    {
                        title: 'Pemasukan',
                        dataIndex: 'income',
                        key: 'income',
                        align: 'right',
                        render: (v) => <Text type="success">{fmtRp(v)}</Text>
                    },
                    {
                        title: 'Pengeluaran',
                        dataIndex: 'expense',
                        key: 'expense',
                        align: 'right',
                        render: (v) => <Text type="danger">{fmtRp(v)}</Text>
                    },
                    {
                        title: 'Selisih',
                        key: 'diff',
                        align: 'right',
                        render: (_, record: any) => {
                            const diff = Number(record.income) - Number(record.expense);
                            return <Text strong type={diff >= 0 ? 'success' : 'danger'}>{fmtRp(diff)}</Text>
                        }
                    },
                ]}
                dataSource={monthlyData}
                loading={loadingMonthly}
                pagination={false}
                rowKey="month"
            />
        </div>
    );

    const renderYearly = () => (
        <Table
            columns={[
                { title: 'Tahun', dataIndex: 'year', key: 'year' },
                {
                    title: 'Pemasukan',
                    dataIndex: 'income',
                    key: 'income',
                    align: 'right',
                    render: (v) => <Text type="success">{fmtRp(v)}</Text>
                },
                {
                    title: 'Pengeluaran',
                    dataIndex: 'expense',
                    key: 'expense',
                    align: 'right',
                    render: (v) => <Text type="danger">{fmtRp(v)}</Text>
                },
                {
                    title: 'Selisih',
                    key: 'diff',
                    align: 'right',
                    render: (_, record: any) => {
                        const diff = Number(record.income) - Number(record.expense);
                        return <Text strong type={diff >= 0 ? 'success' : 'danger'}>{fmtRp(diff)}</Text>
                    }
                },
            ]}
            dataSource={yearlyData}
            loading={loadingYearly}
            pagination={false}
            rowKey="year"
        />
    );

    const items = [
        { key: 'daily', label: 'Laporan Harian', children: renderDaily(), icon: <PieChartOutlined /> },
        { key: 'monthly', label: 'Laporan Bulanan', children: renderMonthly(), icon: <BarChartOutlined /> },
        { key: 'yearly', label: 'Laporan Tahunan', children: renderYearly(), icon: <LineChartOutlined /> },
    ];

    return (
        <div>
            <Breadcrumb className="mb-4" items={[{ title: 'Beranda' }, { title: 'Keuangan' }, { title: 'Laporan Kas' }]} />

            <Title level={4} className="mb-4">Laporan Arus Kas</Title>

            <Card bordered={false} style={{ borderRadius: 8 }}>
                <Tabs defaultActiveKey="daily" items={items} />
            </Card>
        </div>
    );
};

export default FinanceReportsPage;
