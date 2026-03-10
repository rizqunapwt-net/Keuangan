import React, { useState } from 'react';
import { Table, Button, Tag, Card, Typography, Row, Col, Space, Input, Popconfirm, message, Select } from 'antd';
import { PlusOutlined, SearchOutlined, ArrowUpOutlined, ArrowDownOutlined, WalletOutlined, DeleteOutlined, HistoryOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import dayjs from 'dayjs';
import CashTransactionDrawer from './CashTransactionDrawer';
import PageHeader from '../../components/PageHeader';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

const CashBookPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedBank, setSelectedBank] = useState<number | null>(null);

    const { data: rawData = [], isLoading } = useQuery({
        queryKey: ['cash-transactions', selectedBank],
        queryFn: async () => {
            const params: any = {};
            if (selectedBank) params.bank_id = selectedBank;
            const res = await api.get('/finance/cash-transactions', { params });
            return res.data?.data || res.data || [];
        },
    });

    const { data: summary } = useQuery({
        queryKey: ['cash-summary'],
        queryFn: async () => {
            const res = await api.get('/finance/cash-summary');
            return res.data;
        },
    });

    const { data: banks = [] } = useQuery({
        queryKey: ['banks'],
        queryFn: async () => {
            const res = await api.get('/finance/banks');
            return res.data?.data?.data || res.data?.data || [];
        },
    });

    const data = Array.isArray(rawData) ? rawData : [];

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            return await api.delete(`/finance/cash-transactions/${id}`);
        },
        onSuccess: () => {
            message.success('Transaksi dihapus!');
            queryClient.invalidateQueries({ queryKey: ['cash-transactions'] });
            queryClient.invalidateQueries({ queryKey: ['cash-summary'] });
            queryClient.invalidateQueries({ queryKey: ['banks'] });
        },
        onError: () => {
            message.error('Gagal menghapus transaksi');
        }
    });

    const filteredData = data.filter((item: any) =>
        (item.description && item.description.toLowerCase().includes(searchText.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(searchText.toLowerCase())) ||
        (item.bank?.name && item.bank.name.toLowerCase().includes(searchText.toLowerCase()))
    );

    const columns = [
        {
            title: 'TANGGAL',
            dataIndex: 'date',
            key: 'date',
            width: 120,
            render: (v: string) => <Text style={{ fontSize: 12, fontWeight: 500, color: '#666' }}>{dayjs(v).format('DD MMM YYYY')}</Text>,
        },
        {
            title: 'AKUN KAS/BANK',
            dataIndex: ['bank', 'name'],
            key: 'bank',
            render: (v: string) => <Text strong style={{ fontSize: 13, color: '#333' }}>{v}</Text>
        },
        {
            title: 'KATEGORI',
            dataIndex: 'category',
            key: 'category',
            render: (v: string) => (
                <Tag bordered={false} style={{ backgroundColor: '#f0fdfa', color: '#0fb9b1', fontWeight: 600, fontSize: 10, borderRadius: 6 }}>
                    {(v || 'UMUM').toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'KETERANGAN',
            dataIndex: 'description',
            key: 'description',
            render: (v: string) => <Text style={{ fontSize: 12, color: '#666' }}>{v || '-'}</Text>
        },
        {
            title: 'PEMASUKAN',
            key: 'income',
            align: 'right' as const,
            render: (_: any, record: any) => record.type === 'income' ? (
                <Text strong style={{ color: '#10b981', fontSize: 13 }}>+ {Number(record.amount).toLocaleString('id-ID')}</Text>
            ) : null
        },
        {
            title: 'PENGELUARAN',
            key: 'expense',
            align: 'right' as const,
            render: (_: any, record: any) => record.type === 'expense' ? (
                <Text strong style={{ color: '#ef4444', fontSize: 13 }}>- {Number(record.amount).toLocaleString('id-ID')}</Text>
            ) : null
        },
        {
            title: 'SALDO',
            dataIndex: 'running_balance',
            key: 'running_balance',
            align: 'right' as const,
            render: (v: number) => <Text strong style={{ fontSize: 13, color: '#333' }}>Rp{Number(v).toLocaleString('id-ID')}</Text>
        },
        {
            title: '',
            key: 'action',
            width: 50,
            render: (_: any, record: any) => (
                <Popconfirm title="Hapus transaksi?" onConfirm={() => deleteMutation.mutate(record.id)} okText="Hapus" cancelText="Batal" okButtonProps={{ danger: true }}>
                    <Button type="text" danger icon={<DeleteOutlined />} size="small" style={{ color: '#aaa' }} />
                </Popconfirm>
            )
        }
    ];

    const summaryCards = [
        { title: 'PEMASUKAN', value: summary?.total_income || 0, icon: <ArrowUpOutlined />, color: '#10b981', bgColor: '#10b98110' },
        { title: 'PENGELUARAN', value: summary?.total_expense || 0, icon: <ArrowDownOutlined />, color: '#ef4444', bgColor: '#ef444410' },
        { title: 'SALDO BERSIH', value: summary?.net_balance || 0, icon: <WalletOutlined />, color: '#3b82f6', bgColor: '#3b82f610' },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={{ fontFamily: "'Poppins', sans-serif" }}>
            <PageHeader
                title="Buku Kas & Bank"
                description="Pantau arus kas masuk dan keluar secara real-time dari semua akun bank Anda."
                breadcrumb={[{ label: 'KEUANGAN' }, { label: 'BUKU KAS' }]}
                extra={
                    <Space size={12}>
                        <Button icon={<HistoryOutlined />} style={{ borderRadius: 10, height: 40, fontWeight: 600 }}>Riwayat</Button>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setDrawerOpen(true)} style={{ borderRadius: 12, height: 40, fontWeight: 700, boxShadow: '0 4px 12px rgba(15, 185, 177, 0.2)' }}>
                            Catat Transaksi
                        </Button>
                    </Space>
                }
            />

            <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
                {summaryCards.map((card, i) => (
                    <Col xs={24} sm={8} key={i}>
                        <Card className="premium-card" style={{ borderRadius: 20 }} bodyStyle={{ padding: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: card.bgColor, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {card.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 10, fontWeight: 700, color: '#aaa', letterSpacing: '0.8px', display: 'block' }}>{card.title}</Text>
                                    <Title level={4} style={{ margin: 0, fontWeight: 800, color: '#333' }}>
                                        Rp{card.value.toLocaleString('id-ID')}
                                    </Title>
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Card className="premium-card" style={{ borderRadius: 20 }} bodyStyle={{ padding: 0 }}>
                <div style={{ padding: '20px 32px', borderBottom: '1px solid #f8f8f8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <Title level={5} style={{ margin: 0, fontWeight: 700, color: '#333' }}>ARUS KAS</Title>
                    <Space size={12} wrap>
                        <Input
                            placeholder="Cari transaksi..."
                            prefix={<SearchOutlined style={{ color: '#ccc' }} />}
                            style={{ width: 240, borderRadius: 12, height: 40, background: '#fcfcfc', border: '1px solid #eee' }}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                        />
                        <Select
                            placeholder="Filter Bank"
                            style={{ width: 200, height: 40 }}
                            allowClear
                            onChange={(v) => setSelectedBank(v)}
                            options={banks.map((b: any) => ({
                                value: b.id,
                                label: b.name
                            }))}
                        />
                    </Space>
                </div>
                <div style={{ padding: '0 8px' }}>
                    <Table
                        columns={columns}
                        dataSource={filteredData}
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

            <CashTransactionDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            />
        </motion.div>
    );
};

export default CashBookPage;
