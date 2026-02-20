import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Typography, Card, Breadcrumb, Row, Col, Statistic, message, Popconfirm } from 'antd';
import { PlusOutlined, CalculatorOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const { Title, Text } = Typography;

interface FixedAsset {
    id: number;
    name: string;
    purchaseDate: string;
    purchaseCost: number;
    usefulLife: number; // in years
}

const FixedAssetsPage: React.FC = () => {
    const [data, setData] = useState<FixedAsset[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchAssets = async () => {
        setLoading(true);
        try {
            const response = await api.get('/finance/assets');
            setData(response.data);
        } catch {
            message.error('Gagal mengambil data aset tetap');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/finance/assets/${id}`);
            message.success('Aset berhasil dihapus');
            fetchAssets();
        } catch {
            message.error('Gagal menghapus aset');
        }
    };

    useEffect(() => {
        fetchAssets();
    }, []);

    const totalAssetValue = data.reduce((sum, asset) => sum + Number(asset.purchaseCost), 0);

    const columns = [
        {
            title: 'Nama Aset',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <Text strong className="text-primary">{text}</Text>,
        },
        {
            title: 'Tanggal Perolehan',
            dataIndex: 'purchaseDate',
            key: 'purchaseDate',
            render: (text: string) => new Date(text).toLocaleDateString('id-ID'),
        },
        {
            title: 'Harga Perolehan',
            dataIndex: 'purchaseCost',
            key: 'purchaseCost',
            align: 'right' as const,
            render: (val: number) => `Rp ${Number(val).toLocaleString('id-ID')}`,
        },
        {
            title: 'Umur Ekonomis',
            dataIndex: 'usefulLife',
            key: 'usefulLife',
            render: (val: number) => `${val} Tahun`,
        },
        {
            title: 'Aksi',
            key: 'action',
            align: 'center' as const,
            render: (_: unknown, record: FixedAsset) => (
                <Space size="middle">
                    <Button type="link" icon={<CalculatorOutlined />} onClick={() => message.info('Fitur penyusutan segera hadir')}>Susutkan</Button>
                    <Popconfirm
                        title="Hapus aset ini?"
                        description="Data yang sudah dihapus tidak dapat dikembalikan."
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
            <Breadcrumb className="mb-4" items={[{ title: 'Beranda' }, { title: 'Aset Tetap' }, { title: 'Daftar Aset' }]} />

            <div className="flex justify-between items-center mb-6">
                <Title level={3} className="!m-0">Aset Tetap</Title>
                <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => navigate('/assets/add')}>Tambah Aset</Button>
            </div>

            <Row gutter={[16, 16]} className="mb-6">
                <Col span={24}>
                    <Card className="shadow-sm border-gray-100 rounded-xl bg-orange-50">
                        <Statistic
                            title="Total Nilai Aset Tetap"
                            value={totalAssetValue}
                            prefix="Rp"
                            valueStyle={{ color: '#d46b08', fontWeight: 'bold' }}
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
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </div>
    );
};

export default FixedAssetsPage;
