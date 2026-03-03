import React, { useState } from 'react';
import { Card, Typography, Form, Input, Button, message, Divider, Avatar, Row, Col, Breadcrumb } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';

const { Title, Text } = Typography;

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [changingPassword, setChangingPassword] = useState(false);
  const [form] = Form.useForm();

  const handleChangePassword = async (values: { current_password: string; new_password: string; new_password_confirmation: string }) => {
    setChangingPassword(true);
    try {
      await api.post('/auth/change-password', values);
      message.success('Password berhasil diubah');
      form.resetFields();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Gagal mengubah password');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div>
      <Breadcrumb className="mb-4" items={[{ title: 'Beranda' }, { title: 'Profil' }]} />
      <Title level={4} style={{ marginBottom: 24 }}>Profil Saya</Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card bordered={false} style={{ borderRadius: 16, textAlign: 'center' }}>
            <Avatar size={80} icon={<UserOutlined />} style={{ background: 'linear-gradient(135deg, #0ea5e9, #2563eb)', marginBottom: 16 }} />
            <Title level={5} style={{ margin: 0 }}>{user?.name || 'Admin'}</Title>
            <Text type="secondary">{user?.email}</Text>
            <Divider />
            <div style={{ textAlign: 'left' }}>
              <div style={{ marginBottom: 12 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>Role</Text>
                <div><Text strong>{(user as any)?.role || 'Administrator'}</Text></div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Bergabung</Text>
                <div><Text strong>{(user as any)?.created_at ? new Date((user as any).created_at).toLocaleDateString('id-ID') : '-'}</Text></div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Card title="Ubah Password" bordered={false} style={{ borderRadius: 16 }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleChangePassword}
              requiredMark={false}
            >
              <Form.Item
                name="current_password"
                label="Password Saat Ini"
                rules={[{ required: true, message: 'Masukkan password saat ini' }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Password saat ini" size="large" />
              </Form.Item>

              <Form.Item
                name="new_password"
                label="Password Baru"
                rules={[
                  { required: true, message: 'Masukkan password baru' },
                  { min: 8, message: 'Minimal 8 karakter' },
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Password baru" size="large" />
              </Form.Item>

              <Form.Item
                name="new_password_confirmation"
                label="Konfirmasi Password Baru"
                dependencies={['new_password']}
                rules={[
                  { required: true, message: 'Konfirmasi password baru' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('new_password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Password tidak cocok'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Ulangi password baru" size="large" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={changingPassword} size="large" style={{ borderRadius: 10 }}>
                  Simpan Password
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProfilePage;
