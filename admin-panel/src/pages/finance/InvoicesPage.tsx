import React, { useState, useEffect, useMemo } from 'react';
import {
    Table,
    Tag,
    Card,
    Typography,
    Button,
    Space,
    Popconfirm,
    message,
    Input,
    Select,
    Radio,
    Tooltip,
} from 'antd';
import {
    EditOutlined,
    CheckCircleOutlined,
    PlusOutlined,
    CloseOutlined,
    SearchOutlined,
    PrinterOutlined,
} from '@ant-design/icons';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import InvoiceFormDrawer from './InvoiceFormDrawer';
import InvoicePrintModal from './InvoicePrintModal';
import PageHeader from '../../components/PageHeader';
import { motion } from 'framer-motion';

const { Text } = Typography;
const { Option } = Select;

const fmtPhpRp = (n: number | string | null | undefined): string => {
    if (n === null || n === undefined || isNaN(Number(n))) return 'Rp.0';
    return `Rp.${Number(n).toLocaleString('en-US')}`; 
};

const fmtPhpDate = (d: string | Date): string => {
    if (!d) return '-';
    const str = typeof d === 'string' ? d : d.toISOString();
    const dateOnlyMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateOnlyMatch) {
        return `${dateOnlyMatch[3]}/${dateOnlyMatch[2]}/${dateOnlyMatch[1]}`;
    }
    const date = new Date(str);
    if (isNaN(date.getTime())) return '-';
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
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
    useAuth();

    const [settings, setSettings] = useState<any>(() => {
        const saved = localStorage.getItem('app_settings');
        return saved ? JSON.parse(saved) : null;
    });

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
                date: inv.date || inv.transDate || inv.trans_date || inv.created_at,
            }));
            setData(normalized);
        } catch (error) {
            console.error('Error fetching invoices:', error);
            message.error('Gagal mengambil data invoice');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
        api.get('/settings').then(res => {
            if (res.data?.data) {
                setSettings(res.data.data);
                localStorage.setItem('app_settings', JSON.stringify(res.data.data));
            }
        }).catch(() => {});
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

    const filteredData = useMemo(() => {
        const rows: any[] = [];
        data.forEach((inv) => {
            const items = inv.items || [];
            if (items.length === 0) {
                rows.push({
                    ...inv,
                    _item_name: inv.description || '-',
                    _item_total: inv.total_amount,
                });
            } else {
                items.forEach((item: any) => {
                    rows.push({
                        ...inv,
                        _item_name: item.nama_produk,
                        _item_total: (Number(item.harga || 0) * Number(item.jumlah || 0)) - Number(item.diskon || 0),
                    });
                });
            }
        });

        let result = rows;
        if (activeTab !== 'all') {
            result = result.filter(row => {
                const isPaid = row.status === 'paid' || row.status === 'lunas';
                return activeTab === 'paid' ? isPaid : !isPaid;
            });
        }

        if (!searchText) return result;
        const low = searchText.toLowerCase();
        return result.filter(row => {
            if (searchCategory === 'nama') return (row.client_name || row.contact?.name)?.toLowerCase().includes(low);
            if (searchCategory === 'kodeinvoice') return row.invoice_number?.toLowerCase().includes(low);
            if (searchCategory === 'tanggal') return String(row.date).toLowerCase().includes(low);
            if (searchCategory === 'statusbayar') return row.status?.toLowerCase().includes(low);
            if (searchCategory === 'nama_produk') return row._item_name?.toLowerCase().includes(low);
            return true;
        });
    }, [data, searchText, searchCategory, activeTab]);

    const columns = [
        {
            title: 'KODE',
            dataIndex: 'invoice_number',
            key: 'invoice_number',
            width: 140,
            render: (text: string, record: any) => {
                const isPaid = record.status === 'paid' || record.status === 'lunas';
                return (
                    <Button 
                        size="small" 
                        style={{ 
                            fontSize: 11, 
                            fontWeight: 700, 
                            borderRadius: 6,
                            background: isPaid ? '#10b981' : '#ef4444',
                            color: '#fff',
                            border: 'none',
                        }}
                        onClick={() => handlePrint(record)}
                    >
                        #{text}
                    </Button>
                );
            }
        },
        {
            title: 'TANGGAL',
            dataIndex: 'date',
            key: 'date',
            width: 110,
            render: (v: any) => <Text style={{ fontSize: 13, color: '#475569' }}>{fmtPhpDate(v)}</Text>
        },
        {
            title: 'PELANGGAN',
            key: 'client_name',
            render: (record: any) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Text strong style={{ fontSize: 13, color: '#333' }}>{record.contact?.name || record.client_name || 'Umum'}</Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>{record.contact?.phone || '-'}</Text>
                </div>
            ),
        },
        {
            title: 'PRODUK',
            dataIndex: '_item_name',
            key: 'produk',
            width: 180, // Narrowed
            render: (text: string) => <Text style={{ fontSize: 13, color: '#333' }}>{text}</Text>
        },
        {
            title: 'TOTAL',
            dataIndex: '_item_total',
            key: 'total',
            width: 160, // Widened
            align: 'right' as const,
            render: (v: number) => <Text strong style={{ fontSize: 13, color: '#333', whiteSpace: 'nowrap' }}>{fmtPhpRp(v)}</Text>,
        },
        {
            title: 'STATUS',
            key: 'status_label',
            width: 120,
            render: (record: any) => {
                const isPaid = record.status === 'paid' || record.status === 'lunas';
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Tag 
                            bordered={false}
                            style={{ 
                                backgroundColor: isPaid ? '#10b98115' : '#ef444415', 
                                color: isPaid ? '#10b981' : '#ef4444',
                                fontWeight: 700, 
                                fontSize: 10, 
                                margin: 0, 
                                borderRadius: 6,
                                textTransform: 'uppercase'
                            }}
                        >
                            {isPaid ? 'Lunas' : 'Belum'}
                        </Tag>
                        <Popconfirm
                            title={isPaid ? 'Batal tandai lunas?' : 'Tandai sebagai LUNAS?'}
                            onConfirm={() => handleTogglePaid(record.id)}
                            okText="Ya"
                            cancelText="Batal"
                        >
                            <Tooltip title={isPaid ? "Batal Lunas" : "Tandai Lunas"}>
                                <Button 
                                    size="small" 
                                    shape="circle"
                                    icon={<CheckCircleOutlined />}
                                    style={{ 
                                        background: isPaid ? '#f5f5f5' : '#10b981', 
                                        color: isPaid ? '#ccc' : '#fff',
                                        border: 'none',
                                        fontSize: 12
                                    }}
                                />
                            </Tooltip>
                        </Popconfirm>
                    </div>
                );
            }
        },
        {
            title: '',
            key: 'actions',
            align: 'right' as const,
            width: 100,
            render: (_: any, record: any) => (
                <Space size={4}>
                    <Tooltip title="Cetak">
                        <Button size="small" icon={<PrinterOutlined />} onClick={() => handlePrint(record)} style={{ borderRadius: 8 }} />
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} style={{ borderRadius: 8 }} />
                    </Tooltip>
                    <Popconfirm
                        title="Hapus invoice?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Hapus"
                        cancelText="Batal"
                        okButtonProps={{ danger: true }}
                    >
                        <Button size="small" danger icon={<CloseOutlined />} style={{ borderRadius: 8 }} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={{ fontFamily: "'Poppins', sans-serif" }}>
            <PageHeader
                title="Data Penjualan"
                description="Kelola invoice, pembayaran, dan riwayat pesanan pelanggan."
                breadcrumb={[{ label: 'KEUANGAN' }, { label: 'INVOICE' }]}
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} style={{ borderRadius: 12, height: 40, fontWeight: 700, boxShadow: '0 4px 12px rgba(15, 185, 177, 0.2)' }}>
                        Tambah Order
                    </Button>
                }
            />

            <Card className="premium-card" style={{ borderRadius: 24 }} bodyStyle={{ padding: 0 }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #f8f8f8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <Space size={12} wrap>
                        <Select value={searchCategory} onChange={setSearchCategory} style={{ width: 160, height: 40 }}>
                            <Option value="nama">Nama Customer</Option>
                            <Option value="kodeinvoice">Kode Invoice</Option>
                            <Option value="tanggal">Tanggal</Option>
                            <Option value="statusbayar">Status Bayar</Option>
                            <Option value="nama_produk">Nama Produk</Option>
                        </Select>
                        <Input 
                            placeholder="Cari data..." 
                            prefix={<SearchOutlined style={{ color: '#ccc' }} />}
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            style={{ width: 240, borderRadius: 12, height: 40, background: '#fcfcfc', border: '1px solid #eee' }}
                            allowClear
                        />
                    </Space>

                    <Radio.Group value={activeTab} onChange={e => setActiveTab(e.target.value)} size="middle" buttonStyle="solid">
                        <Radio.Button value="all" style={{ borderRadius: '10px 0 0 10px' }}>SEMUA</Radio.Button>
                        <Radio.Button value="unpaid">BELUM BAYAR</Radio.Button>
                        <Radio.Button value="paid" style={{ borderRadius: '0 10px 10px 0' }}>LUNAS</Radio.Button>
                    </Radio.Group>
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey={(r, i) => `${r.id}-${i}`}
                    loading={loading}
                    pagination={{ pageSize: 15, showSizeChanger: true, showTotal: (t) => <span style={{ fontSize: 12, color: '#aaa' }}>Total {t} data</span> }}
                    size="middle"
                />
            </Card>

            <InvoiceFormDrawer open={drawerOpen} onClose={() => { setDrawerOpen(false); setEditInvoice(null); }} onSuccess={() => { setDrawerOpen(false); setEditInvoice(null); fetchInvoices(); }} editData={editInvoice} />
            <InvoicePrintModal open={printModalOpen} onClose={() => setPrintModalOpen(false)} invoice={selectedInvoice} settings={settings} />
        </motion.div>
    );
};

export default InvoicesPage;
