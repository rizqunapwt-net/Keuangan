import React, { useState } from 'react';
import { Table, Button, Tag, Card, Typography, Row, Col, Statistic, Breadcrumb, Space, Input, message, Tooltip } from 'antd';
import { PlusOutlined, SearchOutlined, FilterOutlined, HistoryOutlined, DollarCircleOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import dayjs from 'dayjs';
import DebtFormDrawer from './DebtFormDrawer';
import DebtPaymentDrawer from './DebtPaymentDrawer';

const { Title, Text } = Typography;

const statusColors: Record<string, string> = {
    unpaid: 'red',
    partial: 'orange',
    paid: 'green'
};

const statusLabels: Record<string, string> = {
    unpaid: 'Belum Lunas',
    partial: 'Sebagian',
    paid: 'Lunas'
};

const DebtsPage: React.FC = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
    const [selectedDebt, setSelectedDebt] = useState<any>(null);
    const [editData, setEditData] = useState<any>(null);
    const [searchText, setSearchText] = useState('');

    const { data: rawData = [], isLoading } = useQuery({
        queryKey: ['debts', 'payable'],
        queryFn: async () => {
            const res = await api.get('/finance/debts', { params: { type: 'payable' } });
            return res.data || [];
        },
    });

    const data = Array.isArray(rawData) ? rawData : [];

    // Filter data based on search
    const filteredData = data.filter((item: any) =>
        item.client_name.toLowerCase().includes(searchText.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchText.toLowerCase()))
    );

    // Summary metrics
    const totalDebt = data.reduce((s: number, e: any) => s + Number(e.amount), 0);
    const totalPaid = data.reduce((s: number, e: any) => s + Number(e.paid_amount), 0);
    const remainingDebt = totalDebt - totalPaid;

    const columns = [
        {
            title: 'Tanggal',
            dataIndex: 'date',
            key: 'date',
            sorter: (a: any, b: any) => dayjs(a.date).unix() - dayjs(b.date).unix(),
            render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (s: string) => (
                <Tag color={statusColors[s] || 'default'}>
                    {statusLabels[s] || s}
                </Tag>
            ),
        },
        {
            title: 'Kreditur',
            dataIndex: 'client_name',
            key: 'client_name',
            sorter: (a: any, b: any) => a.client_name.localeCompare(b.client_name),
            render: (v: string, record: any) => (
                <div style={{ fontWeight: 600 }}>
                    {v}
                    {record.client_phone && <div style={{ fontSize: 11, fontWeight: 400, color: '#64748b' }}>{record.client_phone}</div>}
                </div>
            )
        },
        {
            title: 'Keterangan',
            dataIndex: 'description',
            key: 'description',
            render: (v: string) => <Text type="secondary" style={{ fontSize: 12 }}>{v || '-'}</Text>
        },
        {
            title: 'Jatuh Tempo',
            dataIndex: 'due_date',
            key: 'due_date',
            render: (v: string) => v ? (
                <Text type={dayjs(v).isBefore(dayjs()) ? 'danger' : 'secondary'}>
                    {dayjs(v).format('DD/MM/YYYY')}
                </Text>
            ) : '-'
        },
        {
            title: 'Nominal',
            dataIndex: 'amount',
            key: 'amount',
            align: 'right' as const,
            render: (v: number) => `Rp ${Number(v).toLocaleString('id-ID')}`,
        },
        {
            title: 'Terbayar',
            dataIndex: 'paid_amount',
            key: 'paid_amount',
            align: 'right' as const,
            render: (v: number) => <Text type="success">Rp {Number(v).toLocaleString('id-ID')}</Text>,
        },
        {
            title: 'Sisa',
            key: 'remaining',
            align: 'right' as const,
            render: (_: any, record: any) => {
                const sisa = Number(record.amount) - Number(record.paid_amount);
                return <Text strong type={sisa > 0 ? 'danger' : 'secondary'}>Rp {sisa.toLocaleString('id-ID')}</Text>;
            }
        },
        {
            title: 'Aksi',
            key: 'action',
            width: 100,
            align: 'center' as const,
            render: (_: any, record: any) => (
                <Space>
                    <Tooltip title="Cicilan / Bayar">
                        <Button
                            type="text"
                            icon={<DollarCircleOutlined style={{ color: '#52c41a' }} />}
                            size="small"
                            onClick={() => {
                                setSelectedDebt(record);
                                setPaymentDrawerOpen(true);
                            }}
                            disabled={record.status === 'paid'}
                        />
                    </Tooltip>
                    <Tooltip title="Riwayat">
                        <Button
                            type="text"
                            icon={<HistoryOutlined />}
                            size="small"
                            onClick={() => message.info('Fitur riwayat segera hadir')}
                        />
                    </Tooltip>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            setEditData(record);
                            setDrawerOpen(true);
                        }}
                    >
                        Edit
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Breadcrumb className="mb-4" items={[{ title: 'Beranda' }, { title: 'Keuangan' }, { title: 'Utang' }]} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0 }}>Utang (Buku Utang)</Title>
                <Space>
                    <Button icon={<FilterOutlined />} size="small">Filter</Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setEditData(null);
                            setDrawerOpen(true);
                        }}
                    >
                        Utang Baru
                    </Button>
                </Space>
            </div>

            {/* Summary Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ borderRadius: 8, background: '#fff' }} bodyStyle={{ padding: 16 }}>
                        <Statistic
                            title={<Text type="secondary" style={{ fontSize: 12 }}>Total Utang</Text>}
                            value={totalDebt}
                            prefix="Rp"
                            valueStyle={{ fontSize: 18, fontWeight: 700, color: '#1e293b' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ borderRadius: 8, background: '#fff' }} bodyStyle={{ padding: 16 }}>
                        <Statistic
                            title={<Text type="secondary" style={{ fontSize: 12 }}>Total Terbayar</Text>}
                            value={totalPaid}
                            prefix="Rp"
                            valueStyle={{ fontSize: 18, fontWeight: 700, color: '#16a34a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ borderRadius: 8, background: '#fff' }} bodyStyle={{ padding: 16 }}>
                        <Statistic
                            title={<Text type="secondary" style={{ fontSize: 12 }}>Sisa Utang</Text>}
                            value={remainingDebt}
                            prefix="Rp"
                            valueStyle={{ fontSize: 18, fontWeight: 700, color: '#dc2626' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }} bodyStyle={{ padding: 0 }}>
                {/* Search Bar */}
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                    <Input
                        placeholder="Cari kreditur atau keterangan..."
                        prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                        style={{ width: 300 }}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        allowClear
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{ pageSize: 15, showSizeChanger: true }}
                    size="middle"
                />
            </Card>

            <DebtFormDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                type="payable"
                initialValues={editData}
            />
            <DebtPaymentDrawer
                open={paymentDrawerOpen}
                onClose={() => setPaymentDrawerOpen(false)}
                debt={selectedDebt}
            />
        </div>
    );
};

export default DebtsPage;
