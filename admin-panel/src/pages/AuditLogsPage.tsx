import React, { useState, useEffect } from 'react';
import { Table, Tag, Card, Typography, Space, Input, DatePicker, Select, Button, Row, Col, Avatar } from 'antd';
import { 
    AuditOutlined, 
    SearchOutlined, 
    HistoryOutlined, 
    UserOutlined,
    ClockCircleOutlined,
    EyeOutlined
} from '@ant-design/icons';
import api from '../api';
import { motion } from 'framer-motion';
import { fmtDate } from '../utils/formatters';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const AuditLogsPage: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [eventType, setEventType] = useState<string | undefined>();
    const [tableName, setTableName] = useState<string | undefined>();
    const [pagination, setPagination] = useState({ current: 1, pageSize: 50, total: 0 });

    const fetchLogs = async (page = 1) => {
        setLoading(true);
        try {
            const response = await api.get('/audit/logs', {
                params: {
                    page,
                    per_page: pagination.pageSize,
                    search,
                    event_type: eventType,
                    table_name: tableName,
                }
            });
            const payload = response.data;
            setData(payload.data || []);
            setPagination(prev => ({ ...prev, current: page, total: payload.total }));
        } catch (error) {
            console.error('Error fetching audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/audit/logs-stats');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching audit stats:', error);
        }
    };

    useEffect(() => {
        fetchLogs();
        fetchStats();
    }, [eventType, tableName]);

    // Auto-refresh every 30s
    useEffect(() => {
        const interval = setInterval(() => {
            fetchLogs(pagination.current);
            fetchStats();
        }, 30000);
        return () => clearInterval(interval);
    }, [eventType, tableName, pagination.current]);

    const eventColors: Record<string, string> = {
        created: '#10b981',
        updated: '#3b82f6',
        deleted: '#ef4444',
        status_changed: '#f59e0b',
        voided: '#8b5cf6',
        data_modified: '#06b6d4',
        balance_changed: '#ec4899',
        login: '#8b5cf6',
        logout: '#64748b',
    };

    const eventLabels: Record<string, string> = {
        created: 'BUAT',
        updated: 'UBAH',
        deleted: 'HAPUS',
        status_changed: 'STATUS',
        voided: 'VOID',
        data_modified: 'MODIFIKASI',
        balance_changed: 'SALDO',
        login: 'LOGIN',
    };

    const columns = [
        {
            title: 'WAKTU',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 180,
            render: (date: string) => (
                <Space>
                    <ClockCircleOutlined style={{ color: '#94a3b8' }} />
                    <Text style={{ fontSize: 13 }}>{fmtDate(date)}</Text>
                </Space>
            ),
        },
        {
            title: 'USER',
            dataIndex: 'user',
            key: 'user',
            width: 180,
            render: (user: any) => (
                <Space>
                    <Avatar size="small" icon={<UserOutlined />} src={user?.avatar_url} />
                    <Text strong>{user?.name || 'System'}</Text>
                </Space>
            ),
        },
        {
            title: 'EVENT',
            dataIndex: 'event_type',
            key: 'event_type',
            width: 120,
            render: (type: string) => (
                <Tag color={eventColors[type] || 'default'} style={{ borderRadius: 6, fontWeight: 700, textTransform: 'uppercase', fontSize: 10 }}>
                    {eventLabels[type] || type}
                </Tag>
            ),
        },
        {
            title: 'MODUL',
            dataIndex: 'table_name',
            key: 'table_name',
            width: 150,
            render: (table: string) => {
                const moduleLabels: Record<string, string> = {
                    debts: 'Invoice/Piutang',
                    expenses: 'Biaya',
                    contacts: 'Kontak',
                    journals: 'Jurnal',
                    banks: 'Bank/Kas',
                    cash_transactions: 'Buku Kas',
                };
                return <Tag color="blue" bordered={false}>{moduleLabels[table] || table?.replace('_', ' ').toUpperCase()}</Tag>;
            }
        },
        {
            title: 'DESKRIPSI',
            dataIndex: 'description',
            key: 'description',
            render: (text: string) => <Text style={{ color: '#475569' }}>{text}</Text>,
        },
        {
            title: '',
            key: 'actions',
            width: 50,
            render: () => (
                <Button type="text" icon={<EyeOutlined />} style={{ color: '#0fb9b1' }} />
            ),
        },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <Title level={2} style={{ margin: 0, fontWeight: 800, letterSpacing: '-0.5px' }}>
                        Log <span style={{ color: '#0fb9b1' }}>Audit Keamanan</span>
                    </Title>
                    <Text type="secondary">Rekaman aktivitas pengguna dan perubahan sistem secara real-time.</Text>
                </div>
                <Space>
                    <Button icon={<HistoryOutlined />} style={{ borderRadius: 10 }}>Export Logs</Button>
                </Space>
            </div>

            <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
                <Col xs={24} md={6}>
                    <Card bordered={false} style={{ borderRadius: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#0fb9b110', color: '#0fb9b1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                                <AuditOutlined />
                            </div>
                            <div>
                                <Text type="secondary" style={{ fontSize: 11, fontWeight: 700 }}>TOTAL LOGS</Text>
                                <div style={{ fontSize: 24, fontWeight: 800 }}>{stats?.total || 0}</div>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} md={6}>
                    <Card bordered={false} style={{ borderRadius: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#3b82f610', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                                <ClockCircleOutlined />
                            </div>
                            <div>
                                <Text type="secondary" style={{ fontSize: 11, fontWeight: 700 }}>HARI INI</Text>
                                <div style={{ fontSize: 24, fontWeight: 800 }}>{stats?.today || 0}</div>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Card style={{ borderRadius: 20 }} bodyStyle={{ padding: 0 }}>
                <div style={{ padding: '20px 32px', borderBottom: '1px solid #f8f8f8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <Select 
                            placeholder="Jenis Event" 
                            style={{ width: 150 }} 
                            allowClear 
                            onChange={v => setEventType(v)}
                            options={[
                                { value: 'created', label: '🟢 Buat' },
                                { value: 'updated', label: '🔵 Ubah' },
                                { value: 'deleted', label: '🔴 Hapus' },
                                { value: 'status_changed', label: '🟡 Status' },
                                { value: 'voided', label: '🟣 Void' },
                                { value: 'data_modified', label: '🔷 Modifikasi' },
                                { value: 'balance_changed', label: '🔷 Saldo' },
                            ]}
                        />
                        <Select
                            placeholder="Modul"
                            style={{ width: 160 }}
                            allowClear
                            onChange={v => setTableName(v)}
                            options={[
                                { value: 'debts', label: 'Invoice/Piutang' },
                                { value: 'expenses', label: 'Biaya' },
                                { value: 'contacts', label: 'Kontak' },
                                { value: 'journals', label: 'Jurnal' },
                                { value: 'banks', label: 'Bank/Kas' },
                                { value: 'cash_transactions', label: 'Buku Kas' },
                            ]}
                        />
                        <RangePicker style={{ width: 280 }} />
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <Input
                            placeholder="Cari logs..."
                            prefix={<SearchOutlined style={{ color: '#ccc' }} />}
                            style={{ width: 240, borderRadius: 10 }}
                            onPressEnter={() => fetchLogs(1)}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <Button type="primary" icon={<SearchOutlined />} onClick={() => fetchLogs(1)} style={{ borderRadius: 10, background: '#0fb9b1', border: 'none' }}>
                            Cari
                        </Button>
                    </div>
                </div>

                <div style={{ padding: '0 8px' }}>
                    <Table
                        columns={columns}
                        dataSource={data}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            ...pagination,
                            onChange: (page) => fetchLogs(page),
                            showSizeChanger: false,
                        }}
                    />
                </div>
            </Card>
        </motion.div>
    );
};

export default AuditLogsPage;
