import React, { useState, useEffect } from 'react';
import { Card, List, Button, Tag, Typography, Space, Modal, message, Row, Col, Divider } from 'antd';
import { 
    SafetyOutlined, 
    LaptopOutlined, 
    MobileOutlined, 
    GlobalOutlined, 
    LogoutOutlined,
    ClockCircleOutlined,
    CheckCircleFilled
} from '@ant-design/icons';
import api from '../../api';
import { motion } from 'framer-motion';
import { fmtDate } from '../../utils/formatters';

const { Title, Text } = Typography;

const SecuritySessionsPage: React.FC = () => {
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const response = await api.get('/user/sessions');
            setSessions(response.data?.data || []);
        } catch (error) {
            message.error('Gagal mengambil data sesi aktif.');
        } finally {
            setLoading(false);
        }
    };

    const handleRevoke = (id: number) => {
        Modal.confirm({
            title: 'Keluarkan Sesi?',
            content: 'Perangkat ini akan langsung keluar dari sistem dan harus login ulang.',
            okText: 'Keluarkan',
            okType: 'danger',
            cancelText: 'Batal',
            onOk: async () => {
                try {
                    await api.delete(`/user/sessions/${id}`);
                    message.success('Sesi berhasil dikeluarkan.');
                    fetchSessions();
                } catch (error) {
                    message.error('Gagal mengeluarkan sesi.');
                }
            }
        });
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ marginBottom: 32 }}>
                <Title level={2} style={{ margin: 0, fontWeight: 800, letterSpacing: '-0.5px' }}>
                    Sesi <span style={{ color: '#0fb9b1' }}>Aktif & Keamanan</span>
                </Title>
                <Text type="secondary">Kelola perangkat yang saat ini masuk ke akun Anda.</Text>
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                    <Card style={{ borderRadius: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }} bodyStyle={{ padding: 0 }}>
                        <div style={{ padding: '24px 32px', borderBottom: '1px solid #f8f9fa' }}>
                            <Title level={5} style={{ margin: 0 }}>Daftar Perangkat</Title>
                        </div>
                        <List
                            loading={loading}
                            dataSource={sessions}
                            renderItem={(item: any) => (
                                <List.Item
                                    style={{ padding: '24px 32px', borderBottom: '1px solid #f8f9fa' }}
                                    actions={[
                                        item.is_current ? (
                                            <Tag color="success" style={{ borderRadius: 6, fontWeight: 600, padding: '4px 12px' }}>
                                                SESI INI
                                            </Tag>
                                        ) : (
                                            <Button 
                                                danger 
                                                type="text" 
                                                icon={<LogoutOutlined />}
                                                onClick={() => handleRevoke(item.id)}
                                            >
                                                Keluarkan
                                            </Button>
                                        )
                                    ]}
                                >
                                    <List.Item.Meta
                                        avatar={
                                            <div style={{ 
                                                width: 48, height: 48, borderRadius: 14, 
                                                background: item.is_current ? '#0fb9b110' : '#f8f9fa', 
                                                color: item.is_current ? '#0fb9b1' : '#64748b',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
                                            }}>
                                                {item.name?.toLowerCase().includes('mobile') ? <MobileOutlined /> : <LaptopOutlined />}
                                            </div>
                                        }
                                        title={
                                            <Space>
                                                <Text strong style={{ fontSize: 16 }}>{item.name || 'Perangkat Tidak Dikenal'}</Text>
                                                {item.is_current && <CheckCircleFilled style={{ color: '#0fb9b1' }} />}
                                            </Space>
                                        }
                                        description={
                                            <Space direction="vertical" size={2}>
                                                <Space split={<Text type="secondary">|</Text>}>
                                                    <Text type="secondary"><GlobalOutlined /> IP: {item.ip_address || '127.0.0.1'}</Text>
                                                    <Text type="secondary"><ClockCircleOutlined /> Terakhir aktif: {fmtDate(item.last_used_at)}</Text>
                                                </Space>
                                                <Text type="secondary" style={{ fontSize: 12 }}>Dibuat pada: {fmtDate(item.created_at)}</Text>
                                            </Space>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card style={{ borderRadius: 24, background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: '#fff', border: 'none' }}>
                        <Space direction="vertical" size={20} style={{ width: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <SafetyOutlined style={{ fontSize: 24, color: '#0fb9b1' }} />
                                <Title level={4} style={{ margin: 0, color: '#fff' }}>Tips Keamanan</Title>
                            </div>
                            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 1.6 }}>
                                Jika Anda melihat perangkat yang mencurigakan atau tidak Anda kenali, segera keluarkan sesi tersebut dan ubah kata sandi Anda.
                            </Text>
                            <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: 16 }}>
                                <Text strong style={{ color: '#fff', display: 'block', marginBottom: 8 }}>Butuh Bantuan?</Text>
                                <Button type="primary" block style={{ background: '#0fb9b1', border: 'none', height: 40, borderRadius: 10 }}>
                                    Hubungi IT Support
                                </Button>
                            </div>
                        </Space>
                    </Card>
                </Col>
            </Row>
        </motion.div>
    );
};

export default SecuritySessionsPage;
