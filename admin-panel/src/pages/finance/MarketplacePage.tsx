import React from 'react';
import { Card, Row, Col, Typography, Button, Space, Tag, Avatar, Breadcrumb, Divider } from 'antd';
import { ShoppingOutlined, LinkOutlined, ApiOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const MarketplacePage: React.FC = () => {
    const availableChannels = [
        { name: 'Shopee', color: '#ff4d00', description: 'Integrasi pesanan dan produk Shopee' },
        { name: 'Tokopedia', color: '#42b549', description: 'Sinkronisasi otomatis dengan Tokopedia' },
        { name: 'Lazada', color: '#133596', description: 'Hubungkan toko Lazada Anda' },
    ];

    return (
        <div>
            <Breadcrumb className="mb-4" items={[{ title: 'Beranda' }, { title: 'Settings' }, { title: 'Marketplace' }]} />

            <div className="flex justify-between items-center mb-6">
                <Title level={3} className="!m-0">Integrasi Marketplace</Title>
            </div>

            <Card bordered={false} style={{ borderRadius: 12, background: 'linear-gradient(135deg, #fa8c16 0%, #d46b08 100%)', marginBottom: 24, textAlign: 'center', padding: '24px 0' }}>
                <ApiOutlined style={{ fontSize: 48, color: '#fff', marginBottom: 12 }} />
                <Title level={3} style={{ color: '#fff', margin: 0 }}>Segera Hadir</Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.85)', marginTop: 8 }}>
                    Fitur integrasi marketplace sedang dalam pengembangan. Hubungkan toko online Anda untuk sinkronisasi pesanan dan stok secara otomatis.
                </Paragraph>
            </Card>

            <Title level={4}>Channel Tersedia</Title>
            <Row gutter={[16, 16]}>
                {availableChannels.map(channel => (
                    <Col span={8} key={channel.name}>
                        <Card className="shadow-sm border-gray-100 rounded-xl">
                            <div className="flex justify-between items-start">
                                <Space>
                                    <Avatar style={{ backgroundColor: channel.color }} icon={<ShoppingOutlined />} />
                                    <div>
                                        <Text strong className="text-lg block">{channel.name}</Text>
                                        <Tag color="default">Belum Terhubung</Tag>
                                    </div>
                                </Space>
                                <Button type="primary" size="small" icon={<LinkOutlined />} disabled>Connect</Button>
                            </div>
                            <Divider className="my-3" />
                            <Text type="secondary" style={{ fontSize: 12 }}>{channel.description}</Text>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default MarketplacePage;
