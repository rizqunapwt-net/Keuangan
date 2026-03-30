import React, { useState, useEffect, useMemo } from 'react';
import {
    Table,
    Tag,
    Card,
    Typography,
    Button,
    Space,
    Tabs,
    Popconfirm,
    message,
    Input,
    Select,
    Breadcrumb,
} from 'antd';
import {
    EditOutlined,
    CheckCircleOutlined,
    PlusOutlined,
    CloseOutlined,
} from '@ant-design/icons';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import InvoiceFormDrawer from './InvoiceFormDrawer';
import InvoicePrintModal from './InvoicePrintModal';
import { motion } from 'framer-motion';

const { Title } = Typography;
const { Option } = Select;

// Exactly match PHP formatting: Rp.17,500 (dot after Rp, comma separator)
const fmtPhpRp = (n: number | string | null | undefined): string => {
    if (n === null || n === undefined || isNaN(Number(n))) return 'Rp.0';
    return `Rp.${Number(n).toLocaleString('en-US')}`; 
};

// Format tanggal: DD/MM/YYYY (tanpa jam jika date-only)
const fmtPhpDate = (d: string | Date): string => {
    if (!d) return '-';
    const str = typeof d === 'string' ? d : d.toISOString();
    // Jika date-only format YYYY-MM-DD, tampilkan tanggal saja tanpa jam
    const dateOnlyMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateOnlyMatch) {
        return `${dateOnlyMatch[3]}/${dateOnlyMatch[2]}/${dateOnlyMatch[1]}`;
    }
    // Jika ada timestamp lengkap
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
    const { } = useAuth();

    const [settings, setSettings] = useState<any>(() => {
        const saved = localStorage.getItem('app_settings');
        return saved ? JSON.parse(saved) : null;
    });

    const fetchSettings = async () => {
        try {
            const res = await api.get('/settings');
            if (res.data?.data) {
                setSettings(res.data.data);
                localStorage.setItem('app_settings', JSON.stringify(res.data.data));
            }
        } catch (err) {
            console.error('Failed to fetch settings:', err);
        }
    };

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
        fetchSettings();
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
            title: <span style={{ fontSize: 10, color: '#666' }}>No</span>,
            key: 'no',
            width: 35,
            render: (_: any, __: any, index: number) => <span style={{ fontSize: 11 }}>{index + 1}</span>,
        },
        {
            title: <span style={{ fontSize: 10, color: '#666' }}>Kode tagihan</span>,
            dataIndex: 'invoice_number',
            key: 'invoice_number',
            render: (text: string, record: any) => {
                const isPaid = record.status === 'paid' || record.status === 'lunas';
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <Button 
                            size="small" 
                            style={{ 
                                fontSize: 9, 
                                fontWeight: 700, 
                                borderRadius: 4,
                                background: isPaid ? '#28a745' : '#dc3545',
                                color: '#fff',
                                border: 'none',
                                minWidth: 80,
                                padding: '4px 10px',
                                height: 'auto',
                                lineHeight: 'normal',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                            }}
                            onClick={() => handlePrint(record)}
                        >
                            {text}
                        </Button>
                        <a href="#" style={{ fontSize: 9, color: '#007bff', fontWeight: 500, opacity: 0.8 }}>tambah item?</a>
                    </div>
                );
            }
        },
        {
            title: <span style={{ fontSize: 10, color: '#666' }}>Nama user</span>,
            key: 'client_name',
            render: (record: any) => <span style={{ fontSize: 11, color: '#333' }}>{record.contact?.name || record.client_name || 'Umum'}</span>,
        },
        {
            title: <span style={{ fontSize: 10, color: '#666' }}>Tanggal order</span>,
            dataIndex: 'created_at',
            key: 'date',
            render: (date: string) => <span style={{ color: '#555', fontSize: 10, whiteSpace: 'nowrap' }}>{fmtPhpDate(date)}</span>,
        },
        {
            title: <span style={{ fontSize: 10, color: '#666' }}>Produk</span>,
            dataIndex: '_item_name',
            key: 'produk',
            render: (text: string) => <span style={{ fontSize: 11, color: '#333' }}>{text}</span>
        },
        {
            title: <span style={{ fontSize: 10, color: '#666' }}>harga @</span>,
            dataIndex: '_item_price',
            key: 'price',
            align: 'right' as const,
            render: (v: number) => <span style={{ fontSize: 11, color: '#333' }}>{fmtPhpRp(v)}</span>,
        },
        {
            title: <span style={{ fontSize: 10, color: '#666' }}>disc</span>,
            dataIndex: '_item_discount',
            key: 'discount',
            align: 'right' as const,
            render: (v: number) => <span style={{ fontSize: 11, color: '#333' }}>{fmtPhpRp(v)}</span>,
        },
        {
            title: <span style={{ fontSize: 10, color: '#666' }}>Total</span>,
            dataIndex: '_item_total',
            key: 'total',
            align: 'right' as const,
            render: (v: number) => <span style={{ fontWeight: 700, fontSize: 11, color: '#000' }}>{fmtPhpRp(v)}</span>,
        },
        {
            title: <span style={{ fontSize: 10, color: '#666' }}>Status bayar</span>,
            dataIndex: 'status',
            key: 'status_text',
            render: (status: string) => {
                const label = status === 'paid' ? 'lunas' : (status === 'unpaid' ? 'belum' : status);
                return <span style={{ fontSize: 10, color: '#555' }}>{label}</span>;
            }
        },
        {
            title: <span style={{ fontSize: 10, color: '#666' }}>status pembayaran</span>,
            key: 'status_label',
            render: (record: any) => {
                const isPaid = record.status === 'paid' || record.status === 'lunas';
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Tag 
                            color={isPaid ? '#28a745' : '#dc3545'}
                            style={{ borderRadius: 3, fontWeight: 700, fontSize: 9, margin: 0, padding: '0 3px', lineHeight: '14px', border: 'none' }}
                        >
                            {isPaid ? 'lunas' : 'belum'}
                        </Tag>
                        <Popconfirm
                            title={isPaid ? 'Batal tandai lunas?' : 'Tandai sebagai LUNAS?'}
                            onConfirm={() => handleTogglePaid(record.id)}
                            okText="Ya"
                            cancelText="Batal"
                        >
                            <Button 
                                size="small" 
                                style={{ 
                                    padding: '0 2px', 
                                    height: 16, 
                                    background: '#28a745', 
                                    color: '#fff',
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    fontSize: 10,
                                    borderRadius: 3
                                }}
                            >
                                <CheckCircleOutlined style={{ fontSize: 10 }} />
                            </Button>
                        </Popconfirm>
                    </div>
                );
            }
        },
        {
            title: <span style={{ fontSize: 10, color: '#666' }}>aksi</span>,
            key: 'actions',
            align: 'right' as const,
            width: 70,
            render: (_: any, record: any) => (
                <Space size={2}>
                    <Button
                        size="small"
                        style={{ background: '#ffc107', border: 'none', color: '#000', padding: '0 4px', height: 20, width: 22, borderRadius: 3 }}
                        icon={<EditOutlined style={{ fontSize: 10 }} />}
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
                            icon={<CloseOutlined style={{ fontSize: 10 }} />}
                            style={{ background: '#dc3545', border: 'none', padding: '0 4px', height: 20, width: 22, borderRadius: 3 }}
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];


    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: 12 }} // Global smaller font
        >
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                <Space direction="vertical" size={0}>
                    <Breadcrumb 
                        items={[{ title: 'Home' }, { title: 'tagihan' }]} 
                        style={{ marginBottom: 2, fontSize: 11 }} 
                    />
                    <Title level={5} style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>Data Orderan</Title>
                </Space>
            </div>


            <Card bordered={false} style={{ borderRadius: 6 }} bodyStyle={{ padding: 0 }}>
                <div style={{ padding: '6px 12px', display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', alignItems: 'center', gap: 8, borderBottom: '1px solid #f0f0f0' }}>
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined style={{ fontSize: 12 }} />} 
                        onClick={handleCreate} 
                        size="small"
                        style={{ background: '#28a745', border: 'none', borderRadius: 3, fontWeight: 600, height: 26, fontSize: 11, marginRight: 8 }}
                    >
                        tambah order
                    </Button>

                    <div style={{ display: 'flex', border: '1px solid #d9d9d9', borderRadius: 3, overflow: 'hidden' }}>
                        <Input 
                            placeholder="kata kunci pencarian" 
                            style={{ width: 160, fontSize: 11 }} 
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onPressEnter={fetchInvoices}
                            bordered={false}
                            size="small"
                        />
                        <Select 
                            value={searchCategory}
                            onChange={setSearchCategory}
                            style={{ width: 130, fontSize: 11, borderLeft: '1px solid #d9d9d9' }}
                            bordered={false}
                            size="small"
                            dropdownStyle={{ minWidth: 180 }}
                        >
                            <Option value="nama"><span style={{ fontSize: 11 }}>nama customer</span></Option>
                            <Option value="kodeinvoice"><span style={{ fontSize: 11 }}>kode invoice</span></Option>
                            <Option value="tanggal"><span style={{ fontSize: 11 }}>tanggal order</span></Option>
                            <Option value="statusbayar"><span style={{ fontSize: 11 }}>status bayar</span></Option>
                            <Option value="nama_produk"><span style={{ fontSize: 11 }}>nama produk</span></Option>
                        </Select>
                        <Button style={{ border: 'none', background: '#f5f5f5', fontSize: 11, height: 24, borderLeft: '1px solid #d9d9d9' }} size="small" onClick={fetchInvoices}>search</Button>
                    </div>
                    
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        size="small"
                        className="small-tabs"
                        items={[
                            { key: 'all', label: <span style={{ fontSize: 11 }}>SEMUA</span> },
                            { key: 'unpaid', label: <span style={{ fontSize: 11 }}>BELUM BAYAR</span> },
                            { key: 'paid', label: <span style={{ fontSize: 11 }}>LUNAS</span> },
                        ]}
                        style={{ marginBottom: -10 }}
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
                            showTotal: (total) => <span style={{ fontSize: 10 }}>Total {total} data</span>,
                            size: 'small'
                        }}
                        className="compact-table"
                        bordered
                        style={{ fontSize: 11 }}
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
            
            <style>{`
                .compact-table .ant-table-thead > tr > th {
                    padding: 4px 8px !important;
                    background: #fafafa !important;
                }
                .compact-table .ant-table-tbody > tr > td {
                    padding: 3px 8px !important;
                }
                .compact-table .ant-table-pagination.ant-pagination {
                    margin: 8px 0 !important;
                }
                .small-tabs .ant-tabs-tab {
                    padding: 4px 8px !important;
                }
            `}</style>
        </motion.div>
    );
};

export default InvoicesPage;
