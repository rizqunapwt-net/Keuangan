import React, { useState } from 'react';
import { Table, Button, Tag, Card, Typography, Row, Col, Breadcrumb, Space, Input, message, Tooltip } from 'antd';
import { PlusOutlined, SearchOutlined, FilterOutlined, HistoryOutlined, DollarCircleOutlined, FileSearchOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../../api';
import dayjs from 'dayjs';
import DebtFormDrawer from './DebtFormDrawer';
import DebtPaymentDrawer from './DebtPaymentDrawer';

const { Title, Text } = Typography;

const statusColors: Record<string, string> = {
    unpaid: '#ef4444',
    partial: '#f59e0b',
    paid: '#10b981'
};

const statusLabels: Record<string, string> = {
    unpaid: 'Belum Lunas',
    partial: 'Sebagian',
    paid: 'Lunas'
};

const DebtsPage: React.FC = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
    const [selectedDebt, setSelectedDebt] = useState<any>(null);
    const [editData, setEditData] = useState<any>(null);
    const [searchText, setSearchText] = useState('');

    const { data: rawData = [], isLoading } = useQuery({
        queryKey: ['debts', 'payable'],
        queryFn: async () => {
            const res = await api.get('/finance/debts', { params: { type: 'payable' } });
            return res.data || [];
        },
    });

    const data = Array.isArray(rawData) ? rawData : [];

    // Filter data based on search
    const filteredData = data.filter((item: any) =>
        item.client_name.toLowerCase().includes(searchText.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchText.toLowerCase()))
    );

    // Summary metrics
    const totalDebt = data.reduce((s: number, e: any) => s + Number(e.amount), 0);
    const totalPaid = data.reduce((s: number, e: any) => s + Number(e.paid_amount), 0);
    const remainingDebt = totalDebt - totalPaid;

    const stats = [
        { 
            title: 'Total Utang', 
            value: totalDebt, 
            icon: <FileSearchOutlined />, 
            color: '#1e293b', 
            bg: '#f1f5f9' 
        },
        { 
            title: 'Total Terbayar', 
            value: totalPaid, 
            icon: <DollarCircleOutlined />, 
            color: '#16a34a', 
            bg: '#d1fae5' 
        },
        { 
            title: 'Sisa Utang', 
            value: remainingDebt, 
            icon: <ClockCircleOutlined />, 
            color: '#dc2626', 
            bg: '#fee2e2' 
        },
    ];

    const columns = [
        {
            title: 'Tanggal',
            dataIndex: 'date',
            key: 'date',
            sorter: (a: any, b: any) => dayjs(a.date).unix() - dayjs(b.date).unix(),
            render: (v: string) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ClockCircleOutlined style={{ color: '#94a3b8', fontSize: 12 }} />
                    <Text style={{ fontSize: 13 }}>{dayjs(v).format('DD/MM/YYYY')}</Text>
                </div>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (s: string) => {
                const color = statusColors[s] || '#64748b';
                return (
                    <Tag bordered={false} style={{
                        backgroundColor: `${color}15`,
                        color: color,
                        fontWeight: 600,
                        borderRadius: 6,
                        padding: '2px 10px',
                        fontSize: 12
                    }}>
                        {statusLabels[s] || s}
                    </Tag>
                );
            },
        },
        {
            title: 'Kreditur',
            dataIndex: 'client_name',
            key: 'client_name',
            sorter: (a: any, b: any) => a.client_name.localeCompare(b.client_name),
            render: (v: string, record: any) => (
                <div>
                    <Text strong style={{ color: '#1e293b', fontSize: 14 }}>{v}</Text>
                    {record.client_phone && (
                        <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 2 }}>
                            {record.client_phone}
                        </Text>
                    )}
                </div>
            )
        },
        {
            title: 'Keterangan',
            dataIndex: 'description',
            key: 'description',
            render: (v: string) => (
                <Text type="secondary" style={{ fontSize: 12, maxWidth: 200, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {v || '-'}
                </Text>
            )
        },
        {
            title: 'Jatuh Tempo',
            dataIndex: 'due_date',
            key: 'due_date',
            render: (v: string) => {
                const isOverdue = v && dayjs(v).isBefore(dayjs());
                return v ? (
                    <Tag bordered={false} style={{
                        backgroundColor: isOverdue ? '#fee2e2' : '#f1f5f9',
                        color: isOverdue ? '#ef4444' : '#64748b',
                        fontWeight: 600,
                        borderRadius: 6,
                        padding: '2px 10px',
                        fontSize: 12
                    }}>
                        {dayjs(v).format('DD/MM/YYYY')}
                    </Tag>
                ) : '-';
            }
        },
        {
            title: 'Nominal',
            dataIndex: 'amount',
            key: 'amount',
            align: 'right' as const,
            render: (v: number) => (
                <Text style={{ color: '#64748b', fontSize: 13 }}>
                    Rp {Number(v).toLocaleString('id-ID')}
                </Text>
            ),
        },
        {
            title: 'Terbayar',
            dataIndex: 'paid_amount',
            key: 'paid_amount',
            align: 'right' as const,
            render: (v: number) => (
                <Text style={{ color: '#16a34a', fontWeight: 600, fontSize: 13 }}>
                    Rp {Number(v).toLocaleString('id-ID')}
                </Text>
            ),
        },
        {
            title: 'Sisa',
            key: 'remaining',
            align: 'right' as const,
            render: (_: any, record: any) => {
                const sisa = Number(record.amount) - Number(record.paid_amount);
                return (
                    <Text strong style={{ 
                        color: sisa > 0 ? '#ef4444' : '#16a34a', 
                        fontSize: 14,
                        fontWeight: 700
                    }}>
                        Rp {sisa.toLocaleString('id-ID')}
                    </Text>
                );
            }
        },
        {
            title: 'Aksi',
            key: 'action',
            width: 120,
            align: 'center' as const,
            render: (_: any, record: any) => (
                <Space size="small">
                    <Tooltip title="Cicilan / Bayar">
                        <Button
                            type="text"
                            icon={<DollarCircleOutlined style={{ color: '#16a34a', fontSize: 16 }} />}
                            size="small"
                            style={{ borderRadius: 8 }}
                            onClick={() => {
                                setSelectedDebt(record);
                                setPaymentDrawerOpen(true);
                            }}
                            disabled={record.status === 'paid'}
                        />
                    </Tooltip>
                    <Tooltip title="Riwayat">
                        <Button
                            type="text"
                            icon={<HistoryOutlined style={{ color: '#64748b', fontSize: 14 }} />}
                            size="small"
                            style={{ borderRadius: 8 }}
                            onClick={() => message.info('Fitur riwayat segera hadir')}
                        />
                    </Tooltip>
                    <Button
                        type="link"
                        size="small"
                        style={{ color: '#0fb9b1' }}
                        onClick={() => {
                            setEditData(record);
                            setDrawerOpen(true);
                        }}
                    >
                        Edit
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Breadcrumb 
                className="mb-4" 
                items={[
                    { title: 'Beranda' }, 
                    { title: 'Keuangan' },
                    { title: <span style={{ color: '#0fb9b1' }}>Utang</span> }
                ]} 
            />

            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: 24,
                flexWrap: 'wrap',
                gap: 16
            }}>
                <div>
                    <Title level={2} style={{ 
                        margin: 0, 
                        fontWeight: 800,
                        letterSpacing: '-0.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12
                    }}>
                        <FileSearchOutlined style={{ color: '#f59e0b' }} />
                        <span>Utang Usaha</span>
                    </Title>
                    <Text type="secondary" style={{ fontSize: 14, marginTop: 4, display: 'block' }}>
                        Kelola dan pantau kewajiban utang perusahaan
                    </Text>
                </div>
                <Space size="middle">
                    <Button 
                        icon={<FilterOutlined />} 
                        size="large"
                        className="glass-effect"
                        style={{ borderRadius: 12 }}
                    >
                        Filter
                    </Button>
                    <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setEditData(null);
                            setDrawerOpen(true);
                        }}
                        style={{ borderRadius: 12, height: 44 }}
                    >
                        Utang Baru
                    </Button>
                </Space>
            </div>

            {/* Summary Cards */}
            <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
                {stats.map((stat, i) => (
                    <Col xs={24} sm={8} key={i}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.4 }}
                        >
                            <Card 
                                className="premium-card" 
                                bodyStyle={{ padding: '24px' }}
                                style={{ borderRadius: 20 }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{
                                        width: 52, height: 52, borderRadius: 16,
                                        background: stat.bg, color: stat.color,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 22
                                    }}>
                                        {stat.icon}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <Text type="secondary" style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>
                                            {stat.title}
                                        </Text>
                                        <div style={{ fontSize: 24, fontWeight: 800, color: stat.color, marginTop: 4 }}>
                                            Rp {stat.value.toLocaleString('id-ID')}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </Col>
                ))}
            </Row>

            <Card 
                className="premium-card" 
                bodyStyle={{ padding: 0 }}
                style={{ borderRadius: 24 }}
            >
                {/* Search Bar */}
                <div style={{ 
                    padding: '20px 24px', 
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    gap: 12,
                    alignItems: 'center'
                }}>
                    <Input
                        placeholder="Cari kreditur atau keterangan..."
                        prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                        style={{ 
                            width: 320, 
                            borderRadius: 12, 
                            background: '#f8fafc',
                            border: 'none',
                            height: 44
                        }}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        allowClear
                        size="large"
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{ 
                        pageSize: 15, 
                        showSizeChanger: true,
                        position: ['bottomRight'],
                        style: { paddingRight: 24, paddingBottom: 24 }
                    }}
                    size="middle"
                />
            </Card>

            <DebtFormDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                type="payable"
                initialValues={editData}
            />
            <DebtPaymentDrawer
                open={paymentDrawerOpen}
                onClose={() => setPaymentDrawerOpen(false)}
                debt={selectedDebt}
            />
        </motion.div>
    );
};

export default DebtsPage;
