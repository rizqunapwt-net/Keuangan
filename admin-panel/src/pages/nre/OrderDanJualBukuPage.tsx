import React, { useState, useEffect } from 'react';
import {
    Card,
    Typography,
    Table,
    Button,
    Space,
    Tag,
    Modal,
    Form,
    Input,
    InputNumber,
    Select,
    DatePicker,
    message,
    Tabs,
    Statistic,
    Row,
    Col,
    Descriptions,
    Popconfirm,
} from 'antd';
import {
    PlusOutlined,
    ReloadOutlined,
    EyeOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// API helper (adjust to your API setup)
const API_BASE = '/api/v1';

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_BASE}${url}`, { ...options, headers });
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Request failed');
    }

    return data;
};

const OrderDanJualBukuPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('orders');
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);
    const [sales, setSales] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [books, setBooks] = useState<any[]>([]);
    const [marketplaces, setMarketplaces] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'order' | 'sale'>('order');
    const [form] = Form.useForm();
    const [pagination, setPagination] = useState({ current: 1, pageSize: 15, total: 0 });

    // Fetch data on mount
    useEffect(() => {
        fetchBooks();
        fetchMarketplaces();
        if (activeTab === 'orders') {
            fetchOrders();
        } else {
            fetchSales();
            fetchStats();
        }
    }, [activeTab]);

    const fetchBooks = async () => {
        try {
            const data = await fetchWithAuth('/books');
            setBooks(data.data || []);
        } catch (error) {
            console.error('Failed to fetch books:', error);
        }
    };

    const fetchMarketplaces = async () => {
        try {
            const data = await fetchWithAuth('/marketplaces');
            setMarketplaces(data.data || []);
        } catch (error) {
            console.error('Failed to fetch marketplaces:', error);
        }
    };

    const fetchOrders = async (page = 1) => {
        setLoading(true);
        try {
            const data = await fetchWithAuth(`/print-orders?per_page=${pagination.pageSize}&page=${page}`);
            setOrders(data.data || []);
            setPagination(prev => ({ ...prev, current: page, total: data.meta?.total || 0 }));
        } catch (error: any) {
            message.error('Gagal mengambil data order: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchSales = async (page = 1) => {
        setLoading(true);
        try {
            const data = await fetchWithAuth(`/sales?per_page=${pagination.pageSize}&page=${page}`);
            setSales(data.data || []);
            setPagination(prev => ({ ...prev, current: page, total: data.meta?.total || 0 }));
        } catch (error: any) {
            message.error('Gagal mengambil data penjualan: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const data = await fetchWithAuth('/sales/stats');
            setStats(data.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleCreateOrder = async (values: any) => {
        try {
            await fetchWithAuth('/print-orders', {
                method: 'POST',
                body: JSON.stringify({
                    ...values,
                    ordered_at: values.ordered_at?.format('YYYY-MM-DD'),
                    expected_delivery: values.expected_delivery?.format('YYYY-MM-DD'),
                }),
            });
            message.success('Order cetak berhasil dibuat');
            setIsModalOpen(false);
            form.resetFields();
            fetchOrders();
        } catch (error: any) {
            message.error('Gagal membuat order: ' + error.message);
        }
    };

    const handleCreateSale = async (values: any) => {
        try {
            await fetchWithAuth('/sales', {
                method: 'POST',
                body: JSON.stringify({
                    ...values,
                    period_month: values.period_month?.format('YYYY-MM'),
                }),
            });
            message.success('Penjualan berhasil dicatat');
            setIsModalOpen(false);
            form.resetFields();
            fetchSales();
            fetchStats();
        } catch (error: any) {
            message.error('Gagal mencatat penjualan: ' + error.message);
        }
    };

    const handleUpdateOrderStatus = async (orderId: number, status: string) => {
        try {
            await fetchWithAuth(`/print-orders/${orderId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status }),
            });
            message.success('Status order berhasil diupdate');
            fetchOrders();
        } catch (error: any) {
            message.error('Gagal update status: ' + error.message);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'orange',
            approved: 'blue',
            in_production: 'processing',
            qc: 'purple',
            delivered: 'green',
            cancelled: 'red',
        };
        return colors[status] || 'default';
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            pending: 'Pending',
            approved: 'Disetujui',
            in_production: 'Dalam Produksi',
            qc: 'Quality Control',
            delivered: 'Terkirim',
            cancelled: 'Dibatalkan',
        };
        return labels[status] || status;
    };

    const orderColumns = [
        {
            title: 'Order Number',
            dataIndex: 'order_number',
            key: 'order_number',
            width: 150,
        },
        {
            title: 'Judul Buku',
            dataIndex: ['book', 'title'],
            key: 'book_title',
            ellipsis: true,
        },
        {
            title: 'Vendor',
            dataIndex: 'vendor_name',
            key: 'vendor_name',
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'right' as const,
        },
        {
            title: 'Total Biaya',
            dataIndex: 'total_cost',
            key: 'total_cost',
            align: 'right' as const,
            render: (value: number) => `Rp ${value?.toLocaleString('id-ID')}`,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>{getStatusLabel(status)}</Tag>
            ),
        },
        {
            title: 'Tanggal Order',
            dataIndex: 'ordered_at',
            key: 'ordered_at',
            render: (date: string) => dayjs(date).format('DD MMM YYYY'),
        },
        {
            title: 'Aksi',
            key: 'actions',
            render: (_: any, record: any) => (
                <Space size="small">
                    {record.status === 'pending' && (
                        <>
                            <Popconfirm
                                title="Setujui order?"
                                onConfirm={() => handleUpdateOrderStatus(record.id, 'approved')}
                                okText="Ya"
                                cancelText="Batal"
                            >
                                <Button type="link" size="small" icon={<CheckCircleOutlined />} />
                            </Popconfirm>
                            <Popconfirm
                                title="Batalkan order?"
                                onConfirm={() => handleUpdateOrderStatus(record.id, 'cancelled')}
                                okText="Ya"
                                cancelText="Batal"
                            >
                                <Button type="link" size="small" danger icon={<CloseCircleOutlined />} />
                            </Popconfirm>
                        </>
                    )}
                    {record.status === 'in_production' && (
                        <Button
                            type="link"
                            size="small"
                            onClick={() => handleUpdateOrderStatus(record.id, 'qc')}
                        >
                            QC
                        </Button>
                    )}
                    {record.status === 'qc' && (
                        <Button
                            type="link"
                            size="small"
                            onClick={() => handleUpdateOrderStatus(record.id, 'delivered')}
                        >
                            Selesai
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    const saleColumns = [
        {
            title: 'Judul Buku',
            dataIndex: ['book', 'title'],
            key: 'book_title',
            ellipsis: true,
        },
        {
            title: 'Marketplace',
            dataIndex: ['marketplace', 'name'],
            key: 'marketplace_name',
        },
        {
            title: 'Periode',
            dataIndex: 'period_month',
            key: 'period_month',
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'right' as const,
        },
        {
            title: 'Harga Satuan',
            dataIndex: 'net_price',
            key: 'net_price',
            align: 'right' as const,
            render: (value: number) => `Rp ${value?.toLocaleString('id-ID')}`,
        },
        {
            title: 'Total',
            key: 'total',
            align: 'right' as const,
            render: (_: any, record: any) =>
                `Rp ${(record.quantity * record.net_price)?.toLocaleString('id-ID')}`,
        },
        {
            title: 'Tanggal',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date: string) => dayjs(date).format('DD MMM YYYY'),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={4}>Order & Jual Buku</Title>
                <Space>
                    <Button icon={<ReloadOutlined />} onClick={() => {
                        if (activeTab === 'orders') fetchOrders();
                        else {
                            fetchSales();
                            fetchStats();
                        }
                    }}>
                        Refresh
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setModalType(activeTab === 'orders' ? 'order' : 'sale');
                            setIsModalOpen(true);
                        }}
                    >
                        {activeTab === 'orders' ? 'Order Cetak' : 'Catat Penjualan'}
                    </Button>
                </Space>
            </div>

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                    {
                        key: 'orders',
                        label: 'Order Cetak',
                        children: (
                            <Card>
                                <Table
                                    columns={orderColumns}
                                    dataSource={orders}
                                    rowKey="id"
                                    loading={loading}
                                    pagination={{
                                        ...pagination,
                                        onChange: (page) => fetchOrders(page),
                                    }}
                                />
                            </Card>
                        ),
                    },
                    {
                        key: 'sales',
                        label: 'Penjualan',
                        children: (
                            <>
                                {stats && (
                                    <Card style={{ marginBottom: 16 }}>
                                        <Row gutter={16}>
                                            <Col span={6}>
                                                <Statistic
                                                    title="Total Terjual"
                                                    value={stats.total_sales}
                                                    suffix="buku"
                                                />
                                            </Col>
                                            <Col span={6}>
                                                <Statistic
                                                    title="Total Revenue"
                                                    value={stats.total_revenue}
                                                    prefix="Rp"
                                                    precision={0}
                                                />
                                            </Col>
                                            <Col span={6}>
                                                <Statistic
                                                    title="Transaksi"
                                                    value={stats.total_transactions}
                                                />
                                            </Col>
                                            <Col span={6}>
                                                <Statistic
                                                    title="Periode"
                                                    value={stats.period_month}
                                                />
                                            </Col>
                                        </Row>
                                    </Card>
                                )}
                                <Card>
                                    <Table
                                        columns={saleColumns}
                                        dataSource={sales}
                                        rowKey="id"
                                        loading={loading}
                                        pagination={{
                                            ...pagination,
                                            onChange: (page) => fetchSales(page),
                                        }}
                                    />
                                </Card>
                            </>
                        ),
                    },
                ]}
            />

            {/* Modal Form */}
            <Modal
                title={modalType === 'order' ? 'Buat Order Cetak' : 'Catat Penjualan'}
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                }}
                footer={null}
                width={700}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={modalType === 'order' ? handleCreateOrder : handleCreateSale}
                    style={{ marginTop: 16 }}
                >
                    {modalType === 'order' ? (
                        <>
                            <Form.Item
                                name="book_id"
                                label="Buku"
                                rules={[{ required: true, message: 'Pilih buku' }]}
                            >
                                <Select showSearch placeholder="Pilih buku" optionFilterProp="children">
                                    {books.map((book) => (
                                        <Option key={book.id} value={book.id}>
                                            {book.title} ({book.isbn})
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="vendor_name"
                                label="Nama Vendor"
                                rules={[{ required: true, message: 'Nama vendor wajib diisi' }]}
                            >
                                <Input placeholder="Contoh: PT. Gramedia" />
                            </Form.Item>

                            <Form.Item name="vendor_contact" label="Kontak Vendor">
                                <Input placeholder="Email/Telepon" />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="quantity"
                                        label="Jumlah Cetak"
                                        rules={[{ required: true, message: 'Wajib diisi' }]}
                                    >
                                        <InputNumber min={1} style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="unit_cost"
                                        label="Harga Satuan"
                                        rules={[{ required: true, message: 'Wajib diisi' }]}
                                    >
                                        <InputNumber
                                            min={0}
                                            formatter={(value) =>
                                                `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                                            }
                                            style={{ width: '100%' }}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item name="paper_type" label="Jenis Kertas" initialValue="HVS 80gsm">
                                        <Select>
                                            <Option value="HVS 70gsm">HVS 70gsm</Option>
                                            <Option value="HVS 80gsm">HVS 80gsm</Option>
                                            <Option value="Art Paper 120gsm">Art Paper 120gsm</Option>
                                            <Option value="Art Paper 150gsm">Art Paper 150gsm</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item name="binding_type" label="Jenis Binding" initialValue="Perfect Binding">
                                        <Select>
                                            <Option value="Perfect Binding">Perfect Binding</Option>
                                            <Option value="Spiral">Spiral</Option>
                                            <Option value="Hard Binding">Hard Binding</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item name="cover_type" label="Jenis Cover" initialValue="Soft Cover">
                                        <Select>
                                            <Option value="Soft Cover">Soft Cover</Option>
                                            <Option value="Hard Cover">Hard Cover</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="ordered_at" label="Tanggal Order">
                                        <DatePicker style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="expected_delivery" label="Estimasi Pengiriman">
                                        <DatePicker style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item name="notes" label="Catatan">
                                <TextArea rows={3} placeholder="Catatan tambahan (opsional)" />
                            </Form.Item>
                        </>
                    ) : (
                        <>
                            <Form.Item
                                name="book_id"
                                label="Buku"
                                rules={[{ required: true, message: 'Pilih buku' }]}
                            >
                                <Select showSearch placeholder="Pilih buku" optionFilterProp="children">
                                    {books.map((book) => (
                                        <Option key={book.id} value={book.id}>
                                            {book.title} ({book.isbn})
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="marketplace_id"
                                label="Marketplace"
                                rules={[{ required: true, message: 'Pilih marketplace' }]}
                            >
                                <Select placeholder="Pilih marketplace">
                                    {marketplaces.map((mp) => (
                                        <Option key={mp.id} value={mp.id}>
                                            {mp.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="period_month"
                                label="Periode Bulan"
                                rules={[{ required: true, message: 'Pilih periode' }]}
                            >
                                <DatePicker picker="month" style={{ width: '100%' }} />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                            name="quantity"
                                            label="Jumlah Terjual"
                                            rules={[{ required: true, message: 'Wajib diisi' }]}
                                        >
                                            <InputNumber min={1} style={{ width: '100%' }} />
                                        </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="net_price"
                                        label="Harga Bersih per Unit"
                                        rules={[{ required: true, message: 'Wajib diisi' }]}
                                    >
                                        <InputNumber
                                            min={0}
                                            formatter={(value) =>
                                                `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                                            }
                                            style={{ width: '100%' }}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item name="transaction_id" label="ID Transaksi (Opsional)">
                                <Input placeholder="ID dari marketplace" />
                            </Form.Item>
                        </>
                    )}

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: 24 }}>
                        <Space>
                            <Button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    form.resetFields();
                                }}
                            >
                                Batal
                            </Button>
                            <Button type="primary" htmlType="submit">
                                {modalType === 'order' ? 'Buat Order' : 'Simpan'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default OrderDanJualBukuPage;
