import React, { useState, useEffect, useCallback } from 'react';
import { Drawer, Form, Input, Button, Space, Select, DatePicker, InputNumber, message, Divider, Tag, Typography, Row, Col, Checkbox, Card, Spin } from 'antd';
import { ShoppingCartOutlined, UserOutlined, CalculatorOutlined, DeploymentUnitOutlined, BgColorsOutlined, BookOutlined } from '@ant-design/icons';
import api from '../../api';
import dayjs from 'dayjs';

// Lightweight debounce — replaces lodash dependency
function debounce<T extends (...args: any[]) => any>(fn: T, ms: number): T {
    let timer: ReturnType<typeof setTimeout>;
    return ((...args: any[]) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    }) as unknown as T;
}

const { Option } = Select;
const { Text } = Typography;

interface OrderFormDrawerProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editId?: number | null;
}

const OrderFormDrawer: React.FC<OrderFormDrawerProps> = ({ open, onClose, onSuccess, editId }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [calculating, setCalculating] = useState(false);
    const [calcResult, setCalcResult] = useState<any>(null);

    const [customers, setCustomers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    const fetchInitialData = async () => {
        try {
            const [custRes, prodRes] = await Promise.all([
                api.get('/percetakan/customers'),
                api.get('/percetakan/products')
            ]);
            setCustomers(custRes.data?.data?.data || custRes.data?.data || []);
            setProducts(prodRes.data?.data || []);
        } catch (err) {
            message.error('Gagal mengambil data master');
        }
    };

    const calculatePrice = useCallback(
        debounce(async (values: any) => {
            if (!values.product_id || !values.quantity) return;

            setCalculating(true);
            try {
                const activeFinishings = [];
                if (values.lamination !== 'none' && values.lamination) activeFinishings.push(values.lamination);
                if (values.hotprint) activeFinishings.push('HOTPRINT');
                if (values.emboss) activeFinishings.push('EMBOSS');

                const payload = {
                    ...values,
                    finishings: activeFinishings
                };

                const res = await api.post('/percetakan/calculator/calculate', payload);
                if (res.data?.success) {
                    const result = res.data.data;
                    setCalcResult(result);

                    // Final Calculation with Discount & Tax
                    const subtotal = result.total_price;
                    const discount = values.discount_amount || 0;
                    const taxRate = values.is_taxable ? 0.11 : 0;

                    const afterDiscount = subtotal - discount;
                    const taxAmount = afterDiscount * taxRate;
                    const finalTotal = afterDiscount + taxAmount;

                    form.setFieldsValue({
                        total_amount: finalTotal,
                        tax_amount: taxAmount,
                        subtotal: subtotal
                    });
                }
            } catch (err) {
                console.error('Calculation error', err);
            } finally {
                setCalculating(false);
            }
        }, 500),
        [form]
    );

    useEffect(() => {
        if (open) {
            fetchInitialData();
            if (!editId) {
                form.resetFields();
                form.setFieldsValue({
                    order_date: dayjs(),
                    quantity: 1,
                    width_cm: 100,
                    height_cm: 100,
                    paper_size: 'A5',
                    paper_type: 'hvs',
                    paper_gsm: 70,
                    page_count: 50,
                    lamination: 'none',
                    discount_amount: 0,
                    is_taxable: false,
                    binding_type: 'perfect'
                });
            }
        }
    }, [open, editId, form]);

    const handleValuesChange = (changedValues: any, allValues: any) => {
        if (changedValues.product_id) {
            const prod = products.find(p => p.id === changedValues.product_id);
            setSelectedProduct(prod);
        }
        calculatePrice(allValues);
    };

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const payload = {
                ...values,
                order_date: values.order_date.format('YYYY-MM-DD'),
                deadline: values.deadline ? values.deadline.format('YYYY-MM-DD') : null,
                calc_details: calcResult
            };

            if (editId) {
                await api.put(`/percetakan/orders/${editId}`, payload);
                message.success('Pesanan berhasil diperbarui');
            } else {
                await api.post('/percetakan/orders', payload);
                message.success('Pesanan berhasil dibuat');
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            message.error(err.response?.data?.message || 'Gagal menyimpan pesanan');
        } finally {
            setLoading(false);
        }
    };

    const isBook = selectedProduct?.pricing_model === 'per_page';

    return (
        <Drawer
            title={
                <Space>
                    <ShoppingCartOutlined style={{ color: '#0fb9b1', fontSize: 20 }} />
                    <span style={{ fontWeight: 700 }}>{editId ? 'Edit Order' : 'Kalkulator Pesanan Mahameru Style'}</span>
                </Space>
            }
            width={900}
            onClose={onClose}
            open={open}
            styles={{ body: { padding: 0, background: '#f0f2f5' } }}
            extra={
                <Space>
                    <Button onClick={onClose}>Batal</Button>
                    <Button
                        onClick={() => form.submit()}
                        type="primary"
                        loading={loading}
                        style={{ background: '#0fb9b1', border: 'none', height: 40, fontWeight: 600, borderRadius: 8 }}
                    >
                        Simpan Pesanan
                    </Button>
                </Space>
            }
        >
            <Form
                layout="vertical"
                form={form}
                onFinish={onFinish}
                onValuesChange={handleValuesChange}
                style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            >
                <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
                    <Row gutter={20}>
                        {/* LEFT: Product & Basic */}
                        <Col span={14}>
                            <Card title={<Space><UserOutlined /> Pelanggan & Produk</Space>} style={{ borderRadius: 12, marginBottom: 20 }}>
                                <Form.Item name="customer_id" label="Pilih Pelanggan" rules={[{ required: true }]}>
                                    <Select showSearch placeholder="Cari pelanggan..." options={customers.map(c => ({ value: c.id, label: c.name }))} />
                                </Form.Item>

                                <Form.Item name="product_id" label="Jenis Produk Cetak" rules={[{ required: true }]}>
                                    <Select showSearch placeholder="Pilih produk">
                                        {products.map(p => (
                                            <Option key={p.id} value={p.id}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span>{p.name}</span>
                                                    <Tag color="cyan">{p.pricing_model.replace('_', ' ')}</Tag>
                                                </div>
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>

                                <Row gutter={12}>
                                    <Col span={12}><Form.Item name="order_date" label="Tgl Pesan" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" /></Form.Item></Col>
                                    <Col span={12}><Form.Item name="deadline" label="Deadline"><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" /></Form.Item></Col>
                                </Row>
                            </Card>

                            {selectedProduct && (
                                <Card title={<Space><DeploymentUnitOutlined /> Spesifikasi Teknis</Space>} style={{ borderRadius: 12 }}>
                                    <Row gutter={12}>
                                        <Col span={12}>
                                            <Form.Item name="quantity" label={isBook ? "Jumlah Buku" : "Jumlah Qty"} rules={[{ required: true }]}>
                                                <InputNumber min={1} style={{ width: '100%' }} />
                                            </Form.Item>
                                        </Col>

                                        {selectedProduct.pricing_model === 'area_based' && (
                                            <>
                                                <Col span={6}><Form.Item name="width_cm" label="L (cm)"><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
                                                <Col span={6}><Form.Item name="height_cm" label="T (cm)"><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
                                            </>
                                        )}

                                        {isBook && (
                                            <Col span={12}>
                                                <Form.Item name="page_count" label="Jumlah Halaman" rules={[{ required: true }]}>
                                                    <InputNumber min={2} step={2} style={{ width: '100%' }} placeholder="Wajib Genap" />
                                                </Form.Item>
                                            </Col>
                                        )}
                                    </Row>

                                    {isBook && (
                                        <Row gutter={12}>
                                            <Col span={12}>
                                                <Form.Item name="paper_type" label="Jenis Kertas Isi">
                                                    <Select options={[
                                                        { value: 'hvs', label: 'HVS (Putih)' },
                                                        { value: 'bookpaper', label: 'Bookpaper (Cream)' },
                                                        { value: 'artpaper', label: 'Art Paper (Licin)' }
                                                    ]} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item name="paper_gsm" label="Gramatur (GSM)">
                                                    <Select options={[
                                                        { value: 57, label: '57 gsm' },
                                                        { value: 70, label: '70 gsm' },
                                                        { value: 72, label: '72 gsm' },
                                                        { value: 80, label: '80 gsm' },
                                                        { value: 100, label: '100 gsm' },
                                                        { value: 120, label: '120 gsm' },
                                                        { value: 150, label: '150 gsm' }
                                                    ]} />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    )}

                                    <Row gutter={12}>
                                        <Col span={12}>
                                            <Form.Item name="paper_size" label="Ukuran">
                                                <Select options={['A3', 'A4', 'A5', 'A6', '1/3 A4', 'DL'].map(s => ({ value: s, label: s }))} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item name="binding_type" label="Jilid / Finishing">
                                                <Select options={[
                                                    { value: 'perfect', label: 'Lem Panas (Perfect)' },
                                                    { value: 'saddle_stitch', label: 'Staples (Saddle)' },
                                                    { value: 'wire_o', label: 'Spiral Kawat' },
                                                    { value: 'comb', label: 'Spiral Plastik' }
                                                ]} />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Card>
                            )}
                        </Col>

                        {/* RIGHT: Calculation & Visualization */}
                        <Col span={10}>
                            <Card title={<Space><BgColorsOutlined /> Extra & Summary</Space>} style={{ borderRadius: 12, marginBottom: 20 }}>
                                <div style={{ display: 'flex', gap: 20 }}>
                                    <Form.Item name="is_taxable" valuePropName="checked" style={{ marginBottom: 0 }}>
                                        <Checkbox>PPN 11%</Checkbox>
                                    </Form.Item>
                                    <Form.Item name="hotprint" valuePropName="checked" style={{ marginBottom: 0 }}>
                                        <Checkbox>Hotprint</Checkbox>
                                    </Form.Item>
                                </div>
                                <Divider style={{ margin: '12px 0' }} />
                                <Form.Item name="discount_amount" label="Potongan Harga (Rp)">
                                    <InputNumber style={{ width: '100%' }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')} parser={v => v!.replace(/\./g, '')} />
                                </Form.Item>
                            </Card>

                            {calcResult && isBook && (
                                <Card style={{ borderRadius: 12, marginBottom: 20, background: '#e6f7ff', border: '1px solid #91d5ff' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <BookOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                                        <div>
                                            <Text strong style={{ color: '#0050b3' }}>Estimasi Lebar Punggung</Text>
                                            <div style={{ fontSize: 22, fontWeight: 800, color: '#1890ff' }}>
                                                {calcResult.spine_width_mm} mm
                                            </div>
                                            <Text type="secondary" style={{ fontSize: 11 }}>
                                                * Gunakan ukuran ini untuk layout cover Anda
                                            </Text>
                                        </div>
                                    </div>
                                    {/* Visual spine representation */}
                                    <div style={{
                                        marginTop: 12,
                                        height: 20,
                                        width: Math.min(100, calcResult.spine_width_mm * 2),
                                        background: '#1890ff',
                                        borderRadius: 2,
                                        transition: 'width 0.3s ease'
                                    }} />
                                </Card>
                            )}

                            <Card
                                style={{
                                    borderRadius: 12,
                                    background: 'linear-gradient(135deg, #2c3e50, #000000)',
                                    color: '#fff',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                                }}
                            >
                                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                                    <CalculatorOutlined style={{ fontSize: 32, color: '#0fb9b1' }} />
                                    <div style={{ fontSize: 14, opacity: 0.8, marginTop: 8 }}>ESTIMASI HARGA TOTAL</div>
                                    <Spin spinning={calculating}>
                                        <div style={{ fontSize: 32, fontWeight: 800, color: '#0fb9b1' }}>
                                            Rp {Number(form.getFieldValue('total_amount') || 0).toLocaleString('id-ID')}
                                        </div>
                                    </Spin>
                                </div>

                                {calcResult && (
                                    <div style={{ fontSize: 12, background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: 8 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <span>Subtotal:</span>
                                            <span>Rp {Number(form.getFieldValue('subtotal') || 0).toLocaleString('id-ID')}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <span>Berat Paket:</span>
                                            <Tag color="orange" style={{ margin: 0, fontSize: 10 }}>{calcResult.weight_kg} KG</Tag>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Lama Kerja:</span>
                                            <span>{calcResult.estimated_days} Hari</span>
                                        </div>
                                    </div>
                                )}

                                <Form.Item name="total_amount" hidden><Input /></Form.Item>
                                <Form.Item name="tax_amount" hidden><Input /></Form.Item>
                                <Form.Item name="subtotal" hidden><Input /></Form.Item>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </Form>
        </Drawer>
    );
};

export default OrderFormDrawer;
