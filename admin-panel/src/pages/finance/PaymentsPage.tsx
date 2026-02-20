import React, { useEffect, useState } from 'react';
import { Table, Button, Typography, Card, Breadcrumb, Row, Col, Statistic, message, Tag } from 'antd';
import { CheckCircleOutlined, SyncOutlined, ReloadOutlined } from '@ant-design/icons';
import api from '../../api';

const { Title, Text } = Typography;

interface Payment {
    id: number;
    method: string;
    amount: number;
    status: string;
    date: string;
}

const PaymentsPage: React.FC = () => {
    const [data, setData] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const response = await api.get('/finance/payments');
            setData(response.data);
        } catch {
            message.error('Gagal mengambil data pembayaran');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const columns = [
        {
            title: 'Metode Pembayaran',
            dataIndex: 'method',
            key: 'method',
            render: (text: string) => <Text strong>{text}</Text>,
        },
        {
            title: 'Jumlah Pembayaran',
            dataIndex: 'amount',
            key: 'amount',
            align: 'right' as const,
            render: (val: number) => `Rp ${Number(val).toLocaleString('id-ID')}`,
        },
        {
            title: 'Tanggal',
            dataIndex: 'date',
            key: 'date',
            render: (date: string) => new Date(date).toLocaleString('id-ID'),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag
                    icon={status === 'paid' ? <CheckCircleOutlined /> : <SyncOutlined spin />}
                    color={status === 'paid' ? 'success' : 'processing'}
                >
                    {status === 'paid' ? 'Dibayar' : 'Menunggu'}
                </Tag>
            ),
        },
        {
            title: 'Aksi',
            key: 'action',
            align: 'center' as const,
            render: () => (
                <Button type="link" disabled>Detail</Button>
            ),
        },
    ];

    return (
        <div>
            <Breadcrumb className="mb-4" items={[{ title: 'Beranda' }, { title: 'Settings' }, { title: 'Pembayaran' }]} />

            <div className="flex justify-between items-center mb-6">
                <Title level={3} className="!m-0">Integrasi Pembayaran</Title>
                <Button icon={<ReloadOutlined />} onClick={fetchPayments}>Muat Ulang</Button>
            </div>

            <Row gutter={[16, 16]} className="mb-6">
                <Col span={24}>
                    <Card className="shadow-sm border-gray-100 rounded-xl bg-purple-50">
                        <Statistic
                            title="Total Pembayaran Masuk"
                            value={data.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)}
                            prefix="Rp"
                            valueStyle={{ color: '#722ed1', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card className="shadow-sm border-gray-100 rounded-xl" title="Transaksi Gateway (Midtrans/Xendit)">
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

export default PaymentsPage;
