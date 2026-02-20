import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Typography, Card, Breadcrumb, Tag, Input, Row, Col, Statistic, message } from 'antd';
import { PlusOutlined, CarOutlined, CheckCircleOutlined, ClockCircleOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../../api';

const { Title, Text } = Typography;

interface Delivery {
    id: number;
    refNumber: string;
    contact?: { name: string };
    trackingNumber?: string;
    status: string;
    transDate: string;
    type: string;
}

const DeliveriesPage: React.FC = () => {
    const [data, setData] = useState<Delivery[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDeliveries = async () => {
        setLoading(true);
        try {
            const res = await api.get('/finance/deliveries');
            setData(res.data || []);
        } catch {
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeliveries();
    }, []);

    const pending = data.filter(d => d.status === 'pending').length;
    const shipped = data.filter(d => d.status === 'shipped').length;
    const delivered = data.filter(d => d.status === 'delivered').length;
    const cancelled = data.filter(d => d.status === 'cancelled').length;

    const columns = [
        {
            title: 'No. Referensi',
            dataIndex: 'refNumber',
            key: 'refNumber',
            render: (text: string) => <Text strong style={{ color: '#1890ff' }}>{text}</Text>,
        },
        {
            title: 'Pelanggan',
            key: 'contact',
            render: (_: unknown, record: Delivery) => record.contact?.name || '-',
        },
        {
            title: 'No. Resi',
            dataIndex: 'trackingNumber',
            key: 'trackingNumber',
            render: (text: string) => text || '-',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                let color = 'orange';
                let icon = <ClockCircleOutlined />;
                let label = 'Diproses';

                if (status === 'shipped') {
                    color = 'blue';
                    icon = <CarOutlined />;
                    label = 'Dikirim';
                } else if (status === 'delivered') {
                    color = 'green';
                    icon = <CheckCircleOutlined />;
                    label = 'Diterima';
                } else if (status === 'cancelled') {
                    color = 'red';
                    label = 'Dibatalkan';
                }

                return <Tag color={color} icon={icon}>{label}</Tag>;
            },
        },
        {
            title: 'Tanggal',
            dataIndex: 'transDate',
            key: 'transDate',
            render: (d: string) => d ? new Date(d).toLocaleDateString('id-ID') : '-',
        },
    ];

    return (
        <div>
            <Breadcrumb className="mb-4" items={[{ title: 'Beranda' }, { title: 'Penjualan' }, { title: 'Pengiriman' }]} />

            <div className="flex justify-between items-center mb-6">
                <Title level={3} className="!m-0">Manajemen Pengiriman</Title>
                <Space>
                    <Input prefix={<SearchOutlined />} placeholder="Cari Resi/Pelanggan..." style={{ width: 250 }} />
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => message.info('Fitur buat pengiriman segera hadir')}>Buat Pengiriman</Button>
                </Space>
            </div>

            <Row gutter={[16, 16]} className="mb-6">
                <Col span={6}>
                    <Card className="shadow-sm border-gray-100 rounded-xl">
                        <Statistic title="Perlu Dikirim" value={pending} valueStyle={{ color: '#fa8c16' }} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card className="shadow-sm border-gray-100 rounded-xl">
                        <Statistic title="Dalam Perjalanan" value={shipped} valueStyle={{ color: '#1890ff' }} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card className="shadow-sm border-gray-100 rounded-xl">
                        <Statistic title="Diterima" value={delivered} valueStyle={{ color: '#52c41a' }} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card className="shadow-sm border-gray-100 rounded-xl">
                        <Statistic title="Dibatalkan" value={cancelled} />
                    </Card>
                </Col>
            </Row>

            <Card className="shadow-sm border-gray-100 rounded-xl">
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10, showSizeChanger: true }}
                />
            </Card>

        </div>
    );
};

export default DeliveriesPage;
