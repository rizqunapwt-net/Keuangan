import React, { useEffect, useState, useMemo } from 'react';
import { Table, Tag, Space, Button, Input, DatePicker, Typography, Breadcrumb, Card, Tabs, message, Row, Col } from 'antd';
import {
    SearchOutlined,
    PlusOutlined,
    FilterOutlined,
    PrinterOutlined,
    DollarCircleOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import AccessControl from '../../components/AccessControl';
import InvoiceFormDrawer from './InvoiceFormDrawer';
import InvoicePrintModal from './InvoicePrintModal';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const InvoicesPage: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [printInvoice, setPrintInvoice] = useState<any>(null);
    const navigate = useNavigate();

    // Load company settings from localStorage
    const settings = useMemo(() => {
        try {
            const raw = localStorage.getItem('app_settings');
            return raw ? JSON.parse(raw) : {};
        } catch { return {}; }
    }, []);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const response = await api.get('/finance/invoices', { params: { type: 'sales' } });
            const payload = response.data?.data;
            setData(Array.isArray(payload) ? payload : (Array.isArray(response.data) ? response.data : []));
        } catch (error) {
            console.error('Failed to fetch', error);
            message.error('Gagal mengambil data tagihan');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const filteredData = activeTab === 'all' ? data : data.filter((item: any) => {
        switch (activeTab) {
            case 'unpaid': return item.status === 'unpaid';
            case 'partial': return item.status === 'partial';
            case 'paid': return item.status === 'paid';
            default: return true;
        }
    });

    const stats = useMemo(() => {
        const unpaid = data.filter(i => i.status === 'unpaid' || i.status === 'partial');
        const totalUnpaid = unpaid.reduce((acc, curr) => acc + (Number(curr.total) - Number(curr.paidAmount || 0)), 0);

        const paidThisMonth = data.filter(i => i.status === 'paid');
        const totalPaid = paidThisMonth.reduce((acc, curr) => acc + Number(curr.total), 0);

        return [
            { title: 'TAGIHAN AKTIF', value: totalUnpaid, icon: <ClockCircleOutlined />, color: '#f59e0b', count: unpaid.length },
            { title: 'TOTAL PELUNASAN', value: totalPaid, icon: <CheckCircleOutlined />, color: '#0fb9b1', count: paidThisMonth.length },
            { title: 'PIUTANG LAINNYA', value: 0, icon: <DollarCircleOutlined />, color: '#ef4444', count: 0 },
        ];
    }, [data]);

    const statusLabels: Record<string, { label: string; color: string; bgColor: string }> = {
        paid: { label: 'Lunas', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
        partial: { label: 'Parsial', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
        unpaid: { label: 'Belum Bayar', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
        draft: { label: 'Draft', color: '#aaa', bgColor: '#f5f5f5' },
        void: { label: 'Batal', color: '#ccc', bgColor: '#fafafa' },
    };

    const columns = [
        {
            title: 'NOMOR INVOICE',
            dataIndex: 'refNumber',
            key: 'refNumber',
            render: (text: string, record: any) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Text strong
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/finance/invoices/${record.id}`);
                        }}
                        style={{ color: '#0fb9b1', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                        {text}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#aaa', fontWeight: 500 }}>
                        {record.transDate ? new Date(record.transDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </Text>
                </div>
            ),
        },
        {
            title: 'PELANGGAN',
            dataIndex: ['contact', 'name'],
            key: 'contact',
            render: (name: string) => (
                <Text strong style={{ color: '#333', fontSize: 13 }}>{name || '-'}</Text>
            ),
        },
        {
            title: 'JATUH TEMPO',
            dataIndex: 'dueDate',
            key: 'dueDate',
            render: (date: string) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CalendarOutlined style={{ fontSize: 12, color: '#aaa' }} />
                    <Text style={{ fontSize: 12, color: '#666', fontWeight: 500 }}>
                        {date ? new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}
                    </Text>
                </div>
            ),
        },
        {
            title: 'STATUS',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const s = statusLabels[status] || { label: status, color: '#aaa', bgColor: '#f5f5f5' };
                return (
                    <Tag bordered={false} style={{
                        backgroundColor: s.bgColor,
                        color: s.color,
                        fontWeight: 700,
                        borderRadius: 8,
                        fontSize: 10,
                        padding: '2px 10px',
                        letterSpacing: '0.3px'
                    }}>
                        {s.label.toUpperCase()}
                    </Tag>
                );
            },
        },
        {
            title: 'SISA TAGIHAN',
            key: 'remaining',
            align: 'right' as const,
            render: (_: any, record: any) => {
                const remaining = Number(record.total) - Number(record.paidAmount || 0);
                return (
                    <Text strong style={{ color: remaining > 0 ? '#ef4444' : '#10b981', fontSize: 13 }}>
                        Rp{remaining.toLocaleString('id-ID')}
                    </Text>
                );
            },
        },
        {
            title: 'TOTAL',
            dataIndex: 'total',
            key: 'total',
            align: 'right' as const,
            render: (val: number) => (
                <Text strong style={{ color: '#333', fontSize: 14, fontWeight: 700 }}>
                    Rp{Number(val).toLocaleString('id-ID')}
                </Text>
            ),
        },
        {
            title: '',
            key: 'actions',
            width: 50,
            render: (_: any, record: any) => (
                <Button type="text" icon={<PrinterOutlined />}
                    style={{ borderRadius: 10, color: '#0fb9b1' }}
                    onClick={() => setPrintInvoice(record)}
                    title="Cetak Invoice"
                />
            ),
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontFamily: "'Poppins', sans-serif" }}
        >
            <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Breadcrumb
                        items={[{ title: 'KEUANGAN' }, { title: 'TAGIHAN PENJUALAN' }]}
                        style={{ fontSize: 11, fontWeight: 600, color: '#aaa', marginBottom: 4, letterSpacing: '0.5px' }}
                    />
                    <Title level={3} style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.3px' }}>
                        Daftar Transaksi <span style={{ color: '#0fb9b1' }}>Tagihan</span>
                    </Title>
                </div>
                <Space size="middle">
                    <Button icon={<PrinterOutlined />} style={{ borderRadius: 14, height: 44, fontWeight: 600, color: '#666', background: '#fff', border: '1px solid #eee' }}>Cetak Laporan</Button>
                    <AccessControl permission="invoices_create">
                        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setDrawerOpen(true)} style={{ borderRadius: 14, height: 44, fontWeight: 700, boxShadow: '0 8px 16px rgba(15, 185, 177, 0.25)' }}>
                            Buat Invoice
                        </Button>
                    </AccessControl>
                </Space>
            </div>

            {/* Quick Stats Summary — Fillow Style */}
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
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Title level={4} style={{ margin: 0, fontWeight: 800, color: '#333' }}>Rp{stat.value.toLocaleString('id-ID')}</Title>
                                        <div style={{ background: '#f8f8f8', padding: '2px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, color: '#aaa' }}>
                                            {stat.count} Transaksi
                                        </div>
                                    </div>
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
                            { key: 'unpaid', label: <span style={{ fontWeight: 600, fontSize: 13 }}>BELUM BAYAR</span> },
                            { key: 'partial', label: <span style={{ fontWeight: 600, fontSize: 13 }}>PARSIAL</span> },
                            { key: 'paid', label: <span style={{ fontWeight: 600, fontSize: 13 }}>LUNAS</span> },
                        ]}
                    />
                    <div style={{ display: 'flex', gap: 10 }}>
                        <Input
                            placeholder="Cari transaksi..."
                            prefix={<SearchOutlined style={{ color: '#ccc' }} />}
                            style={{ width: 240, borderRadius: 12, height: 40, background: '#fcfcfc', border: '1px solid #eee' }}
                        />
                        <RangePicker style={{ borderRadius: 12, height: 40, background: '#fcfcfc', border: '1px solid #eee' }} />
                        <Button icon={<FilterOutlined />} style={{ borderRadius: 12, height: 40, fontWeight: 600, color: '#888', background: '#fff', border: '1px solid #eee' }}>Filter</Button>
                    </div>
                </div>

                <div style={{ padding: '0 8px' }}>
                    <Table
                        columns={columns}
                        dataSource={filteredData}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            position: ['bottomRight'],
                            style: { margin: '24px 16px' }
                        }}
                    />
                </div>
            </Card>

            <InvoiceFormDrawer open={drawerOpen} onClose={() => {
                setDrawerOpen(false);
                fetchInvoices();
            }} />

            <InvoicePrintModal
                open={!!printInvoice}
                onClose={() => setPrintInvoice(null)}
                invoice={printInvoice}
                companyName={settings.company_name}
                companyEmail={settings.company_email}
                companyWebsite={settings.company_website}
                companyIG={settings.company_ig}
                companyAddress={settings.company_address}
                companyPhone={settings.company_phone}
                companyLogo={settings.company_logo}
                companySignature={settings.company_signature}
                authorizedName={settings.director_name}
                authorizedTitle={settings.director_title}
                bankName={settings.invoice_bank_name}
                bankAccount={settings.invoice_bank_account}
                bankHolder={settings.invoice_bank_holder}
            />
        </motion.div>
    );
};

export default InvoicesPage;
