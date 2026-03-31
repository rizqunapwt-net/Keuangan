import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Typography, Card, Tag, Input, message, Tabs, Row, Col, Popconfirm } from 'antd';
import { PlusOutlined, SearchOutlined, PrinterOutlined, ExportOutlined, DeleteOutlined, ContactsOutlined, TeamOutlined, ShopOutlined } from '@ant-design/icons';
import api from '../../api';
import AccessControl from '../../components/AccessControl';
import ContactFormDrawer from './ContactFormDrawer';
import PageHeader from '../../components/PageHeader';
import { motion } from 'framer-motion';
import { fmtRp } from '../../utils/formatters';

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
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [searchText, setSearchText] = useState('');

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/finance/contacts');
            const payload = res.data?.data;
            setContacts(Array.isArray(payload) ? payload : (Array.isArray(res.data) ? res.data : []));
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

    const filteredContacts = (activeTab === 'all' ? contacts : contacts.filter(c => c.type === activeTab))
        .filter(c => !searchText || c.name.toLowerCase().includes(searchText.toLowerCase()) || c.email?.toLowerCase().includes(searchText.toLowerCase()) || c.phone?.includes(searchText));

    // Summary calculations
    const totalOwed = contacts.filter(c => c.type === 'vendor').reduce((s, c) => s + Number(c.balance || 0), 0);
    const totalReceivable = contacts.filter(c => c.type === 'customer').reduce((s, c) => s + Number(c.balance || 0), 0);

    const stats = [
        { title: 'TOTAL KONTAK', value: contacts.length, isCount: true, icon: <ContactsOutlined style={{ fontSize: 20 }} />, color: '#3b82f6', bg: '#3b82f610' },
        { title: 'PELANGGAN', value: contacts.filter(c => c.type === 'customer').length, isCount: true, icon: <TeamOutlined style={{ fontSize: 20 }} />, color: '#0fb9b1', bg: '#0fb9b110' },
        { title: 'VENDOR', value: contacts.filter(c => c.type === 'vendor').length, isCount: true, icon: <ShopOutlined style={{ fontSize: 20 }} />, color: '#f59e0b', bg: '#f59e0b10' },
        { title: 'ANDA HUTANG', value: totalOwed, isCount: false, icon: <ExportOutlined style={{ fontSize: 20 }} />, color: '#ef4444', bg: '#ef444410' },
        { title: 'MEREKA HUTANG', value: totalReceivable, isCount: false, icon: <ExportOutlined style={{ fontSize: 20, transform: 'scaleX(-1)' }} />, color: '#10b981', bg: '#10b98110' },
    ];

    const columns = [
        {
            title: 'Nama',
            dataIndex: 'name',
            key: 'name',
            sorter: true,
            render: (text: string) => (
                <Text strong style={{ color: '#1e293b', fontSize: 14 }}>{text}</Text>
            ),
        },
        {
            title: 'Tipe Kontak',
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => {
                const config: Record<string, { color: string; bg: string; label: string }> = {
                    customer: { color: '#3b82f6', bg: '#3b82f615', label: 'Pelanggan' },
                    vendor: { color: '#f59e0b', bg: '#f59e0b15', label: 'Vendor' },
                    employee: { color: '#10b981', bg: '#10b98115', label: 'Pegawai' },
                };
                const c = config[type] || { color: '#64748b', bg: '#64748b15', label: type };
                return (
                    <Tag bordered={false} style={{
                        backgroundColor: c.bg,
                        color: c.color,
                        fontWeight: 600,
                        borderRadius: 6,
                        padding: '2px 10px',
                        fontSize: 12
                    }}>
                        {c.label}
                    </Tag>
                );
            },
        },
        {
            title: 'Alamat',
            dataIndex: 'address',
            key: 'address',
            ellipsis: true,
            render: (v: string) => <Text type="secondary" style={{ fontSize: 12 }}>{v || '-'}</Text>
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (v: string) => <Text style={{ fontSize: 13 }}>{v || '-'}</Text>
        },
        {
            title: 'Telepon',
            dataIndex: 'phone',
            key: 'phone',
            render: (v: string) => <Text style={{ fontSize: 13 }}>{v || '-'}</Text>
        },
        {
            title: 'Anda Hutang',
            key: 'youOwe',
            align: 'right' as const,
            render: (_: unknown, record: Contact) => {
                const val = record.type === 'vendor' ? Number(record.balance || 0) : 0;
                return val > 0 ? (
                    <Text style={{ color: '#ef4444', fontWeight: 600, fontSize: 13 }}>Rp {val.toLocaleString('id-ID')}</Text>
                ) : <Text type="secondary">-</Text>;
            },
        },
        {
            title: 'Mereka Hutang',
            key: 'theyOwe',
            align: 'right' as const,
            render: (_: unknown, record: Contact) => {
                const val = record.type === 'customer' ? Number(record.balance || 0) : 0;
                return val > 0 ? (
                    <Text style={{ color: '#16a34a', fontWeight: 600, fontSize: 13 }}>Rp {val.toLocaleString('id-ID')}</Text>
                ) : <Text type="secondary">-</Text>;
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
                    <Button type="text" danger icon={<DeleteOutlined />} size="small" style={{ borderRadius: 8 }} />
                </Popconfirm>
            ),
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ fontFamily: "'Poppins', sans-serif" }}
        >
            <PageHeader
                title="Kontak"
                description="Kelola data pelanggan, vendor, dan pegawai perusahaan Anda."
                breadcrumb={[{ label: 'KEUANGAN' }, { label: 'KONTAK' }]}
                extra={
                    <Space size={12}>
                        <Button
                            icon={<PrinterOutlined />}
                            onClick={() => message.info('Fitur cetak segera hadir')}
                            style={{ borderRadius: 10, height: 40, fontWeight: 600, color: '#666' }}
                        >
                            Print
                        </Button>
                        <AccessControl permission="contacts_create">
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => setDrawerOpen(true)}
                                style={{ borderRadius: 12, height: 40, fontWeight: 700, boxShadow: '0 4px 12px rgba(15, 185, 177, 0.2)' }}
                            >
                                Tambah Kontak
                            </Button>
                        </AccessControl>
                    </Space>
                }
            />

            {/* Summary Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
                {stats.map((stat, i) => (
                    <Col xs={12} sm={8} lg={Math.floor(24 / stats.length)} key={i}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05, duration: 0.4 }}
                        >
                            <Card className="premium-card" style={{ borderRadius: 20 }} bodyStyle={{ padding: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <div style={{
                                        width: 44, height: 44, borderRadius: 12,
                                        background: stat.bg, color: stat.color,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                    }}>
                                        {stat.icon}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block' }}>
                                            {stat.title}
                                        </Text>
                                        <Title level={4} style={{ margin: 0, fontWeight: 800, color: stat.color, marginTop: 2 }}>
                                            {stat.isCount ? stat.value : fmtRp(stat.value)}
                                        </Title>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </Col>
                ))}
            </Row>

            <Card className="premium-card" style={{ borderRadius: 24 }} bodyStyle={{ padding: 0 }}>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    style={{ padding: '0 24px' }}
                    items={[
                        { key: 'all', label: 'Semua' },
                        { key: 'vendor', label: 'Vendor' },
                        { key: 'employee', label: 'Pegawai' },
                        { key: 'customer', label: 'Pelanggan' },
                        { key: 'investor', label: 'Investor' },
                        { key: 'other', label: 'Lainnya' },
                    ]}
                />

                <div style={{ padding: '0 24px 16px', display: 'flex', gap: 8 }}>
                    <Input
                        prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                        placeholder="Cari kontak..."
                        style={{
                            width: 320,
                            borderRadius: 12,
                            background: '#f8fafc',
                            border: 'none',
                            height: 40
                        }}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        allowClear
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredContacts}
                    rowKey="id"
                    loading={loading}
                    rowSelection={{ type: 'checkbox' }}
                    pagination={{
                        pageSize: 15,
                        showSizeChanger: true,
                        position: ['bottomRight'],
                        style: { paddingRight: 24, paddingBottom: 24 }
                    }}
                    size="middle"
                />
            </Card>
            <ContactFormDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        </motion.div>
    );
};

export default ContactsPage;
