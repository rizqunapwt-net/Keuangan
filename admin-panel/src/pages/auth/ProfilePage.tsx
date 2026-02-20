import React from 'react';
import { Card, Avatar, Typography, Descriptions, Tag, Divider, Row, Col, Space } from 'antd';
import { UserOutlined, KeyOutlined, SolutionOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;

const ProfilePage: React.FC = () => {
    const { user } = useAuth();

    return (
        <div className="max-w-4xl mx-auto">
            <Title level={3} className="mb-6">Profil Pengguna</Title>

            <Row gutter={24}>
                <Col span={8}>
                    <Card className="text-center shadow-sm border-gray-100 rounded-2xl">
                        <Avatar size={100} icon={<UserOutlined />} className="bg-indigo-100 text-indigo-600 mb-4" />
                        <Title level={4} className="!m-0">{user?.name || 'User'}</Title>
                        <Text type="secondary">{user?.tenant?.name || '-'}</Text>
                        <Divider />
                        <div className="text-left space-y-4">
                            <div className="flex items-center gap-3">
                                <Tag color="gold">{(user?.role as string) || 'User'}</Tag>
                                <Tag color="green">Aktif</Tag>
                            </div>
                        </div>
                    </Card>
                </Col>

                <Col span={16}>
                    <Card className="shadow-sm border-gray-100 rounded-2xl mb-6">
                        <Title level={5} className="mb-4 flex items-center gap-2">
                            <SolutionOutlined className="text-indigo-500" /> Informasi Pribadi
                        </Title>
                        <Descriptions column={1} bordered size="small">
                            <Descriptions.Item label="Nama Lengkap">{user?.name || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Email">{user?.email || '-'}</Descriptions.Item>
                        </Descriptions>
                    </Card>

                    <Card className="shadow-sm border-gray-100 rounded-2xl">
                        <Title level={5} className="mb-4 flex items-center gap-2">
                            <KeyOutlined className="text-orange-500" /> Keamanan & Akun
                        </Title>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <Text strong>Kata Sandi</Text>
                                    <br />
                                    <Text type="secondary" style={{ fontSize: '12px' }}>Fitur ganti password segera hadir</Text>
                                </div>
                            </div>
                        </Space>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ProfilePage;
