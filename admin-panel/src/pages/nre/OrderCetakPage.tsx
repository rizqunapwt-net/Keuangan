import React, { useEffect, useState } from 'react';
import {
    Table, Button, Space, Tag, Input, Card, Typography, message, Statistic, Row, Col,
    Modal, Form, Select, InputNumber, DatePicker, Tooltip, Descriptions
} from 'antd';
import {
    SearchOutlined, ReloadOutlined, PrinterOutlined, PlusOutlined, EditOutlined,
    ClockCircleOutlined, SyncOutlined
} from '@ant-design/icons';
import api from '../../api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface PrintOrderItem {
    id: number;
    order_number: string;
    book?: { id: number; title: string; tracking_code?: string };
    book_title?: string;
    vendor_name: string;
    vendor_contact?: string;
    quantity: number;
    unit_cost: number;
    total_cost: number;
    paper_type: string;
    binding_type: string;
    cover_type: string;
    page_count?: number;
    size: string;
    status: string;
    ordered_by?: string;
    ordered_at?: string;
    expected_delivery?: string;
    delivered_at?: string;
    notes?: string;
    created_at: string;
}

interface BookOption {
    id: number;
    title: string;
    tracking_code?: string;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
    pending: { label: 'Menunggu Persetujuan', color: 'gold' },
    approved: { label: 'Disetujui', color: 'blue' },
    in_production: { label: 'Dalam Produksi', color: 'processing' },
    qc: { label: 'Quality Control', color: 'purple' },
    delivered: { label: 'Diterima', color: 'success' },
    cancelled: { label: 'Dibatalkan', color: 'error' },
};

const PAPER_TYPES = ['HVS 70gsm', 'HVS 80gsm', 'Book Paper 57gsm', 'Book Paper 70gsm', 'Art Paper 120gsm', 'Art Paper 150gsm', 'Matt Paper 120gsm'];
const BINDING_TYPES = ['Perfect Binding', 'Saddle Stitch', 'Case Binding', 'Spiral/Ring', 'Japanese Binding'];
const COVER_TYPES = ['Soft Cover', 'Hard Cover', 'Soft Cover Laminasi Glossy', 'Soft Cover Laminasi Doff', 'Hard Cover with Jacket'];
const SIZES = ['A4', 'A5', 'B5', 'A6 (Pocket)', '14x21 cm', '15x23 cm', 'Custom'];

const OrderCetakPage: React.FC = () => {
    const [data, setData] = useState<PrintOrderItem[]>([]);
    const [books, setBooks] = useState<BookOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | undefined>();

    const [addModal, setAddModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [detailModal, setDetailModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<PrintOrderItem | null>(null);

    const [addForm] = Form.useForm();
    const [editForm] = Form.useForm();

    const fetchData = async () => {
        setLoading(true);
        try {
            const params: Record<string, string> = {};
            if (statusFilter) params.status = statusFilter;
            const res = await api.get('/print-orders', { params });
            setData(res.data.data || []);
        } catch {
            message.error('Gagal mengambil data order cetak');
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchBooks = async () => {
        try {
            const res = await api.get('/books');
            setBooks((res.data.data || []).map((b: BookOption) => ({ id: b.id, title: b.title, tracking_code: b.tracking_code })));
        } catch { /* ignore */ }
    };

    useEffect(() => { fetchData(); fetchBooks(); }, []);

    const handleAdd = async (values: Record<string, unknown>) => {
        try {
            const payload = {
                ...values,
                ordered_at: values.ordered_at ? (values.ordered_at as dayjs.Dayjs).format('YYYY-MM-DD') : undefined,
                expected_delivery: values.expected_delivery ? (values.expected_delivery as dayjs.Dayjs).format('YYYY-MM-DD') : undefined,
            };
            await api.post('/print-orders', payload);
            message.success('Order cetak berhasil dibuat');
            setAddModal(false);
            addForm.resetFields();
            fetchData();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            message.error(error.response?.data?.message || 'Gagal membuat order cetak');
        }
    };

    const handleEdit = async (values: Record<string, unknown>) => {
        if (!selectedOrder) return;
        try {
            const payload = {
                ...values,
                expected_delivery: values.expected_delivery ? (values.expected_delivery as dayjs.Dayjs).format('YYYY-MM-DD') : undefined,
            };
            await api.patch(`/print-orders/${selectedOrder.id}`, payload);
            message.success('Order cetak diperbarui');
            setEditModal(false);
            editForm.resetFields();
            fetchData();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            message.error(error.response?.data?.message || 'Gagal memperbarui order');
        }
    };

    const columns = [
        {
            title: 'No. Order', dataIndex: 'order_number', key: 'order_number', width: 160,
            render: (v: string) => <Text code copyable>{v}</Text>,
        },
        {
            title: 'Buku', key: 'book', width: 200,
            render: (_: unknown, r: PrintOrderItem) => r.book?.title || r.book_title || '-',
        },
        {
            title: 'Vendor', dataIndex: 'vendor_name', key: 'vendor',
        },
        {
            title: 'Qty', dataIndex: 'quantity', key: 'qty', width: 80,
            render: (v: number) => v?.toLocaleString('id-ID'),
        },
        {
            title: 'Total Biaya', dataIndex: 'total_cost', key: 'cost', width: 140,
            render: (v: number) => `Rp ${Number(v).toLocaleString('id-ID')}`,
        },
        {
            title: 'Spesifikasi', key: 'spec', width: 200,
            render: (_: unknown, r: PrintOrderItem) => (
                <Space direction="vertical" size={0}>
                    <Text style={{ fontSize: 12 }}>{r.paper_type} • {r.size}</Text>
                    <Text style={{ fontSize: 12 }} type="secondary">{r.binding_type} • {r.cover_type}</Text>
                </Space>
            ),
        },
        {
            title: 'Status', dataIndex: 'status', key: 'status', width: 170,
            render: (v: string) => {
                const s = STATUS_MAP[v] || { label: v, color: 'default' };
                return <Tag color={s.color}>{s.label}</Tag>;
            },
        },
        {
            title: 'Tanggal', key: 'dates', width: 140,
            render: (_: unknown, r: PrintOrderItem) => (
                <Space direction="vertical" size={0}>
                    {r.ordered_at && <Text style={{ fontSize: 12 }}>Order: {new Date(r.ordered_at).toLocaleDateString('id-ID')}</Text>}
                    {r.expected_delivery && <Text style={{ fontSize: 12 }} type="secondary">Target: {new Date(r.expected_delivery).toLocaleDateString('id-ID')}</Text>}
                    {r.delivered_at && <Text style={{ fontSize: 12, color: '#52c41a' }}>Diterima: {new Date(r.delivered_at).toLocaleDateString('id-ID')}</Text>}
                </Space>
            ),
        },
        {
            title: 'Aksi', key: 'actions', width: 120,
            render: (_: unknown, r: PrintOrderItem) => (
                <Space>
                    <Tooltip title="Detail">
                        <Button icon={<PrinterOutlined />} size="small" onClick={() => { setSelectedOrder(r); setDetailModal(true); }} />
                    </Tooltip>
                    <Tooltip title="Update">
                        <Button icon={<EditOutlined />} size="small" type="primary" ghost
                            onClick={() => {
                                setSelectedOrder(r);
                                editForm.setFieldsValue({
                                    status: r.status,
                                    quantity: r.quantity,
                                    unit_cost: r.unit_cost,
                                    vendor_name: r.vendor_name,
                                    notes: r.notes,
                                });
                                setEditModal(true);
                            }} />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const filtered = data.filter(o =>
        !search || o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
        o.vendor_name?.toLowerCase().includes(search.toLowerCase()) ||
        o.book?.title?.toLowerCase().includes(search.toLowerCase())
    );

    const totalOrders = data.length;
    const pending = data.filter(o => o.status === 'pending').length;
    const inProd = data.filter(o => o.status === 'in_production').length;
    const totalCost = data.reduce((sum, o) => sum + Number(o.total_cost || 0), 0);

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <Title level={4} style={{ margin: '0 0 12px 0' }}>Order Pencetakan Buku</Title>
                <Space wrap>
                    <Select placeholder="Filter Status" allowClear style={{ width: 180 }}
                        options={Object.entries(STATUS_MAP).map(([k, v]) => ({ label: v.label, value: k }))}
                        onChange={v => { setStatusFilter(v); }} />
                    <Input placeholder="Cari order..." prefix={<SearchOutlined />} value={search}
                        onChange={e => setSearch(e.target.value)} style={{ width: 200 }} />
                    <Button icon={<ReloadOutlined />} onClick={fetchData}>Refresh</Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => { fetchBooks(); setAddModal(true); }}>
                        Order Cetak Baru
                    </Button>
                </Space>
            </div>

            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}><Card><Statistic title="Total Order" value={totalOrders} prefix={<PrinterOutlined />} /></Card></Col>
                <Col span={6}><Card><Statistic title="Menunggu" value={pending} valueStyle={{ color: '#faad14' }} prefix={<ClockCircleOutlined />} /></Card></Col>
                <Col span={6}><Card><Statistic title="Dalam Produksi" value={inProd} valueStyle={{ color: '#1890ff' }} prefix={<SyncOutlined />} /></Card></Col>
                <Col span={6}><Card><Statistic title="Total Biaya" value={totalCost} prefix="Rp" valueStyle={{ color: '#52c41a' }}
                    formatter={(v) => Number(v).toLocaleString('id-ID')} /></Card></Col>
            </Row>

            <Card>
                <Table columns={columns} dataSource={filtered} rowKey="id" loading={loading}
                    pagination={{ pageSize: 15, showSizeChanger: true, showTotal: t => `Total ${t} order` }}
                    scroll={{ x: 1400 }} />
            </Card>

            {/* ── Add Order Modal ── */}
            <Modal title="Buat Order Cetak Baru" open={addModal} onCancel={() => setAddModal(false)}
                onOk={() => addForm.submit()} okText="Buat Order" cancelText="Batal" width={700}>
                <Form form={addForm} layout="vertical" onFinish={handleAdd}>
                    <Form.Item name="book_id" label="Buku" rules={[{ required: true, message: 'Pilih buku' }]}>
                        <Select placeholder="Pilih buku yang akan dicetak" showSearch
                            filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())}
                            options={books.map(b => ({ label: `${b.title} (${b.tracking_code || '-'})`, value: b.id }))} />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="vendor_name" label="Nama Vendor Percetakan" rules={[{ required: true }]}>
                                <Input placeholder="CV Percetakan Jaya" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="vendor_contact" label="Kontak Vendor">
                                <Input placeholder="No. HP / Email" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="quantity" label="Jumlah Cetak (eks)" rules={[{ required: true }]}>
                                <InputNumber min={1} style={{ width: '100%' }} placeholder="500" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="unit_cost" label="Biaya/eks (Rp)" rules={[{ required: true }]}>
                                <InputNumber min={0} style={{ width: '100%' }} placeholder="25000"
                                    formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="page_count" label="Jumlah Halaman">
                                <InputNumber min={1} style={{ width: '100%' }} placeholder="200" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={6}>
                            <Form.Item name="paper_type" label="Jenis Kertas" initialValue="HVS 80gsm">
                                <Select options={PAPER_TYPES.map(p => ({ label: p, value: p }))} />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="binding_type" label="Jilid" initialValue="Perfect Binding">
                                <Select options={BINDING_TYPES.map(b => ({ label: b, value: b }))} />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="cover_type" label="Cover" initialValue="Soft Cover">
                                <Select options={COVER_TYPES.map(c => ({ label: c, value: c }))} />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="size" label="Ukuran" initialValue="A5">
                                <Select options={SIZES.map(s => ({ label: s, value: s }))} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="ordered_at" label="Tanggal Order">
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="expected_delivery" label="Target Pengiriman">
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="notes" label="Catatan"><Input.TextArea rows={2} placeholder="Instruksi khusus untuk percetakan" /></Form.Item>
                </Form>
            </Modal>

            {/* ── Edit Order Modal ── */}
            <Modal title={`Update: ${selectedOrder?.order_number || ''}`} open={editModal}
                onCancel={() => setEditModal(false)} onOk={() => editForm.submit()} okText="Update" cancelText="Batal">
                <Form form={editForm} layout="vertical" onFinish={handleEdit}>
                    <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                        <Select options={Object.entries(STATUS_MAP).map(([k, v]) => ({ label: v.label, value: k }))} />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="quantity" label="Qty"><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="unit_cost" label="Biaya/eks"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="notes" label="Catatan"><Input.TextArea rows={2} /></Form.Item>
                </Form>
            </Modal>

            {/* ── Detail Modal ── */}
            <Modal title={`Detail Order: ${selectedOrder?.order_number || ''}`} open={detailModal}
                onCancel={() => setDetailModal(false)} footer={null} width={600}>
                {selectedOrder && (
                    <Descriptions bordered column={2} size="small">
                        <Descriptions.Item label="No. Order"><Text copyable>{selectedOrder.order_number}</Text></Descriptions.Item>
                        <Descriptions.Item label="Status">
                            <Tag color={STATUS_MAP[selectedOrder.status]?.color}>{STATUS_MAP[selectedOrder.status]?.label}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Buku" span={2}>{selectedOrder.book?.title || '-'}</Descriptions.Item>
                        <Descriptions.Item label="Vendor">{selectedOrder.vendor_name}</Descriptions.Item>
                        <Descriptions.Item label="Kontak">{selectedOrder.vendor_contact || '-'}</Descriptions.Item>
                        <Descriptions.Item label="Jumlah">{selectedOrder.quantity?.toLocaleString('id-ID')} eks</Descriptions.Item>
                        <Descriptions.Item label="Biaya/eks">Rp {Number(selectedOrder.unit_cost).toLocaleString('id-ID')}</Descriptions.Item>
                        <Descriptions.Item label="Total Biaya" span={2}>
                            <Text strong style={{ color: '#52c41a' }}>Rp {Number(selectedOrder.total_cost).toLocaleString('id-ID')}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Kertas">{selectedOrder.paper_type}</Descriptions.Item>
                        <Descriptions.Item label="Jilid">{selectedOrder.binding_type}</Descriptions.Item>
                        <Descriptions.Item label="Cover">{selectedOrder.cover_type}</Descriptions.Item>
                        <Descriptions.Item label="Ukuran">{selectedOrder.size}</Descriptions.Item>
                        <Descriptions.Item label="Halaman">{selectedOrder.page_count || '-'}</Descriptions.Item>
                        <Descriptions.Item label="Order Oleh">{selectedOrder.ordered_by || '-'}</Descriptions.Item>
                        <Descriptions.Item label="Tgl Order">{selectedOrder.ordered_at ? new Date(selectedOrder.ordered_at).toLocaleDateString('id-ID') : '-'}</Descriptions.Item>
                        <Descriptions.Item label="Target Kirim">{selectedOrder.expected_delivery ? new Date(selectedOrder.expected_delivery).toLocaleDateString('id-ID') : '-'}</Descriptions.Item>
                        {selectedOrder.delivered_at && (
                            <Descriptions.Item label="Diterima" span={2}>{new Date(selectedOrder.delivered_at).toLocaleDateString('id-ID')}</Descriptions.Item>
                        )}
                        {selectedOrder.notes && (
                            <Descriptions.Item label="Catatan" span={2}>{selectedOrder.notes}</Descriptions.Item>
                        )}
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default OrderCetakPage;
