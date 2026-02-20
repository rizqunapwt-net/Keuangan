import React, { useState, useEffect } from 'react';
import {
    Table,
    Tag,
    Button,
    Input,
    Select,
    Space,
    Typography,
    Card,
    Row,
    Col,
    Statistic,
    Popconfirm,
    message,
} from 'antd';
import {
    PlusOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const OrderListPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 15,
        total: 0,
    });
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        search: '',
    });
    const [statistics, setStatistics] = useState({
        total_orders: 0,
        by_status: {},
        this_month: { orders: 0, revenue: 0 },
        pending_approval: 0,
        urgent_orders: 0,
    });

    useEffect(() => {
        loadOrders();
        loadStatistics();
    }, [pagination.current, pagination.pageSize, filters]);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const params: any = {
                per_page: pagination.pageSize,
                page: pagination.current,
                sort_by: 'created_at',
                sort_order: 'desc',
            };

            if (filters.status) params.status = filters.status;
            if (filters.priority) params.priority = filters.priority;
            if (filters.search) params.search = filters.search;

            const response = await api.get('/percetakan/orders', { params });
            setOrders(response.data.data || []);
            setPagination({
                ...pagination,
                total: response.data.meta?.total || 0,
            });
        } catch (error) {
            message.error('Gagal memuat data orders');
        } finally {
            setLoading(false);
        }
    };

    const loadStatistics = async () => {
        try {
            const response = await api.get('/percetakan/orders/statistics');
            setStatistics(response.data.data || {});
        } catch (error) {
            console.error('Failed to load statistics:', error);
        }
    };

    const handleDelete = async (orderId: number) => {
        try {
            await api.delete(`/percetakan/orders/${orderId}`);
            message.success('Order berhasil dibatalkan');
            loadOrders();
            loadStatistics();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Gagal membatalkan order');
        }
    };

    const getStatusColor = (status: string) => {
        const colors: any = {
            inquiry: 'default',
            quoted: 'blue',
            confirmed: 'green',
            in_production: 'processing',
            completed: 'success',
            ready_delivery: 'cyan',
            delivered: 'success',
            cancelled: 'red',
        };
        return colors[status] || 'default';
    };

    const getPriorityColor = (priority: string) => {
        const colors: any = {
            low: 'default',
            normal: 'blue',
            high: 'orange',
            urgent: 'red',
        };
        return colors[priority] || 'default';
    };

    const columns = [
        {
            title: 'Order Number',
            dataIndex: 'order_number',
            key: 'order_number',
            width: 150,
            sorter: true,
        },
        {
            title: 'Customer',
            dataIndex: ['customer', 'name'],
            key: 'customer',
            width: 200,
            ellipsis: true,
        },
        {
            title: 'Product',
            dataIndex: ['product', 'name'],
            key: 'product',
            width: 150,
            ellipsis: true,
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 100,
            align: 'right' as const,
        },
        {
            title: 'Total',
            dataIndex: 'total_amount',
            key: 'total_amount',
            width: 120,
            align: 'right' as const,
            render: (value: number) => `Rp ${value.toLocaleString('id-ID')}`,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>
                    {status.replace('_', ' ').toUpperCase()}
                </Tag>
            ),
            filters: [
                { text: 'Inquiry', value: 'inquiry' },
                { text: 'Quoted', value: 'quoted' },
                { text: 'Confirmed', value: 'confirmed' },
                { text: 'In Production', value: 'in_production' },
                { text: 'Completed', value: 'completed' },
                { text: 'Delivered', value: 'delivered' },
                { text: 'Cancelled', value: 'cancelled' },
            ],
            onFilter: (value: any, record: any) => record.status === value,
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            width: 100,
            render: (priority: string) => (
                <Tag color={getPriorityColor(priority)}>
                    {priority.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Deadline',
            dataIndex: 'deadline',
            key: 'deadline',
            width: 120,
            render: (date: string) => dayjs(date).format('DD MMM YYYY'),
            sorter: true,
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            fixed: 'right' as const,
            render: (_: any, record: any) => (
                <Space size="small">
                    <Button
                        type="link"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/percetakan/orders/${record.id}`)}
                    />
                    <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/percetakan/orders/${record.id}/edit`)}
                    />
                    {record.status !== 'delivered' && record.status !== 'cancelled' && (
                        <Popconfirm
                            title="Batalkan order?"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Ya"
                            cancelText="Batal"
                        >
                            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Title level={3}>📋 Daftar Order</Title>
                    <Typography.Text type="secondary">
                        Kelola semua order percetakan
                    </Typography.Text>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    onClick={() => navigate('/percetakan/orders/new')}
                >
                    Buat Order Baru
                </Button>
            </div>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Order"
                            value={statistics.total_orders}
                            prefix="📦"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Bulan Ini"
                            value={statistics.this_month?.orders || 0}
                            suffix={`orders`}
                            prefix="📊"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Pending Approval"
                            value={statistics.pending_approval || 0}
                            prefix="⏳"
                            valueStyle={{ color: '#fa8c16' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Urgent"
                            value={statistics.urgent_orders || 0}
                            prefix="🔥"
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card className="mb-6">
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} md={8}>
                        <Search
                            placeholder="Cari order number..."
                            allowClear
                            enterButton={<SearchOutlined />}
                            size="large"
                            onSearch={(value) => setFilters({ ...filters, search: value })}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Select
                            placeholder="Filter Status"
                            size="large"
                            className="w-full"
                            allowClear
                            onChange={(value) => setFilters({ ...filters, status: value })}
                        >
                            <Option value="inquiry">Inquiry</Option>
                            <Option value="quoted">Quoted</Option>
                            <Option value="confirmed">Confirmed</Option>
                            <Option value="in_production">In Production</Option>
                            <Option value="completed">Completed</Option>
                            <Option value="delivered">Delivered</Option>
                            <Option value="cancelled">Cancelled</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Select
                            placeholder="Filter Priority"
                            size="large"
                            className="w-full"
                            allowClear
                            onChange={(value) => setFilters({ ...filters, priority: value })}
                        >
                            <Option value="low">Low</Option>
                            <Option value="normal">Normal</Option>
                            <Option value="high">High</Option>
                            <Option value="urgent">Urgent</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Button
                            icon={<ReloadOutlined />}
                            size="large"
                            className="w-full"
                            onClick={loadOrders}
                        >
                            Refresh
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Orders Table */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={orders}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        onChange: (page, pageSize) => {
                            setPagination({ ...pagination, current: page, pageSize });
                        },
                        showSizeChanger: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} orders`,
                    }}
                    scroll={{ x: 1200 }}
                    size="middle"
                />
            </Card>
        </div>
    );
};

export default OrderListPage;
