import React, { useState, useEffect, useMemo } from 'react';
import {
    Table,
    Tag,
    Card,
    Typography,
    Button,
    Space,
    Tabs,
    Row,
    Col,
    Popconfirm,
    message,
    Input,
    Select,
    Breadcrumb,
} from 'antd';
import {
    ClockCircleOutlined,
    AuditOutlined,
    EditOutlined,
    DeleteOutlined,
    CheckCircleOutlined,
    PlusOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import InvoiceFormDrawer from './InvoiceFormDrawer';
import InvoicePrintModal from './InvoicePrintModal';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;
const { Option } = Select;

// Exactly match PHP formatting: Rp.17,500 (dot after Rp, comma separator)
const fmtPhpRp = (n: number | string | null | undefined): string => {
    if (n === null || n === undefined || isNaN(Number(n))) return 'Rp.0';
    return `Rp.${Number(n).toLocaleString('en-US')}`; 
};

// Exactly match PHP date: 11/02/2026 07:53:00
const fmtPhpDate = (d: string | Date): string => {
    if (!d) return '-';
    const date = new Date(d);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const InvoicesPage: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchCategory, setSearchCategory] = useState('nama');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editInvoice, setEditInvoice] = useState<any>(null);
    const [printModalOpen, setPrintModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('all');
    const { } = useAuth();

    const settings = useMemo(() => {
        const saved = localStorage.getItem('app_settings');
        return saved ? JSON.parse(saved) : null;
    }, []);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const response = await api.get('/finance/invoices', {
                params: { status: activeTab === 'all' ? undefined : activeTab }
            });
            const raw = response.data?.data || [];
            const normalized = raw.map((inv: any) => ({
                ...inv,
                invoice_number: inv.invoice_number || inv.refNumber || inv.number || '-',
                total_amount: Number(inv.total_amount ?? inv.total ?? 0),
                paid_amount: Number(inv.paid_amount ?? inv.paidAmount ?? 0),
                remaining_balance: Number(inv.remaining_balance ?? ((inv.total_amount ?? inv.total ?? 0) - (inv.paid_amount ?? inv.paidAmount ?? 0))),
                date: inv.date || inv.transDate,
            }));
            setData(normalized);
        } catch (error) {
            console.error('Error fetching invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, [activeTab]);

    const handlePrint = (record: any) => {
        setSelectedInvoice(record);
        setPrintModalOpen(true);
    };

    const handleEdit = (record: any) => {
        setEditInvoice(record);
        setDrawerOpen(true);
    };

    const handleCreate = () => {
        setEditInvoice(null);
        setDrawerOpen(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/finance/invoices/${id}`);
            message.success('Invoice berhasil dihapus!');
            fetchInvoices();
        } catch (err: any) {
            message.error(err.response?.data?.message || 'Gagal menghapus invoice');
        }
    };

    const handleTogglePaid = async (id: number) => {
        try {
            const res = await api.patch(`/finance/invoices/${id}/toggle-paid`);
            message.success(res.data?.message || 'Status diperbarui!');
            fetchInvoices();
        } catch (err: any) {
            message.error(err.response?.data?.message || 'Gagal mengubah status');
        }
    };

    const flattenedData = useMemo(() => {
        const rows: any[] = [];
        data.forEach((inv) => {
            const items = inv.items || [];
            if (items.length === 0) {
                rows.push({
                    ...inv,
                    _item_name: inv.description || '-',
                    _item_price: inv.total_amount,
                    _item_qty: 1,
                    _item_discount: 0,
                    _item_total: inv.total_amount,
                });
            } else {
                items.forEach((item: any) => {
                    rows.push({
                        ...inv,
                        _item_name: item.nama_produk,
                        _item_price: Number(item.harga || 0),
                        _item_qty: Number(item.jumlah || 0),
                        _item_discount: Number(item.diskon || 0),
                        _item_total: (Number(item.harga || 0) * Number(item.jumlah || 0)) - Number(item.diskon || 0),
                    });
                });
            }
        });
        return rows;
    }, [data]);

    const filteredData = useMemo(() => {
        if (!searchText) return flattenedData;
        const low = searchText.toLowerCase();
        return flattenedData.filter(row => {
            if (searchCategory === 'nama') return (row.client_name || row.contact?.name)?.toLowerCase().includes(low);
            if (searchCategory === 'kodeinvoice') return row.invoice_number?.toLowerCase().includes(low);
            if (searchCategory === 'tanggal') return String(row.date).toLowerCase().includes(low);
            if (searchCategory === 'statusbayar') return row.status?.toLowerCase().includes(low);
            if (searchCategory === 'nama_produk') return row._item_name?.toLowerCase().includes(low);
            return true;
        });
    }, [flattenedData, searchText, searchCategory]);

    const columns = [
        {
            title: 'No',
            key: 'no',
            width: 40,
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: 'Kode tagihan',
            dataIndex: 'invoice_number',
            key: 'invoice_number',
            render: (text: string, record: any) => (
                <Button 
                    size="small" 
                    type="primary" 
                    style={{ 
                        fontSize: 10, 
                        fontWeight: 700, 
                        borderRadius: 4,
                        background: record.status === 'paid' ? '#28a745' : '#dc3545',
                        border: 'none',
                        minWidth: 80,
                        padding: '0 8px',
                        height: 22
                    }}
                    onClick={() => handlePrint(record)}
                >
                    {text}
                </Button>
            ),
        },
        {
            title: 'Nama user',
            key: 'client_name',
            render: (record: any) => record.contact?.name || record.client_name || 'Umum',
        },
        {
            title: 'Tanggal order',
            dataIndex: 'date',
            key: 'date',
            render: (date: string) => <small style={{ color: '#333' }}>{fmtPhpDate(date)}</small>,
        },
        {
            title: 'Produk',
            dataIndex: '_item_name',
            key: 'produk',
            render: (text: string) => <span style={{ fontSize: 12 }}>{text}</span>
        },
        {
            title: 'harga @',
            dataIndex: '_item_price',
            key: 'price',
            align: 'right' as const,
            render: (v: number) => fmtPhpRp(v),
        },
        {
            title: 'disc',
            dataIndex: '_item_discount',
            key: 'discount',
            align: 'right' as const,
            render: (v: number) => fmtPhpRp(v),
        },
        {
            title: 'Total',
            dataIndex: '_item_total',
            key: 'total',
            align: 'right' as const,
            render: (v: number) => <Text strong>{fmtPhpRp(v)}</Text>,
        },
        {
            title: 'Status bayar',
            dataIndex: 'status',
            key: 'status_text',
            render: (status: string) => status === 'paid' ? 'lunas' : status,
        },
        {
            title: 'status pembayaran',
            key: 'status_label',
            render: (record: any) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Tag 
                        color={record.status === 'paid' ? '#28a745' : '#dc3545'}
                        style={{ borderRadius: 4, fontWeight: 700, fontSize: 10, margin: 0, padding: '0 5px' }}
                    >
                        {record.status === 'paid' ? 'lunas' : record.status}
                    </Tag>
                    <Popconfirm
                        title={record.status === 'paid' ? 'Batal tandai lunas?' : 'Tandai sebagai LUNAS?'}
                        onConfirm={() => handleTogglePaid(record.id)}
                        okText="Ya"
                        cancelText="Batal"
                    >
                        <Button 
                            type="primary" 
                            size="small" 
                            style={{ 
                                padding: '0 4px', 
                                height: 22, 
                                background: '#28a745', 
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <CheckCircleOutlined />
                        </Button>
                    </Popconfirm>
                </div>
            ),
        },
        {
            title: 'aksi',
            key: 'actions',
            align: 'right' as const,
            width: 80,
            render: (_: any, record: any) => (
                <Space size={4}>
                    <Button
                        size="small"
                        style={{ background: '#ffc107', border: 'none', color: '#000', padding: '0 6px' }}
                        icon={<EditOutlined style={{ fontSize: 12 }} />}
                        onClick={() => handleEdit(record)}
                    />
                    <Popconfirm
                        title="Yakin hapus data?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Hapus"
                        cancelText="Batal"
                    >
                        <Button
                            size="small"
                            type="primary"
                            danger
                            icon={<DeleteOutlined style={{ fontSize: 12 }} />}
                            style={{ background: '#dc3545', border: 'none', padding: '0 6px' }}
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const stats = [
        { title: 'Total Omzet', value: data.reduce((sum, i) => sum + (i.total_amount || 0), 0), isCurrency: true, icon: <AuditOutlined />, color: '#28a745' },
        { title: 'Belum Lunas', value: data.filter(i => i.status !== 'paid').length, icon: <ClockCircleOutlined />, color: '#dc3545' },
        { title: 'Total Piutang', value: data.reduce((sum, i) => sum + (i.remaining_balance || 0), 0), isCurrency: true, icon: <AuditOutlined />, color: '#dc3545' },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ marginBottom: 15, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space direction="vertical" size={0}>
                    <Breadcrumb items={[{ title: 'Home' }, { title: 'tagihan' }]} style={{ marginBottom: 4 }} />
                    <Title level={4} style={{ margin: 0, fontWeight: 700 }}>Data Orderan</Title>
                </Space>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={handleCreate} 
                    style={{ background: '#28a745', border: 'none', borderRadius: 4, fontWeight: 600 }}
                >
                    tambah order
                </Button>
            </div>

            <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
                {stats.map((stat, i) => (
                    <Col key={i} xs={24} md={8}>
                        <Card bordered={false} bodyStyle={{ padding: '12px 15px' }} style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 6, background: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase' }}>{stat.title}</Text>
                                    <div style={{ fontSize: 16, fontWeight: 800 }}>
                                        {stat.isCurrency ? fmtPhpRp(stat.value) : stat.value}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Card bordered={false} style={{ borderRadius: 8 }} bodyStyle={{ padding: 0 }}>
                <div style={{ padding: '8px 15px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12, borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', border: '1px solid #d9d9d9', borderRadius: 4, overflow: 'hidden' }}>
                        <Select 
                            value={searchCategory}
                            onChange={setSearchCategory}
                            style={{ width: 150 }}
                            bordered={false}
                            dropdownStyle={{ minWidth: 200 }}
                        >
                            <Option value="nama">nama customer</Option>
                            <Option value="kodeinvoice">kode invoice</Option>
                            <Option value="tanggal">tanggal order</Option>
                            <Option value="statusbayar">status bayar</Option>
                            <Option value="nama_produk">nama produk</Option>
                        </Select>
                        <Input 
                            placeholder="kata kunci pencarian" 
                            style={{ width: 180, borderLeft: '1px solid #d9d9d9' }} 
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onPressEnter={fetchInvoices}
                            bordered={false}
                        />
                        <Button style={{ border: 'none', background: '#f5f5f5' }} onClick={fetchInvoices}>search</Button>
                    </div>
                    
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        size="small"
                        items={[
                            { key: 'all', label: 'SEMUA' },
                            { key: 'unpaid', label: 'BELUM BAYAR' },
                            { key: 'paid', label: 'LUNAS' },
                        ]}
                        style={{ marginBottom: -13 }}
                    />
                </div>

                <div className="table-responsive">
                    <Table
                        columns={columns}
                        dataSource={filteredData}
                        rowKey={(r, i) => `${r.id}-${i}`}
                        loading={loading}
                        size="small"
                        pagination={{ 
                            pageSize: 50, 
                            showSizeChanger: true,
                            showTotal: (total) => `Total ${total} data`
                        }}
                        className="old-style-table"
                        bordered
                    />
                </div>
            </Card>

            <InvoiceFormDrawer
                open={drawerOpen}
                onClose={() => { setDrawerOpen(false); setEditInvoice(null); }}
                onSuccess={() => { setDrawerOpen(false); setEditInvoice(null); fetchInvoices(); }}
                editData={editInvoice}
            />

            <InvoicePrintModal
                open={printModalOpen}
                onClose={() => setPrintModalOpen(false)}
                invoice={selectedInvoice}
                settings={settings}
            />
        </motion.div>
    );
};

export default InvoicesPage;
