import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Card, Typography, message, Modal, Form, Select, Input, InputNumber, DatePicker, Space, Statistic, Row, Col, Drawer, Descriptions, Popconfirm, Tooltip } from 'antd';
import { ReloadOutlined, PlusOutlined, SearchOutlined, CheckCircleOutlined, CloseCircleOutlined, EditOutlined, EyeOutlined, FileTextOutlined, CalendarOutlined } from '@ant-design/icons';
import api from '../../api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface Contract {
    id: number;
    book_id?: number;
    contract_number?: string;
    contract_file_path?: string;
    author?: { id: number; name: string } | string;
    author_name?: string;
    book?: { id: number; title: string } | string;
    book_title?: string;
    start_date: string;
    end_date: string;
    royalty_percentage?: number;
    status: string;
    approved_by?: number;
    approver_name?: string;
    approved_at?: string;
    rejected_reason?: string;
    created_by?: number;
    creator_name?: string;
    created_at?: string;
}

interface BookOption { id: number; title: string; author_name?: string; }

const STATUS_MAP: Record<string, { label: string; color: string }> = {
    pending: { label: 'Menunggu', color: 'orange' },
    approved: { label: 'Disetujui', color: 'green' },
    rejected: { label: 'Ditolak', color: 'red' },
    expired: { label: 'Kedaluwarsa', color: 'default' },
};

const KontrakPage: React.FC = () => {
    const [data, setData] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
    const [addModal, setAddModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [detailDrawer, setDetailDrawer] = useState(false);
    const [rejectModal, setRejectModal] = useState(false);
    const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
    const [books, setBooks] = useState<BookOption[]>([]);
    const [addForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const [rejectForm] = Form.useForm();

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/contracts');
            const list = res.data.data || res.data || [];
            setData(Array.isArray(list) ? list : []);
        } catch {
            message.info('API Kontrak belum tersedia');
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchBooks = async () => {
        try {
            const res = await api.get('/books');
            const list = res.data.data || res.data || [];
            setBooks(Array.isArray(list) ? list.map((b: Record<string, unknown>) => ({
                id: b.id as number,
                title: b.title as string,
                author_name: (b.author as { name?: string })?.name || b.author_name as string || '',
            })) : []);
        } catch { /* ignore */ }
    };

    useEffect(() => { fetchData(); }, []);

    const handleAdd = async (values: Record<string, unknown>) => {
        try {
            const payload = {
                book_id: values.book_id,
                start_date: (values.start_date as dayjs.Dayjs).format('YYYY-MM-DD'),
                end_date: (values.end_date as dayjs.Dayjs).format('YYYY-MM-DD'),
                royalty_percentage: values.royalty_percentage,
            };
            await api.post('/contracts', payload);
            message.success('Kontrak berhasil ditambahkan');
            setAddModal(false);
            addForm.resetFields();
            fetchData();
        } catch (e: unknown) {
            const err = e as { response?: { data?: { message?: string } } };
            message.error(err.response?.data?.message || 'Gagal menambahkan kontrak');
        }
    };

    const handleEdit = async (values: Record<string, unknown>) => {
        if (!selectedContract) return;
        try {
            const payload: Record<string, unknown> = {};
            if (values.book_id) payload.book_id = values.book_id;
            if (values.start_date) payload.start_date = (values.start_date as dayjs.Dayjs).format('YYYY-MM-DD');
            if (values.end_date) payload.end_date = (values.end_date as dayjs.Dayjs).format('YYYY-MM-DD');
            if (values.royalty_percentage !== undefined) payload.royalty_percentage = values.royalty_percentage;
            await api.patch(`/contracts/${selectedContract.id}`, payload);
            message.success('Kontrak berhasil diperbarui');
            setEditModal(false);
            editForm.resetFields();
            fetchData();
        } catch (e: unknown) {
            const err = e as { response?: { data?: { message?: string } } };
            message.error(err.response?.data?.message || 'Gagal memperbarui kontrak');
        }
    };

    const handleApprove = async (id: number) => {
        try {
            await api.put(`/contracts/${id}/approve`);
            message.success('Kontrak berhasil disetujui');
            fetchData();
            if (detailDrawer) setDetailDrawer(false);
        } catch (e: unknown) {
            const err = e as { response?: { data?: { message?: string } } };
            message.error(err.response?.data?.message || 'Gagal menyetujui kontrak');
        }
    };

    const handleReject = async (values: { rejected_reason: string }) => {
        if (!selectedContract) return;
        try {
            await api.put(`/contracts/${selectedContract.id}/reject`, values);
            message.success('Kontrak berhasil ditolak');
            setRejectModal(false);
            rejectForm.resetFields();
            fetchData();
        } catch (e: unknown) {
            const err = e as { response?: { data?: { message?: string } } };
            message.error(err.response?.data?.message || 'Gagal menolak kontrak');
        }
    };

    const openEdit = (record: Contract) => {
        setSelectedContract(record);
        editForm.setFieldsValue({
            book_id: typeof record.book === 'object' ? record.book?.id : record.book_id,
            start_date: record.start_date ? dayjs(record.start_date) : null,
            end_date: record.end_date ? dayjs(record.end_date) : null,
            royalty_percentage: record.royalty_percentage,
        });
        fetchBooks();
        setEditModal(true);
    };

    const openDetail = (record: Contract) => {
        setSelectedContract(record);
        setDetailDrawer(true);
    };

    const openReject = (record: Contract) => {
        setSelectedContract(record);
        rejectForm.resetFields();
        setRejectModal(true);
    };

    const getBookTitle = (r: Contract) => (typeof r.book === 'object' ? r.book?.title : r.book) || r.book_title || '-';
    const getAuthorName = (r: Contract) => (typeof r.author === 'object' ? r.author?.name : r.author) || r.author_name || '-';

    const isExpired = (r: Contract) => r.end_date && dayjs(r.end_date).isBefore(dayjs(), 'day');

    const columns = [
        {
            title: 'Buku', key: 'book', width: 200,
            render: (_: unknown, r: Contract) => (
                <div>
                    <Text strong>{getBookTitle(r)}</Text>
                    <br /><Text type="secondary" style={{ fontSize: 12 }}>{getAuthorName(r)}</Text>
                </div>
            ),
        },
        {
            title: 'Periode', key: 'period',
            render: (_: unknown, r: Contract) => (
                <div>
                    <Text>{r.start_date ? dayjs(r.start_date).format('DD MMM YYYY') : '-'}</Text>
                    <Text type="secondary"> — </Text>
                    <Text type={isExpired(r) ? 'danger' : undefined}>
                        {r.end_date ? dayjs(r.end_date).format('DD MMM YYYY') : '-'}
                    </Text>
                    {isExpired(r) && r.status !== 'expired' && <Tag color="red" style={{ marginLeft: 4, fontSize: 10 }}>Expired</Tag>}
                </div>
            ),
        },
        {
            title: 'Royalti', dataIndex: 'royalty_percentage', key: 'royalty', width: 100,
            render: (v: number) => v ? <Tag color="blue">{v}%</Tag> : '-',
        },
        {
            title: 'Status', dataIndex: 'status', key: 'status', width: 130,
            render: (v: string) => {
                const s = STATUS_MAP[v] || { label: v?.toUpperCase() || 'N/A', color: 'default' };
                return <Tag color={s.color}>{s.label}</Tag>;
            },
            filters: Object.entries(STATUS_MAP).map(([k, v]) => ({ text: v.label, value: k })),
            onFilter: (value: unknown, record: Contract) => record.status === value,
        },
        {
            title: 'Aksi', key: 'actions', width: 180,
            render: (_: unknown, r: Contract) => (
                <Space size="small">
                    <Tooltip title="Detail"><Button type="text" size="small" icon={<EyeOutlined />} onClick={() => openDetail(r)} /></Tooltip>
                    {r.status === 'pending' && (
                        <>
                            <Tooltip title="Edit"><Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} /></Tooltip>
                            <Tooltip title="Setujui">
                                <Popconfirm title="Setujui kontrak ini?" onConfirm={() => handleApprove(r.id)}>
                                    <Button type="text" size="small" icon={<CheckCircleOutlined />} style={{ color: '#52c41a' }} />
                                </Popconfirm>
                            </Tooltip>
                            <Tooltip title="Tolak"><Button type="text" size="small" icon={<CloseCircleOutlined />} danger onClick={() => openReject(r)} /></Tooltip>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    const filtered = data.filter(c => {
        const matchSearch = !search ||
            getBookTitle(c).toLowerCase().includes(search.toLowerCase()) ||
            getAuthorName(c).toLowerCase().includes(search.toLowerCase());
        const matchStatus = !statusFilter || c.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const total = data.length;
    const pending = data.filter(c => c.status === 'pending').length;
    const approved = data.filter(c => c.status === 'approved').length;
    const expiredCount = data.filter(c => c.status === 'expired' || (c.status === 'approved' && isExpired(c))).length;

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <Title level={4} style={{ margin: '0 0 12px 0' }}>Manajemen Kontrak</Title>
                <Space wrap>
                    <Select placeholder="Filter Status" allowClear style={{ width: 160 }}
                        options={Object.entries(STATUS_MAP).map(([k, v]) => ({ label: v.label, value: k }))}
                        onChange={v => setStatusFilter(v)} />
                    <Input placeholder="Cari buku/penulis..." prefix={<SearchOutlined />} value={search}
                        onChange={e => setSearch(e.target.value)} style={{ width: 220 }} />
                    <Button icon={<ReloadOutlined />} onClick={fetchData}>Refresh</Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => { fetchBooks(); setAddModal(true); }}>
                        Buat Kontrak
                    </Button>
                </Space>
            </div>

            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}><Card size="small"><Statistic title="Total Kontrak" value={total} prefix={<FileTextOutlined />} /></Card></Col>
                <Col span={6}><Card size="small"><Statistic title="Menunggu" value={pending} valueStyle={{ color: '#fa8c16' }} prefix={<CalendarOutlined />} /></Card></Col>
                <Col span={6}><Card size="small"><Statistic title="Aktif" value={approved} valueStyle={{ color: '#52c41a' }} prefix={<CheckCircleOutlined />} /></Card></Col>
                <Col span={6}><Card size="small"><Statistic title="Kedaluwarsa" value={expiredCount} valueStyle={{ color: '#ff4d4f' }} prefix={<CloseCircleOutlined />} /></Card></Col>
            </Row>

            <Card>
                <Table columns={columns} dataSource={filtered} rowKey="id" loading={loading} pagination={{ pageSize: 15 }} />
            </Card>

            {/* Add Contract Modal */}
            <Modal title="Buat Kontrak Baru" open={addModal} onCancel={() => setAddModal(false)} onOk={() => addForm.submit()} okText="Buat Kontrak" cancelText="Batal" width={560}>
                <Form form={addForm} layout="vertical" onFinish={handleAdd}>
                    <Form.Item name="book_id" label="Buku" rules={[{ required: true, message: 'Pilih buku' }]}>
                        <Select showSearch placeholder="Pilih buku" optionFilterProp="label"
                            options={books.map(b => ({ label: `${b.title} — ${b.author_name || 'N/A'}`, value: b.id }))} />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="start_date" label="Tanggal Mulai" rules={[{ required: true, message: 'Wajib diisi' }]}>
                                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="end_date" label="Tanggal Berakhir" rules={[{ required: true, message: 'Wajib diisi' }]}>
                                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="royalty_percentage" label="Royalti (%)" rules={[{ required: true, message: 'Wajib diisi' }]}>
                        <InputNumber min={0} max={100} step={0.5} style={{ width: '100%' }} placeholder="Contoh: 10" addonAfter="%" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Edit Contract Modal */}
            <Modal title="Edit Kontrak" open={editModal} onCancel={() => setEditModal(false)} onOk={() => editForm.submit()} okText="Simpan" cancelText="Batal" width={560}>
                <Form form={editForm} layout="vertical" onFinish={handleEdit}>
                    <Form.Item name="book_id" label="Buku">
                        <Select showSearch placeholder="Pilih buku" optionFilterProp="label"
                            options={books.map(b => ({ label: `${b.title} — ${b.author_name || 'N/A'}`, value: b.id }))} />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="start_date" label="Tanggal Mulai">
                                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="end_date" label="Tanggal Berakhir">
                                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="royalty_percentage" label="Royalti (%)">
                        <InputNumber min={0} max={100} step={0.5} style={{ width: '100%' }} addonAfter="%" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Reject Modal */}
            <Modal title="Tolak Kontrak" open={rejectModal} onCancel={() => setRejectModal(false)} onOk={() => rejectForm.submit()} okText="Tolak Kontrak" okButtonProps={{ danger: true }} cancelText="Batal">
                <Form form={rejectForm} layout="vertical" onFinish={handleReject}>
                    <Form.Item name="rejected_reason" label="Alasan Penolakan" rules={[{ required: true, message: 'Wajib diisi' }]}>
                        <Input.TextArea rows={3} placeholder="Jelaskan alasan penolakan kontrak ini..." />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Detail Drawer */}
            <Drawer title="Detail Kontrak" open={detailDrawer} onClose={() => setDetailDrawer(false)} width={480}
                extra={selectedContract?.status === 'pending' && (
                    <Space>
                        <Popconfirm title="Setujui kontrak ini?" onConfirm={() => handleApprove(selectedContract!.id)}>
                            <Button type="primary" icon={<CheckCircleOutlined />} size="small">Setujui</Button>
                        </Popconfirm>
                        <Button danger icon={<CloseCircleOutlined />} size="small" onClick={() => openReject(selectedContract!)}>Tolak</Button>
                    </Space>
                )}>
                {selectedContract && (
                    <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label="Buku">{getBookTitle(selectedContract)}</Descriptions.Item>
                        <Descriptions.Item label="Penulis">{getAuthorName(selectedContract)}</Descriptions.Item>
                        <Descriptions.Item label="Status">
                            <Tag color={STATUS_MAP[selectedContract.status]?.color || 'default'}>
                                {STATUS_MAP[selectedContract.status]?.label || selectedContract.status}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Tanggal Mulai">
                            {selectedContract.start_date ? dayjs(selectedContract.start_date).format('DD MMMM YYYY') : '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tanggal Berakhir">
                            <Text type={isExpired(selectedContract) ? 'danger' : undefined}>
                                {selectedContract.end_date ? dayjs(selectedContract.end_date).format('DD MMMM YYYY') : '-'}
                            </Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Royalti">
                            {selectedContract.royalty_percentage ? `${selectedContract.royalty_percentage}%` : '-'}
                        </Descriptions.Item>
                        {selectedContract.approver_name && (
                            <Descriptions.Item label="Disetujui oleh">{selectedContract.approver_name}</Descriptions.Item>
                        )}
                        {selectedContract.approved_at && (
                            <Descriptions.Item label="Tanggal Persetujuan">
                                {dayjs(selectedContract.approved_at).format('DD MMMM YYYY HH:mm')}
                            </Descriptions.Item>
                        )}
                        {selectedContract.rejected_reason && (
                            <Descriptions.Item label="Alasan Penolakan">
                                <Text type="danger">{selectedContract.rejected_reason}</Text>
                            </Descriptions.Item>
                        )}
                        {selectedContract.creator_name && (
                            <Descriptions.Item label="Dibuat oleh">{selectedContract.creator_name}</Descriptions.Item>
                        )}
                        <Descriptions.Item label="Tanggal Dibuat">
                            {selectedContract.created_at ? dayjs(selectedContract.created_at).format('DD MMMM YYYY HH:mm') : '-'}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Drawer>
        </div>
    );
};

export default KontrakPage;
