import React from 'react';
import { Table, Button, Tag, Card, Typography, Space, Breadcrumb, Input, Tabs, message } from 'antd';
import { PlusOutlined, SearchOutlined, FilterOutlined, FileTextOutlined, PrinterOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const statusLabels: Record<string, { label: string; color: string }> = {
    draft: { label: 'Draft', color: 'default' },
    sent: { label: 'Terkirim', color: 'blue' },
    accepted: { label: 'Diterima', color: 'green' },
    declined: { label: 'Ditolak', color: 'red' },
    expired: { label: 'Kedaluwarsa', color: 'orange' },
};

const PurchaseQuotesPage: React.FC = () => {
    const [activeTab, setActiveTab] = React.useState('all');

    const { data = [], isLoading } = useQuery({
        queryKey: ['purchase-quotes'],
        queryFn: async () => {
            try { const res = await api.get('/finance/purchase-quotes'); return res.data; }
            catch { return []; }
        },
    });

    const filteredData = activeTab === 'all' ? data : data.filter((i: Record<string, unknown>) => i.status === activeTab);

    const columns = [
        {
            title: 'Nomor', dataIndex: 'refNumber', key: 'refNumber', sorter: true,
            render: (t: string) => <a style={{ fontWeight: 600, color: '#1890ff' }}>{t}</a>
        },
        { title: 'Vendor', dataIndex: ['contact', 'name'], key: 'contact', sorter: true },
        { title: 'Tanggal', dataIndex: 'transDate', key: 'transDate', render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
        { title: 'Berlaku Hingga', dataIndex: 'expiryDate', key: 'expiryDate', render: (v: string) => v ? dayjs(v).format('DD/MM/YYYY') : '-' },
        {
            title: 'Status', dataIndex: 'status', key: 'status',
            render: (s: string) => { const st = statusLabels[s] || { label: s, color: 'default' }; return <Tag color={st.color}>{st.label}</Tag>; }
        },
        {
            title: 'Total', dataIndex: 'total', key: 'total', align: 'right' as const,
            render: (v: number) => <Text strong>Rp {Number(v).toLocaleString('id-ID')}</Text>
        },
    ];

    return (
        <div>
            <Breadcrumb className="mb-4" items={[{ title: 'Beranda' }, { title: 'Pembelian' }, { title: 'Penawaran Pembelian' }]} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0 }}>Penawaran Pembelian</Title>
                <Space>
                    <Button icon={<FileTextOutlined />} size="small" onClick={() => message.info('Fitur laporan segera hadir')}>Laporan</Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => message.info('Fitur tambah penawaran segera hadir')}>Tambah</Button>
                    <Button icon={<PrinterOutlined />} size="small" onClick={() => message.info('Fitur cetak segera hadir')}>Print</Button>
                </Space>
            </div>
            <Card bordered={false} style={{ borderRadius: 8 }} bodyStyle={{ padding: 0 }}>
                <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ padding: '0 16px' }}
                    items={[
                        { key: 'all', label: 'Semua' },
                        { key: 'draft', label: 'Draft' },
                        { key: 'sent', label: 'Terkirim' },
                        { key: 'accepted', label: 'Diterima' },
                    ]}
                />
                <div style={{ padding: '0 16px 12px', display: 'flex', gap: 8 }}>
                    <Input placeholder="Cari..." prefix={<SearchOutlined />} style={{ width: 240 }} size="small" />
                    <Button icon={<FilterOutlined />} size="small">Filter</Button>
                </div>
                <Table columns={columns} dataSource={filteredData} rowKey="id" loading={isLoading}
                    rowSelection={{ type: 'checkbox' }} pagination={{ pageSize: 10 }} size="small" />
            </Card>
        </div>
    );
};

export default PurchaseQuotesPage;
