import React, { useEffect, useState } from 'react';
import { Table, Tag, Space, Button, Input, DatePicker, Typography, Breadcrumb, Card, Tabs, message } from 'antd';
import { SearchOutlined, PlusOutlined, FilterOutlined, PrinterOutlined, ExportOutlined, FileTextOutlined, BookOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import AccessControl from '../../components/AccessControl';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const InvoicesPage: React.FC = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const navigate = useNavigate();

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const response = await api.get('/finance/invoices', { params: { type: 'sales' } });
            setData(response.data?.data || response.data || []);
        } catch (error) {
            console.error('Failed to fetch', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const filteredData = activeTab === 'all' ? data : data.filter((item: Record<string, unknown>) => {
        switch (activeTab) {
            case 'unpaid': return item.status === 'unpaid';
            case 'partial': return item.status === 'partial';
            case 'paid': return item.status === 'paid';
            default: return true;
        }
    });

    const statusLabels: Record<string, { label: string; color: string }> = {
        paid: { label: 'Lunas', color: 'green' },
        partial: { label: 'Dibayar Sebagian', color: 'orange' },
        unpaid: { label: 'Belum Dibayar', color: 'blue' },
        draft: { label: 'Draft', color: 'default' },
        void: { label: 'Void', color: 'default' },
    };

    const columns = [
        {
            title: 'Nomor',
            dataIndex: 'refNumber',
            key: 'refNumber',
            sorter: true,
            render: (text: string, record: Record<string, unknown>) => (
                <a onClick={() => navigate(`/sales/invoices/${record.id}`)}
                    style={{ fontWeight: 600, color: '#1890ff' }}>
                    {text}
                </a>
            ),
        },
        {
            title: 'Pelanggan',
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
            title: 'Tgl. Jatuh Tempo',
            dataIndex: 'dueDate',
            key: 'dueDate',
            sorter: true,
            render: (date: string) => date ? new Date(date).toLocaleDateString('id-ID') : '-',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            sorter: true,
            render: (status: string) => {
                const s = statusLabels[status] || { label: status, color: 'default' };
                return <Tag color={s.color}>{s.label}</Tag>;
            },
        },
        {
            title: 'Sisa Tagihan',
            key: 'remaining',
            align: 'right' as const,
            sorter: true,
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
            render: (val: number) => `Rp ${Number(val).toLocaleString('id-ID')}`,
        },
    ];

    return (
        <div>
            <Breadcrumb className="mb-4" items={[{ title: 'Beranda' }, { title: 'Penjualan' }, { title: 'Tagihan' }]} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0 }}>Tagihan Penjualan</Title>
                <Space>
                    <Button icon={<FileTextOutlined />} size="small" onClick={() => message.info('Fitur laporan segera hadir')}>Laporan</Button>
                    <Button icon={<BookOutlined />} size="small" onClick={() => message.info('Panduan penggunaan segera hadir')}>Panduan</Button>
                    <AccessControl permission="invoices_create">
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/sales/invoices/add')}>
                            Tambah
                        </Button>
                    </AccessControl>
                    <Button icon={<ExportOutlined />} size="small" onClick={() => message.info('Fitur import segera hadir')}>Import</Button>
                    <Button icon={<PrinterOutlined />} size="small" onClick={() => message.info('Fitur cetak segera hadir')}>Print</Button>
                </Space>
            </div>

            <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }} bodyStyle={{ padding: 0 }}>
                {/* Status Tabs */}
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

                {/* Filter Bar */}
                <div style={{ padding: '0 16px 12px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Input
                        placeholder="Cari nomor atau kontak..."
                        prefix={<SearchOutlined />}
                        style={{ width: 240 }}
                        size="small"
                    />
                    <RangePicker size="small" style={{ width: 240 }} />
                    <Button icon={<FilterOutlined />} size="small">Filter</Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="id"
                    loading={loading}
                    rowSelection={{ type: 'checkbox' }}
                    pagination={{ pageSize: 10, showSizeChanger: true }}
                    size="small"
                />
            </Card>
        </div>
    );
};

export default InvoicesPage;
