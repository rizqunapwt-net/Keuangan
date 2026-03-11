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
    Breadcrumb,
    Popconfirm,
    message,
    Input,
    Select,
} from 'antd';
import {
    PlusOutlined,
    ClockCircleOutlined,
    AuditOutlined,
    EditOutlined,
    DeleteOutlined,
    CheckCircleOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import InvoiceFormDrawer from './InvoiceFormDrawer';
import InvoicePrintModal from './InvoicePrintModal';
import { motion } from 'framer-motion';
import { fmtRpCompact, fmtDateShort } from '../../utils/formatters';

const { Title, Text } = Typography;
const { Option } = Select;

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
                due_date: inv.due_date || inv.dueDate,
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
                        _item_price: item.harga,
                        _item_qty: item.jumlah,
                        _item_discount: item.diskon || 0,
                        _item_total: (item.harga * item.jumlah) - (item.diskon || 0),
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
            if (searchCategory === 'tanggal') return row.date?.toLowerCase().includes(low);
            if (searchCategory === 'statusbayar') return row.status?.toLowerCase().includes(low);
            if (searchCategory === 'nama_produk') return row._item_name?.toLowerCase().includes(low);
            return true;
        });
    }, [flattenedData, searchText, searchCategory]);

    const columns = [
        {
            title: 'No',
            key: 'no',
            width: 50,
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
                        fontSize: 11, 
                        fontWeight: 700, 
                        borderRadius: 4,
                        background: record.status === 'paid' ? '#28a745' : '#dc3545',
                        border: 'none',
                        minWidth: 100
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
            render: (record: any) => (
                <Text strong>{record.contact?.name || record.client_name || 'Umum'}</Text>
            ),
        },
        {
            title: 'Tanggal order',
            dataIndex: 'date',
            key: 'date',
            render: (date: string) => <small style={{ color: '#666' }}>{fmtDateShort(date)}</small>,
        },
        {
            title: 'Produk',
            dataIndex: '_item_name',
            key: 'produk',
            render: (text: string) => <span style={{ fontSize: 13 }}>{text}</span>
        },
        {
            title: 'harga @',
            dataIndex: '_item_price',
            key: 'price',
            align: 'right' as const,
            render: (v: number) => fmtRpCompact(v),
        },
        {
            title: 'disc',
            dataIndex: '_item_discount',
            key: 'discount',
            align: 'right' as const,
            render: (v: number) => <span style={{ color: v > 0 ? '#dc3545' : '#999' }}>{fmtRpCompact(v)}</span>,
        },
        {
            title: 'Total',
            dataIndex: '_item_total',
            key: 'total',
            align: 'right' as const,
            render: (v: number) => <Text strong>{fmtRpCompact(v)}</Text>,
        },
        {
            title: 'status pembayaran',
            key: 'status_label',
            render: (record: any) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Tag 
                        color={record.status === 'paid' ? 'success' : 'error'}
                        style={{ borderRadius: 4, fontWeight: 700, fontSize: 10, margin: 0 }}
                    >
                        {record.status.toUpperCase()}
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
                        style={{ background: '#ffc107', border: 'none', color: '#000' }}
                        icon={<EditOutlined style={{ fontSize: 12 }} />}
                        onClick={() => handleEdit(record)}
                    />
                    {record.status !== 'paid' && (
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
                                style={{ background: '#dc3545' }}
                            />
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    const stats = [
        { title: 'Total Omzet', value: data.reduce((sum, i) => sum + (i.total_amount || 0), 0), isCurrency: true, icon: <AuditOutlined />, color: '#0fb9b1' },
        { title: 'Belum Lunas', value: data.filter(i => i.status !== 'paid').length, icon: <ClockCircleOutlined />, color: '#f59e0b' },
        { title: 'Total Piutang', value: data.reduce((sum, i) => sum + (i.remaining_balance || 0), 0), isCurrency: true, icon: <AuditOutlined />, color: '#ef4444' },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                {stats.map((stat, i) => (
                    <Col key={i} xs={24} md={8}>
                        <Card bordered={false} bodyStyle={{ padding: '16px 20px' }} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 8, background: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>{stat.title}</Text>
                                    <div style={{ fontSize: 18, fontWeight: 800, color: '#333' }}>
                                        {stat.isCurrency ? fmtRpCompact(stat.value) : stat.value}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }} bodyStyle={{ padding: 0 }}>
                <div style={{ padding: '12px 20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12, borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', gap: 0, alignItems: 'center' }}>
                        <Select 
                            value={searchCategory}
                            onChange={setSearchCategory}
                            style={{ width: 140 }}
                        >
                            <Option value="nama">nama customer</Option>
                            <Option value="kodeinvoice">kode invoice</Option>
                            <Option value="tanggal">tanggal order</Option>
                            <Option value="statusbayar">status bayar</Option>
                            <Option value="nama_produk">nama produk</Option>
                        </Select>
                        <Input 
                            placeholder="kata kunci pencarian" 
                            style={{ width: 180 }} 
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onPressEnter={fetchInvoices}
                            suffix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        />
                        <Button style={{ marginLeft: 8, borderRadius: 4 }} onClick={fetchInvoices}>search</Button>
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
                            showTotal: (total) => `Total ${total} items` 
                        }}
                        style={{ padding: '0 4px' }}
                        className="old-style-table"
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
