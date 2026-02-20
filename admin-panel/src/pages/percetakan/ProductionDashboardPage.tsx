import React, { useState, useEffect } from 'react';
import {
    Card,
    Typography,
    Row,
    Col,
    Statistic,
    Progress,
    Table,
    Tag,
    Badge,
    Timeline,
    Alert,
} from 'antd';
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    WarningOutlined,
    ThunderboltOutlined,
    ForkOutlined,
} from '@ant-design/icons';
import api from '../../api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const ProductionDashboardPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>({
        total_jobs: 0,
        by_stage: {},
        by_status: {},
        efficiency: { avg_completion_time_hours: 0 },
        today: { started: 0, completed: 0 },
    });
    const [activeJobs, setActiveJobs] = useState([]);
    const [urgentOrders, setUrgentOrders] = useState([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // Load production statistics
            const statsResponse = await api.get('/percetakan/production-jobs/statistics');
            setStats(statsResponse.data.data || {});

            // Load active jobs
            const jobsResponse = await api.get('/percetakan/production-jobs', {
                params: { status: 'in_progress', per_page: 10 },
            });
            setActiveJobs(jobsResponse.data.data || []);

            // Load urgent orders
            const ordersResponse = await api.get('/percetakan/orders', {
                params: { status: 'in_production', priority: 'urgent', per_page: 10 },
            });
            setUrgentOrders(ordersResponse.data.data || []);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStageColor = (stage: string) => {
        const colors: any = {
            'pre-press': 'blue',
            'printing': 'purple',
            'finishing': 'orange',
            'qc': 'cyan',
            'packaging': 'green',
        };
        return colors[stage] || 'default';
    };

    const jobColumns = [
        {
            title: 'Job Number',
            dataIndex: 'job_number',
            key: 'job_number',
            width: 150,
        },
        {
            title: 'Order',
            dataIndex: ['order', 'order_number'],
            key: 'order',
            width: 120,
        },
        {
            title: 'Stage',
            dataIndex: 'stage',
            key: 'stage',
            width: 120,
            render: (stage: string) => (
                <Tag color={getStageColor(stage)}>
                    {stage.replace('-', ' ').toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Machine',
            dataIndex: ['machine', 'name'],
            key: 'machine',
            width: 150,
            ellipsis: true,
        },
        {
            title: 'Operator',
            dataIndex: ['operator', 'name'],
            key: 'operator',
            width: 150,
            ellipsis: true,
        },
        {
            title: 'Progress',
            key: 'progress',
            width: 150,
            render: (_: any, record: any) => (
                <Progress
                    percent={record.quantity?.efficiency_percentage || 0}
                    size="small"
                    format={() => `${record.quantity?.efficiency_percentage || 0}%`}
                />
            ),
        },
        {
            title: 'Started',
            dataIndex: 'timing',
            key: 'started',
            width: 150,
            render: (timing: any) =>
                timing?.started_at ? dayjs(timing.started_at).format('DD MMM, HH:mm') : '-',
        },
    ];

    return (
        <div className="p-6">
            <div className="mb-6">
                <Title level={3}>🏭 Production Dashboard</Title>
                <Text type="secondary">
                    Real-time monitoring produksi percetakan
                </Text>
            </div>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Jobs"
                            value={stats.total_jobs}
                            prefix={<FactoryOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="In Progress"
                            value={stats.by_status?.in_progress || 0}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Completed Today"
                            value={stats.today?.completed || 0}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Avg Completion"
                            value={stats.efficiency?.avg_completion_time_hours || 0}
                            suffix="hours"
                            prefix={<ThunderboltOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                {/* Active Jobs */}
                <Col xs={24} lg={16}>
                    <Card
                        title="🔄 Active Production Jobs"
                        className="mb-4"
                        extra={
                            <Badge count={stats.by_status?.in_progress || 0} showZero />
                        }
                    >
                        <Table
                            columns={jobColumns}
                            dataSource={activeJobs}
                            rowKey="id"
                            pagination={false}
                            size="middle"
                            scroll={{ x: 1000 }}
                        />
                    </Card>

                    {/* Production by Stage */}
                    <Card title="📊 Production by Stage" className="mb-4">
                        <Row gutter={[16, 16]}>
                            {Object.entries(stats.by_stage || {}).map(([stage, count]: any) => (
                                <Col xs={24} sm={12} lg={8} key={stage}>
                                    <Card size="small">
                                        <Statistic
                                            title={stage.replace('-', ' ').toUpperCase()}
                                            value={count}
                                            valueStyle={{
                                                color: stage === 'printing' ? '#722ed1' :
                                                       stage === 'qc' ? '#13c2c2' :
                                                       stage === 'packaging' ? '#52c41a' :
                                                       stage === 'finishing' ? '#fa8c16' : '#1890ff',
                                            }}
                                        />
                                        <Progress
                                            percent={(count / stats.total_jobs) * 100 || 0}
                                            size="small"
                                            showInfo={false}
                                            strokeColor={getStageColor(stage)}
                                        />
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Card>
                </Col>

                {/* Urgent Orders & Alerts */}
                <Col xs={24} lg={8}>
                    <Card
                        title="🔥 Urgent Orders"
                        className="mb-4"
                        extra={
                            <Badge count={urgentOrders.length} showZero color="red" />
                        }
                    >
                        {urgentOrders.length > 0 ? (
                            <Timeline
                                items={urgentOrders.map((order: any) => ({
                                    key: order.id,
                                    color: 'red',
                                    title: order.order_number,
                                    children: (
                                        <div>
                                            <Text strong>{order.customer?.name}</Text>
                                            <br />
                                            <Text type="secondary">
                                                Deadline: {dayjs(order.dates.deadline).format('DD MMM')}
                                            </Text>
                                        </div>
                                    ),
                                }))}
                            />
                        ) : (
                            <Alert
                                message="Tidak ada order urgent"
                                type="success"
                                showIcon
                            />
                        )}
                    </Card>

                    <Card title="⚠️ Alerts" className="mb-4">
                        <Timeline
                            items={[
                                {
                                    key: 1,
                                    color: 'orange',
                                    dot: <WarningOutlined />,
                                    title: 'Low Stock Materials',
                                    children: '3 materials below minimum stock',
                                },
                                {
                                    key: 2,
                                    color: 'blue',
                                    dot: <ClockCircleOutlined />,
                                    title: 'Maintenance Due',
                                    children: '2 machines need maintenance this week',
                                },
                            ]}
                        />
                    </Card>

                    {/* Stage Distribution */}
                    <Card title="📈 Stage Distribution">
                        {Object.entries(stats.by_stage || {}).map(([stage, count]: any) => (
                            <div key={stage} className="mb-4">
                                <div className="flex justify-between mb-1">
                                    <Text>{stage.replace('-', ' ').toUpperCase()}</Text>
                                    <Text strong>{count}</Text>
                                </div>
                                <Progress
                                    percent={(count / stats.total_jobs) * 100 || 0}
                                    size="small"
                                    strokeColor={getStageColor(stage)}
                                />
                            </div>
                        ))}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ProductionDashboardPage;
