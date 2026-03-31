import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Switch, Space, Tag, message, Popconfirm, Card, Row, Col, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import PageHeader from '../../components/PageHeader';

interface User {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

const UserManagementPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/users');
      return res.data?.data || [];
    },
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const res = await api.get('/roles');
      return res.data?.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (values: any) => api.post('/users', values),
    onSuccess: () => {
      message.success('Pengguna berhasil dibuat');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (err: any) => message.error(err.response?.data?.message || 'Gagal membuat pengguna'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...values }: any) => api.put(`/users/${id}`, values),
    onSuccess: () => {
      message.success('Pengguna berhasil diperbarui');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
      setEditingUser(null);
      form.resetFields();
    },
    onError: (err: any) => message.error(err.response?.data?.message || 'Gagal memperbarui pengguna'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/users/${id}`),
    onSuccess: () => {
      message.success('Pengguna berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: any) => message.error(err.response?.data?.error?.message || 'Gagal menghapus pengguna'),
  });

  const handleSubmit = (values: any) => {
    if (editingUser) {
      const payload: any = { id: editingUser.id, name: values.name, email: values.email, roles: values.roles };
      if (values.password) payload.password = values.password;
      if (values.is_active !== undefined) payload.is_active = values.is_active;
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(values);
    }
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    form.setFieldsValue({ 
      name: user.name, 
      email: user.email, 
      is_active: user.is_active,
      roles: user.roles?.map((r: any) => r.name) || []
    });
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: 'Nama',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <Space>
          <UserOutlined />
          <span style={{ fontWeight: 500 }}>{name}</span>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Peran (Role)',
      dataIndex: 'roles',
      key: 'roles',
      render: (roleList: any[]) => (
        <Space wrap>
          {roleList?.map((r: any) => (
            <Tag color={r.name === 'Admin' ? 'purple' : 'blue'} key={r.name}>{r.name}</Tag>
          )) || <Tag>User</Tag>}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>{active ? 'Aktif' : 'Nonaktif'}</Tag>
      ),
    },
    {
      title: 'Login Terakhir',
      dataIndex: 'last_login_at',
      key: 'last_login_at',
      render: (val: string | null) => val ? new Date(val).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-',
    },
    {
      title: 'Aksi',
      key: 'actions',
      width: 150,
      render: (_: any, record: User) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            Edit
          </Button>
          <Popconfirm title="Hapus pengguna ini?" onConfirm={() => deleteMutation.mutate(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Manajemen Pengguna"
        subtitle="Kelola akun pengguna dan hak akses sistem (RBAC/REBAC)"
      />

      <Card
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingUser(null);
              form.resetFields();
              setIsModalOpen(true);
            }}
          >
            Tambah Pengguna
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          loading={isLoading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'Belum ada pengguna' }}
        />
      </Card>

      <Modal
        title={editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); setEditingUser(null); form.resetFields(); }}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText={editingUser ? 'Simpan' : 'Buat'}
        cancelText="Batal"
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Nama" rules={[{ required: true, message: 'Nama wajib diisi' }]}>
                <Input placeholder="Nama lengkap" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Email tidak valid' }]}>
                <Input placeholder="email@example.com" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
             <Col span={24}>
                <Form.Item name="roles" label="Hak Akses (Roles)" rules={[{ required: true, message: 'Minimal pilih satu role' }]}>
                   <Select mode="multiple" placeholder="Pilih Role" style={{ width: '100%' }}>
                      {roles.map((r: any) => (
                        <Select.Option key={r.name} value={r.name}>{r.name}</Select.Option>
                      ))}
                   </Select>
                </Form.Item>
             </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="password"
                label="Password"
                rules={editingUser ? [] : [{ required: true, message: 'Password wajib diisi' }, { min: 8, message: 'Minimal 8 karakter' }]}
              >
                <Input.Password placeholder={editingUser ? 'Kosongkan jika tidak diubah' : 'Minimal 8 karakter'} />
              </Form.Item>
            </Col>
            {!editingUser && (
              <Col span={12}>
                <Form.Item
                  name="password_confirmation"
                  label="Konfirmasi Password"
                  rules={[{ required: true, message: 'Konfirmasi password wajib' }]}
                >
                  <Input.Password placeholder="Ulangi password" />
                </Form.Item>
              </Col>
            )}
          </Row>
          
          {editingUser && (
            <Form.Item name="is_active" label="Status Aktif" valuePropName="checked">
              <Switch checkedChildren="Aktif" unCheckedChildren="Nonaktif" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
