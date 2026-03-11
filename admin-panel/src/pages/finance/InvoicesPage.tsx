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
    Badge,
    Breadcrumb,
    Avatar,
    Popconfirm,
    message,
    Tooltip,
    Input,
} from 'antd';
import {
    PrinterOutlined,
    PlusOutlined,
    ClockCircleOutlined,
    AuditOutlined,
    EditOutlined,
    DeleteOutlined,
    CheckCircleOutlined,
    UndoOutlined,
} from '@ant-design/icons';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import InvoiceFormDrawer from './InvoiceFormDrawer';
import InvoicePrintModal from './InvoicePrintModal';
import { motion } from 'framer-motion';
import { fmtRpCompact, fmtDateShort } from '../../utils/formatters';

const { Title, Text } = Typography;

const InvoicesPage: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [searchText, setSearchText] = useState('');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editInvoice, setEditInvoice] = useState<any>(null);
    const [printModalOpen, setPrintModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('all');
    const { user } = useAuth();

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

    const columns = [
        {
            title: 'INVOICE',
            dataIndex: 'invoice_number',
            key: 'invoice_number',
            render: (text: string) => <Text strong style={{ color: '#0fb9b1' }}>{text}</Text>,
        },
        {
            title: 'PELANGGAN',
            dataIndex: 'contact',
            key: 'contact',
            render: (contact: any) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar size="small" style={{ backgroundColor: '#0fb9b115', color: '#0fb9b1' }}>
                        {contact?.name?.charAt(0) || 'C'}
                    </Avatar>
                    <Text strong>{contact?.name || 'Umum'}</Text>
                </div>
            ),
        },
        {
            title: 'TANGGAL',
            dataIndex: 'date',
            key: 'date',
            render: (date: string) => fmtDateShort(date),
        },
        {
            title: 'TOTAL',
            dataIndex: 'total_amount',
            key: 'total_amount',
            render: (amount: number) => <Text strong>{fmtRpCompact(amount)}</Text>,
        },
        {
            title: 'SISA',
            dataIndex: 'remaining_balance',
            key: 'remaining_balance',
            render: (balance: number) => (
                <Text type={balance > 0 ? 'danger' : 'secondary'} strong>
                    {balance > 0 ? fmtRpCompact(balance) : 'Lunas'}
                </Text>
            ),
        },
        {
            title: 'STATUS',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                let color = 'default';
                if (status === 'paid') color = 'success';
                if (status === 'partial') color = 'warning';
                if (status === 'unpaid') color = 'error';
                return (
                    <Tag color={color} style={{ borderRadius: 6, fontWeight: 700, textTransform: 'uppercase', fontSize: 10 }}>
                        {status}
                    </Tag>
                );
            },
        },
        {
            title: 'AKSI',
            key: 'actions',
            align: 'right' as const,
            width: 160,
            render: (_: any, record: any) => (
                <Space size={0}>
                    {/* Toggle Paid */}
                    <Tooltip title={record.status === 'paid' ? 'Batal Lunas' : 'Tandai Lunas'}>
                        <Popconfirm
                            title={record.status === 'paid' ? 'Batal tandai lunas?' : 'Tandai sebagai LUNAS?'}
                            onConfirm={(e) => { e?.stopPropagation(); handleTogglePaid(record.id); }}
                            onCancel={(e) => e?.stopPropagation()}
                            okText="Ya"
                            cancelText="Batal"
                        >
                            <Button
                                type="text"
                                icon={record.status === 'paid'
                                    ? <UndoOutlined style={{ color: '#f59e0b' }} />
                                    : <CheckCircleOutlined style={{ color: '#16a34a' }} />
                                }
                                onClick={(e) => e.stopPropagation()}
                                size="small"
                            />
                        </Popconfirm>
                    </Tooltip>
                    {/* Edit */}
                    <Tooltip title="Edit">
                        <Button
                            type="text"
                            icon={<EditOutlined style={{ color: '#3b82f6' }} />}
                            onClick={(e) => { e.stopPropagation(); handleEdit(record); }}
                            size="small"
                        />
                    </Tooltip>
                    {/* Print */}
                    <Tooltip title="Cetak">
                        <Button
                            type="text"
                            icon={<PrinterOutlined style={{ color: '#0fb9b1' }} />}
                            onClick={(e) => { e.stopPropagation(); handlePrint(record); }}
                            size="small"
                        />
                    </Tooltip>
                    {/* Delete */}
                    {record.status !== 'paid' && (
                        <Tooltip title="Hapus">
                            <Popconfirm
                                title="Hapus invoice ini?"
                                description="Invoice yang dihapus tidak bisa dikembalikan."
                                onConfirm={(e) => { e?.stopPropagation(); handleDelete(record.id); }}
                                onCancel={(e) => e?.stopPropagation()}
                                okText="Hapus"
                                cancelText="Batal"
                                okButtonProps={{ danger: true }}
                            >
                                <Button
                                    type="text"
                                    icon={<DeleteOutlined style={{ color: '#ef4444' }} />}
                                    onClick={(e) => e.stopPropagation()}
                                    size="small"
                                />
                            </Popconfirm>
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    const filteredData = useMemo(() => {
        if (!searchText) return data;
        const low = searchText.toLowerCase();
        return data.filter(inv => 
            inv.invoice_number?.toLowerCase().includes(low) || 
            inv.contact?.name?.toLowerCase().includes(low) ||
            inv.client_name?.toLowerCase().includes(low) ||
            inv.description?.toLowerCase().includes(low)
        );
    }, [data, searchText]);

    const stats = [
        { title: 'Total Invoice', value: data.length, icon: <FileTextOutlined />, color: '#3b82f6' },
        { title: 'Belum Lunas', value: data.filter(i => i.status !== 'paid').length, icon: <ClockCircleOutlined />, color: '#f59e0b' },
        { title: 'Total Piutang', value: data.reduce((sum, i) => sum + (i.remaining_balance || 0), 0), isCurrency: true, icon: <AuditOutlined />, color: '#ef4444' },
    ];

    if (!user) console.debug('Guest Mode');

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Space direction="vertical" size={0}>
                    <Breadcrumb items={[{ title: 'KEUANGAN' }, { title: 'INVOICE' }]} style={{ marginBottom: 8 }} />
                    <Title level={2} style={{ margin: 0, fontWeight: 800 }}>Daftar <span style={{ color: '#0fb9b1' }}>Invoice</span></Title>
                    <Text type="secondary">Kelola penagihan dan pembayaran pelanggan.</Text>
                </Space>
                <Button type="primary" size="large" icon={<PlusOutlined />} onClick={handleCreate} style={{ borderRadius: 12, height: 44, background: '#0fb9b1', border: 'none', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                    Buat Invoice
                </Button>
            </div>

            <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
                {stats.map((stat, i) => (
                    <Col key={i} xs={24} md={8}>
                        <Card className="premium-card" style={{ borderRadius: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                                    {stat.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>{stat.title}</Text>
                                    <div style={{ fontSize: 22, fontWeight: 800 }}>
                                        {stat.isCurrency ? fmtRpCompact(stat.value) : stat.value}
                                    </div>
                                </div>
                                <Badge status="processing" color={stat.color} />
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Card className="premium-card" style={{ borderRadius: 24 }} bodyStyle={{ padding: 0 }}>
                <div style={{ padding: '4px 20px', borderBottom: '1px solid #f8f9fa', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        className="premium-tabs"
                        items={[
                            { key: 'all', label: <span style={{ fontWeight: 600, fontSize: 13 }}>SEMUA</span> },
                            { key: 'unpaid', label: <span style={{ fontWeight: 600, fontSize: 13 }}>BELUM BAYAR</span> },
                            { key: 'partial', label: <span style={{ fontWeight: 600, fontSize: 13 }}>DICICIL</span> },
                            { key: 'paid', label: <span style={{ fontWeight: 600, fontSize: 13 }}>LUNAS</span> },
                        ]}
                    />
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <Input.Search 
                            placeholder="Cari invoice/pelanggan..." 
                            style={{ width: 250 }} 
                            onSearch={setSearchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                        <Button type="primary" style={{ borderRadius: 12, height: 40, background: '#333', border: 'none' }} onClick={() => fetchInvoices()}>
                            Refresh
                        </Button>
                    </div>
                </div>

                <div style={{ padding: '0 8px' }}>
                    <Table
                        columns={columns}
                        dataSource={filteredData}
                        rowKey="id"
                        loading={loading}
                        rowSelection={{
                            type: 'checkbox',
                            selectedRowKeys,
                            onChange: (keys) => setSelectedRowKeys(keys),
                        }}
                        expandable={{
                            expandedRowRender: (record) => (
                                <div style={{ background: '#fefefe', padding: '16px 24px', borderRadius: 16, border: '1px dashed #d9d9d9' }}>
                                    <Text strong style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', marginBottom: 12, display: 'block' }}>
                                        Rincian Produk / Item ({record.items?.length || 0})
                                    </Text>
                                    <Table 
                                        size="small"
                                        pagination={false}
                                        columns={[
                                            { title: 'Item', dataIndex: 'nama_produk', key: 'name' },
                                            { title: 'Qty', dataIndex: 'jumlah', key: 'qty', align: 'center' },
                                            { title: 'Unit', dataIndex: 'satuan', key: 'unit', align: 'center' },
                                            { title: 'Harga', dataIndex: 'harga', key: 'price', align: 'right', render: (v: any) => fmtRpCompact(v) },
                                            { title: 'Sub', key: 'sub', align: 'right', render: (_: any, r: any) => fmtRpCompact((r.harga || 0) * (r.jumlah || 0) - (r.diskon || 0)) },
                                        ]}
                                        dataSource={record.items || []}
                                        rowKey={(_, i) => i!}
                                    />
                                    {record.description && (
                                        <div style={{ marginTop: 12, fontSize: 12, color: '#666' }}>
                                            <Text strong>Catatan:</Text> {record.description}
                                        </div>
                                    )}
                                </div>
                            ),
                            rowExpandable: (record) => record.items?.length > 0,
                        }}
                        onRow={(record) => ({
                            onClick: () => handlePrint(record),
                            style: { cursor: 'pointer' }
                        })}
                        pagination={{ pageSize: 15, showSizeChanger: true }}
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

const FileTextOutlined = () => (
    <svg width="1em" height="1em" fill="currentColor" viewBox="0 0 1024 1024" style={{ verticalAlign: 'middle' }}>
        <path d="M854.6 288.6L639.4 73.4c-6-6-14.1-9.4-22.6-9.4H132c-17.7 0-32 14.3-32 32v832c0 17.7 14.3 32 32 32h720c17.7 0 32-14.3 32-32V311.2c0-8.5-3.4-16.7-9.4-22.6zM790.2 326L602 326V137.8L790.2 326zM812 888H172V136h358v190c0 17.7 14.3 32 32 32h190v530z" />
    </svg>
);

export default InvoicesPage;
