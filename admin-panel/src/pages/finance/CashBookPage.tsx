import React, { useState } from 'react';
import { Table, Button, Tag, Card, Typography, Row, Col, Statistic, Breadcrumb, Space, Input, Popconfirm, message, Select } from 'antd';
import { PlusOutlined, SearchOutlined, FilterOutlined, DollarOutlined, ArrowUpOutlined, ArrowDownOutlined, WalletOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import dayjs from 'dayjs';
import CashTransactionDrawer from './CashTransactionDrawer';

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
            // API returns array directly in V1 implementation, or wrapped in success:true
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
            // Backend outputs: { success: true, data: { data: [...] } }
            return res.data?.data?.data || res.data?.data || [];
        },
    });

    const data = Array.isArray(rawData) ? rawData : [];

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            return await api.delete(`/finance/cash-transactions/${id}`);
        },
        onSuccess: () => {
            message.success('Transaksi dihapus dan saldo bank diperbarui');
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
            title: 'Tanggal',
            dataIndex: 'date',
            key: 'date',
            width: 120,
            render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
        },
        {
            title: 'Akun Kas/Bank',
            dataIndex: ['bank', 'name'],
            key: 'bank',
        },
        {
            title: 'Kategori',
            dataIndex: 'category',
            key: 'category',
            render: (v: string) => <Tag color="blue">{v || 'Umum'}</Tag>
        },
        {
            title: 'Keterangan',
            dataIndex: 'description',
            key: 'description',
            render: (v: string) => <Text style={{ fontSize: 13 }}>{v || '-'}</Text>
        },
        {
            title: 'Pemasukan',
            key: 'income',
            align: 'right' as const,
            render: (_: any, record: any) => record.type === 'income' ? (
                <Text type="success" strong>+ {Number(record.amount).toLocaleString('id-ID')}</Text>
            ) : null
        },
        {
            title: 'Pengeluaran',
            key: 'expense',
            align: 'right' as const,
            render: (_: any, record: any) => record.type === 'expense' ? (
                <Text type="danger" strong>- {Number(record.amount).toLocaleString('id-ID')}</Text>
            ) : null
        },
        {
            title: 'Saldo Berjalan',
            dataIndex: 'running_balance',
            key: 'running_balance',
            align: 'right' as const,
            render: (v: number) => <Text type="secondary">Rp {Number(v).toLocaleString('id-ID')}</Text>
        },
        {
            title: '',
            key: 'action',
            width: 50,
            render: (_: any, record: any) => (
                <Popconfirm
                    title="Hapus transaksi?"
                    description="Saldo bank akan dikembalikan."
                    onConfirm={() => deleteMutation.mutate(record.id)}
                    okText="Hapus"
                    cancelText="Batal"
                    okButtonProps={{ danger: true }}
                >
                    <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                </Popconfirm>
            )
        }
    ];

    return (
        <div>
            <Breadcrumb className="mb-4" items={[{ title: 'Beranda' }, { title: 'Keuangan' }, { title: 'Buku Kas' }]} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0 }}>Buku Kas (Arus Kas)</Title>
                <Space>
                    <Button icon={<HistoryOutlined />} size="small" onClick={() => message.info('Segera hadir')}>Riwayat Saldo</Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setDrawerOpen(true)}>
                        Catat Transaksi
                    </Button>
                </Space>
            </div>

            {/* Summary Header */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ borderRadius: 8, background: '#fff' }} bodyStyle={{ padding: 16 }}>
                        <Statistic
                            title={<Text type="secondary" style={{ fontSize: 12 }}>Total Pemasukan</Text>}
                            value={summary?.total_income || 0}
                            prefix={<ArrowUpOutlined style={{ color: '#52c41a' }} />}
                            valueStyle={{ fontSize: 20, fontWeight: 700, color: '#16a34a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ borderRadius: 8, background: '#fff' }} bodyStyle={{ padding: 16 }}>
                        <Statistic
                            title={<Text type="secondary" style={{ fontSize: 12 }}>Total Pengeluaran</Text>}
                            value={summary?.total_expense || 0}
                            prefix={<ArrowDownOutlined style={{ color: '#ff4d4f' }} />}
                            valueStyle={{ fontSize: 20, fontWeight: 700, color: '#dc2626' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ borderRadius: 8, background: '#fff' }} bodyStyle={{ padding: 16 }}>
                        <Statistic
                            title={<Text type="secondary" style={{ fontSize: 12 }}>Saldo Bersih (Semua Kas/Bank)</Text>}
                            value={summary?.net_balance || 0}
                            prefix={<WalletOutlined style={{ color: '#0ea5e9' }} />}
                            valueStyle={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }} bodyStyle={{ padding: 0 }}>
                {/* Filter Bar */}
                <div style={{ padding: '12px 16px', display: 'flex', gap: 12, flexWrap: 'wrap', borderBottom: '1px solid #f1f5f9' }}>
                    <Input
                        placeholder="Cari transaksi..."
                        prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                        style={{ width: 260 }}
                        size="small"
                        onChange={(e) => setSearchText(e.target.value)}
                        allowClear
                    />
                    <Select
                        placeholder="Pilih Akun Kas/Bank"
                        style={{ width: 220 }}
                        size="small"
                        allowClear
                        onChange={(v) => setSelectedBank(v)}
                        options={banks.map((b: any) => ({
                            value: b.id,
                            label: b.name
                        }))}
                    />
                    <Button icon={<FilterOutlined />} size="small">Range Tanggal</Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{ pageSize: 15, showSizeChanger: true }}
                    size="small"
                />
            </Card>

            <CashTransactionDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            />
        </div>
    );
};

// Mock HistoryOutlined since it might not be in the environment's icons
const HistoryOutlined = () => <HistoryOutlinedOriginal />;
import { HistoryOutlined as HistoryOutlinedOriginal } from '@ant-design/icons';

export default CashBookPage;
