import React from 'react';
import { Form, Input, InputNumber, DatePicker, Button, Card, Select, message, Space, Divider } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';

const AddPurchasePage: React.FC = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const { data: contacts = [] } = useQuery({
        queryKey: ['contacts'],
        queryFn: async () => {
            const res = await api.get('/finance/contacts');
            return res.data?.data || res.data || [];
        },
    });
    const { data: products = [] } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const res = await api.get('/finance/products');
            return res.data?.data || res.data || [];
        },
    });

    const vendors = contacts.filter((c: Record<string, unknown>) => c.type === 'vendor');

    interface PurchaseItem {
        productId: number;
        description?: string;
        qty: number;
        price: number;
        total: number;
    }

    const onFinish = async (values: Record<string, unknown>) => {
        try {
            const items = (values.items || []) as PurchaseItem[];
            const transDate = values.transDate as { format: (f: string) => string };
            const dueDate = values.dueDate as { format: (f: string) => string };
            const total = items.reduce((sum: number, item: PurchaseItem) => sum + (item?.total || 0), 0);
            await api.post('/finance/purchases', {
                contactId: values.contactId,
                refNumber: values.refNumber,
                transDate: transDate.format('YYYY-MM-DD'),
                dueDate: dueDate.format('YYYY-MM-DD'),
                total,
                items: items.map((item: PurchaseItem) => ({
                    productId: item.productId,
                    description: item.description || '',
                    qty: item.qty,
                    price: item.price,
                    total: item.total,
                })),
            });
            message.success('Pembelian berhasil dibuat!');
            navigate('/purchases');
        } catch (error: unknown) {
            const e = error as { response?: { data?: { message?: string } } };
            message.error(e.response?.data?.message || 'Gagal membuat pembelian');
        }
    };

    return (
        <div>
            <h1>Buat Pembelian Baru</h1>
            <Card>
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
                        <Form.Item name="contactId" label="Supplier" rules={[{ required: true }]}>
                            <Select placeholder="Pilih Supplier" options={vendors.map((v: Record<string, unknown>) => ({ value: v.id, label: v.name as string }))} />
                        </Form.Item>
                        <Form.Item name="refNumber" label="No. Referensi" rules={[{ required: true }]}>
                            <Input placeholder="PO-001" />
                        </Form.Item>
                        <Form.Item name="transDate" label="Tanggal" rules={[{ required: true }]}>
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item name="dueDate" label="Jatuh Tempo" rules={[{ required: true }]}>
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </div>

                    <Divider>Item Pembelian</Divider>

                    <Form.List name="items" initialValue={[{}]}>
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Space key={key} style={{ display: 'flex', marginBottom: 8, alignItems: 'flex-start' }}>
                                        <Form.Item {...restField} name={[name, 'productId']} rules={[{ required: true }]} style={{ width: 200 }}>
                                            <Select placeholder="Produk" options={products.map((p: Record<string, unknown>) => ({ value: p.id, label: p.name as string }))} />
                                        </Form.Item>
                                        <Form.Item {...restField} name={[name, 'description']} style={{ width: 200 }}>
                                            <Input placeholder="Deskripsi" />
                                        </Form.Item>
                                        <Form.Item {...restField} name={[name, 'qty']} rules={[{ required: true }]} style={{ width: 100 }}>
                                            <InputNumber placeholder="Qty" min={1} style={{ width: '100%' }} onChange={() => {
                                                const items = form.getFieldValue('items');
                                                if (items[name]) {
                                                    items[name].total = (items[name].qty || 0) * (items[name].price || 0);
                                                    form.setFieldsValue({ items });
                                                }
                                            }} />
                                        </Form.Item>
                                        <Form.Item {...restField} name={[name, 'price']} rules={[{ required: true }]} style={{ width: 150 }}>
                                            <InputNumber placeholder="Harga" min={0} style={{ width: '100%' }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')} onChange={() => {
                                                const items = form.getFieldValue('items');
                                                if (items[name]) {
                                                    items[name].total = (items[name].qty || 0) * (items[name].price || 0);
                                                    form.setFieldsValue({ items });
                                                }
                                            }} />
                                        </Form.Item>
                                        <Form.Item {...restField} name={[name, 'total']} style={{ width: 150 }}>
                                            <InputNumber placeholder="Total" disabled style={{ width: '100%' }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')} />
                                        </Form.Item>
                                        {fields.length > 1 && <MinusCircleOutlined onClick={() => remove(name)} />}
                                    </Space>
                                ))}
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                    Tambah Item
                                </Button>
                            </>
                        )}
                    </Form.List>

                    <Divider />
                    <Button type="primary" htmlType="submit" size="large">
                        Simpan Pembelian
                    </Button>
                </Form>
            </Card>
        </div>
    );
};

export default AddPurchasePage;
