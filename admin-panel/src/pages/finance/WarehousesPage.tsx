import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Typography, Card, Breadcrumb, Row, Col, Statistic, message, Tag, Popconfirm } from 'antd';
import { PlusOutlined, ShopOutlined, EnvironmentOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const { Title, Text } = Typography;

interface Warehouse {
    id: number;
    name: string;
    location: string;
    status: string;
}

const WarehousesPage: React.FC = () => {
    const [data, setData] = useState<Warehouse[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchWarehouses = async () => {
        setLoading(true);
        try {
            const response = await api.get('/finance/warehouses');
            setData(response.data);
        } catch {
            message.error('Gagal mengambil data gudang');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/finance/warehouses/${id}`);
            message.success('Gudang berhasil dihapus');
            fetchWarehouses();
        } catch {
            message.error('Gagal menghapus gudang');
        }
    };

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const columns = [
        {
            title: 'Nama Gudang',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <Text strong className="text-primary">{text}</Text>,
        },
        {
            title: 'Lokasi',
            dataIndex: 'location',
            key: 'location',
            render: (text: string) => (
                <Space>
                    <EnvironmentOutlined className="text-gray-400" />
                    <Text>{text}</Text>
                </Space>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'active' ? 'success' : 'default'}>
                    {status === 'active' ? 'Aktif' : 'Non-aktif'}
                </Tag>
            ),
        },
        {
            title: 'Aksi',
            key: 'action',
            align: 'center' as const,
            render: (_: unknown, record: Warehouse) => (
                <Space size="middle">
                    <Popconfirm
                        title="Hapus gudang ini?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Hapus"
                        cancelText="Batal"
                        okButtonProps={{ danger: true }}
                    >
                        <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Breadcrumb className="mb-4" items={[{ title: 'Beranda' }, { title: 'Produk' }, { title: 'Gudang' }]} />

            <div className="flex justify-between items-center mb-6">
                <Title level={3} className="!m-0">Manajemen Gudang</Title>
                <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => navigate('/warehouses/add')}>Tambah Gudang</Button>
            </div>

            <Row gutter={[16, 16]} className="mb-6">
                <Col span={24}>
                    <Card className="shadow-sm border-gray-100 rounded-xl bg-green-50">
                        <Statistic
                            title="Total Lokasi Gudang"
                            value={data.length}
                            prefix={<ShopOutlined />}
                            valueStyle={{ color: '#3f8600', fontWeight: 'bold' }}
                        />
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

export default WarehousesPage;
