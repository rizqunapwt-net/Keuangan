import React from 'react';
import { Table, Button, Tag, Card, Typography, Row, Col, Space, Input, Popconfirm, message } from 'antd';
import { PlusOutlined, SearchOutlined, PrinterOutlined, ExportOutlined, StopOutlined, DollarOutlined } from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import AccessControl from '../../components/AccessControl';
import dayjs from 'dayjs';
import ExpenseFormDrawer from './ExpenseFormDrawer';
import PageHeader from '../../components/PageHeader';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

const statusConfig: Record<string, { color: string; bgColor: string; label: string }> = {
    recorded: { color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)', label: 'TERCATAT' },
    void: { color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)', label: 'VOID' },
    unpaid: { color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)', label: 'BELUM BAYAR' },
};

const ExpensesPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const { data: rawData = [], isLoading } = useQuery({
        queryKey: ['expenses'],
        queryFn: async () => {
            const res = await api.get('/finance/expenses');
            const data = res.data?.data || res.data;
            return Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
        },
    });
    const data = rawData;

    const handleVoid = async (id: number) => {
        try {
            await api.put(`/finance/expenses/${id}/void`);
            message.success('Biaya berhasil dibatalkan (void)');
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
        } catch {
            message.error('Gagal membatalkan biaya');
        }
    };

    // Summary metrics
    const now = dayjs();
    const thisMonth = data.filter((e: any) => dayjs(e.transDate).isSame(now, 'month'));
    const last30 = data.filter((e: any) => dayjs(e.transDate).isAfter(now.subtract(30, 'day')));
    const totalThisMonth = thisMonth.reduce((s: number, e: any) => s + Number(e.amount), 0);
    const totalLast30 = last30.reduce((s: number, e: any) => s + Number(e.amount), 0);

    const columns = [
        {
            title: 'TANGGAL',
            dataIndex: 'transDate',
            key: 'transDate',
            sorter: true,
            render: (v: string) => <Text style={{ fontSize: 13, fontWeight: 500, color: '#666' }}>{dayjs(v).format('DD MMM YYYY')}</Text>,
        },
        {
            title: 'NOMOR REF',
            dataIndex: 'refNumber',
            key: 'refNumber',
            sorter: true,
            render: (v: string) => <Text strong style={{ color: '#0fb9b1', fontWeight: 700 }}>#{v}</Text>,
        },
        {
            title: 'PENERIMA',
            dataIndex: ['contact', 'name'],
            key: 'contact',
            render: (v: string) => <Text style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>{v || '-'}</Text>,
        },
        {
            title: 'STATUS',
            dataIndex: 'status',
            key: 'status',
            render: (s: string) => {
                const config = statusConfig[s] || { color: '#aaa', bgColor: '#f5f5f5', label: s.toUpperCase() };
                return (
                    <Tag bordered={false} style={{
                        backgroundColor: config.bgColor,
                        color: config.color,
                        fontWeight: 700,
                        borderRadius: 8,
                        fontSize: 10,
                        padding: '2px 10px',
                        letterSpacing: '0.3px'
                    }}>
                        {config.label}
                    </Tag>
                );
            },
        },
        {
            title: 'TOTAL BIAYA',
            dataIndex: 'amount',
            key: 'amount',
            align: 'right' as const,
            sorter: true,
            render: (v: number) => <Text strong style={{ fontSize: 14, color: '#333' }}>Rp{Number(v).toLocaleString('id-ID')}</Text>,
        },
        {
            title: '',
            key: 'action',
            width: 80,
            align: 'right' as const,
            render: (_: unknown, record: any) => record.status !== 'void' ? (
                <Popconfirm
                    title="Batalkan biaya ini?"
                    onConfirm={() => handleVoid(record.id)}
                    okText="Ya, Void"
                    cancelText="Batal"
                    okButtonProps={{ danger: true }}
                >
                    <Button type="text" danger icon={<StopOutlined />} size="small" style={{ color: '#aaa' }} />
                </Popconfirm>
            ) : null,
        },
    ];

    const stats = [
        { title: 'BULAN INI', value: totalThisMonth, color: '#0fb9b1', icon: <DollarOutlined style={{ fontSize: 20 }} /> },
        { title: '30 HARI TERAKHIR', value: totalLast30, color: '#3b82f6', icon: <ExportOutlined style={{ fontSize: 20 }} /> },
        { title: 'BELUM DIBAYAR', value: 0, color: '#f59e0b', icon: <DollarOutlined style={{ fontSize: 20 }} /> },
        { title: 'JATUH TEMPO', value: 0, color: '#ef4444', icon: <StopOutlined style={{ fontSize: 20 }} /> },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={{ fontFamily: "'Poppins', sans-serif" }}>
            <PageHeader
                title="Daftar Pengeluaran"
                description="Kelola dan pantau semua pengeluaran operasional bisnis Anda."
                breadcrumb={[{ label: 'KEUANGAN' }, { label: 'BIAYA' }]}
                extra={
                    <Space size={12}>
                        <Button icon={<PrinterOutlined />} style={{ borderRadius: 10, height: 40, fontWeight: 600, color: '#666' }}>Print</Button>
                        <AccessControl permission="expenses_create">
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => setDrawerOpen(true)}
                                style={{ borderRadius: 12, height: 40, fontWeight: 700, boxShadow: '0 4px 12px rgba(15, 185, 177, 0.2)' }}
                            >
                                Catat Biaya
                            </Button>
                        </AccessControl>
                    </Space>
                }
            />

            <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
                {stats.map((stat, i) => (
                    <Col xs={24} sm={12} lg={6} key={i}>
                        <Card className="premium-card" style={{ borderRadius: 20 }} bodyStyle={{ padding: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 12,
                                    background: `${stat.color}10`, color: stat.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                }}>
                                    {stat.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block' }}>{stat.title}</Text>
                                    <Title level={4} style={{ margin: 0, fontWeight: 800, color: '#333' }}>
                                        Rp{stat.value.toLocaleString('id-ID')}
                                    </Title>
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Card className="premium-card" style={{ borderRadius: 20 }} bodyStyle={{ padding: 0 }}>
                <div style={{ padding: '20px 32px', borderBottom: '1px solid #f8f8f8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <Title level={5} style={{ margin: 0, fontWeight: 700, color: '#333' }}>RIWAYAT TRANSAKSI</Title>
                    <Input
                        prefix={<SearchOutlined style={{ color: '#ccc' }} />}
                        placeholder="Cari biaya..."
                        style={{ width: 260, borderRadius: 12, height: 40, background: '#fcfcfc', border: '1px solid #eee' }}
                    />
                </div>
                <div style={{ padding: '0 8px' }}>
                    <Table
                        columns={columns}
                        dataSource={data}
                        rowKey="id"
                        loading={isLoading}
                        pagination={{ 
                            pageSize: 15, 
                            showSizeChanger: true,
                            position: ['bottomRight'],
                            style: { margin: '24px 16px' }
                        }}
                    />
                </div>
            </Card>

            <ExpenseFormDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        </motion.div>
    );
};

export default ExpensesPage;
