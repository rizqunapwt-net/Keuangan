import React, { useState, useEffect } from 'react';
import {
    Form, Input, Button, DatePicker, Select, Table, InputNumber,
    Card, Typography, Space, Divider, message, Breadcrumb
} from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import api from '../../api';

const { Title, Text } = Typography;
const { Option } = Select;

interface Product {
    id: number;
    name: string;
    sku: string;
    sellPrice: number;
}

interface Contact {
    id: number;
    name: string;
}

interface InvoiceItemState {
    key: number;
    productId: number | null;
    description: string;
    qty: number;
    price: number;
    total: number;
}

const AddInvoicePage: React.FC = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [items, setItems] = useState<InvoiceItemState[]>([{ key: 0, productId: null, description: '', qty: 1, price: 0, total: 0 }]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [totals, setTotals] = useState({ subtotal: 0, tax: 0, grandTotal: 0 });

    useEffect(() => {
        // Fetch contacts & products for dropdowns
        const fetchData = async () => {
            try {
                const [cRes, pRes] = await Promise.all([
                    api.get('/finance/contacts'), // We need to implement this
                    api.get('/finance/products')
                ]);
                setContacts(cRes.data?.data || cRes.data || []);
                setProducts(pRes.data?.data || pRes.data || []);
            } catch (err) {
                console.error('Fetch error', err);
            }
        };
        fetchData();
    }, []);

    const calculateTotals = (currentItems: InvoiceItemState[]) => {
        const subtotal = currentItems.reduce((sum, item) => sum + (item.qty * item.price), 0);
        const tax = subtotal * 0.11; // 11% Tax
        setTotals({ subtotal, tax, grandTotal: subtotal + tax });
    };

    const addItem = () => {
        const newItems = [...items, { key: items.length, productId: null, description: '', qty: 1, price: 0, total: 0 }];
        setItems(newItems);
    };

    const removeItem = (key: number) => {
        const newItems = items.filter(i => i.key !== key);
        setItems(newItems);
        calculateTotals(newItems);
    };

    const handleItemChange = (key: number, field: string, value: string | number | null) => {
        const newItems = items.map(item => {
            if (item.key === key) {
                const updated = { ...item, [field]: value };
                if (field === 'productId') {
                    const product = products.find((p: Product) => p.id === value);
                    if (product) {
                        updated.price = product.sellPrice;
                        updated.description = product.name;
                    }
                }
                updated.total = updated.qty * updated.price;
                return updated;
            }
            return item;
        });
        setItems(newItems);
        calculateTotals(newItems);
    };

    const onFinish = async (values: Record<string, unknown>) => {
        try {
            const payload = {
                ...values,
                type: 'sales',
                transDate: (values.transDate as { toISOString: () => string }).toISOString(),
                dueDate: (values.dueDate as { toISOString: () => string }).toISOString(),
                total: totals.grandTotal,
                taxTotal: totals.tax,
                items: items.map(item => ({
                    productId: item.productId,
                    description: item.description,
                    qty: item.qty,
                    price: item.price,
                    total: item.total,
                    discount: 0
                }))
            };
            await api.post('/finance/invoices', payload);
            message.success('Tagihan berhasil dibuat!');
            navigate('/sales/invoices');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            message.error(err.response?.data?.message || 'Gagal membuat tagihan');
        }
    };

    const columns = [
        {
            title: 'Produk',
            dataIndex: 'productId',
            key: 'productId',
            width: '30%',
            render: (_: number | null, record: InvoiceItemState) => (
                <Select
                    showSearch
                    className="w-full"
                    placeholder="Pilih Produk"
                    onChange={(v) => handleItemChange(record.key, 'productId', v)}
                >
                    {products.map((p: Product) => <Option key={p.id} value={p.id}>{p.name} ({p.sku})</Option>)}
                </Select>
            )
        },
        {
            title: 'Kuantitas',
            dataIndex: 'qty',
            key: 'qty',
            render: (val: number, record: InvoiceItemState) => (
                <InputNumber min={1} value={val} onChange={(v) => handleItemChange(record.key, 'qty', v)} />
            )
        },
        {
            title: 'Harga Satuan',
            dataIndex: 'price',
            key: 'price',
            render: (val: number, record: InvoiceItemState) => (
                <InputNumber className="w-full" value={val} onChange={(v) => handleItemChange(record.key, 'price', v)} />
            )
        },
        {
            title: 'Total',
            key: 'itemTotal',
            align: 'right' as const,
            render: (_: unknown, record: InvoiceItemState) => `Rp ${Number(record.qty * record.price).toLocaleString('id-ID')}`,
        },
        {
            title: '',
            key: 'action',
            render: (_: unknown, record: InvoiceItemState) => (
                <Button danger icon={<DeleteOutlined />} onClick={() => removeItem(record.key)} />
            )
        }
    ];

    return (
        <div>
            <Breadcrumb className="mb-4" items={[{ title: 'Beranda' }, { title: 'Penjualan' }, { title: 'Tagihan' }, { title: 'Tambah' }]} />

            <div className="flex justify-between items-center mb-6">
                <Space size="middle">
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
                    <Title level={3} className="!m-0">Tambah Tagihan Penjualan</Title>
                </Space>
                <Button type="primary" icon={<SaveOutlined />} size="large" onClick={() => form.submit()}>Simpan Tagihan</Button>
            </div>

            <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ transDate: dayjs(), dueDate: dayjs().add(7, 'day') }}>
                <Card className="shadow-sm border-gray-100 rounded-xl mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Form.Item name="contactId" label="Pelanggan" rules={[{ required: true }]}>
                            <Select placeholder="Pilih Pelanggan">
                                {contacts.map((c: Contact) => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                            </Select>
                        </Form.Item>
                        <Form.Item name="transDate" label="Tanggal Transaksi" rules={[{ required: true }]}>
                            <DatePicker className="w-full" />
                        </Form.Item>
                        <Form.Item name="dueDate" label="Tanggal Jatuh Tempo" rules={[{ required: true }]}>
                            <DatePicker className="w-full" />
                        </Form.Item>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Form.Item name="refNumber" label="Nomor Tagihan" rules={[{ required: true }]}>
                            <Input placeholder="T-10001" />
                        </Form.Item>
                    </div>
                </Card>

                <Card className="shadow-sm border-gray-100 rounded-xl mb-6" title="Item Tagihan">
                    <Table
                        dataSource={items}
                        columns={columns}
                        pagination={false}
                        footer={() => (
                            <Button type="dashed" onClick={addItem} block icon={<PlusOutlined />}>Tambah Baris</Button>
                        )}
                    />
                </Card>

                <div className="flex justify-end">
                    <div className="w-80">
                        <Card className="bg-gray-50 border-none rounded-xl">
                            <div className="flex justify-between mb-2">
                                <Text type="secondary">Subtotal</Text>
                                <Text>Rp {totals.subtotal.toLocaleString('id-ID')}</Text>
                            </div>
                            <div className="flex justify-between mb-2">
                                <Text type="secondary">Pajak (11%)</Text>
                                <Text>Rp {totals.tax.toLocaleString('id-ID')}</Text>
                            </div>
                            <Divider className="my-2" />
                            <div className="flex justify-between">
                                <Text className="text-lg font-bold">Total</Text>
                                <Text className="text-lg font-bold text-primary">Rp {totals.grandTotal.toLocaleString('id-ID')}</Text>
                            </div>
                        </Card>
                    </div>
                </div>
            </Form>
        </div>
    );
};

export default AddInvoicePage;
