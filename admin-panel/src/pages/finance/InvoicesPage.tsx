import React, { useEffect, useState, useMemo } from 'react';
import { Table, Tag, Space, Button, Input, DatePicker, Typography, Breadcrumb, Card, Tabs, message, Row, Col, Badge } from 'antd';
import {
    SearchOutlined,
    PlusOutlined,
    FilterOutlined,
    PrinterOutlined,
    DollarCircleOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    MoreOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import AccessControl from '../../components/AccessControl';
import InvoiceFormDrawer from './InvoiceFormDrawer';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const InvoicesPage: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const navigate = useNavigate();

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const response = await api.get('/finance/invoices', { params: { type: 'sales' } });
            const payload = response.data?.data;
            setData(Array.isArray(payload) ? payload : (Array.isArray(response.data) ? response.data : []));
        } catch (error) {
            console.error('Failed to fetch', error);
            message.error('Gagal mengambil data tagihan');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const filteredData = activeTab === 'all' ? data : data.filter((item: any) => {
        switch (activeTab) {
            case 'unpaid': return item.status === 'unpaid';
            case 'partial': return item.status === 'partial';
            case 'paid': return item.status === 'paid';
            default: return true;
        }
    });

    const stats = useMemo(() => {
        const unpaid = data.filter(i => i.status === 'unpaid' || i.status === 'partial');
        const totalUnpaid = unpaid.reduce((acc, curr) => acc + (Number(curr.total) - Number(curr.paidAmount || 0)), 0);

        const paidThisMonth = data.filter(i => i.status === 'paid');
        const totalPaid = paidThisMonth.reduce((acc, curr) => acc + Number(curr.total), 0);

        return [
            { title: 'Total Tagihan Aktif', value: totalUnpaid, icon: <ClockCircleOutlined />, color: '#f59e0b', count: unpaid.length },
            { title: 'Total Pelunasan', value: totalPaid, icon: <CheckCircleOutlined />, color: '#0fb9b1', count: paidThisMonth.length },
            { title: 'Piutang Macet', value: 0, icon: <DollarCircleOutlined />, color: '#ef4444', count: 0 },
        ];
    }, [data]);

    const statusLabels: Record<string, { label: string; color: string; bgColor: string }> = {
        paid: { label: 'Lunas', color: '#0fb9b1', bgColor: '#e6fffb' },
        partial: { label: 'Parsial', color: '#f59e0b', bgColor: '#fffbe6' },
        unpaid: { label: 'Belum Bayar', color: '#ef4444', bgColor: '#fff1f0' },
        draft: { label: 'Draft', color: '#64748b', bgColor: '#f1f5f9' },
        void: { label: 'Batal', color: '#94a3b8', bgColor: '#f8fafc' },
    };

    const columns = [
        {
            title: 'NOMOR INVOICE',
            dataIndex: 'refNumber',
            key: 'refNumber',
            render: (text: string, record: any) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Text strong
                        onClick={() => navigate(`/finance/invoices/${record.id}`)}
                        style={{ color: '#0fb9b1', cursor: 'pointer', fontSize: 14 }}>
                        {text}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                        Tgl: {record.transDate ? new Date(record.transDate).toLocaleDateString('id-ID') : '-'}
                    </Text>
                </div>
            ),
        },
        {
            title: 'PELANGGAN',
            dataIndex: ['contact', 'name'],
            key: 'contact',
            render: (name: string) => (
                <Text strong style={{ color: '#1e293b' }}>{name || '-'}</Text>
            ),
        },
        {
            title: 'JATUH TEMPO',
            dataIndex: 'dueDate',
            key: 'dueDate',
            render: (date: string) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ClockCircleOutlined style={{ fontSize: 12, color: '#94a3b8' }} />
                    <Text style={{ fontSize: 13, color: '#64748b' }}>
                        {date ? new Date(date).toLocaleDateString('id-ID') : '-'}
                    </Text>
                </div>
            ),
        },
        {
            title: 'STATUS',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const s = statusLabels[status] || { label: status, color: '#64748b', bgColor: '#f1f5f9' };
                return (
                    <Tag bordered={false} style={{
                        backgroundColor: s.bgColor,
                        color: s.color,
                        fontWeight: 700,
                        borderRadius: 6,
                        padding: '2px 10px'
                    }}>
                        {s.label.toUpperCase()}
                    </Tag>
                );
            },
        },
        {
            title: 'SISA TAGIHAN',
            key: 'remaining',
            align: 'right' as const,
            render: (_: any, record: any) => {
                const remaining = Number(record.total) - Number(record.paidAmount || 0);
                return (
                    <Text strong style={{ color: remaining > 0 ? '#ef4444' : '#0fb9b1' }}>
                        Rp{remaining.toLocaleString('id-ID')}
                    </Text>
                );
            },
        },
        {
            title: 'TOTAL',
            dataIndex: 'total',
            key: 'total',
            align: 'right' as const,
            render: (val: number) => (
                <Text strong style={{ color: '#0f172a', fontSize: 15 }}>
                    Rp{Number(val).toLocaleString('id-ID')}
                </Text>
            ),
        },
        {
            title: '',
            key: 'actions',
            width: 50,
            render: () => <Button type="text" icon={<MoreOutlined />} style={{ borderRadius: 8 }} />
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <Breadcrumb
                        items={[{ title: 'Beranda' }, { title: 'Keuangan' }, { title: 'Tagihan Penjualan' }]}
                        style={{ marginBottom: 8 }}
                    />
                    <Title level={2} style={{ margin: 0, fontWeight: 800, letterSpacing: '-0.5px' }}>
                        Daftar <span style={{ color: '#0fb9b1' }}>Tagihan</span>
                    </Title>
                </div>
                <Space size="middle">
                    <Button icon={<PrinterOutlined />} className="glass-effect" style={{ borderRadius: 12 }}>Print</Button>
                    <AccessControl permission="invoices_create">
                        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setDrawerOpen(true)}>
                            Tambah Invoice
                        </Button>
                    </AccessControl>
                </Space>
            </div>

            {/* Quick Stats Summary */}
            <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
                {stats.map((stat, i) => (
                    <Col xs={24} md={8} key={i}>
                        <Card className="premium-card" bodyStyle={{ padding: '20px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: 14,
                                    background: `${stat.color}15`, color: stat.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
                                }}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>{stat.title}</Text>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                                        <Title level={3} style={{ margin: 0, fontWeight: 800 }}>Rp{stat.value.toLocaleString('id-ID')}</Title>
                                        <Badge count={stat.count} style={{ backgroundColor: '#f1f5f9', color: '#64748b', boxShadow: 'none' }} />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Card className="premium-card" bodyStyle={{ padding: 0 }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        style={{ marginBottom: -20 }}
                        items={[
                            { key: 'all', label: 'Semua Transaksi' },
                            { key: 'unpaid', label: 'Belum Bayar' },
                            { key: 'partial', label: 'Parsial' },
                            { key: 'paid', label: 'Lunas' },
                        ]}
                    />
                    <div style={{ display: 'flex', gap: 12 }}>
                        <Input
                            placeholder="Cari invoice atau kontak..."
                            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                            style={{ width: 280, borderRadius: 12, background: '#f8fafc', border: 'none' }}
                        />
                        <RangePicker style={{ borderRadius: 12, background: '#f8fafc', border: 'none' }} />
                        <Button icon={<FilterOutlined />} className="glass-effect" style={{ borderRadius: 12 }}>Filter</Button>
                    </div>
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        position: ['bottomRight'],
                        style: { paddingRight: 24 }
                    }}
                    onRow={(record) => ({
                        onClick: () => navigate(`/sales/invoices/${record.id}`),
                        style: { cursor: 'pointer' }
                    })}
                />
            </Card>

            <InvoiceFormDrawer open={drawerOpen} onClose={() => {
                setDrawerOpen(false);
                fetchInvoices();
            }} />
        </motion.div>
    );
};

export default InvoicesPage;
