import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, Typography, Card, Tag, Input, message, Tabs, Row, Col, Tooltip, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import {
    PlusOutlined, SearchOutlined, PrinterOutlined,
    CalendarOutlined, EditOutlined,
    DollarOutlined, ClockCircleOutlined, InboxOutlined,
    FilePdfOutlined, MailOutlined, MoreOutlined
} from '@ant-design/icons';
import api from '../../api';
import OrderFormDrawer from './OrderFormDrawer';
import PageHeader from '../../components/PageHeader';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

interface Order {
    id: number;
    order_number: string;
    customer_name: string;
    customer_company_name: string;
    status: string;
    total_amount: number;
    deposit_amount: number;
    balance_due: number;
    order_date: string;
    sales_name: string;
}

const OrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/percetakan/orders', {
                params: {
                    status: activeTab === 'all' ? undefined : activeTab,
                    search
                }
            });
            const payload = res.data?.data?.data || res.data?.data || [];
            setOrders(Array.isArray(payload) ? payload : []);
        } catch {
            message.error('Gagal mengambil data pesanan. Silakan coba kembali.');
        } finally {
            setLoading(false);
        }
    }, [activeTab, search]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleEdit = (id: number) => {
        setEditId(id);
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
        setEditId(null);
    };

    const handlePrintSpk = (id: number) => {
        window.open(`${import.meta.env.VITE_API_URL}/percetakan/orders/${id}/spk`, '_blank');
    };

    const handlePrintInvoice = (id: number) => {
        window.open(`${import.meta.env.VITE_API_URL}/percetakan/orders/${id}/invoice`, '_blank');
    };

    const handleEmailInvoice = async (id: number) => {
        try {
            message.loading({ content: 'Mengirim invoice...', key: 'emailing' });
            await api.post(`/percetakan/orders/${id}/email`);
            message.success({ content: 'Invoice berhasil terkirim.', key: 'emailing' });
        } catch (err: any) {
            message.error({ content: 'Email gagal terkirim.', key: 'emailing' });
        }
    };

    const statusConfig: Record<string, { color: string; bgColor: string; label: string }> = {
        inquiry: { color: '#aaa', bgColor: '#f5f5f5', label: 'INQUIRY' },
        quoted: { color: '#0ea5e9', bgColor: 'rgba(14, 165, 233, 0.1)', label: 'QUOTED' },
        confirmed: { color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)', label: 'CONFIRMED' },
        in_production: { color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.1)', label: 'PRODUKSI' },
        completed: { color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)', label: 'SELESAI' },
        delivered: { color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)', label: 'TERKIRIM' },
        cancelled: { color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)', label: 'BATAL' },
    };

    const columns = [
        {
            title: 'NO. ORDER',
            dataIndex: 'order_number',
            key: 'order_number',
            render: (text: string) => <Text strong style={{ color: '#0fb9b1', fontWeight: 700 }}>#{text}</Text>,
        },
        {
            title: 'PELANGGAN',
            key: 'customer',
            render: (_: unknown, record: Order) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Text strong style={{ color: '#333', fontSize: 13 }}>{record.customer_name}</Text>
                    {record.customer_company_name && <Text style={{ fontSize: 11, color: '#aaa', fontWeight: 500 }}>{record.customer_company_name}</Text>}
                </div>
            ),
        },
        {
            title: 'TGL PESAN',
            dataIndex: 'order_date',
            key: 'order_date',
            render: (date: string) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CalendarOutlined style={{ color: '#aaa', fontSize: 12 }} />
                    <Text style={{ fontSize: 12, color: '#666', fontWeight: 500 }}>{new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</Text>
                </div>
            ),
        },
        {
            title: 'STATUS',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const config = statusConfig[status] || { color: '#aaa', bgColor: '#f5f5f5', label: status.toUpperCase() };
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
            title: 'TOTAL TAGIHAN',
            dataIndex: 'total_amount',
            key: 'amount',
            align: 'right' as const,
            render: (val: number) => <Text strong style={{ color: '#333', fontSize: 14 }}>Rp{Number(val).toLocaleString('id-ID')}</Text>,
        },
        {
            title: 'SISA',
            dataIndex: 'balance_due',
            key: 'balance',
            align: 'right' as const,
            render: (val: number) => {
                const isDebt = Number(val) > 0;
                return (
                    <Text strong style={{ color: isDebt ? '#ef4444' : '#10b981', fontSize: 13 }}>
                        {isDebt ? `Rp${Number(val).toLocaleString('id-ID')}` : 'LUNAS'}
                    </Text>
                );
            },
        },
        {
            title: '',
            key: 'action',
            width: 140,
            align: 'right' as const,
            render: (_: unknown, record: Order) => {
                const menuItems: MenuProps['items'] = [
                    {
                        key: 'edit',
                        label: 'Edit Pesanan',
                        icon: <EditOutlined />,
                        disabled: ['completed', 'delivered'].includes(record.status),
                        onClick: () => handleEdit(record.id)
                    },
                    {
                        key: 'print_spk',
                        label: 'Cetak SPK Produksi',
                        icon: <PrinterOutlined />,
                        onClick: () => handlePrintSpk(record.id)
                    },
                    {
                        key: 'print_invoice',
                        label: 'Cetak Invoice PDF',
                        icon: <FilePdfOutlined />,
                        onClick: () => handlePrintInvoice(record.id)
                    },
                    { type: 'divider' },
                    {
                        key: 'email',
                        label: 'Kirim Email Ke Pelanggan',
                        icon: <MailOutlined />,
                        danger: true,
                        onClick: () => handleEmailInvoice(record.id)
                    },
                ];

                return (
                    <Space>
                        <Tooltip title="Edit">
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                size="small"
                                onClick={(e) => { e.stopPropagation(); handleEdit(record.id); }}
                                disabled={['completed', 'delivered'].includes(record.status)}
                                style={{ color: '#aaa' }}
                            />
                        </Tooltip>
                        <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                            <Button
                                type="text"
                                icon={<MoreOutlined />}
                                style={{ color: '#aaa' }}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </Dropdown>
                    </Space>
                );
            },
        },
    ];

    const stats = [
        { title: 'TOTAL OMZET', value: orders.reduce((s, o) => s + Number(o.total_amount), 0), color: '#0fb9b1', icon: <DollarOutlined /> },
        { title: 'PIUTANG PRODUKSI', value: orders.reduce((s, o) => s + Number(o.balance_due), 0), color: '#f59e0b', icon: <ClockCircleOutlined /> },
        { title: 'PESANAN AKTIF', value: orders.filter(o => !['completed', 'delivered', 'cancelled'].includes(o.status)).length, color: '#8b5cf6', icon: <InboxOutlined />, isCount: true },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={{ fontFamily: "'Poppins', sans-serif" }}>
            <PageHeader
                title="Antrean Pesanan"
                description="Pantau alur produksi percetakan secara real-time."
                breadcrumb={[{ label: 'PERCETAKAN' }, { label: 'PESANAN' }]}
                extra={
                    <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        style={{ borderRadius: 14, height: 44, fontWeight: 700, boxShadow: '0 8px 16px rgba(15, 185, 177, 0.25)' }}
                        onClick={() => setDrawerOpen(true)}
                    >
                        Buat Pesanan Baru
                    </Button>
                }
            />

            <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
                {stats.map((stat, i) => (
                    <Col xs={24} md={8} key={i}>
                        <Card className="premium-card" style={{ borderRadius: 20 }} bodyStyle={{ padding: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: 14,
                                    background: `${stat.color}10`, color: stat.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0
                                }}>
                                    {stat.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block' }}>{stat.title}</Text>
                                    <Title level={4} style={{ margin: 0, fontWeight: 800, color: '#333' }}>
                                        {stat.isCount ? stat.value : `Rp${stat.value.toLocaleString('id-ID')}`}
                                    </Title>
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Card className="premium-card" style={{ borderRadius: 20 }} bodyStyle={{ padding: 0 }}>
                <div style={{ padding: '20px 32px', borderBottom: '1px solid #f8f8f8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        style={{ marginBottom: -20 }}
                        tabBarStyle={{ borderBottom: 'none' }}
                        items={[
                            { key: 'all', label: <span style={{ fontWeight: 600, fontSize: 13 }}>SEMUA</span> },
                            { key: 'inquiry', label: <span style={{ fontWeight: 600, fontSize: 13 }}>INQUIRY</span> },
                            { key: 'in_production', label: <span style={{ fontWeight: 600, fontSize: 13 }}>PRODUKSI</span> },
                            { key: 'completed', label: <span style={{ fontWeight: 600, fontSize: 13 }}>SELESAI</span> },
                        ]}
                    />
                    <Input
                        prefix={<SearchOutlined style={{ color: '#ccc' }} />}
                        placeholder="Cari transaksi..."
                        style={{ width: 260, borderRadius: 12, height: 40, background: '#fcfcfc', border: '1px solid #eee' }}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div style={{ padding: '0 8px' }}>
                    <Table
                        columns={columns}
                        dataSource={orders}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            position: ['bottomRight'],
                            style: { margin: '24px 16px' }
                        }}
                        onRow={(record) => ({
                            onClick: () => handleEdit(record.id),
                            style: { cursor: 'pointer' }
                        })}
                    />
                </div>
            </Card>

            <OrderFormDrawer
                open={drawerOpen}
                editId={editId}
                onClose={handleCloseDrawer}
                onSuccess={fetchOrders}
            />
        </motion.div>
    );
};

export default OrdersPage;
