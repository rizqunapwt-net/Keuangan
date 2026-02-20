import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Card, Typography, message, Modal, Form, Select, Input, InputNumber, Space, Statistic, Row, Col, Drawer, Descriptions, Progress, Timeline, Tooltip, Badge } from 'antd';
import { ReloadOutlined, PlusOutlined, SearchOutlined, EyeOutlined, SwapOutlined, FileTextOutlined, PrinterOutlined, CheckCircleOutlined, CloseCircleOutlined, LinkOutlined, ArrowRightOutlined } from '@ant-design/icons';
import api from '../../api';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

interface BookRecord {
    id: number;
    title: string;
    isbn?: string;
    tracking_code?: string;
    author?: { id: number; name: string };
    author_name?: string;
    description?: string;
    price?: number;
    stock?: number;
    status: string;
    status_label?: string;
    progress?: number;
    cover_path?: string;
    cover_file_path?: string;
    gdrive_link?: string;
    surat_scan_path?: string;
    surat_status?: string;
    revision_notes?: string;
    published_year?: number;
    page_count?: number;
    size?: string;
    allowed_transitions?: { value: string; label: string }[];
    files_count?: number;
    print_orders_count?: number;
    files?: { id: number; file_type: string; file_type_label?: string; file_path: string; original_name: string; file_size?: number; uploaded_by?: string; notes?: string; created_at?: string }[];
    status_logs?: { id: number; from_status: string; to_status: string; changed_by?: string; notes?: string; created_at?: string }[];
    print_orders?: { id: number; order_number?: string; vendor_name?: string; quantity?: number; total_cost?: number; status?: string; ordered_at?: string; expected_delivery?: string }[];
    created_at?: string;
    updated_at?: string;
}

// 8-step publishing workflow pipeline
const WORKFLOW_STEPS = [
    { value: 'incoming', label: '1. Naskah Masuk', color: '#1890ff', icon: '📥' },
    { value: 'review', label: '2. Review', color: '#fa8c16', icon: '🔍' },
    { value: 'editorial', label: '3. Editing & Layout', color: '#1677ff', icon: '✏️' },
    { value: 'covering', label: '4. Desain Cover', color: '#722ed1', icon: '🎨' },
    { value: 'approving', label: '5. Approval', color: '#eb2f96', icon: '✅' },
    { value: 'surat_pernyataan', label: '6. Surat Pernyataan', color: '#13c2c2', icon: '📝' },
    { value: 'isbn_process', label: '7. Proses ISBN', color: '#f5222d', icon: '🔢' },
    { value: 'production', label: '8. Cetak', color: '#2f54eb', icon: '🖨️' },
];

const ALL_STATUSES = [
    ...WORKFLOW_STEPS,
    { value: 'draft', label: 'Draft', color: '#8c8c8c', icon: '📄' },
    { value: 'revision', label: 'Revisi Penulis', color: '#ff4d4f', icon: '↩️' },
    { value: 'warehouse', label: 'Stok Gudang', color: '#52c41a', icon: '📦' },
    { value: 'published', label: 'Terbit & Jual', color: '#52c41a', icon: '✨' },
    { value: 'archived', label: 'Arsip Lama', color: '#8c8c8c', icon: '🗄️' },
];

const statusInfo = (val: string) => ALL_STATUSES.find(s => s.value === val) || { label: val, color: '#8c8c8c', icon: '❓' };

const SURAT_STATUS_MAP: Record<string, { label: string; color: string }> = {
    belum_kirim: { label: 'Belum Kirim Link', color: 'default' },
    link_terkirim: { label: 'Link Terkirim', color: 'processing' },
    sudah_ttd: { label: 'Sudah Ditandatangani', color: 'warning' },
    scan_diterima: { label: 'Scan Diterima', color: 'success' },
};

const NaskahPenerbitanPage: React.FC = () => {
    const [data, setData] = useState<BookRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
    const [addModal, setAddModal] = useState(false);
    const [statusModal, setStatusModal] = useState(false);
    const [detailDrawer, setDetailDrawer] = useState(false);
    const [selectedBook, setSelectedBook] = useState<BookRecord | null>(null);
    const [authors, setAuthors] = useState<{ id: number; name: string }[]>([]);
    const [addForm] = Form.useForm();
    const [statusForm] = Form.useForm();
    const [detailData, setDetailData] = useState<BookRecord | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/books', { params: { type: 'publishing' } });
            const list = res.data.data || res.data || [];
            setData(Array.isArray(list) ? list : []);
        } catch {
            message.info('API belum tersedia');
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchAuthors = async () => {
        try {
            const res = await api.get('/authors');
            const list = res.data.data || res.data || [];
            setAuthors(Array.isArray(list) ? list.map((a: Record<string, unknown>) => ({ id: a.id as number, name: a.name as string })) : []);
        } catch { /* ignore */ }
    };

    useEffect(() => { fetchData(); }, []);

    const handleAdd = async (values: Record<string, unknown>) => {
        try {
            await api.post('/books', {
                ...values,
                type: 'publishing',
                status: 'incoming',
            });
            message.success('Naskah penerbitan berhasil ditambahkan');
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
            title: 'Penulis', key: 'author', width: 180,
            render: (_: unknown, r: BookRecord) => <Text>{getAuthorName(r)}</Text>,
        },
        {
            title: 'Status', key: 'status', width: 160,
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
            (b.isbn || '').toLowerCase().includes(search.toLowerCase()) ||
            (b.tracking_code || '').toLowerCase().includes(search.toLowerCase());
        const matchStatus = !statusFilter || b.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const total = data.length;
    const published = data.filter(b => b.status === 'published' || b.status === 'warehouse').length;
    const inProcess = data.filter(b => ['incoming', 'review', 'editorial', 'covering', 'approving', 'surat_pernyataan', 'isbn_process', 'production'].includes(b.status)).length;
    const revision = data.filter(b => b.status === 'revision').length;

    const stepCounts = WORKFLOW_STEPS.map(s => ({
        ...s,
        count: data.filter(b => b.status === s.value).length,
    }));

    const selectedTransitions = selectedBook?.allowed_transitions || [];

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <Title level={4} style={{ margin: '0 0 12px 0' }}>Naskah & Alur Kerja Penerbitan</Title>
                <Space wrap>
                    <Select placeholder="Filter Status" allowClear style={{ width: 180 }}
                        options={ALL_STATUSES.map(s => ({ label: `${s.icon} ${s.label}`, value: s.value }))}
                        onChange={v => setStatusFilter(v)} />
                    <Input placeholder="Cari buku..." prefix={<SearchOutlined />} value={search}
                        onChange={e => setSearch(e.target.value)} style={{ width: 220 }} />
                    <Button icon={<ReloadOutlined />} onClick={fetchData}>Refresh</Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => { fetchAuthors(); setAddModal(true); }}>
                        Naskah Baru
                    </Button>
                </Space>
            </div>

            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}><Card size="small"><Statistic title="Total Naskah" value={total} prefix={<FileTextOutlined />} /></Card></Col>
                <Col span={6}><Card size="small"><Statistic title="Terbit" value={published} valueStyle={{ color: '#52c41a' }} prefix={<CheckCircleOutlined />} /></Card></Col>
                <Col span={6}><Card size="small"><Statistic title="Dalam Proses" value={inProcess} valueStyle={{ color: '#1677ff' }} prefix={<PrinterOutlined />} /></Card></Col>
                <Col span={6}><Card size="small"><Statistic title="Revisi" value={revision} valueStyle={{ color: '#ff4d4f' }} prefix={<CloseCircleOutlined />} /></Card></Col>
            </Row>

            <Card size="small" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    {stepCounts.map((step, i) => (
                        <Tooltip key={step.value} title={`Klik untuk filter: ${step.label}`}>
                            <div
                                onClick={() => setStatusFilter(statusFilter === step.value ? undefined : step.value)}
                                style={{
                                    textAlign: 'center', cursor: 'pointer', padding: '8px 6px', borderRadius: 8, flex: 1, minWidth: 80,
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

            {/* Add Book Modal */}
            <Modal title="Naskah Penerbitan Baru" open={addModal} onCancel={() => setAddModal(false)} onOk={() => addForm.submit()} okText="Tambah Naskah" cancelText="Batal" width={520}>
                <Form form={addForm} layout="vertical" onFinish={handleAdd}>
                    <Form.Item name="title" label="Judul Buku" rules={[{ required: true, message: 'Wajib diisi' }]}>
                        <Input placeholder="Masukkan judul buku" />
                    </Form.Item>
                    <Form.Item name="author_id" label="Penulis" rules={[{ required: true, message: 'Pilih penulis' }]}>
                        <Select showSearch placeholder="Pilih penulis" optionFilterProp="label"
                            options={authors.map(a => ({ label: a.name, value: a.id }))} />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="isbn" label="ISBN">
                                <Input placeholder="978-xxx-xxx" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="price" label="Harga Jual (Rp)">
                                <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="description" label="Deskripsi">
                        <Input.TextArea rows={2} placeholder="Deskripsi singkat buku" />
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
                            {statusInfo(selectedBook.status).icon} {selectedBook.status_label}
                        </Tag>
                    </div>
                )}
                <Form form={statusForm} layout="vertical" onFinish={handleStatusChange}>
                    <Form.Item name="status" label="Status Baru" rules={[{ required: true, message: 'Pilih status' }]}>
                        <Select placeholder="Pilih status berikutnya"
                            options={selectedTransitions.map(t => ({
                                label: `${statusInfo(t.value).icon} ${t.label}`,
                                value: t.value,
                            }))}
                            onChange={() => statusForm.validateFields()} />
                    </Form.Item>

                    <Form.Item noStyle shouldUpdate>
                        {({ getFieldValue }) =>
                            getFieldValue('status') === 'surat_pernyataan' ? (
                                <Form.Item name="gdrive_link" label="Link Google Drive (Surat Pernyataan Keaslian)" rules={[{ required: true, message: 'Link GDrive wajib diisi' }, { type: 'url', message: 'URL tidak valid' }]}>
                                    <Input prefix={<LinkOutlined />} placeholder="https://drive.google.com/..." />
                                </Form.Item>
                            ) : null
                        }
                    </Form.Item>

                    <Form.Item noStyle shouldUpdate>
                        {({ getFieldValue }) =>
                            getFieldValue('status') === 'revision' ? (
                                <Form.Item name="revision_notes" label="Catatan Revisi untuk Penulis" rules={[{ required: true, message: 'Catatan revisi wajib diisi' }]}>
                                    <Input.TextArea rows={3} placeholder="Jelaskan apa yang perlu diperbaiki oleh penulis..." />
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
                                    {statusInfo(detailData.status).icon} {detailData.status_label}
                                </Tag>
                                <Text type="secondary">{detailData.tracking_code}</Text>
                            </div>
                            <Progress percent={detailData.progress || 0} strokeColor={detailData.progress === 100 ? '#52c41a' : '#1677ff'} />
                        </Card>

                        <Descriptions column={1} bordered size="small" style={{ marginBottom: 16 }}>
                            <Descriptions.Item label="Judul">{detailData.title}</Descriptions.Item>
                            <Descriptions.Item label="Penulis">{detailData.author?.name || '-'}</Descriptions.Item>
                            <Descriptions.Item label="ISBN">{detailData.isbn || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Harga">{detailData.price ? `Rp ${Number(detailData.price).toLocaleString('id-ID')}` : '-'}</Descriptions.Item>
                            <Descriptions.Item label="Stok">{detailData.stock ?? 0}</Descriptions.Item>
                        </Descriptions>

                        {(detailData.gdrive_link || detailData.status === 'surat_pernyataan') && (
                            <Card title="Surat Pernyataan Keaslian" size="small" style={{ marginBottom: 16 }}>
                                {detailData.gdrive_link && (
                                    <div style={{ marginBottom: 8 }}>
                                        <Text type="secondary">Link GDrive: </Text>
                                        <a href={detailData.gdrive_link} target="_blank" rel="noopener noreferrer">
                                            <LinkOutlined /> Buka Link
                                        </a>
                                    </div>
                                )}
                                <div>
                                    <Text type="secondary">Status: </Text>
                                    <Tag color={SURAT_STATUS_MAP[detailData.surat_status || '']?.color || 'default'}>
                                        {SURAT_STATUS_MAP[detailData.surat_status || '']?.label || 'Belum Diproses'}
                                    </Tag>
                                </div>
                                <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 8 }}>
                                    Penulis mengunduh surat, cetak, tanda tangan di atas materai, scan, lalu kirim balik ke penerbit.
                                </Paragraph>
                            </Card>
                        )}

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
                                            <Text strong>{statusInfo(log.from_status).label}</Text>
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

export default NaskahPenerbitanPage;
