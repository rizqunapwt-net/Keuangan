import React, { useState, useEffect } from 'react';
import { Drawer, Form, Input, Button, Space, Select, InputNumber, message, Divider, Typography } from 'antd';
import { PushpinOutlined, InboxOutlined, DollarOutlined, InfoCircleOutlined } from '@ant-design/icons';
import api from '../../api';

const { Option } = Select;
const { Text } = Typography;

interface MaterialFormDrawerProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editId?: number | null;
}

const MaterialFormDrawer: React.FC<MaterialFormDrawerProps> = ({ open, onClose, onSuccess, editId }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(false);

    const fetchMaterialDetails = async (id: number) => {
        setFetchingData(true);
        try {
            const res = await api.get(`/percetakan/materials/${id}`);
            if (res.data?.data) {
                form.setFieldsValue(res.data.data);
            }
        } catch (err) {
            message.error('Gagal mengambil detail material');
            onClose();
        } finally {
            setFetchingData(false);
        }
    };

    useEffect(() => {
        if (open) {
            if (editId) {
                fetchMaterialDetails(editId);
            } else {
                form.resetFields();
            }
        }
    }, [open, editId]);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            if (editId) {
                await api.put(`/percetakan/materials/${editId}`, values);
                message.success('Material berhasil diperbarui');
            } else {
                await api.post('/percetakan/materials', values);
                message.success('Material berhasil ditambahkan');
            }
            form.resetFields();
            onSuccess();
            onClose();
        } catch (err: any) {
            message.error(err.response?.data?.message || 'Gagal menyimpan material');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Drawer
            title={
                <Space>
                    <PushpinOutlined style={{ color: '#0fb9b1', fontSize: 20 }} />
                    <span style={{ fontWeight: 700 }}>{editId ? 'Edit Material' : 'Tambah Material Baru'}</span>
                </Space>
            }
            width={480}
            onClose={onClose}
            open={open}
            styles={{ body: { paddingBottom: 80 } }}
            extra={
                <Space>
                    <Button onClick={onClose}>Batal</Button>
                    <Button 
                        onClick={() => form.submit()} 
                        type="primary" 
                        loading={loading || fetchingData} 
                        style={{ 
                            background: 'linear-gradient(135deg, #0fb9b1, #20bf6b)', 
                            border: 'none',
                            height: 38,
                            fontWeight: 600,
                            borderRadius: 8
                        }}
                    >
                        {editId ? 'Simpan Perubahan' : 'Simpan Material'}
                    </Button>
                </Space>
            }
        >
            <Form
                layout="vertical"
                form={form}
                onFinish={onFinish}
                disabled={fetchingData}
                initialValues={{
                    category: 'paper',
                    unit: 'pcs',
                    min_stock: 0,
                }}
            >
                <Form.Item
                    name="name"
                    label={<Space><InboxOutlined /> <Text strong>Nama Material</Text></Space>}
                    rules={[{ required: true, message: 'Harap isi nama material' }]}
                >
                    <Input placeholder="Contoh: Art Paper 150gr A3+" size="large" style={{ borderRadius: 8 }} />
                </Form.Item>

                <div style={{ display: 'flex', gap: 16 }}>
                    <Form.Item
                        name="category"
                        label={<Text strong>Kategori</Text>}
                        rules={[{ required: true }]}
                        style={{ flex: 1 }}
                    >
                        <Select size="large" style={{ borderRadius: 8 }}>
                            <Option value="paper">Kertas</Option>
                            <Option value="ink">Tinta</Option>
                            <Option value="plate">Plat Cetak</Option>
                            <Option value="consumable">Habis Pakai</Option>
                            <Option value="packaging">Packaging</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="unit"
                        label={<Text strong>Satuan</Text>}
                        rules={[{ required: true }]}
                        style={{ flex: 1 }}
                    >
                        <Select size="large" style={{ borderRadius: 8 }}>
                            <Option value="ream">Rim</Option>
                            <Option value="sheet">Lembar</Option>
                            <Option value="pcs">Pcs</Option>
                            <Option value="roll">Roll</Option>
                            <Option value="liter">Liter</Option>
                            <Option value="kg">Kg</Option>
                        </Select>
                    </Form.Item>
                </div>

                <Divider />

                <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: 12, marginBottom: 24 }}>
                    <Space style={{ display: 'flex' }} align="baseline">
                        <Form.Item
                            name="current_stock"
                            label={<Text strong>Stok Saat Ini</Text>}
                            rules={[{ required: true }]}
                        >
                            <InputNumber min={0} style={{ width: '100%', borderRadius: 8, height: 40 }} />
                        </Form.Item>
                        <Form.Item
                            name="min_stock"
                            label={<Text strong>Stok Minimum</Text>}
                        >
                            <InputNumber min={0} style={{ width: '100%', borderRadius: 8, height: 40 }} />
                        </Form.Item>
                    </Space>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        <InfoCircleOutlined /> Sistem akan memberi peringatan jika stok di bawah minimum
                    </Text>
                </div>

                <Form.Item
                    name="unit_cost"
                    label={<Space><DollarOutlined /> <Text strong>Harga Pokok Satuan (HPP/Modal)</Text></Space>}
                    rules={[{ required: true }]}
                >
                    <InputNumber
                        formatter={value => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                        parser={value => value!.replace(/Rp\s?|(\.*)/g, '') as any}
                        style={{ width: '100%', borderRadius: 8, height: 42 }}
                        min={0}
                        size="large"
                    />
                </Form.Item>
            </Form>
        </Drawer>
    );
};

export default MaterialFormDrawer;
