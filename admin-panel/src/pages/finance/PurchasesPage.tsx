import React from 'react';
import { Table, Button, Tag, Card, Typography, Space, Breadcrumb, Input, Tabs, message } from 'antd';
import { PlusOutlined, SearchOutlined, PrinterOutlined, ExportOutlined, FilterOutlined, FileTextOutlined, BookOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import AccessControl from '../../components/AccessControl';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const statusLabels: Record<string, { label: string; color: string }> = {
    draft: { label: 'Draft', color: 'default' },
    unpaid: { label: 'Belum Dibayar', color: 'blue' },
    partial: { label: 'Dibayar Sebagian', color: 'orange' },
    paid: { label: 'Lunas', color: 'green' },
    void: { label: 'Void', color: 'red' },
};

const PurchasesPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = React.useState('all');

    const { data = [], isLoading } = useQuery({
        queryKey: ['purchases'],
        queryFn: async () => {
            const res = await api.get('/finance/purchases');
            return res.data?.data || res.data || [];
        },
    });

    const filteredData = activeTab === 'all' ? data : data.filter((item: Record<string, unknown>) => {
        switch (activeTab) {
            case 'unpaid': return item.status === 'unpaid';
            case 'partial': return item.status === 'partial';
            case 'paid': return item.status === 'paid';
            default: return true;
        }
    });

    const columns = [
        {
            title: 'Nomor',
            dataIndex: 'refNumber',
            key: 'refNumber',
            sorter: true,
            render: (text: string) => (
                <span style={{ fontWeight: 600, color: '#1890ff' }}>{text}</span>
            ),
        },
        {
            title: 'Supplier',
            dataIndex: ['contact', 'name'],
            key: 'contact',
            sorter: true,
        },
        {
            title: 'Referensi',
            dataIndex: 'notes',
            key: 'reference',
            render: (v: string) => v || '-',
        },
        {
            title: 'Tanggal',
            dataIndex: 'transDate',
            key: 'transDate',
            sorter: true,
            render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
        },
        {
            title: 'Tgl. Jatuh Tempo',
            dataIndex: 'dueDate',
            key: 'dueDate',
            sorter: true,
            render: (v: string) => v ? dayjs(v).format('DD/MM/YYYY') : '-',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const s = statusLabels[status] || { label: status, color: 'default' };
                return <Tag color={s.color}>{s.label}</Tag>;
            },
        },
        {
            title: 'Sisa Tagihan',
            key: 'remaining',
            align: 'right' as const,
            render: (_: unknown, record: Record<string, unknown>) => {
                const remaining = Number(record.total) - Number(record.paidAmount || 0);
                return <Text strong>Rp {remaining.toLocaleString('id-ID')}</Text>;
            },
        },
        {
            title: 'Total',
            dataIndex: 'total',
            key: 'total',
            align: 'right' as const,
            sorter: true,
            render: (v: number) => `Rp ${Number(v).toLocaleString('id-ID')}`,
        },
    ];

    return (
        <div>
            <Breadcrumb className="mb-4" items={[{ title: 'Beranda' }, { title: 'Pembelian' }, { title: 'Tagihan Pembelian' }]} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0 }}>Tagihan Pembelian</Title>
                <Space>
                    <Button icon={<FileTextOutlined />} size="small" onClick={() => message.info('Fitur laporan segera hadir')}>Laporan</Button>
                    <Button icon={<BookOutlined />} size="small" onClick={() => message.info('Panduan penggunaan segera hadir')}>Panduan</Button>
                    <AccessControl permission="purchases_create">
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/purchases/add')}>
                            Tambah
                        </Button>
                    </AccessControl>
                    <Button icon={<ExportOutlined />} size="small" onClick={() => message.info('Fitur import segera hadir')}>Import</Button>
                    <Button icon={<PrinterOutlined />} size="small" onClick={() => message.info('Fitur cetak segera hadir')}>Print</Button>
                </Space>
            </div>

            <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }} bodyStyle={{ padding: 0 }}>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    style={{ padding: '0 16px' }}
                    items={[
                        { key: 'all', label: 'Semua' },
                        { key: 'unpaid', label: 'Belum Dibayar' },
                        { key: 'partial', label: 'Dibayar Sebagian' },
                        { key: 'paid', label: 'Lunas' },
                        { key: 'other', label: 'Lainnya ▾' },
                    ]}
                />

                <div style={{ padding: '0 16px 12px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Input
                        placeholder="Cari nomor atau supplier..."
                        prefix={<SearchOutlined />}
                        style={{ width: 240 }}
                        size="small"
                    />
                    <Button icon={<FilterOutlined />} size="small">Filter</Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="id"
                    loading={isLoading}
                    rowSelection={{ type: 'checkbox' }}
                    pagination={{ pageSize: 10, showSizeChanger: true }}
                    size="small"
                />
            </Card>
        </div>
    );
};

export default PurchasesPage;
