import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Card, Typography, message, Modal, Form, Select, Input, InputNumber, Space, Statistic, Row, Col, Drawer, Descriptions, Progress, Timeline, Tooltip, Badge } from 'antd';
import { ReloadOutlined, PlusOutlined, SearchOutlined, EyeOutlined, SwapOutlined, FileTextOutlined, PrinterOutlined, CheckCircleOutlined, CloseCircleOutlined, ArrowRightOutlined } from '@ant-design/icons';
import api from '../../api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface BookRecord {
    id: number;
    title: string;
    tracking_code?: string;
    author?: { id: number; name: string };
    author_name?: string;
    description?: string;
    price?: number;
    stock?: number;
    status: string;
    status_label?: string;
    progress?: number;
    revision_notes?: string;
    page_count?: number;
    size?: string;
    allowed_transitions?: { value: string; label: string }[];
    files_count?: number;
    status_logs?: { id: number; from_status: string; to_status: string; changed_by?: string; notes?: string; created_at?: string }[];
    created_at?: string;
    updated_at?: string;
}

// 6-step printing workflow (simpler, no ISBN/surat/approval)
const WORKFLOW_STEPS = [
    { value: 'incoming', label: '1. Naskah Masuk', color: '#1890ff', icon: '📥' },
    { value: 'review', label: '2. Review', color: '#fa8c16', icon: '🔍' },
    { value: 'editorial', label: '3. Editing & Layout', color: '#1677ff', icon: '✏️' },
    { value: 'covering', label: '4. Desain Cover', color: '#722ed1', icon: '🎨' },
    { value: 'production', label: '5. Cetak', color: '#2f54eb', icon: '🖨️' },
    { value: 'done', label: '6. Selesai', color: '#52c41a', icon: '✅' },
];

const ALL_STATUSES = [
    ...WORKFLOW_STEPS,
    { value: 'draft', label: 'Draft', color: '#8c8c8c', icon: '📄' },
    { value: 'revision', label: 'Revisi', color: '#ff4d4f', icon: '↩️' },
];

const statusInfo = (val: string) => ALL_STATUSES.find(s => s.value === val) || { label: val, color: '#8c8c8c', icon: '❓' };

const NaskahCetakPage: React.FC = () => {
    const [data, setData] = useState<BookRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
    const [addModal, setAddModal] = useState(false);
    const [statusModal, setStatusModal] = useState(false);
    const [detailDrawer, setDetailDrawer] = useState(false);
    const [selectedBook, setSelectedBook] = useState<BookRecord | null>(null);
    const [addForm] = Form.useForm();
    const [statusForm] = Form.useForm();
    const [detailData, setDetailData] = useState<BookRecord | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/books', { params: { type: 'printing' } });
            const list = res.data.data || res.data || [];
            setData(Array.isArray(list) ? list : []);
        } catch {
            message.info('API belum tersedia');
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleAdd = async (values: Record<string, unknown>) => {
        try {
            await api.post('/books', {
                ...values,
                type: 'printing',
                status: 'incoming',
            });
            message.success('Naskah cetak berhasil ditambahkan');
            setAddModal(false);
            addForm.resetFields();
            fetchData();
        } catch (e: unknown) {
            const err = e as { response?: { data?: { message?: string } } };
            message.error(err.response?.data?.message || 'Gagal menambahkan naskah');
        }
    };

    const handleStatusChange = async (values: Record<string, unknown>) => {
        if (!selectedBook) return;
        try {
            await api.patch(`/books/${selectedBook.id}/status`, values);
            message.success('Status berhasil diperbarui');
            setStatusModal(false);
            statusForm.resetFields();
            fetchData();
            if (detailDrawer) loadDetail(selectedBook.id);
        } catch (e: unknown) {
            const err = e as { response?: { data?: { message?: string } } };
            message.error(err.response?.data?.message || 'Gagal mengubah status');
        }
    };

    const loadDetail = async (id: number) => {
        try {
            const res = await api.get(`/books/${id}`);
            setDetailData(res.data.data || res.data);
        } catch { /* ignore */ }
    };

    const openStatusChange = (book: BookRecord) => {
        setSelectedBook(book);
        statusForm.resetFields();
        setStatusModal(true);
    };

    const openDetail = async (book: BookRecord) => {
        setSelectedBook(book);
        setDetailDrawer(true);
        loadDetail(book.id);
    };

    const getAuthorName = (r: BookRecord) => r.author?.name || r.author_name || '-';

    const columns = [
        {
            title: 'Kode', dataIndex: 'tracking_code', key: 'code', width: 120,
            render: (v: string) => <Text code style={{ fontSize: 11 }}>{v}</Text>,
        },
        {
            title: 'Judul', dataIndex: 'title', key: 'title', sorter: (a: BookRecord, b: BookRecord) => a.title.localeCompare(b.title),
            render: (v: string, r: BookRecord) => (
                <a onClick={() => openDetail(r)} style={{ fontWeight: 500 }}>{v}</a>
            ),
        },
        {
            title: 'Klien/Penulis', key: 'author', width: 180,
            render: (_: unknown, r: BookRecord) => <Text>{getAuthorName(r)}</Text>,
        },
        {
            title: 'Status', key: 'status', width: 150,
            render: (_: unknown, r: BookRecord) => {
                const si = statusInfo(r.status);
                return (
                    <Tag color={si.color} style={{ margin: 0 }}>
                        {si.icon} {r.status_label || si.label}
                    </Tag>
                );
            },
        },
        {
            title: 'Progress', key: 'progress', width: 120,
            render: (_: unknown, r: BookRecord) => (
                <Progress percent={r.progress || 0} size="small" strokeColor={r.progress === 100 ? '#52c41a' : '#1677ff'} />
            ),
        },
        {
            title: 'Harga', dataIndex: 'price', key: 'price', width: 100,
            render: (v: number) => v ? `Rp ${Number(v).toLocaleString('id-ID')}` : '-',
        },
        {
            title: 'Aksi', key: 'actions', width: 100,
            render: (_: unknown, r: BookRecord) => (
                <Space size="small">
                    <Tooltip title="Detail">
                        <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => openDetail(r)} />
                    </Tooltip>
                    {r.allowed_transitions && r.allowed_transitions.length > 0 && (
                        <Tooltip title="Ubah Status">
                            <Button type="text" size="small" icon={<SwapOutlined />} onClick={() => openStatusChange(r)} />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    const filtered = data.filter(b => {
        const matchSearch = !search ||
            b.title.toLowerCase().includes(search.toLowerCase()) ||
            getAuthorName(b).toLowerCase().includes(search.toLowerCase()) ||
            (b.tracking_code || '').toLowerCase().includes(search.toLowerCase());
        const matchStatus = !statusFilter || b.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const total = data.length;
    const done = data.filter(b => b.status === 'done').length;
    const inProcess = data.filter(b => ['incoming', 'review', 'editorial', 'covering', 'production'].includes(b.status)).length;
    const revision = data.filter(b => b.status === 'revision').length;

    const stepCounts = WORKFLOW_STEPS.map(s => ({
        ...s,
        count: data.filter(b => b.status === s.value).length,
    }));

    const selectedTransitions = selectedBook?.allowed_transitions || [];

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <Title level={4} style={{ margin: '0 0 12px 0' }}>Daftar Naskah Cetak</Title>
                <Space wrap>
                    <Select placeholder="Filter Status" allowClear style={{ width: 180 }}
                        options={ALL_STATUSES.map(s => ({ label: `${s.icon} ${s.label}`, value: s.value }))}
                        onChange={v => setStatusFilter(v)} />
                    <Input placeholder="Cari naskah..." prefix={<SearchOutlined />} value={search}
                        onChange={e => setSearch(e.target.value)} style={{ width: 220 }} />
                    <Button icon={<ReloadOutlined />} onClick={fetchData}>Refresh</Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModal(true)}>
                        Naskah Cetak Baru
                    </Button>
                </Space>
            </div>

            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}><Card size="small"><Statistic title="Total Naskah" value={total} prefix={<FileTextOutlined />} /></Card></Col>
                <Col span={6}><Card size="small"><Statistic title="Selesai" value={done} valueStyle={{ color: '#52c41a' }} prefix={<CheckCircleOutlined />} /></Card></Col>
                <Col span={6}><Card size="small"><Statistic title="Dalam Proses" value={inProcess} valueStyle={{ color: '#1677ff' }} prefix={<PrinterOutlined />} /></Card></Col>
                <Col span={6}><Card size="small"><Statistic title="Revisi" value={revision} valueStyle={{ color: '#ff4d4f' }} prefix={<CloseCircleOutlined />} /></Card></Col>
            </Row>

            {/* Workflow Pipeline */}
            <Card size="small" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    {stepCounts.map((step, i) => (
                        <Tooltip key={step.value} title={`Klik untuk filter: ${step.label}`}>
                            <div
                                onClick={() => setStatusFilter(statusFilter === step.value ? undefined : step.value)}
                                style={{
                                    textAlign: 'center', cursor: 'pointer', padding: '8px 6px', borderRadius: 8, flex: 1, minWidth: 90,
                                    background: statusFilter === step.value ? `${step.color}15` : 'transparent',
                                    border: statusFilter === step.value ? `2px solid ${step.color}` : '2px solid transparent',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <div style={{ fontSize: 18 }}>{step.icon}</div>
                                <Badge count={step.count} showZero color={step.color} style={{ marginTop: 4 }} />
                                <div style={{ fontSize: 10, color: '#666', marginTop: 4, lineHeight: 1.2 }}>{step.label}</div>
                                {i < stepCounts.length - 1 && <ArrowRightOutlined style={{ position: 'absolute', right: -8, top: '50%', color: '#d9d9d9', fontSize: 10 }} />}
                            </div>
                        </Tooltip>
                    ))}
                </div>
            </Card>

            <Card>
                <Table columns={columns} dataSource={filtered} rowKey="id" loading={loading}
                    pagination={{ pageSize: 15, showTotal: (t) => `${t} naskah` }}
                    scroll={{ x: 900 }} />
            </Card>

            {/* Add Printing Book Modal */}
            <Modal title="Naskah Cetak Baru" open={addModal} onCancel={() => setAddModal(false)} onOk={() => addForm.submit()} okText="Tambah Naskah" cancelText="Batal" width={520}>
                <Form form={addForm} layout="vertical" onFinish={handleAdd}>
                    <Form.Item name="title" label="Judul Naskah" rules={[{ required: true, message: 'Wajib diisi' }]}>
                        <Input placeholder="Masukkan judul naskah" />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="price" label="Harga (Rp)">
                                <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="stock" label="Jumlah Cetak">
                                <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="description" label="Keterangan">
                        <Input.TextArea rows={2} placeholder="Keterangan naskah cetak..." />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Status Change Modal */}
            <Modal title="Ubah Status Naskah" open={statusModal} onCancel={() => setStatusModal(false)} onOk={() => statusForm.submit()} okText="Ubah Status" cancelText="Batal" width={520}>
                {selectedBook && (
                    <div style={{ marginBottom: 16, padding: 12, background: '#f6f8fa', borderRadius: 8 }}>
                        <Text strong>{selectedBook.title}</Text>
                        <br />
                        <Text type="secondary">Status saat ini: </Text>
                        <Tag color={statusInfo(selectedBook.status).color}>
                            {statusInfo(selectedBook.status).icon} {selectedBook.status_label || statusInfo(selectedBook.status).label}
                        </Tag>
                    </div>
                )}
                <Form form={statusForm} layout="vertical" onFinish={handleStatusChange}>
                    <Form.Item name="status" label="Status Baru" rules={[{ required: true, message: 'Pilih status' }]}>
                        <Select placeholder="Pilih status berikutnya"
                            options={selectedTransitions.map(t => ({
                                label: `${statusInfo(t.value).icon} ${t.label}`,
                                value: t.value,
                            }))} />
                    </Form.Item>

                    <Form.Item noStyle shouldUpdate>
                        {({ getFieldValue }) =>
                            getFieldValue('status') === 'revision' ? (
                                <Form.Item name="revision_notes" label="Catatan Revisi" rules={[{ required: true, message: 'Catatan revisi wajib diisi' }]}>
                                    <Input.TextArea rows={3} placeholder="Jelaskan apa yang perlu diperbaiki..." />
                                </Form.Item>
                            ) : null
                        }
                    </Form.Item>

                    <Form.Item name="notes" label="Catatan (opsional)">
                        <Input.TextArea rows={2} placeholder="Catatan perubahan status..." />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Detail Drawer */}
            <Drawer title={selectedBook?.title || 'Detail Naskah'} open={detailDrawer} onClose={() => { setDetailDrawer(false); setDetailData(null); }} width={520}
                extra={selectedBook?.allowed_transitions && selectedBook.allowed_transitions.length > 0 && (
                    <Button type="primary" size="small" icon={<SwapOutlined />} onClick={() => openStatusChange(selectedBook!)}>Ubah Status</Button>
                )}>
                {detailData && (
                    <div>
                        <Card size="small" style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <Tag color={statusInfo(detailData.status).color} style={{ fontSize: 14, padding: '4px 12px' }}>
                                    {statusInfo(detailData.status).icon} {detailData.status_label || statusInfo(detailData.status).label}
                                </Tag>
                                <Text type="secondary">{detailData.tracking_code}</Text>
                            </div>
                            <Progress percent={detailData.progress || 0} strokeColor={detailData.progress === 100 ? '#52c41a' : '#1677ff'} />
                        </Card>

                        <Descriptions column={1} bordered size="small" style={{ marginBottom: 16 }}>
                            <Descriptions.Item label="Judul">{detailData.title}</Descriptions.Item>
                            <Descriptions.Item label="Klien/Penulis">{detailData.author?.name || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Harga">{detailData.price ? `Rp ${Number(detailData.price).toLocaleString('id-ID')}` : '-'}</Descriptions.Item>
                            <Descriptions.Item label="Stok">{detailData.stock ?? 0}</Descriptions.Item>
                            {detailData.page_count && <Descriptions.Item label="Halaman">{detailData.page_count}</Descriptions.Item>}
                            {detailData.size && <Descriptions.Item label="Ukuran">{detailData.size}</Descriptions.Item>}
                        </Descriptions>

                        {detailData.revision_notes && (
                            <Card title="Catatan Revisi" size="small" style={{ marginBottom: 16, borderColor: '#ff4d4f' }}>
                                <Text>{detailData.revision_notes}</Text>
                            </Card>
                        )}

                        {detailData.status_logs && detailData.status_logs.length > 0 && (
                            <Card title="Riwayat Status" size="small">
                                <Timeline items={detailData.status_logs.map((log) => ({
                                    color: statusInfo(log.to_status).color,
                                    children: (
                                        <div>
                                            <Text strong>{statusInfo(log.from_status).label || 'Baru'}</Text>
                                            <Text> → </Text>
                                            <Text strong>{statusInfo(log.to_status).label}</Text>
                                            <br />
                                            <Text type="secondary" style={{ fontSize: 11 }}>
                                                {log.changed_by || 'System'} · {log.created_at ? dayjs(log.created_at).format('DD MMM YYYY HH:mm') : ''}
                                            </Text>
                                            {log.notes && <><br /><Text style={{ fontSize: 12 }}>{log.notes}</Text></>}
                                        </div>
                                    ),
                                }))} />
                            </Card>
                        )}
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default NaskahCetakPage;
