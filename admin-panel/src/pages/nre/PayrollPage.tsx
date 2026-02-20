import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Typography, message, Tag, Statistic, Row, Col } from 'antd';
import { ReloadOutlined, DollarOutlined } from '@ant-design/icons';
import api from '../../api';
import dayjs from 'dayjs';

const { Title } = Typography;

interface Payroll {
    id: number;
    employee_id: number;
    employee?: { name: string };
    employee_name?: string;
    period: string;
    basic_salary: number;
    allowances: number;
    deductions: number;
    net_salary: number;
    status: string;
    paid_at?: string;
}

const PayrollNRE: React.FC = () => {
    const [data, setData] = useState<Payroll[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/payrolls');
            const list = res.data.data || res.data || [];
            setData(Array.isArray(list) ? list : []);
        } catch {
            message.error('Gagal memuat data payroll');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const fmt = (v: number) => `Rp ${(v || 0).toLocaleString('id-ID')}`;
    const totalNet = data.reduce((s, p) => s + (p.net_salary || 0), 0);

    const columns = [
        { title: 'Nama', key: 'name', render: (_: unknown, r: Payroll) => r.employee?.name || r.employee_name || '-' },
        { title: 'Periode', dataIndex: 'period', key: 'period', render: (v: string) => v ? dayjs(v).format('MMM YYYY') : '-' },
        { title: 'Gaji Pokok', dataIndex: 'basic_salary', key: 'basic_salary', render: fmt },
        { title: 'Tunjangan', dataIndex: 'allowances', key: 'allowances', render: fmt },
        { title: 'Potongan', dataIndex: 'deductions', key: 'deductions', render: fmt },
        { title: 'Gaji Bersih', dataIndex: 'net_salary', key: 'net_salary', render: (v: number) => <strong>{fmt(v)}</strong> },
        {
            title: 'Status', dataIndex: 'status', key: 'status',
            render: (v: string) => <Tag color={v === 'PAID' ? 'green' : v === 'GENERATED' ? 'blue' : 'orange'}>{v}</Tag>,
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0 }}>Payroll</Title>
                <Button icon={<ReloadOutlined />} onClick={fetchData}>Refresh</Button>
            </div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={8}><Card><Statistic title="Total Karyawan" value={data.length} /></Card></Col>
                <Col span={8}><Card><Statistic title="Total Gaji Bersih" value={fmt(totalNet)} prefix={<DollarOutlined />} /></Card></Col>
                <Col span={8}><Card><Statistic title="Sudah Dibayar" value={data.filter(p => p.status === 'PAID').length} valueStyle={{ color: '#52c41a' }} /></Card></Col>
            </Row>
            <Card>
                <Table columns={columns} dataSource={data} rowKey="id" loading={loading} pagination={{ pageSize: 20, showSizeChanger: true }} />
            </Card>
        </div>
    );
};

export default PayrollNRE;
