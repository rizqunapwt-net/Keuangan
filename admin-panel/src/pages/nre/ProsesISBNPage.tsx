import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Card, Typography, message, Select, Input, Space, Statistic, Row, Col, Drawer, Descriptions, Progress, Timeline } from 'antd';
import { ReloadOutlined, SearchOutlined, EyeOutlined, FileTextOutlined, CheckCircleOutlined, SyncOutlined, ClockCircleOutlined } from '@ant-design/icons';
import api from '../../api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface BookRecord {
    id: number;
    title: string;
    isbn?: string;
    tracking_code?: string;
    author?: { id: number; name: string };
    author_name?: string;
    price?: number;
    stock?: number;
    status: string;
    status_label?: string;
    progress?: number;
    page_count?: number;
    size?: string;
    published_year?: number;
    status_logs?: { id: number; from_status: string; to_status: string; changed_by?: string; notes?: string; created_at?: string }[];
    created_at?: string;
    updated_at?: string;
}

const ISBN_STATUSES = [
    { value: 'isbn_process', label: 'Proses ISBN', color: '#f5222d' },
    { value: 'production', label: 'Cetak', color: '#2f54eb' },
    { value: 'warehouse', label: 'Stok Gudang', color: '#52c41a' },
    { value: 'published', label: 'Terbit & Jual', color: '#52c41a' },
];

const statusInfo = (val: string) => {
    const found = ISBN_STATUSES.find(s => s.value === val);
    if (found) return found;
    const allMap: Record<string, { label: string; color: string }> = {
        draft: { label: 'Draft', color: '#8c8c8c' },
        incoming: { label: 'Naskah Masuk', color: '#1890ff' },
        review: { label: 'Review', color: '#fa8c16' },
        editorial: { label: 'Editing & Layout', color: '#1677ff' },
        covering: { label: 'Desain Cover', color: '#722ed1' },
        approving: { label: 'Approval', color: '#eb2f96' },
        surat_pernyataan: { label: 'Surat Pernyataan', color: '#13c2c2' },
        revision: { label: 'Revisi', color: '#ff4d4f' },
        archived: { label: 'Arsip', color: '#8c8c8c' },
    };
    return allMap[val] || { label: val, color: '#8c8c8c' };
};

const ProsesISBNPage: React.FC = () => {
    const [data, setData] = useState<BookRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
    const [detailDrawer, setDetailDrawer] = useState(false);
    const [detailData, setDetailData] = useState<BookRecord | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params: Record<string, string> = {};
            if (statusFilter) params.status = statusFilter;
            const res = await api.get('/books/isbn-tracking', { params });
            const list = res.data.data || res.data || [];
            setData(Array.isArray(list) ? list : []);
        } catch {
            message.info('API belum tersedia');
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [statusFilter]);

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
            title: 'Penulis', key: 'author', width: 180,
            render: (_: unknown, r: BookRecord) => <Text>{getAuthorName(r)}</Text>,
        },
        {
            title: 'ISBN', dataIndex: 'isbn', key: 'isbn', width: 150,
            render: (v: string) => v ? <Text code>{v}</Text> : <Tag color="warning">Belum ada</Tag>,
        },
        {
            title: 'Status', key: 'status', width: 140,
            render: (_: unknown, r: BookRecord) => {
                const si = statusInfo(r.status);
                return <Tag color={si.color}>{r.status_label || si.label}</Tag>;
            },
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
    const inIsbn = data.filter(b => b.status === 'isbn_process').length;
    const inProduction = data.filter(b => b.status === 'production').length;
    const published = data.filter(b => b.status === 'published' || b.status === 'warehouse').length;

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <Title level={4} style={{ margin: '0 0 12px 0' }}>Proses ISBN</Title>
                <Space wrap>
                    <Select placeholder="Filter Status" allowClear style={{ width: 180 }}
                        options={ISBN_STATUSES.map(s => ({ label: s.label, value: s.value }))}
                        onChange={v => setStatusFilter(v)} />
                    <Input placeholder="Cari buku/ISBN..." prefix={<SearchOutlined />} value={search}
                        onChange={e => setSearch(e.target.value)} style={{ width: 220 }} />
                    <Button icon={<ReloadOutlined />} onClick={fetchData}>Refresh</Button>
                </Space>
            </div>

            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}><Card size="small"><Statistic title="Total" value={total} prefix={<FileTextOutlined />} /></Card></Col>
                <Col span={6}><Card size="small"><Statistic title="Proses ISBN" value={inIsbn} valueStyle={{ color: '#f5222d' }} prefix={<SyncOutlined />} /></Card></Col>
                <Col span={6}><Card size="small"><Statistic title="Cetak" value={inProduction} valueStyle={{ color: '#2f54eb' }} prefix={<ClockCircleOutlined />} /></Card></Col>
                <Col span={6}><Card size="small"><Statistic title="Terbit" value={published} valueStyle={{ color: '#52c41a' }} prefix={<CheckCircleOutlined />} /></Card></Col>
            </Row>

            <Card>
                <Table columns={columns} dataSource={filtered} rowKey="id" loading={loading}
                    pagination={{ pageSize: 15, showTotal: (t) => `${t} buku` }}
                    scroll={{ x: 900 }} />
            </Card>

            {/* Detail Drawer */}
            <Drawer title={detailData?.title || 'Detail ISBN'} open={detailDrawer}
                onClose={() => { setDetailDrawer(false); setDetailData(null); }} width={520}>
                {detailData && (
                    <div>
                        <Card size="small" style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <Tag color={statusInfo(detailData.status).color} style={{ fontSize: 14, padding: '4px 12px' }}>
                                    {detailData.status_label || statusInfo(detailData.status).label}
                                </Tag>
                                <Text type="secondary">{detailData.tracking_code}</Text>
                            </div>
                            <Progress percent={detailData.progress || 0} strokeColor={detailData.progress === 100 ? '#52c41a' : '#1677ff'} />
                        </Card>

                        <Descriptions column={1} bordered size="small" style={{ marginBottom: 16 }}>
                            <Descriptions.Item label="Judul">{detailData.title}</Descriptions.Item>
                            <Descriptions.Item label="Penulis">{detailData.author?.name || '-'}</Descriptions.Item>
                            <Descriptions.Item label="ISBN">
                                {detailData.isbn ? <Text code copyable>{detailData.isbn}</Text> : <Tag color="warning">Belum ada ISBN</Tag>}
                            </Descriptions.Item>
                            <Descriptions.Item label="Harga">{detailData.price ? `Rp ${Number(detailData.price).toLocaleString('id-ID')}` : '-'}</Descriptions.Item>
                            <Descriptions.Item label="Stok">{detailData.stock ?? 0}</Descriptions.Item>
                            {detailData.page_count && <Descriptions.Item label="Halaman">{detailData.page_count}</Descriptions.Item>}
                            {detailData.size && <Descriptions.Item label="Ukuran">{detailData.size}</Descriptions.Item>}
                            {detailData.published_year && <Descriptions.Item label="Tahun Terbit">{detailData.published_year}</Descriptions.Item>}
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

export default ProsesISBNPage;
