import React from 'react';
import { Table, Button, Tag, Card, Typography, Space, Breadcrumb, Input, Tabs, message } from 'antd';
import { PlusOutlined, SearchOutlined, FilterOutlined, FileTextOutlined, BookOutlined, PrinterOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const statusLabels: Record<string, { label: string; color: string }> = {
    open: { label: 'Terbuka', color: 'blue' },
    partial: { label: 'Sebagian', color: 'orange' },
    completed: { label: 'Selesai', color: 'green' },
    cancelled: { label: 'Dibatalkan', color: 'red' },
};

const SalesOrdersPage: React.FC = () => {
    const [activeTab, setActiveTab] = React.useState('all');

    const { data = [], isLoading } = useQuery({
        queryKey: ['sales-orders'],
        queryFn: async () => {
            try { const res = await api.get('/finance/sales-orders'); return res.data; }
            catch { return []; }
        },
    });

    const filteredData = activeTab === 'all' ? data : data.filter((i: Record<string, unknown>) => i.status === activeTab);

    const columns = [
        {
            title: 'Nomor', dataIndex: 'refNumber', key: 'refNumber', sorter: true,
            render: (t: string) => <span style={{ fontWeight: 600, color: '#1890ff' }}>{t}</span>
        },
        { title: 'Pelanggan', dataIndex: ['contact', 'name'], key: 'contact', sorter: true },
        { title: 'Tanggal', dataIndex: 'transDate', key: 'transDate', render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
        { title: 'Tgl. Pengiriman', dataIndex: 'dueDate', key: 'dueDate', render: (v: string) => v ? dayjs(v).format('DD/MM/YYYY') : '-' },
        {
            title: 'Status', dataIndex: 'status', key: 'status',
            render: (s: string) => { const st = statusLabels[s] || { label: s, color: 'default' }; return <Tag color={st.color}>{st.label}</Tag>; }
        },
        {
            title: 'Uang Muka', dataIndex: 'dpAmount', key: 'dp', align: 'right' as const,
            render: (v: number) => `Rp ${Number(v || 0).toLocaleString('id-ID')}`
        },
        {
            title: 'Total', dataIndex: 'total', key: 'total', align: 'right' as const, sorter: true,
            render: (v: number) => <Text strong>Rp {Number(v).toLocaleString('id-ID')}</Text>
        },
    ];

    return (
        <div>
            <Breadcrumb className="mb-4" items={[{ title: 'Beranda' }, { title: 'Penjualan' }, { title: 'Pemesanan Penjualan' }]} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0 }}>Pemesanan Penjualan</Title>
                <Space>
                    <Button icon={<FileTextOutlined />} size="small" onClick={() => message.info('Fitur laporan segera hadir')}>Laporan</Button>
                    <Button icon={<BookOutlined />} size="small" onClick={() => message.info('Panduan segera hadir')}>Panduan</Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => message.info('Fitur tambah pemesanan segera hadir')}>Tambah</Button>
                    <Button icon={<PrinterOutlined />} size="small" onClick={() => message.info('Fitur cetak segera hadir')}>Print</Button>
                </Space>
            </div>
            <Card bordered={false} style={{ borderRadius: 8 }} bodyStyle={{ padding: 0 }}>
                <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ padding: '0 16px' }}
                    items={[
                        { key: 'all', label: 'Semua' },
                        { key: 'open', label: 'Terbuka' },
                        { key: 'partial', label: 'Sebagian Terkirim' },
                        { key: 'completed', label: 'Selesai' },
                    ]}
                />
                <div style={{ padding: '0 16px 12px', display: 'flex', gap: 8 }}>
                    <Input placeholder="Cari nomor atau pelanggan..." prefix={<SearchOutlined />} style={{ width: 240 }} size="small" />
                    <Button icon={<FilterOutlined />} size="small">Filter</Button>
                </div>
                <Table columns={columns} dataSource={filteredData} rowKey="id" loading={isLoading}
                    rowSelection={{ type: 'checkbox' }} pagination={{ pageSize: 10 }} size="small" />
            </Card>
        </div>
    );
};

export default SalesOrdersPage;
