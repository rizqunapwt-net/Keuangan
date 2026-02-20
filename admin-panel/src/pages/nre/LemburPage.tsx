import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Space, Card, Typography, message, Select } from 'antd';
import { ReloadOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import api from '../../api';
import dayjs from 'dayjs';

const { Title } = Typography;

interface OvertimeRequest {
    id: number;
    user_id: number;
    user?: { name: string };
    employee_name?: string;
    date: string;
    start_time: string;
    end_time: string;
    hours: number;
    reason: string;
    status: string;
    created_at: string;
}

const LemburPage: React.FC = () => {
    const [data, setData] = useState<OvertimeRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/overtime-requests');
            const list = res.data.data || res.data || [];
            setData(Array.isArray(list) ? list : []);
        } catch {
            message.error('Gagal memuat data lembur');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const updateStatus = async (id: number, status: string) => {
        try {
            await api.patch(`/overtime-requests/${id}/status`, { status });
            message.success(`Lembur berhasil di-${status === 'APPROVED' ? 'setujui' : 'tolak'}`);
            fetchData();
        } catch {
            message.error('Gagal mengubah status lembur');
        }
    };

    const columns = [
        { title: 'Nama', key: 'name', render: (_: unknown, r: OvertimeRequest) => r.user?.name || r.employee_name || '-' },
        { title: 'Tanggal', dataIndex: 'date', key: 'date', render: (v: string) => dayjs(v).format('DD MMM YYYY') },
        { title: 'Waktu', key: 'time', render: (_: unknown, r: OvertimeRequest) => `${r.start_time || '-'} - ${r.end_time || '-'}` },
        { title: 'Durasi', dataIndex: 'hours', key: 'hours', render: (v: number) => v ? `${v} jam` : '-' },
        { title: 'Alasan', dataIndex: 'reason', key: 'reason', ellipsis: true },
        {
            title: 'Status', dataIndex: 'status', key: 'status',
            render: (v: string) => <Tag color={v === 'APPROVED' ? 'green' : v === 'REJECTED' ? 'red' : 'orange'}>{v}</Tag>,
        },
        {
            title: 'Aksi', key: 'action', width: 150,
            render: (_: unknown, r: OvertimeRequest) => r.status === 'PENDING' ? (
                <Space>
                    <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => updateStatus(r.id, 'APPROVED')}>Setuju</Button>
                    <Button size="small" danger icon={<CloseOutlined />} onClick={() => updateStatus(r.id, 'REJECTED')}>Tolak</Button>
                </Space>
            ) : null,
        },
    ];

    const filtered = statusFilter ? data.filter(d => d.status === statusFilter) : data;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0 }}>Data Lembur</Title>
                <Space>
                    <Select placeholder="Filter Status" allowClear style={{ width: 150 }} onChange={setStatusFilter}
                        options={[{ value: 'PENDING', label: 'Pending' }, { value: 'APPROVED', label: 'Disetujui' }, { value: 'REJECTED', label: 'Ditolak' }]} />
                    <Button icon={<ReloadOutlined />} onClick={fetchData}>Refresh</Button>
                </Space>
            </div>
            <Card>
                <Table columns={columns} dataSource={filtered} rowKey="id" loading={loading} pagination={{ pageSize: 15, showSizeChanger: true }} />
            </Card>
        </div>
    );
};

export default LemburPage;
