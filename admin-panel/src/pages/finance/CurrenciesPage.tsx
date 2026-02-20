import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Typography, Card, Breadcrumb, Row, Col, Statistic, Tag, Modal, Form, Input, InputNumber, Switch, message, Popconfirm } from 'antd';
import { PlusOutlined, GlobalOutlined, SyncOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../api';

const { Title, Text } = Typography;

interface Currency {
    id: number;
    code: string;
    symbol: string;
    exchangeRate: number;
    isBase: boolean;
}

const CurrenciesPage: React.FC = () => {
    const [data, setData] = useState<Currency[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
    const [form] = Form.useForm();

    const fetchCurrencies = async () => {
        setLoading(true);
        try {
            const response = await api.get('/finance/currencies');
            setData(response.data || []);
        } catch {
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCurrencies();
    }, []);

    const baseCurrency = data.find(c => c.isBase);

    const handleOpenModal = (currency?: Currency) => {
        if (currency) {
            setEditingCurrency(currency);
            form.setFieldsValue(currency);
        } else {
            setEditingCurrency(null);
            form.resetFields();
        }
        setModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/finance/currencies/${id}`);
            message.success('Mata uang berhasil dihapus');
            fetchCurrencies();
        } catch {
            message.error('Gagal menghapus mata uang');
        }
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            if (editingCurrency) {
                await api.put(`/finance/currencies/${editingCurrency.id}`, values);
                message.success('Mata uang berhasil diperbarui');
            } else {
                await api.post('/finance/currencies', values);
                message.success('Mata uang berhasil ditambahkan');
            }
            setModalOpen(false);
            form.resetFields();
            setEditingCurrency(null);
            fetchCurrencies();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            message.error(err.response?.data?.message || 'Gagal menyimpan mata uang');
        }
    };

    const columns = [
        {
            title: 'Kode',
            dataIndex: 'code',
            key: 'code',
            render: (text: string) => <Text strong>{text}</Text>,
        },
        {
            title: 'Simbol',
            dataIndex: 'symbol',
            key: 'symbol',
        },
        {
            title: 'Kurs (vs Base)',
            dataIndex: 'exchangeRate',
            key: 'exchangeRate',
            align: 'right' as const,
            render: (val: number, record: Currency) => record.isBase ? '-' : Number(val).toLocaleString('id-ID'),
        },
        {
            title: 'Tipe',
            dataIndex: 'isBase',
            key: 'isBase',
            render: (isBase: boolean) => isBase ? <Tag color="blue">Mata Uang Dasar</Tag> : <Tag>Mata Uang Asing</Tag>,
        },
        {
            title: 'Aksi',
            key: 'action',
            align: 'center' as const,
            render: (_: unknown, record: Currency) => (
                <Space size="middle">
                    {!record.isBase && (
                        <Button type="link" icon={<SyncOutlined />} onClick={() => handleOpenModal(record)}>Update Kurs</Button>
                    )}
                    <Button type="link" onClick={() => handleOpenModal(record)}>Edit</Button>
                    {!record.isBase && (
                        <Popconfirm
                            title="Hapus mata uang ini?"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Hapus"
                            cancelText="Batal"
                            okButtonProps={{ danger: true }}
                        >
                            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Breadcrumb className="mb-4" items={[{ title: 'Beranda' }, { title: 'Settings' }, { title: 'Mata Uang' }]} />

            <div className="flex justify-between items-center mb-6">
                <Title level={3} className="!m-0">Multi Mata Uang</Title>
                <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => handleOpenModal()}>Tambah Mata Uang</Button>
            </div>

            <Row gutter={[16, 16]} className="mb-6">
                <Col span={24}>
                    <Card className="shadow-sm border-gray-100 rounded-xl bg-indigo-50">
                        <Statistic
                            title="Mata Uang Dasar"
                            value={baseCurrency ? `${baseCurrency.code} (${baseCurrency.symbol})` : 'Belum diatur'}
                            prefix={<GlobalOutlined />}
                            valueStyle={{ color: '#3f51b5', fontWeight: 'bold' }}
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
                    pagination={{ pageSize: 10, showSizeChanger: true }}
                />
            </Card>

            <Modal
                title={editingCurrency ? 'Edit Mata Uang' : 'Tambah Mata Uang'}
                open={modalOpen}
                onOk={handleSave}
                onCancel={() => { setModalOpen(false); form.resetFields(); setEditingCurrency(null); }}
                okText="Simpan"
                cancelText="Batal"
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="code" label="Kode" rules={[{ required: true, message: 'Masukkan kode mata uang' }]}>
                        <Input placeholder="USD" maxLength={5} />
                    </Form.Item>
                    <Form.Item name="symbol" label="Simbol" rules={[{ required: true, message: 'Masukkan simbol' }]}>
                        <Input placeholder="$" maxLength={5} />
                    </Form.Item>
                    <Form.Item name="exchangeRate" label="Kurs" rules={[{ required: true, message: 'Masukkan kurs' }]}>
                        <InputNumber min={0} style={{ width: '100%' }} placeholder="15600" />
                    </Form.Item>
                    <Form.Item name="isBase" label="Mata Uang Dasar" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CurrenciesPage;
