import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Typography, Card, Breadcrumb, Tag, Input, message, Tabs, Row, Col, Statistic, Popconfirm } from 'antd';
import { PlusOutlined, SearchOutlined, PrinterOutlined, ExportOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import AccessControl from '../../components/AccessControl';

const { Title, Text } = Typography;

interface Contact {
    id: number;
    name: string;
    email: string;
    phone: string;
    address?: string;
    type: 'customer' | 'vendor' | 'employee';
    balance: number;
}

const ContactsPage: React.FC = () => {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const navigate = useNavigate();

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/finance/contacts');
            setContacts(res.data?.data || res.data || []);
        } catch {
            message.error('Gagal mengambil data kontak');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/finance/contacts/${id}`);
            message.success('Kontak berhasil dihapus');
            fetchContacts();
        } catch {
            message.error('Gagal menghapus kontak');
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const filteredContacts = activeTab === 'all' ? contacts : contacts.filter(c => c.type === activeTab);

    // Summary calculations
    const totalOwed = contacts.filter(c => c.type === 'vendor').reduce((s, c) => s + Number(c.balance || 0), 0);
    const totalReceivable = contacts.filter(c => c.type === 'customer').reduce((s, c) => s + Number(c.balance || 0), 0);

    const columns = [
        {
            title: 'Nama',
            dataIndex: 'name',
            key: 'name',
            sorter: true,
            render: (text: string, record: Contact) => (
                <a onClick={() => navigate(`/contacts/${record.id}`)} style={{ fontWeight: 600, color: '#1890ff' }}>
                    {text}
                </a>
            ),
        },
        {
            title: 'Tipe Kontak',
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => {
                const colors: Record<string, string> = { customer: 'blue', vendor: 'orange', employee: 'green' };
                const labels: Record<string, string> = { customer: 'Pelanggan', vendor: 'Vendor', employee: 'Pegawai' };
                return <Tag color={colors[type]}>{labels[type] || type}</Tag>;
            },
        },
        { title: 'Perusahaan', key: 'company', render: () => '-' },
        { title: 'Alamat', dataIndex: 'address', key: 'address', ellipsis: true, render: (v: string) => v || '-' },
        { title: 'Email', dataIndex: 'email', key: 'email', render: (v: string) => v || '-' },
        { title: 'Telepon', dataIndex: 'phone', key: 'phone', render: (v: string) => v || '-' },
        {
            title: 'Anda Hutang',
            key: 'youOwe',
            align: 'right' as const,
            render: (_: unknown, record: Contact) => {
                const val = record.type === 'vendor' ? Number(record.balance || 0) : 0;
                return val > 0 ? <Text type="danger">Rp {val.toLocaleString('id-ID')}</Text> : '-';
            },
        },
        {
            title: 'Mereka Hutang',
            key: 'theyOwe',
            align: 'right' as const,
            render: (_: unknown, record: Contact) => {
                const val = record.type === 'customer' ? Number(record.balance || 0) : 0;
                return val > 0 ? <Text style={{ color: '#52c41a', fontWeight: 600 }}>Rp {val.toLocaleString('id-ID')}</Text> : '-';
            },
        },
        {
            title: 'Aksi',
            key: 'action',
            width: 80,
            align: 'center' as const,
            render: (_: unknown, record: Contact) => (
                <Popconfirm
                    title="Hapus kontak ini?"
                    description="Data yang sudah dihapus tidak dapat dikembalikan."
                    onConfirm={() => handleDelete(record.id)}
                    okText="Hapus"
                    cancelText="Batal"
                    okButtonProps={{ danger: true }}
                >
                    <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                </Popconfirm>
            ),
        },
    ];

    return (
        <div>
            <Breadcrumb className="mb-4" items={[{ title: 'Beranda' }, { title: 'Kontak' }]} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0 }}>Kontak</Title>
                <Space>
                    <Button icon={<PrinterOutlined />} size="small" onClick={() => message.info('Fitur cetak segera hadir')}>Print</Button>
                    <Button icon={<ExportOutlined />} size="small" onClick={() => message.info('Fitur export segera hadir')}>Export</Button>
                    <AccessControl permission="contacts_create">
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/contacts/add')}>
                            Tambah Kontak
                        </Button>
                    </AccessControl>
                </Space>
            </div>

            {/* Summary Cards */}
            <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
                <Col xs={12} sm={8} md={4}>
                    <Card bordered={false} style={{ borderRadius: 8 }} bodyStyle={{ padding: 12 }}>
                        <Statistic
                            title={<Text type="secondary" style={{ fontSize: 11 }}>Anda Hutang</Text>}
                            value={totalOwed}
                            prefix="Rp"
                            valueStyle={{ fontSize: 14, fontWeight: 600, color: '#ff4d4f' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8} md={4}>
                    <Card bordered={false} style={{ borderRadius: 8 }} bodyStyle={{ padding: 12 }}>
                        <Statistic
                            title={<Text type="secondary" style={{ fontSize: 11 }}>Mereka Hutang</Text>}
                            value={totalReceivable}
                            prefix="Rp"
                            valueStyle={{ fontSize: 14, fontWeight: 600, color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8} md={4}>
                    <Card bordered={false} style={{ borderRadius: 8 }} bodyStyle={{ padding: 12 }}>
                        <Statistic
                            title={<Text type="secondary" style={{ fontSize: 11 }}>Pembayaran Diterima</Text>}
                            value={0}
                            prefix="Rp"
                            valueStyle={{ fontSize: 14, fontWeight: 600 }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8} md={4}>
                    <Card bordered={false} style={{ borderRadius: 8 }} bodyStyle={{ padding: 12 }}>
                        <Statistic
                            title={<Text type="secondary" style={{ fontSize: 11 }}>Jatuh Tempo Hutang</Text>}
                            value={0}
                            prefix="Rp"
                            valueStyle={{ fontSize: 14, fontWeight: 600, color: '#ff4d4f' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8} md={4}>
                    <Card bordered={false} style={{ borderRadius: 8 }} bodyStyle={{ padding: 12 }}>
                        <Statistic
                            title={<Text type="secondary" style={{ fontSize: 11 }}>Jatuh Tempo Piutang</Text>}
                            value={0}
                            prefix="Rp"
                            valueStyle={{ fontSize: 14, fontWeight: 600, color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8} md={4}>
                    <Card bordered={false} style={{ borderRadius: 8 }} bodyStyle={{ padding: 12 }}>
                        <Statistic
                            title={<Text type="secondary" style={{ fontSize: 11 }}>Pembayaran Dikirim</Text>}
                            value={0}
                            prefix="Rp"
                            valueStyle={{ fontSize: 14, fontWeight: 600 }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }} bodyStyle={{ padding: 0 }}>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    style={{ padding: '0 16px' }}
                    items={[
                        { key: 'all', label: 'Semua' },
                        { key: 'vendor', label: 'Vendor' },
                        { key: 'employee', label: 'Pegawai' },
                        { key: 'customer', label: 'Pelanggan' },
                        { key: 'investor', label: 'Investor' },
                        { key: 'other', label: 'Lainnya' },
                    ]}
                />

                <div style={{ padding: '0 16px 12px', display: 'flex', gap: 8 }}>
                    <Input prefix={<SearchOutlined />} placeholder="Cari kontak..." style={{ width: 250 }} size="small" />
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredContacts}
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

export default ContactsPage;
