import React from 'react';
import { Form, Input, Button, Card, Typography, Row, Col, Breadcrumb, message, Divider, Alert } from 'antd';
import { ShopOutlined, SaveOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;

const CompanyProfilePage: React.FC = () => {
    const [form] = Form.useForm();
    const { user } = useAuth();

    const onFinish = () => {
        message.info('Fitur penyimpanan profil perusahaan segera hadir');
    };

    return (
        <div>
            <Breadcrumb className="mb-4" items={[{ title: 'Beranda' }, { title: 'Settings' }, { title: 'Perusahaan' }]} />

            <div className="flex justify-between items-center mb-6">
                <Title level={3} className="!m-0">Profil Perusahaan</Title>
                <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    size="large"
                    onClick={() => form.submit()}
                >
                    Simpan Perubahan
                </Button>
            </div>

            <Alert
                message="Fitur ini masih dalam pengembangan"
                description="Data profil perusahaan saat ini bersifat read-only. Fitur edit lengkap akan segera hadir."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
            />

            <Card className="shadow-sm border-gray-100 rounded-xl">
                <Form
                    form={form}
                    layout="horizontal"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    onFinish={onFinish}
                    initialValues={{
                        name: user?.tenant?.name || '',
                        email: user?.email || '',
                        phone: '',
                        address: '',
                        taxId: '',
                        website: ''
                    }}
                >
                    <Row gutter={24}>
                        <Col span={12}>
                            <Title level={5}><ShopOutlined /> Identitas Bisnis</Title>
                            <Form.Item label="Nama Perusahaan" name="name" rules={[{ required: true }]}>
                                <Input size="large" />
                            </Form.Item>
                            <Form.Item label="NPWP (Tax ID)" name="taxId">
                                <Input size="large" />
                            </Form.Item>
                            <Form.Item label="Website" name="website">
                                <Input size="large" />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Title level={5}><InfoCircleOutlined /> Kontak & Lokasi</Title>
                            <Form.Item label="Email Bisnis" name="email" rules={[{ required: true, type: 'email' }]}>
                                <Input size="large" />
                            </Form.Item>
                            <Form.Item label="No. Telepon" name="phone">
                                <Input size="large" />
                            </Form.Item>
                            <Form.Item label="Alamat Lengkap" name="address">
                                <Input.TextArea rows={4} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Card>

            <Divider />
            <div className="text-center text-gray-400">
                <Text type="secondary">Data ini akan muncul pada Kop Surat dan Laporan Keuangan Anda.</Text>
            </div>
        </div>
    );
};

export default CompanyProfilePage;
