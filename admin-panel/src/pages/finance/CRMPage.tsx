import React from 'react';
import { Card, Typography, Breadcrumb, Row, Col, Button, Space, Tag, Divider } from 'antd';
import {
    WhatsAppOutlined, RocketOutlined, TeamOutlined,
    BarChartOutlined, MessageOutlined, ApiOutlined,
    RightOutlined, PlayCircleOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const features = [
    { icon: <WhatsAppOutlined style={{ fontSize: 28, color: '#25D366' }} />, title: 'WhatsApp Business API', description: 'Kirim pesan otomatis, blast, dan template ke ribuan kontak' },
    { icon: <TeamOutlined style={{ fontSize: 28, color: '#1890ff' }} />, title: 'Multi-Agent', description: 'Beberapa agen CS menangani percakapan secara bersamaan' },
    { icon: <MessageOutlined style={{ fontSize: 28, color: '#722ed1' }} />, title: 'Auto Reply & Chatbot', description: 'Balas pesan otomatis berdasarkan kata kunci' },
    { icon: <BarChartOutlined style={{ fontSize: 28, color: '#fa8c16' }} />, title: 'Analytics', description: 'Laporan performa agen, response time, dan conversion rate' },
    { icon: <RocketOutlined style={{ fontSize: 28, color: '#eb2f96' }} />, title: 'Broadcast', description: 'Kirim pesan massal ke segmen pelanggan tertentu' },
    { icon: <ApiOutlined style={{ fontSize: 28, color: '#13c2c2' }} />, title: 'API Integration', description: 'Hubungkan dengan marketplace, website, dan sistem lainnya' },
];

const CRMPage: React.FC = () => {
    return (
        <div>
            <Breadcrumb className="mb-4" items={[{ title: 'Beranda' }, { title: 'CRM' }]} />

            {/* Hero */}
            <Card bordered={false} style={{ borderRadius: 12, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', marginBottom: 24 }}>
                <Row gutter={24} align="middle">
                    <Col xs={24} md={14}>
                        <Tag color="#fff" style={{ color: '#764ba2', fontWeight: 600, marginBottom: 12 }}>CRM.ID by Rizquna Elfath</Tag>
                        <Title level={2} style={{ color: '#fff', margin: 0 }}>WhatsApp Business API & CRM</Title>
                        <Paragraph style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15, marginTop: 12, marginBottom: 20 }}>
                            Kelola semua percakapan pelanggan, automasi pesan WhatsApp, dan tingkatkan penjualan langsung dari dashboard Rizquna Elfath.
                        </Paragraph>
                        <Space>
                            <Button type="primary" size="large" style={{ background: '#52c41a', borderColor: '#52c41a' }} icon={<RocketOutlined />}>
                                Coba Gratis 14 Hari
                            </Button>
                            <Button ghost size="large" icon={<PlayCircleOutlined />} style={{ color: '#fff', borderColor: '#fff' }}>
                                Lihat Demo
                            </Button>
                        </Space>
                    </Col>
                    <Col xs={24} md={10} style={{ textAlign: 'center', padding: 32 }}>
                        <div style={{ width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                            <WhatsAppOutlined style={{ fontSize: 80, color: '#fff' }} />
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* Features */}
            <Title level={4} style={{ marginBottom: 16 }}>Fitur Unggulan</Title>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                {features.map((f) => (
                    <Col key={f.title} xs={24} sm={12} md={8}>
                        <Card hoverable bordered={false} style={{ borderRadius: 10, height: '100%' }} bodyStyle={{ padding: '20px 16px' }}>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <div style={{ minWidth: 40 }}>{f.icon}</div>
                                <div>
                                    <Text strong style={{ fontSize: 14 }}>{f.title}</Text>
                                    <div><Text type="secondary" style={{ fontSize: 12 }}>{f.description}</Text></div>
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Pricing */}
            <Card bordered={false} style={{ borderRadius: 12, textAlign: 'center' }}>
                <Title level={4}>Mulai dari Rp 349.000/bulan</Title>
                <Text type="secondary">Termasuk 1.000 pesan WhatsApp, unlimited agent, dan dashboard analytics</Text>
                <Divider />
                <Button type="primary" size="large" icon={<RightOutlined />}>Hubungi Sales</Button>
            </Card>
        </div>
    );
};

export default CRMPage;
