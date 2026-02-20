import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Typography, Card, Breadcrumb, Row, Col, Statistic, message, Avatar, Popconfirm } from 'antd';
import { PlusOutlined, UserOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const { Title, Text } = Typography;

interface Employee {
    id: number;
    name: string;
    email: string;
    phone: string;
}

const EmployeesPage: React.FC = () => {
    const [data, setData] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const response = await api.get('/finance/payroll/employees');
            setData(response.data);
        } catch {
            message.error('Gagal mengambil data karyawan');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/finance/payroll/employees/${id}`);
            message.success('Karyawan berhasil dihapus');
            fetchEmployees();
        } catch {
            message.error('Gagal menghapus karyawan');
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const columns = [
        {
            title: 'Karyawan',
            key: 'employee',
            render: (record: Employee) => (
                <Space size="middle">
                    <Avatar icon={<UserOutlined />} className="bg-blue-100 text-blue-600" />
                    <div>
                        <div>
                            <Text strong className="block">{record.name}</Text>
                            <Text type="secondary" className="text-xs">{record.email || '-'}</Text>
                        </div>
                    </div>
                </Space>
            ),
        },
        {
            title: 'No. Telepon',
            dataIndex: 'phone',
            key: 'phone',
            render: (text: string) => text || '-',
        },
        {
            title: 'Status Gaji',
            key: 'status',
            render: () => <Text className="text-green-600 font-medium italic">Siap Dibayar</Text>,
        },
        {
            title: 'Aksi',
            key: 'action',
            align: 'center' as const,
            render: (_: unknown, record: Employee) => (
                <Space size="middle">
                    <Popconfirm
                        title="Hapus karyawan ini?"
                        description="Data yang sudah dihapus tidak dapat dikembalikan."
                        onConfirm={() => handleDelete(record.id)}
                        okText="Hapus"
                        cancelText="Batal"
                        okButtonProps={{ danger: true }}
                    >
                        <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Breadcrumb className="mb-4" items={[{ title: 'Beranda' }, { title: 'Payroll' }, { title: 'Daftar Karyawan' }]} />

            <div className="flex justify-between items-center mb-6">
                <Title level={3} className="!m-0">Karyawan & Payroll</Title>
                <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => navigate('/payroll/employees/add')}>Tambah Karyawan</Button>
            </div>

            <Row gutter={[16, 16]} className="mb-6">
                <Col span={24}>
                    <Card className="shadow-sm border-gray-100 rounded-xl bg-blue-50">
                        <Statistic
                            title="Total Karyawan Aktif"
                            value={data.length}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#0958d9', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card className="shadow-sm border-gray-100 rounded-xl">
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </div>
    );
};

export default EmployeesPage;
