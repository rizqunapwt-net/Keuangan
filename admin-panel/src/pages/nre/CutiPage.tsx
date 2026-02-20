import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Space, Card, Typography, message, Modal, Select } from 'antd';
import { ReloadOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import api from '../../api';
import dayjs from 'dayjs';

const { Title } = Typography;

interface LeaveRequest {
    id: number;
    user_id: number;
    user?: { name: string };
    employee_name?: string;
    leave_type: string;
    start_date: string;
    end_date: string;
    reason: string;
    status: string;
    created_at: string;
}

const CutiPage: React.FC = () => {
    const [data, setData] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/leave-requests');
            const list = res.data.data || res.data || [];
            setData(Array.isArray(list) ? list : []);
        } catch {
            message.error('Gagal memuat data cuti');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const updateStatus = async (id: number, status: string) => {
        Modal.confirm({
            title: `${status === 'APPROVED' ? 'Setujui' : 'Tolak'} pengajuan cuti?`,
            onOk: async () => {
                try {
                    await api.patch(`/leave-requests/${id}/status`, { status });
                    message.success(`Cuti berhasil di-${status === 'APPROVED' ? 'setujui' : 'tolak'}`);
                    fetchData();
                } catch {
                    message.error('Gagal mengubah status cuti');
                }
            },
        });
    };

    const columns = [
        { title: 'Nama', key: 'name', render: (_: unknown, r: LeaveRequest) => r.user?.name || r.employee_name || '-' },
        { title: 'Tipe', dataIndex: 'leave_type', key: 'leave_type', render: (v: string) => <Tag>{v}</Tag> },
        { title: 'Mulai', dataIndex: 'start_date', key: 'start_date', render: (v: string) => dayjs(v).format('DD MMM YYYY') },
        { title: 'Selesai', dataIndex: 'end_date', key: 'end_date', render: (v: string) => dayjs(v).format('DD MMM YYYY') },
        { title: 'Alasan', dataIndex: 'reason', key: 'reason', ellipsis: true },
        {
            title: 'Status', dataIndex: 'status', key: 'status',
            render: (v: string) => {
                const colors: Record<string, string> = { PENDING: 'orange', APPROVED: 'green', REJECTED: 'red' };
                return <Tag color={colors[v] || 'default'}>{v}</Tag>;
            },
        },
        { title: 'Diajukan', dataIndex: 'created_at', key: 'created_at', render: (v: string) => dayjs(v).format('DD MMM YYYY HH:mm') },
        {
            title: 'Aksi', key: 'action', width: 150,
            render: (_: unknown, r: LeaveRequest) => r.status === 'PENDING' ? (
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
                <Title level={4} style={{ margin: 0 }}>Pengajuan Cuti</Title>
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

export default CutiPage;
