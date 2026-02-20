import React, { useState, useEffect } from 'react';
import {
    Descriptions,
    Card,
    Typography,
    Tag,
    Button,
    Row,
    Col,
    Statistic,
    Progress,
    Timeline,
    Divider,
    Spin,
    Alert,
    Space,
} from 'antd';
import {
    ArrowLeftOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    PrinterOutlined,
    TruckOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import dayjs from 'dayjs';

const { Title, Paragraph, Text } = Typography;

const OrderDetailPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<any>(null);
    const [productionJobs, setProductionJobs] = useState([]);

    useEffect(() => {
        loadOrderDetails();
    }, [id]);

    const loadOrderDetails = async () => {
        setLoading(true);
        try {
            const orderResponse = await api.get(`/percetakan/orders/${id}`);
            setOrder(orderResponse.data.data);

            // Load production jobs
            const jobsResponse = await api.get('/percetakan/production-jobs', {
                params: { order_id: id },
            });
            setProductionJobs(jobsResponse.data.data || []);
        } catch (error) {
            console.error('Failed to load order details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spin size="large" tip="Memuat detail order..." />
            </div>
        );
    }

    if (!order) {
        return (
            <Alert
                message="Order tidak ditemukan"
                description="Order yang Anda cari tidak ditemukan"
                type="error"
                showIcon
            />
        );
    }

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

    const getProgressPercentage = () => {
        const statusProgress: any = {
            inquiry: 0,
            quoted: 10,
            confirmed: 20,
            in_production: 50,
            completed: 80,
            ready_delivery: 90,
            delivered: 100,
            cancelled: 0,
        };
        return statusProgress[order.status] || 0;
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/percetakan/orders')}
                        className="mb-2"
                    >
                        Kembali
                    </Button>
                    <Title level={3} className="!mb-1">
                        📋 Order {order.order_number}
                    </Title>
                    <Paragraph type="secondary">
                        Detail order dan tracking produksi
                    </Paragraph>
                </div>
                <Space>
                    <Tag color={getStatusColor(order.status)} className="text-lg px-4 py-2">
                        {order.status_label}
                    </Tag>
                    <Tag color={getProgressPercentage() === 100 ? 'green' : 'blue'} className="text-lg px-4 py-2">
                        {order.priority?.toUpperCase()}
                    </Tag>
                </Space>
            </div>

            {/* Progress Bar */}
            <Card className="mb-6">
                <div className="mb-2">
                    <Text strong>Progress Order</Text>
                    <Text className="float-right">{getProgressPercentage()}%</Text>
                </div>
                <Progress
                    percent={getProgressPercentage()}
                    strokeColor={{
                        '0%': '#4f46e5',
                        '100%': '#10b981',
                    }}
                    size="small"
                />
            </Card>

            <Row gutter={[16, 16]}>
                {/* Order Information */}
                <Col xs={24} lg={16}>
                    <Card title="📝 Informasi Order" className="mb-4">
                        <Descriptions column={2} bordered>
                            <Descriptions.Item label="Customer">
                                {order.customer?.name || order.customer?.full_name}
                            </Descriptions.Item>
                            <Descriptions.Item label="Sales">
                                {order.sales?.name || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Produk">
                                {order.product?.name}
                            </Descriptions.Item>
                            <Descriptions.Item label="Quantity">
                                {order.quantity.toLocaleString('id-ID')} pcs
                            </Descriptions.Item>
                            <Descriptions.Item label="Order Date">
                                {dayjs(order.dates.order_date).format('DD MMMM YYYY')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Deadline">
                                <Text type={dayjs(order.dates.deadline).isBefore(dayjs()) ? 'danger' : 'secondary'}>
                                    {dayjs(order.dates.deadline).format('DD MMMM YYYY')}
                                </Text>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    <Card title="⚙️ Spesifikasi Cetak" className="mb-4">
                        <Descriptions column={2} bordered>
                            <Descriptions.Item label="Ukuran">
                                {order.detailed_specifications?.size}
                            </Descriptions.Item>
                            <Descriptions.Item label="Jenis Kertas">
                                {order.detailed_specifications?.paper_type} {order.detailed_specifications?.paper_weight}
                            </Descriptions.Item>
                            <Descriptions.Item label="Warna Luar">
                                {order.detailed_specifications?.colors?.outside}
                            </Descriptions.Item>
                            <Descriptions.Item label="Warna Dalam">
                                {order.detailed_specifications?.colors?.inside}
                            </Descriptions.Item>
                            <Descriptions.Item label="Jilid">
                                {order.detailed_specifications?.binding_type || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Finishing">
                                {order.detailed_specifications?.finishing?.join(', ') || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Halaman">
                                {order.detailed_specifications?.pages_count || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Print Run">
                                {order.detailed_specifications?.print_run || 1}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    {/* Production Timeline */}
                    <Card title="🏭 Tracking Produksi" className="mb-4">
                        {productionJobs.length > 0 ? (
                            <Timeline
                                items={productionJobs.map((job: any) => ({
                                    key: job.id,
                                    color: job.status === 'completed' ? 'green' :
                                           job.status === 'in_progress' ? 'blue' :
                                           job.status === 'pending' ? 'gray' : 'red',
                                    dot: job.stage === 'printing' ? <PrinterOutlined /> :
                                         job.stage === 'packaging' ? <TruckOutlined /> :
                                         job.status === 'completed' ? <CheckCircleOutlined /> :
                                         <ClockCircleOutlined />,
                                    title: `${job.stage_label} - ${job.status_label}`,
                                    children: (
                                        <div>
                                            <Text>Job: {job.job_number}</Text>
                                            <br />
                                            {job.timing?.started_at && (
                                                <Text type="secondary">
                                                    Mulai: {dayjs(job.timing.started_at).format('DD MMM YYYY, HH:mm')}
                                                </Text>
                                            )}
                                            {job.quantity?.good !== null && (
                                                <div>
                                                    <Text>Good: {job.quantity.good} | Waste: {job.quantity.waste}</Text>
                                                </div>
                                            )}
                                        </div>
                                    ),
                                }))}
                            />
                        ) : (
                            <Alert
                                message="Belum ada production job"
                                description="Order akan diproses setelah dikonfirmasi"
                                type="info"
                                showIcon
                            />
                        )}
                    </Card>
                </Col>

                {/* Pricing & Payment */}
                <Col xs={24} lg={8}>
                    <Card title="💰 Pricing" className="mb-4">
                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <Statistic
                                    title="Subtotal"
                                    value={order.pricing?.subtotal || 0}
                                    prefix="Rp"
                                    precision={0}
                                />
                            </Col>
                            <Col span={24}>
                                <Statistic
                                    title="Diskon"
                                    value={order.pricing?.discount || 0}
                                    prefix="- Rp"
                                    precision={0}
                                    valueStyle={{ color: '#cf1322' }}
                                />
                            </Col>
                            <Col span={24}>
                                <Statistic
                                    title="PPN (11%)"
                                    value={order.pricing?.tax || 0}
                                    prefix="+ Rp"
                                    precision={0}
                                />
                            </Col>
                            <Divider />
                            <Col span={24}>
                                <Statistic
                                    title="Total"
                                    value={order.pricing?.total || 0}
                                    prefix="Rp"
                                    precision={0}
                                    valueStyle={{ color: '#3f8600', fontWeight: 'bold', fontSize: 24 }}
                                />
                            </Col>
                        </Row>
                    </Card>

                    <Card title="💳 Payment" className="mb-4">
                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <Statistic
                                    title="DP Required"
                                    value={order.payment?.deposit_amount || 0}
                                    prefix="Rp"
                                    precision={0}
                                />
                            </Col>
                            <Col span={24}>
                                <Statistic
                                    title="DP Paid"
                                    value={order.payment?.deposit_paid || 0}
                                    prefix="Rp"
                                    precision={0}
                                    valueStyle={{ color: '#1890ff' }}
                                />
                            </Col>
                            <Col span={24}>
                                <Progress
                                    percent={order.payment?.deposit_percentage || 0}
                                    format={() => `${order.payment?.deposit_percentage || 0}%`}
                                />
                            </Col>
                            <Divider />
                            <Col span={24}>
                                <Statistic
                                    title="Balance Due"
                                    value={order.payment?.balance_due || 0}
                                    prefix="Rp"
                                    precision={0}
                                    valueStyle={{ color: '#cf1322', fontWeight: 'bold' }}
                                />
                            </Col>
                        </Row>
                    </Card>

                    <Card title="📝 Notes" className="mb-4">
                        {order.production_notes && (
                            <div className="mb-4">
                                <Text strong>Production Notes:</Text>
                                <Paragraph type="secondary">{order.production_notes}</Paragraph>
                            </div>
                        )}
                        {order.customer_notes && (
                            <div>
                                <Text strong>Customer Notes:</Text>
                                <Paragraph type="secondary">{order.customer_notes}</Paragraph>
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default OrderDetailPage;
