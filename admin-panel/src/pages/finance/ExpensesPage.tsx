import React from 'react';
import { Table, Button, Tag, Card, Typography, Row, Col, Statistic, Breadcrumb, Space, Input, Popconfirm, message } from 'antd';
import { PlusOutlined, SearchOutlined, PrinterOutlined, ExportOutlined, FilterOutlined, StopOutlined } from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import AccessControl from '../../components/AccessControl';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const statusColors: Record<string, string> = { recorded: 'green', void: 'red', unpaid: 'blue' };
const statusLabels: Record<string, string> = { recorded: 'Tercatat', void: 'Void', unpaid: 'Belum Bayar' };

const ExpensesPage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data = [], isLoading } = useQuery({
        queryKey: ['expenses'],
        queryFn: async () => (await api.get('/finance/expenses')).data,
    });

    const handleVoid = async (id: number) => {
        try {
            await api.put(`/finance/expenses/${id}/void`);
            message.success('Biaya berhasil dibatalkan (void)');
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
        } catch {
            message.error('Gagal membatalkan biaya');
        }
    };

    // Summary metrics
    const now = dayjs();
    const thisMonth = data.filter((e: Record<string, unknown>) => dayjs(e.transDate as string).isSame(now, 'month'));
    const last30 = data.filter((e: Record<string, unknown>) => dayjs(e.transDate as string).isAfter(now.subtract(30, 'day')));
    const totalThisMonth = thisMonth.reduce((s: number, e: Record<string, unknown>) => s + Number(e.amount), 0);
    const totalLast30 = last30.reduce((s: number, e: Record<string, unknown>) => s + Number(e.amount), 0);

    const columns = [
        {
            title: 'Tanggal',
            dataIndex: 'transDate',
            key: 'transDate',
            sorter: true,
            render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
        },
        {
            title: 'Nomor',
            dataIndex: 'refNumber',
            key: 'refNumber',
            sorter: true,
            render: (v: string) => <a style={{ fontWeight: 600, color: '#1890ff' }}>{v}</a>,
        },
        { title: 'Referensi', key: 'ref', render: () => '-' },
        {
            title: 'Penerima',
            dataIndex: ['contact', 'name'],
            key: 'contact',
            render: (v: string) => v || '-',
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
            title: 'Sisa Tagihan',
            key: 'remaining',
            align: 'right' as const,
            render: () => 'Rp 0',
        },
        {
            title: 'Total',
            dataIndex: 'amount',
            key: 'amount',
            align: 'right' as const,
            sorter: true,
            render: (v: number) => `Rp ${Number(v).toLocaleString('id-ID')}`,
        },
        {
            title: 'Aksi',
            key: 'action',
            width: 80,
            align: 'center' as const,
            render: (_: unknown, record: Record<string, unknown>) => record.status !== 'void' ? (
                <Popconfirm
                    title="Batalkan biaya ini?"
                    description="Jurnal terkait akan di-reverse."
                    onConfirm={() => handleVoid(record.id as number)}
                    okText="Void"
                    cancelText="Batal"
                    okButtonProps={{ danger: true }}
                >
                    <Button type="text" danger icon={<StopOutlined />} size="small" />
                </Popconfirm>
            ) : null,
        },
    ];

    return (
        <div>
            <Breadcrumb className="mb-4" items={[{ title: 'Beranda' }, { title: 'Biaya' }]} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0 }}>Biaya</Title>
                <Space>
                    <Button icon={<PrinterOutlined />} size="small" onClick={() => message.info('Fitur cetak segera hadir')}>Print</Button>
                    <Button icon={<ExportOutlined />} size="small" onClick={() => message.info('Fitur export segera hadir')}>Export</Button>
                    <AccessControl permission="expenses_create">
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/expenses/add')}>
                            Catat Biaya
                        </Button>
                    </AccessControl>
                </Space>
            </div>

            {/* Summary Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={12} sm={6}>
                    <Card bordered={false} style={{ borderRadius: 8 }} bodyStyle={{ padding: 16 }}>
                        <Statistic
                            title={<Text type="secondary" style={{ fontSize: 12 }}>Bulan Ini</Text>}
                            value={totalThisMonth}
                            prefix="Rp"
                            valueStyle={{ fontSize: 16, fontWeight: 600 }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card bordered={false} style={{ borderRadius: 8 }} bodyStyle={{ padding: 16 }}>
                        <Statistic
                            title={<Text type="secondary" style={{ fontSize: 12 }}>30 Hari Lalu</Text>}
                            value={totalLast30}
                            prefix="Rp"
                            valueStyle={{ fontSize: 16, fontWeight: 600 }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card bordered={false} style={{ borderRadius: 8 }} bodyStyle={{ padding: 16 }}>
                        <Statistic
                            title={<Text type="secondary" style={{ fontSize: 12 }}>Belum Dibayar</Text>}
                            value={0}
                            prefix="Rp"
                            valueStyle={{ fontSize: 16, fontWeight: 600, color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card bordered={false} style={{ borderRadius: 8 }} bodyStyle={{ padding: 16 }}>
                        <Statistic
                            title={<Text type="secondary" style={{ fontSize: 12 }}>Jatuh Tempo</Text>}
                            value={0}
                            prefix="Rp"
                            valueStyle={{ fontSize: 16, fontWeight: 600, color: '#ff4d4f' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }} bodyStyle={{ padding: 0 }}>
                {/* Filter Bar */}
                <div style={{ padding: '12px 16px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Input
                        placeholder="Cari nomor atau penerima..."
                        prefix={<SearchOutlined />}
                        style={{ width: 240 }}
                        size="small"
                    />
                    <Button icon={<FilterOutlined />} size="small">Filter</Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="id"
                    loading={isLoading}
                    rowSelection={{ type: 'checkbox' }}
                    pagination={{ pageSize: 15, showSizeChanger: true }}
                    size="small"
                />
            </Card>
        </div>
    );
};

export default ExpensesPage;
