import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Card, Typography, message, Select, Input, Space, Statistic, Row, Col, Drawer, Descriptions, Progress, Timeline } from 'antd';
import { ReloadOutlined, SearchOutlined, EyeOutlined, FileTextOutlined, PrinterOutlined, BookOutlined, InboxOutlined } from '@ant-design/icons';
import api from '../../api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface BookRecord {
    id: number;
    type: string;
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
    surat_status?: string;
    revision_notes?: string;
    published_year?: number;
    page_count?: number;
    size?: string;
    files?: { id: number; file_type: string; file_path: string; original_name: string; created_at?: string }[];
    status_logs?: { id: number; from_status: string; to_status: string; changed_by?: string; notes?: string; created_at?: string }[];
    created_at?: string;
    updated_at?: string;
}

// Combined statuses from both publishing and printing
const ALL_STATUSES = [
    { value: 'draft', label: 'Draft', color: '#8c8c8c' },
    { value: 'incoming', label: 'Naskah Masuk', color: '#1890ff' },
    { value: 'review', label: 'Review', color: '#fa8c16' },
    { value: 'editorial', label: 'Editing & Layout', color: '#1677ff' },
    { value: 'covering', label: 'Desain Cover', color: '#722ed1' },
    { value: 'approving', label: 'Approval', color: '#eb2f96' },
    { value: 'surat_pernyataan', label: 'Surat Pernyataan', color: '#13c2c2' },
    { value: 'isbn_process', label: 'Proses ISBN', color: '#f5222d' },
    { value: 'production', label: 'Cetak', color: '#2f54eb' },
    { value: 'warehouse', label: 'Stok Gudang', color: '#52c41a' },
    { value: 'published', label: 'Terbit & Jual', color: '#52c41a' },
    { value: 'done', label: 'Selesai', color: '#52c41a' },
    { value: 'revision', label: 'Revisi', color: '#ff4d4f' },
    { value: 'archived', label: 'Arsip Lama', color: '#8c8c8c' },
];

const statusInfo = (val: string) => ALL_STATUSES.find(s => s.value === val) || { label: val, color: '#8c8c8c' };

const TYPE_MAP: Record<string, { label: string; color: string }> = {
    publishing: { label: 'Penerbitan', color: 'blue' },
    printing: { label: 'Pencetakan', color: 'orange' },
};

const ManajemenBukuPage: React.FC = () => {
    const [data, setData] = useState<BookRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
    const [detailDrawer, setDetailDrawer] = useState(false);
    const [detailData, setDetailData] = useState<BookRecord | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params: Record<string, string> = {};
            if (typeFilter) params.type = typeFilter;
            if (statusFilter) params.status = statusFilter;
            const res = await api.get('/books', { params });
            const list = res.data.data || res.data || [];
            setData(Array.isArray(list) ? list : []);
        } catch {
            message.info('API belum tersedia');
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [typeFilter, statusFilter]);

    const loadDetail = async (id: number) => {
        try {
            const res = await api.get(`/books/${id}`);
            setDetailData(res.data.data || res.data);
        } catch { /* ignore */ }
    };

    const openDetail = async (book: BookRecord) => {
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
            title: 'Judul', dataIndex: 'title', key: 'title',
            sorter: (a: BookRecord, b: BookRecord) => a.title.localeCompare(b.title),
            render: (v: string, r: BookRecord) => (
                <a onClick={() => openDetail(r)} style={{ fontWeight: 500 }}>{v}</a>
            ),
        },
        {
            title: 'Penulis', key: 'author', width: 160,
            render: (_: unknown, r: BookRecord) => <Text>{getAuthorName(r)}</Text>,
        },
        {
            title: 'ISBN', dataIndex: 'isbn', key: 'isbn', width: 140,
            render: (v: string) => v || <Text type="secondary">-</Text>,
        },
        {
            title: 'Sumber', key: 'type', width: 110,
            render: (_: unknown, r: BookRecord) => {
                const t = TYPE_MAP[r.type] || TYPE_MAP.publishing;
                return <Tag color={t.color}>{t.label}</Tag>;
            },
        },
        {
            title: 'Status', key: 'status', width: 150,
            render: (_: unknown, r: BookRecord) => {
                const si = statusInfo(r.status);
                return <Tag color={si.color}>{r.status_label || si.label}</Tag>;
            },
        },
        {
            title: 'Stok', dataIndex: 'stock', key: 'stock', width: 70,
            render: (v: number) => v ?? 0,
        },
        {
            title: 'Progress', key: 'progress', width: 110,
            render: (_: unknown, r: BookRecord) => (
                <Progress percent={r.progress || 0} size="small" strokeColor={r.progress === 100 ? '#52c41a' : '#1677ff'} />
            ),
        },
        {
            title: 'Aksi', key: 'actions', width: 60,
            render: (_: unknown, r: BookRecord) => (
                <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => openDetail(r)} />
            ),
        },
    ];

    const filtered = data.filter(b => {
        if (!search) return true;
        const s = search.toLowerCase();
        return b.title.toLowerCase().includes(s) ||
            getAuthorName(b).toLowerCase().includes(s) ||
            (b.isbn || '').toLowerCase().includes(s) ||
            (b.tracking_code || '').toLowerCase().includes(s);
    });

    const total = data.length;
    const publishingCount = data.filter(b => (b.type || 'publishing') === 'publishing').length;
    const printingCount = data.filter(b => b.type === 'printing').length;
    const totalStock = data.reduce((sum, b) => sum + (b.stock || 0), 0);

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <Title level={4} style={{ margin: '0 0 12px 0' }}>Manajemen Buku</Title>
                <Space wrap>
                    <Select placeholder="Sumber" allowClear style={{ width: 150 }}
                        options={[
                            { label: 'Penerbitan', value: 'publishing' },
                            { label: 'Pencetakan', value: 'printing' },
                        ]}
                        onChange={v => setTypeFilter(v)} />
                    <Select placeholder="Status" allowClear style={{ width: 180 }}
                        options={ALL_STATUSES.map(s => ({ label: s.label, value: s.value }))}
                        onChange={v => setStatusFilter(v)} />
                    <Input placeholder="Cari buku..." prefix={<SearchOutlined />} value={search}
                        onChange={e => setSearch(e.target.value)} style={{ width: 220 }} />
                    <Button icon={<ReloadOutlined />} onClick={fetchData}>Refresh</Button>
                </Space>
            </div>

            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}><Card size="small"><Statistic title="Total Buku" value={total} prefix={<BookOutlined />} /></Card></Col>
                <Col span={6}><Card size="small"><Statistic title="Penerbitan" value={publishingCount} valueStyle={{ color: '#1677ff' }} prefix={<FileTextOutlined />} /></Card></Col>
                <Col span={6}><Card size="small"><Statistic title="Pencetakan" value={printingCount} valueStyle={{ color: '#fa8c16' }} prefix={<PrinterOutlined />} /></Card></Col>
                <Col span={6}><Card size="small"><Statistic title="Total Stok" value={totalStock} valueStyle={{ color: '#52c41a' }} prefix={<InboxOutlined />} /></Card></Col>
            </Row>

            <Card>
                <Table columns={columns} dataSource={filtered} rowKey="id" loading={loading}
                    pagination={{ pageSize: 15, showTotal: (t) => `${t} buku` }}
                    scroll={{ x: 1000 }} />
            </Card>

            {/* Detail Drawer (read-only) */}
            <Drawer title={detailData?.title || 'Detail Buku'} open={detailDrawer}
                onClose={() => { setDetailDrawer(false); setDetailData(null); }} width={520}>
                {detailData && (
                    <div>
                        <Card size="small" style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <Space>
                                    <Tag color={statusInfo(detailData.status).color} style={{ fontSize: 14, padding: '4px 12px' }}>
                                        {detailData.status_label || statusInfo(detailData.status).label}
                                    </Tag>
                                    <Tag color={TYPE_MAP[detailData.type]?.color || 'blue'}>
                                        {TYPE_MAP[detailData.type]?.label || 'Penerbitan'}
                                    </Tag>
                                </Space>
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
                            <Descriptions.Item label="Sumber">{TYPE_MAP[detailData.type]?.label || 'Penerbitan'}</Descriptions.Item>
                            {detailData.page_count && <Descriptions.Item label="Halaman">{detailData.page_count}</Descriptions.Item>}
                            {detailData.size && <Descriptions.Item label="Ukuran">{detailData.size}</Descriptions.Item>}
                        </Descriptions>

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

export default ManajemenBukuPage;
