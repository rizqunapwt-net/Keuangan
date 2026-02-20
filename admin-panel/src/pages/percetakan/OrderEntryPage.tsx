import React, { useState, useEffect } from 'react';
import {
    Form,
    Input,
    InputNumber,
    Select,
    Button,
    Card,
    Typography,
    message,
    Row,
    Col,
    Divider,
    Statistic,
    Alert,
} from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const OrderEntryPage: React.FC = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [pricing, setPricing] = useState({
        subtotal: 0,
        discount: 0,
        tax: 0,
        total: 0,
        deposit: 0,
        balance: 0,
    });

    // Load customers & products
    useEffect(() => {
        loadCustomers();
        loadProducts();
    }, []);

    // Calculate pricing when values change
    useEffect(() => {
        calculatePricing();
    }, [form.getFieldsValue()]);

    const loadCustomers = async () => {
        try {
            const response = await api.get('/percetakan/customers/list');
            setCustomers(response.data.data || []);
        } catch (error) {
            console.error('Failed to load customers:', error);
        }
    };

    const loadProducts = async () => {
        try {
            const response = await api.get('/percetakan/products');
            setProducts(response.data.data || []);
        } catch (error) {
            console.error('Failed to load products:', error);
        }
    };

    const calculatePricing = () => {
        const values = form.getFieldsValue();
        const quantity = values.quantity || 0;
        const unitPrice = values.unit_price || 0;
        const discountAmount = values.discount_amount || 0;
        const depositPercentage = values.deposit_percentage || 50;

        const subtotal = quantity * unitPrice;
        const tax = (subtotal - discountAmount) * 0.11; // PPN 11%
        const total = subtotal - discountAmount + tax;
        const deposit = total * (depositPercentage / 100);
        const balance = total - deposit;

        setPricing({
            subtotal,
            discount: discountAmount,
            tax,
            total,
            deposit,
            balance,
        });
    };

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const payload = {
                ...values,
                specifications: {
                    size: values.size,
                    paper_type: values.paper_type,
                    paper_weight: values.paper_weight,
                    colors_inside: values.colors_inside,
                    colors_outside: values.colors_outside,
                    binding_type: values.binding_type,
                    finishing: values.finishing,
                    pages_count: values.pages_count,
                    print_run: values.print_run,
                    waste_allowance: values.waste_allowance,
                },
            };

            await api.post('/percetakan/orders', payload);

            message.success({
                content: '✅ Order berhasil dibuat!',
                duration: 3,
            });

            navigate('/percetakan/orders');
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Gagal membuat order';
            message.error({
                content: errorMsg,
                duration: 5,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <Title level={3}>📝 Buat Order Baru</Title>
                <Paragraph type="secondary">
                    Isi form di bawah untuk membuat order percetakan baru
                </Paragraph>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                size="large"
                initialValues={{
                    priority: 'normal',
                    is_rush_order: false,
                    deposit_percentage: 50,
                    waste_allowance: 5,
                    print_run: 1,
                }}
            >
                <Row gutter={[16, 16]}>
                    {/* Customer & Product */}
                    <Col xs={24} lg={12}>
                        <Card title="👤 Customer" className="mb-4">
                            <Form.Item
                                name="customer_id"
                                label="Customer"
                                rules={[{ required: true, message: 'Customer harus dipilih' }]}
                            >
                                <Select
                                    showSearch
                                    placeholder="Pilih customer"
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        ((option?.label as string) ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                >
                                    {customers.map((customer: any) => (
                                        <Option key={customer.id} value={customer.id}>
                                            {customer.full_name} ({customer.code})
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="sales_id"
                                label="Sales"
                            >
                                <Select placeholder="Pilih sales (opsional)">
                                    <Option value={1}>Sales 1</Option>
                                </Select>
                            </Form.Item>
                        </Card>
                    </Col>

                    <Col xs={24} lg={12}>
                        <Card title="📦 Produk" className="mb-4">
                            <Form.Item
                                name="product_id"
                                label="Produk"
                                rules={[{ required: true, message: 'Produk harus dipilih' }]}
                            >
                                <Select placeholder="Pilih produk">
                                    {products.map((product: any) => (
                                        <Option key={product.id} value={product.id}>
                                            {product.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="deadline"
                                label="Deadline"
                                rules={[{ required: true, message: 'Deadline harus diisi' }]}
                            >
                                <Input type="date" />
                            </Form.Item>
                        </Card>
                    </Col>
                </Row>

                {/* Specifications */}
                <Card title="⚙️ Spesifikasi Cetak" className="mb-4">
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="size"
                                label="Ukuran"
                                rules={[{ required: true, message: 'Ukuran harus diisi' }]}
                            >
                                <Select placeholder="Pilih ukuran">
                                    <Option value="A4">A4 (210 x 297 mm)</Option>
                                    <Option value="A3">A3 (297 x 420 mm)</Option>
                                    <Option value="F4">F4 (215 x 330 mm)</Option>
                                    <Option value="Letter">Letter (216 x 279 mm)</Option>
                                    <Option value="Custom">Custom</Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="paper_type"
                                label="Jenis Kertas"
                                rules={[{ required: true, message: 'Jenis kertas harus diisi' }]}
                            >
                                <Select placeholder="Pilih jenis kertas">
                                    <Option value="HVS">HVS</Option>
                                    <Option value="Art Paper">Art Paper</Option>
                                    <Option value="Art Carton">Art Carton</Option>
                                    <Option value="Ivory">Ivory</Option>
                                    <Option value="BC">BC (Book Cover)</Option>
                                    <Option value="Kraft">Kraft</Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="paper_weight"
                                label="Berat Kertas"
                                rules={[{ required: true, message: 'Berat kertas harus diisi' }]}
                            >
                                <Select placeholder="Pilih berat">
                                    <Option value="70gsm">70 gsm</Option>
                                    <Option value="80gsm">80 gsm</Option>
                                    <Option value="100gsm">100 gsm</Option>
                                    <Option value="120gsm">120 gsm</Option>
                                    <Option value="150gsm">150 gsm</Option>
                                    <Option value="200gsm">200 gsm</Option>
                                    <Option value="260gsm">260 gsm</Option>
                                    <Option value="310gsm">310 gsm</Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="colors_outside"
                                label="Warna Luar"
                                rules={[{ required: true, message: 'Warna luar harus diisi' }]}
                            >
                                <Select placeholder="Pilih warna">
                                    <Option value="1/0">1 Warna (1/0)</Option>
                                    <Option value="4/0">Full Color (4/0)</Option>
                                    <Option value="4/4">Full Color 2 Sisi (4/4)</Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="colors_inside"
                                label="Warna Dalam"
                                rules={[{ required: true, message: 'Warna dalam harus diisi' }]}
                            >
                                <Select placeholder="Pilih warna">
                                    <Option value="0/0">Tidak Ada (0/0)</Option>
                                    <Option value="1/0">1 Warna (1/0)</Option>
                                    <Option value="4/0">Full Color (4/0)</Option>
                                    <Option value="4/4">Full Color 2 Sisi (4/4)</Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="binding_type"
                                label="Jilid"
                            >
                                <Select placeholder="Pilih jilid">
                                    <Option value="none">Tanpa Jilid</Option>
                                    <Option value="staples">Staples Tengah</Option>
                                    <Option value="perfect_binding">Perfect Binding</Option>
                                    <Option value="spiral">Spiral</Option>
                                    <Option value="hard_cover">Hard Cover</Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="finishing"
                                label="Finishing"
                            >
                                <Select
                                    placeholder="Pilih finishing"
                                    mode="multiple"
                                    maxTagCount="responsive"
                                >
                                    <Option value="laminate_doff">Laminate Doff</Option>
                                    <Option value="laminate_glossy">Laminate Glossy</Option>
                                    <Option value="uv_spot">UV Spot</Option>
                                    <Option value="emboss">Emboss</Option>
                                    <Option value="die_cut">Die Cut</Option>
                                    <Option value="numbering">Numbering</Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="pages_count"
                                label="Jumlah Halaman"
                            >
                                <InputNumber min={1} placeholder="0" className="w-full" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="quantity"
                                label="Jumlah Order"
                                rules={[{ required: true, message: 'Jumlah harus diisi' }]}
                            >
                                <InputNumber min={1} placeholder="0" className="w-full" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                {/* Pricing */}
                <Card title="💰 Pricing" className="mb-4">
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="unit_price"
                                label="Harga Satuan"
                                rules={[{ required: true, message: 'Harga harus diisi' }]}
                            >
                                <InputNumber
                                    min={0}
                                    placeholder="0"
                                    className="w-full"
                                    formatter={(value) => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                                    // @ts-ignore - Ant Design type bug
                                    parser={(value) => parseFloat(value?.toString().replace(/Rp\s?|(,*)/g, '') || '0')}
                                    onChange={calculatePricing}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="discount_amount"
                                label="Diskon"
                            >
                                <InputNumber
                                    min={0}
                                    placeholder="0"
                                    className="w-full"
                                    onChange={calculatePricing}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="deposit_percentage"
                                label="DP (%)"
                            >
                                <InputNumber
                                    min={0}
                                    max={100}
                                    placeholder="50"
                                    className="w-full"
                                    onChange={calculatePricing}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider />

                    <Row gutter={[16, 16]}>
                        <Col xs={12} sm={6}>
                            <Statistic
                                title="Subtotal"
                                value={pricing.subtotal}
                                prefix="Rp"
                                precision={0}
                            />
                        </Col>
                        <Col xs={12} sm={6}>
                            <Statistic
                                title="PPN (11%)"
                                value={pricing.tax}
                                prefix="Rp"
                                precision={0}
                                valueStyle={{ color: '#cf1322' }}
                            />
                        </Col>
                        <Col xs={12} sm={6}>
                            <Statistic
                                title="DP Required"
                                value={pricing.deposit}
                                prefix="Rp"
                                precision={0}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Col>
                        <Col xs={12} sm={6}>
                            <Statistic
                                title="Total"
                                value={pricing.total}
                                prefix="Rp"
                                precision={0}
                                valueStyle={{ color: '#3f8600', fontWeight: 'bold', fontSize: 20 }}
                            />
                        </Col>
                    </Row>
                </Card>

                {/* Additional Info */}
                <Row gutter={[16, 16]}>
                    <Col xs={24} lg={12}>
                        <Card title="📝 Catatan">
                            <Form.Item name="production_notes" label="Catatan Produksi">
                                <TextArea rows={3} placeholder="Catatan untuk tim produksi..." />
                            </Form.Item>

                            <Form.Item name="customer_notes" label="Catatan Customer">
                                <TextArea rows={2} placeholder="Catatan dari customer..." />
                            </Form.Item>
                        </Card>
                    </Col>

                    <Col xs={24} lg={12}>
                        <Card title="⚡ Prioritas">
                            <Form.Item name="priority" label="Prioritas Order">
                                <Select>
                                    <Option value="low">Low (Tidak Mendesak)</Option>
                                    <Option value="normal">Normal (Standar)</Option>
                                    <Option value="high">High (Prioritas)</Option>
                                    <Option value="urgent">Urgent (Sangat Mendesak)</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item name="is_rush_order" label="Rush Order" valuePropName="checked">
                                <Select>
                                    <Option value={false}>Tidak</Option>
                                    <Option value={true}>Ya (Extra Charge)</Option>
                                </Select>
                            </Form.Item>

                            <Alert
                                message="Rush Order"
                                description="Order dengan prioritas urgent atau rush order akan dikenakan biaya tambahan 25%"
                                type="warning"
                                showIcon
                                className="mt-4"
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Actions */}
                <div className="mt-6 flex justify-end gap-4">
                    <Button
                        size="large"
                        onClick={() => navigate('/percetakan/orders')}
                    >
                        Batal
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        loading={loading}
                        icon={<SaveOutlined />}
                    >
                        {loading ? 'Menyimpan...' : 'Simpan Order'}
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default OrderEntryPage;
