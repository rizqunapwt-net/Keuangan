import React, { useState, useCallback, useMemo } from 'react';
import { Typography, Row, Col, Form, InputNumber, Select, Button, Tag, Space, Collapse, Input, message, Popconfirm } from 'antd';
import { PrinterOutlined, ArrowLeftOutlined, SettingOutlined, PlusOutlined, DeleteOutlined, UndoOutlined, CalculatorOutlined, InfoCircleOutlined, ExpandOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api';
import { useCalcSettings } from './useCalcSettings';
import PageHeader from '../../components/PageHeader';

const { Text } = Typography;
const { Option } = Select;

interface CalcResult {
    unit_price: number; total_price: number; area_m2?: number;
    weight_kg?: number; print_method?: string; estimated_days?: string;
    finishing_fees?: number;
}

interface ProductSetting {
    id: number; name: string; desc: string; price: number;
}

const DEFAULT_PRODUCTS: ProductSetting[] = [
    { id: 1, name: 'Spanduk Vinyl Frontlite', desc: 'Banner outdoor tahan hujan & UV', price: 65000 },
    { id: 2, name: 'Backdrop Portable', desc: 'Stand besi + cetak vinyl', price: 750000 },
    { id: 3, name: 'Roll-Up Banner', desc: '60–85cm termasuk stand', price: 350000 },
    { id: 4, name: 'X-Banner', desc: 'X-Banner indoor + stand', price: 120000 },
    { id: 5, name: 'Spanduk Kain', desc: 'Cetak kain, max 140cm', price: 85000 },
];

const SpandukCalculatorPage: React.FC = () => {
    const [form] = Form.useForm();
    const [result, setResult] = useState<CalcResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedId, setSelectedId] = useState<number>(1);
    const navigate = useNavigate();

    const [products, setProducts, resetProducts] = useCalcSettings<ProductSetting[]>('spanduk_products', DEFAULT_PRODUCTS);

    const watchW = Form.useWatch('width_cm', form) || 0;
    const watchH = Form.useWatch('height_cm', form) || 0;
    const watchQ = Form.useWatch('quantity', form) || 1;
    const selectedProd = useMemo(() => products.find(p => p.id === selectedId) || products[0], [products, selectedId]);
    const liveArea = watchW && watchH ? (watchW / 100) * (watchH / 100) : 0;
    const liveEstimate = liveArea * selectedProd.price * watchQ;

    const calculate = useCallback(async () => {
        setLoading(true);
        try {
            const v = form.getFieldsValue();
            const res = await api.post('/percetakan/calculator/calculate', {
                product_id: selectedId, quantity: v.quantity || 1,
                width_cm: v.width_cm, height_cm: v.height_cm,
            });
            if (res.data?.success) setResult(res.data.data);
        } catch (err: any) {
            setResult(null);
            message.error(err?.response?.data?.message || err?.response?.data?.error?.message || 'Gagal menghitung');
        }
        finally { setLoading(false); }
    }, [form, selectedId]);

    const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

    const updateProduct = (idx: number, field: keyof ProductSetting, value: any) => {
        const updated = [...products];
        (updated[idx] as any)[field] = value;
        setProducts(updated);
    };
    const addProduct = () => {
        const newId = Math.max(...products.map(p => p.id), 100) + 1;
        setProducts([...products, { id: newId, name: 'Produk Baru', desc: '-', price: 50000 }]);
        message.success('Produk ditambahkan');
    };
    const removeProduct = (idx: number) => {
        if (products.length <= 1) return message.warning('Minimal 1 produk');
        const updated = products.filter((_, i) => i !== idx);
        setProducts(updated);
        if (selectedId === products[idx].id) setSelectedId(updated[0].id);
    };
    const handleReset = () => { resetProducts(); setSelectedId(1); message.success('Reset ke default'); };

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={{ fontFamily: "'Poppins', sans-serif" }}>
            <PageHeader
                title="Spanduk & Banner"
                description="Kalkulasi harga cetak banner, backdrop, dan spanduk kain secara instan."
                breadcrumb={[{ label: 'KALKULATOR' }, { label: 'SPANDUK' }]}
                extra={<Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/kalkulator')}>Kembali</Button>}
            />

            <Row gutter={[32, 32]}>
                <Col xs={24} lg={14}>
                    <div className="premium-card" style={{ borderRadius: 28, background: '#fff', padding: '32px', marginBottom: 24, border: 'none' }}>
                        <div style={{ marginBottom: 24 }}>
                            <Text strong style={{ fontSize: 11, color: '#aaa', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>PILIH JENIS BANNER</Text>
                            <Select
                                size="large" value={selectedId}
                                onChange={v => { setSelectedId(v); setResult(null); }}
                                style={{ width: '100%', borderRadius: 14 }}
                                dropdownStyle={{ borderRadius: 12, padding: 8 }}
                            >
                                {products.map(p => (
                                    <Option key={p.id} value={p.id}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 600 }}>{p.name}</span>
                                            <Tag color="cyan" bordered={false} style={{ borderRadius: 6, fontSize: 11 }}>{fmt(p.price)}/m²</Tag>
                                        </div>
                                    </Option>
                                ))}
                            </Select>
                            <div style={{ marginTop: 12, padding: '10px 14px', background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
                                <Space align="start"><InfoCircleOutlined style={{ color: '#0fb9b1', marginTop: 3 }} /><Text style={{ fontSize: 12, color: '#64748b' }}>{selectedProd.desc}</Text></Space>
                            </div>
                        </div>

                        <Form form={form} layout="vertical" initialValues={{ width_cm: 200, height_cm: 100, quantity: 1 }} requiredMark={false}>
                            <div style={{ marginBottom: 24 }}>
                                <Text strong style={{ fontSize: 11, color: '#aaa', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: 16 }}>DIMENSI CETAK (CM)</Text>
                                <Row gutter={16} align="middle">
                                    <Col flex="1">
                                        <Form.Item name="width_cm" label={<Text strong style={{ fontSize: 13 }}>Lebar (cm)</Text>}>
                                            <InputNumber min={10} max={2000} style={{ width: '100%', borderRadius: 12 }} size="large" placeholder="0" />
                                        </Form.Item>
                                    </Col>
                                    <Col style={{ paddingBottom: 6 }}><Text style={{ color: '#ddd', fontSize: 20, fontWeight: 300 }}>×</Text></Col>
                                    <Col flex="1">
                                        <Form.Item name="height_cm" label={<Text strong style={{ fontSize: 13 }}>Tinggi (cm)</Text>}>
                                            <InputNumber min={10} max={2000} style={{ width: '100%', borderRadius: 12 }} size="large" placeholder="0" />
                                        </Form.Item>
                                    </Col>
                                    <Col style={{ paddingBottom: 6 }}><Text style={{ color: '#ddd', fontSize: 20, fontWeight: 300 }}>×</Text></Col>
                                    <Col style={{ width: 100 }}>
                                        <Form.Item name="quantity" label={<Text strong style={{ fontSize: 13 }}>Qnty</Text>}>
                                            <InputNumber min={1} max={100} style={{ width: '100%', borderRadius: 12 }} size="large" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </div>

                            <div style={{ background: '#f0fdf4', borderRadius: 20, padding: '20px 24px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #dcfce7' }}>
                                <div>
                                    <Text style={{ fontSize: 11, color: '#166534', fontWeight: 700, letterSpacing: '0.5px' }}>ESTIMASI LUAS AREA</Text>
                                    <div style={{ fontSize: 24, fontWeight: 800, color: '#14532d' }}>{liveArea > 0 ? `${liveArea.toFixed(2)} m²` : '—'}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <Text style={{ fontSize: 11, color: '#166534', fontWeight: 700, letterSpacing: '0.5px' }}>HARGA ESTIMASI</Text>
                                    <div style={{ fontSize: 24, fontWeight: 800, color: '#0fb9b1' }}>{liveEstimate > 0 ? fmt(liveEstimate) : '—'}</div>
                                </div>
                            </div>

                            <Button type="primary" onClick={calculate} loading={loading} block size="large" icon={<CalculatorOutlined />}
                                style={{ borderRadius: 14, height: 52, fontWeight: 700, background: '#0fb9b1', border: 'none', boxShadow: '0 8px 20px rgba(15, 185, 177, 0.25)' }}>
                                HITUNG HARGA FINAL
                            </Button>
                        </Form>
                    </div>

                    <Collapse ghost items={[{
                        key: 'settings',
                        label: <Space style={{ cursor: 'pointer', color: '#aaa', fontWeight: 600, fontSize: 12 }}><SettingOutlined /> Opsi Konfigurasi Harga m²</Space>,
                        children: (
                            <div className="premium-card" style={{ borderRadius: 20, background: '#fff', border: 'none', padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
                                    <Text style={{ fontSize: 12, color: '#aaa' }}>Kelola daftar produk banner dan harga per meter perseginya.</Text>
                                    <Space>
                                        <Button size="small" type="primary" ghost icon={<PlusOutlined />} onClick={addProduct} style={{ borderRadius: 8 }}>Tambah</Button>
                                        <Popconfirm title="Reset?" onConfirm={handleReset}><Button size="small" danger type="text" icon={<UndoOutlined />}>Reset</Button></Popconfirm>
                                    </Space>
                                </div>
                                {products.map((p, idx) => (
                                    <div key={p.id} style={{ padding: '12px 0', borderTop: '1px solid #f8f8f8' }}>
                                        <Row gutter={8} align="middle">
                                            <Col span={8}><Input size="middle" value={p.name} onChange={e => updateProduct(idx, 'name', e.target.value)} style={{ borderRadius: 8 }} placeholder="Nama Produk" /></Col>
                                            <Col span={7}><Input size="middle" value={p.desc} onChange={e => updateProduct(idx, 'desc', e.target.value)} style={{ borderRadius: 8 }} placeholder="Ket" /></Col>
                                            <Col span={7}>
                                                <InputNumber size="middle" value={p.price} min={0} style={{ width: '100%', borderRadius: 8 }} 
                                                    onChange={v => updateProduct(idx, 'price', v || 0)}
                                                    formatter={v => `Rp ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                                                    parser={v => Number(v!.replace(/[^\d]/g, ''))} />
                                            </Col>
                                            <Col span={2} style={{ textAlign: 'right' }}>
                                                <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => removeProduct(idx)} />
                                            </Col>
                                        </Row>
                                    </div>
                                ))}
                            </div>
                        )
                    }]} />
                </Col>

                <Col xs={24} lg={10}>
                    <div style={{ position: 'sticky', top: 100 }}>
                        <AnimatePresence mode="wait">
                            {result ? (
                                <motion.div key="r" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                                    <div className="premium-card" style={{ borderRadius: 28, background: '#fff', overflow: 'hidden', border: 'none' }}>
                                        <div style={{ padding: '32px', background: 'linear-gradient(135deg, #0fb9b1, #20bf6b)', color: '#fff' }}>
                                            <Text style={{ fontSize: 11, fontWeight: 700, opacity: 0.8, letterSpacing: '1px' }}>TOTAL HARGA PRODUKSI</Text>
                                            <div style={{ fontSize: 36, fontWeight: 800, marginTop: 4 }}>{fmt(result.total_price)}</div>
                                            <div style={{ marginTop: 8, fontSize: 13, background: 'rgba(255,255,255,0.15)', display: 'inline-block', padding: '4px 12px', borderRadius: 8 }}>
                                                {fmt(result.unit_price)} <span style={{ opacity: 0.7 }}>/ pcs</span>
                                            </div>
                                        </div>
                                        <div style={{ padding: '32px' }}>
                                             <Row gutter={[16, 24]}>
                                                {[
                                                    { label: 'Luas Total', value: `${result.area_m2} m²`, icon: <ExpandOutlined /> },
                                                    { label: 'Estimasi Berat', value: `${result.weight_kg} kg`, icon: <InfoCircleOutlined /> },
                                                    { label: 'Metode Produksi', value: result.print_method || 'Digital Printing', icon: <PrinterOutlined /> },
                                                ].map((item, i) => (
                                                    <Col span={24} key={i}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0fb9b1' }}>{item.icon}</div>
                                                            <div>
                                                                <Text style={{ fontSize: 10, color: '#aaa', display: 'block', fontWeight: 700, letterSpacing: '0.5px' }}>{item.label.toUpperCase()}</Text>
                                                                <Text strong style={{ fontSize: 15, color: '#333' }}>{item.value}</Text>
                                                            </div>
                                                        </div>
                                                    </Col>
                                                ))}
                                             </Row>
                                             
                                             <div style={{ marginTop: 32, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                {result.estimated_days && <Tag icon={<InfoCircleOutlined />} color="processing" style={{ borderRadius: 8, padding: '4px 12px', fontWeight: 600 }}>± {result.estimated_days} HARI KERJA</Tag>}
                                                {(result.finishing_fees ?? 0) > 0 && <Tag color="warning" style={{ borderRadius: 8, padding: '4px 12px', fontWeight: 600 }}>FINISHING {fmt(result.finishing_fees!)}</Tag>}
                                             </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <div className="premium-card" style={{ borderRadius: 28, background: '#fff', overflow: 'hidden', border: 'none' }}>
                                        <div style={{ padding: '28px 32px', background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)' }}>
                                            <Text style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '1px' }}>PRATINJAU ESTIMASI</Text>
                                            <div style={{ fontSize: 32, fontWeight: 800, color: liveEstimate > 0 ? '#0fb9b1' : '#cbd5e1', marginTop: 4 }}>
                                                {liveEstimate > 0 ? fmt(liveEstimate) : '—'}
                                            </div>
                                            <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, display: 'block' }}>Harga belum dikonfirmasi server</Text>
                                        </div>
                                        <div style={{ padding: '28px 32px' }}>
                                            <Row gutter={[16, 20]}>
                                                {[
                                                    { label: 'Produk', value: selectedProd.name },
                                                    { label: 'Dimensi', value: watchW && watchH ? `${watchW} × ${watchH} cm` : '—' },
                                                    { label: 'Luas Area', value: liveArea > 0 ? `${liveArea.toFixed(2)} m²` : '—' },
                                                    { label: 'Jumlah', value: `${watchQ} pcs` },
                                                ].map((item, i) => (
                                                    <Col span={12} key={i}>
                                                        <Text style={{ fontSize: 10, color: '#94a3b8', display: 'block', fontWeight: 700, letterSpacing: '0.5px' }}>{item.label.toUpperCase()}</Text>
                                                        <Text strong style={{ fontSize: 14, color: '#334155' }}>{item.value}</Text>
                                                    </Col>
                                                ))}
                                            </Row>
                                            <div style={{ marginTop: 24, padding: '12px 16px', background: '#fffbeb', borderRadius: 12, border: '1px solid #fef3c7' }}>
                                                <Text style={{ fontSize: 11, color: '#92400e' }}>💡 Klik <b>"HITUNG HARGA FINAL"</b> untuk mendapatkan harga resmi dari server.</Text>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </Col>
            </Row>
        </motion.div>
    );
};

export default SpandukCalculatorPage;
