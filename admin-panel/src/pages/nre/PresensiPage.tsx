import React, { useEffect, useState } from 'react';
import { Table, Tag, DatePicker, Space, Card, Typography, Button, message, Statistic, Row, Col } from 'antd';
import { ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import api from '../../api';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface Attendance {
    id: number;
    user_id: number;
    user?: { name: string };
    employee_name?: string;
    check_in: string;
    check_out: string | null;
    status: string;
    work_hours?: number;
    date: string;
    location_in?: string;
}

const PresensiPage: React.FC = () => {
    const [data, setData] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params: Record<string, string> = {};
            if (dateRange) {
                params.start_date = dateRange[0].format('YYYY-MM-DD');
                params.end_date = dateRange[1].format('YYYY-MM-DD');
            }
            const res = await api.get('/attendance/history', { params });
            const list = res.data.data || res.data || [];
            setData(Array.isArray(list) ? list : []);
        } catch {
            message.error('Gagal memuat data presensi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const stats = {
        total: data.length,
        hadir: data.filter(d => d.status === 'PRESENT' || d.check_in).length,
        terlambat: data.filter(d => d.status === 'LATE').length,
        absen: data.filter(d => d.status === 'ABSENT').length,
    };

    const columns = [
        { title: 'Tanggal', dataIndex: 'date', key: 'date', render: (v: string) => dayjs(v).format('DD MMM YYYY'), sorter: (a: Attendance, b: Attendance) => dayjs(a.date).unix() - dayjs(b.date).unix() },
        { title: 'Nama', key: 'name', render: (_: unknown, r: Attendance) => r.user?.name || r.employee_name || '-' },
        { title: 'Check In', dataIndex: 'check_in', key: 'check_in', render: (v: string) => v ? dayjs(v).format('HH:mm') : '-' },
        { title: 'Check Out', dataIndex: 'check_out', key: 'check_out', render: (v: string | null) => v ? dayjs(v).format('HH:mm') : '-' },
        { title: 'Jam Kerja', dataIndex: 'work_hours', key: 'work_hours', render: (v: number) => v ? `${v.toFixed(1)} jam` : '-' },
        {
            title: 'Status', dataIndex: 'status', key: 'status',
            render: (v: string) => {
                const colors: Record<string, string> = { PRESENT: 'green', LATE: 'orange', ABSENT: 'red', LEAVE: 'blue' };
                return <Tag color={colors[v] || 'default'}>{v}</Tag>;
            },
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0 }}>Data Presensi</Title>
                <Space>
                    <RangePicker onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)} />
                    <Button icon={<ReloadOutlined />} onClick={fetchData}>Refresh</Button>
                </Space>
            </div>

            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}><Card><Statistic title="Total Record" value={stats.total} /></Card></Col>
                <Col span={6}><Card><Statistic title="Hadir" value={stats.hadir} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} /></Card></Col>
                <Col span={6}><Card><Statistic title="Terlambat" value={stats.terlambat} valueStyle={{ color: '#faad14' }} /></Card></Col>
                <Col span={6}><Card><Statistic title="Absen" value={stats.absen} prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />} /></Card></Col>
            </Row>

            <Card>
                <Table columns={columns} dataSource={data} rowKey="id" loading={loading} pagination={{ pageSize: 20, showSizeChanger: true }} />
            </Card>
        </div>
    );
};

export default PresensiPage;
