import React, { useState, useCallback, useMemo } from 'react';
import { Typography, Row, Col, Form, InputNumber, Select, Button, Tag, Space, Checkbox, Collapse, Input, message, Popconfirm } from 'antd';
import { IdcardOutlined, ArrowLeftOutlined, SettingOutlined, UndoOutlined, CalculatorOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api';
import { useCalcSettings } from './useCalcSettings';
import PageHeader from '../../components/PageHeader';

const { Text } = Typography;
const { Option } = Select;

interface CalcResult {
    unit_price: number; total_price: number; discount_percent?: number;
    weight_kg?: number; estimated_days?: string; finishing_fees?: number;
    print_method?: string;
}

interface KNSettings {
    productId: number; minBox: number; lembarPerBox: number;
    finishings: Array<{ key: string; label: string; price: number }>;
    laminasiOptions: Array<{ value: string; label: string }>;
}

const DEFAULT_SETTINGS: KNSettings = {
    productId: 12, minBox: 2, lembarPerBox: 100,
    finishings: [
        { key: 'hotprint', label: 'Hotprint (Gold/Silver)', price: 2000 },
        { key: 'emboss', label: 'Emboss / Deboss', price: 1500 },
        { key: 'rounded', label: 'Rounded Corner', price: 500 },
    ],
    laminasiOptions: [
        { value: 'none', label: 'Tanpa Laminasi' },
        { value: 'matte', label: 'Matte' },
        { value: 'glossy', label: 'Glossy' },
        { value: 'soft_touch', label: 'Soft Touch (Premium)' },
    ],
};

const KartuNamaCalculatorPage: React.FC = () => {
    const [form] = Form.useForm();
    const [result, setResult] = useState<CalcResult | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [settings, setSettings, resetSettings] = useCalcSettings<KNSettings>('kartu_nama', DEFAULT_SETTINGS);
    const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

    const watchBox = Form.useWatch('box_qty', form) || settings.minBox;
    const watchFinish = Form.useWatch('finishings', form) || [];
    const totalSheets = watchBox * settings.lembarPerBox;
    const finishingSurcharge = useMemo(() => {
        let s = 0;
        (watchFinish as string[]).forEach(k => { s += (settings.finishings.find(f => f.key === k)?.price || 0) * totalSheets; });
        return s;
    }, [watchFinish, totalSheets, settings.finishings]);

    const calculate = useCallback(async () => {
        setLoading(true);
        try {
            const v = form.getFieldsValue();
            const res = await api.post('/percetakan/calculator/kartu-nama', {
                quantity: (v.box_qty || settings.minBox) * settings.lembarPerBox,
                lamination: v.lamination,
                print_sides: v.print_sides,
                finishing: v.finishings,
            });
            if (res.data?.success) setResult(res.data.data);
        } catch (err: any) {
            setResult(null);
            message.error(err?.response?.data?.message || err?.response?.data?.error?.message || 'Gagal menghitung');
        }
        finally { setLoading(false); }
    }, [form, settings]);

    const updateFinish = (idx: number, field: string, value: any) => {
        const updated = { ...settings }; (updated.finishings[idx] as any)[field] = value; setSettings(updated);
    };
    const handleReset = () => { resetSettings(); message.success('Reset ke default'); };

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={{ fontFamily: "'Poppins', sans-serif" }}>
            <PageHeader
                title="Kartu Nama"
                description={`Produksi kartu nama standar premium Artcarton 260gsm per box (${settings.lembarPerBox} lembar).`}
                breadcrumb={[{ label: 'KALKULATOR' }, { label: 'KARTU NAMA' }]}
                extra={<Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/kalkulator')}>Kembali</Button>}
            />

            <Row gutter={[32, 32]}>
                <Col xs={24} lg={14}>
                    <div className="premium-card" style={{ borderRadius: 28, background: '#fff', padding: '32px', marginBottom: 24, border: 'none' }}>
                        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 20 }} className="hide-scrollbar">
                            <Button size="small" shape="round" onClick={() => { 
                                form.setFieldsValue({ box_qty: 2, print_sides: '1_side', lamination: 'none', finishings: [] });
                            }} style={{ fontSize: 11, fontWeight: 600 }}>📄 Presets: Standard 1 Sisi</Button>
                            <Button size="small" shape="round" onClick={() => { 
                                form.setFieldsValue({ box_qty: 5, print_sides: '2_sides', lamination: 'matte', finishings: [] });
                            }} style={{ fontSize: 11, fontWeight: 600 }}>🎴 Presets: Premium 2 Sisi Matte</Button>
                        </div>

                        <Form form={form} layout="vertical" initialValues={{ box_qty: settings.minBox, print_sides: '2_sides', lamination: 'matte', finishings: [] }} requiredMark={false}>
                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item name="box_qty" label={<Text strong style={{ fontSize: 13 }}>Jumlah Box</Text>}>
                                        <InputNumber min={settings.minBox} max={1000} style={{ width: '100%', borderRadius: 12 }} size="large" addonAfter="box" />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item name="print_sides" label={<Text strong style={{ fontSize: 13 }}>Sisi Cetak</Text>}>
                                        <Select size="large" style={{ borderRadius: 12 }}><Option value="1_side">1 Sisi</Option><Option value="2_sides">2 Sisi</Option></Select>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item name="lamination" label={<Text strong style={{ fontSize: 13 }}>Laminasi</Text>}>
                                        <Select size="large" style={{ borderRadius: 12 }}>{settings.laminasiOptions.map(l => <Option key={l.value} value={l.value}>{l.label}</Option>)}</Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <div style={{ marginBottom: 28, marginTop: 12 }}>
                                <Text strong style={{ fontSize: 11, color: '#aaa', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: 16 }}>FINISHING TAMBAHAN</Text>
                                <Form.Item name="finishings" noStyle>
                                    <Checkbox.Group style={{ width: '100%' }}>
                                        <Row gutter={[12, 12]}>
                                            {settings.finishings.map(f => (
                                                <Col span={12} key={f.key}>
                                                    <div style={{ position: 'relative' }}>
                                                        <Checkbox 
                                                            value={f.key}
                                                            className="premium-checkbox"
                                                            style={{ 
                                                                width: '100%', 
                                                                padding: '14px 16px', 
                                                                border: '1px solid #f1f5f9', 
                                                                borderRadius: 12, 
                                                                background: '#f8fafc',
                                                                transition: 'all 0.3s ease'
                                                            }}
                                                        >
                                                            <div style={{ display: 'inline-flex', justifyContent: 'space-between', width: 'calc(100% - 24px)', verticalAlign: 'middle', marginLeft: 8 }}>
                                                                <Text strong style={{ fontSize: 12 }}>{f.label}</Text>
                                                                <Text style={{ fontSize: 11, color: '#0fb9b1', fontWeight: 700 }}>+{fmt(f.price)}</Text>
                                                            </div>
                                                        </Checkbox>
                                                    </div>
                                                </Col>
                                            ))}
                                        </Row>
                                    </Checkbox.Group>
                                </Form.Item>
                            </div>

                            <div style={{ background: '#f8f9ff', borderRadius: 20, padding: '20px 24px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #eef2ff' }}>
                                <div>
                                    <Text style={{ fontSize: 11, color: '#4361ee', fontWeight: 700, letterSpacing: '0.5px' }}>TOTAL LEMBAR PRODUKSI</Text>
                                    <div style={{ fontSize: 24, fontWeight: 800, color: '#3f37c9' }}>{totalSheets.toLocaleString()} Lembar</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <Text style={{ fontSize: 11, color: '#4361ee', fontWeight: 700, letterSpacing: '0.5px' }}>BIAYA FINISHING</Text>
                                    <div style={{ fontSize: 24, fontWeight: 800, color: finishingSurcharge > 0 ? '#ff9f43' : '#ccc' }}>{finishingSurcharge > 0 ? fmt(finishingSurcharge) : '—'}</div>
                                </div>
                            </div>

                            <Button type="primary" onClick={calculate} loading={loading} block size="large" icon={<CalculatorOutlined />}
                                style={{ borderRadius: 14, height: 52, fontWeight: 700, background: '#0fb9b1', border: 'none', boxShadow: '0 8px 20px rgba(15, 185, 177, 0.25)' }}>
                                HITUNG HARGA SEKARANG
                            </Button>
                        </Form>
                    </div>

                    <Collapse ghost items={[{
                        key: 'settings',
                        label: <Space style={{ cursor: 'pointer', color: '#aaa', fontWeight: 600, fontSize: 12 }}><SettingOutlined /> Konfigurasi Produk & Finishing</Space>,
                        children: (
                            <div className="premium-card" style={{ borderRadius: 20, background: '#fff', border: 'none', padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' }}>
                                    <Text style={{ fontSize: 12, color: '#aaa' }}>Sesuaikan parameter standar dan harga tambahan finishing.</Text>
                                    <Popconfirm title="Reset?" onConfirm={handleReset}><Button size="small" danger type="text" icon={<UndoOutlined />}>Reset</Button></Popconfirm>
                                </div>
                                <Row gutter={12} style={{ marginBottom: 24 }}>
                                    <Col span={12}><Text strong style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>MINIMAL PESANAN (BOX)</Text><InputNumber size="middle" value={settings.minBox} min={1} style={{ width: '100%', borderRadius: 8 }} onChange={v => setSettings({ ...settings, minBox: v || 1 })} /></Col>
                                    <Col span={12}><Text strong style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>LEMBAR PER BOX</Text><InputNumber size="middle" value={settings.lembarPerBox} min={10} style={{ width: '100%', borderRadius: 8 }} onChange={v => setSettings({ ...settings, lembarPerBox: v || 100 })} /></Col>
                                </Row>
                                <Text strong style={{ fontSize: 11, display: 'block', marginBottom: 12 }}>HARGA FINISHING PER LEMBAR</Text>
                                {settings.finishings.map((f, idx) => (
                                    <div key={idx} style={{ padding: '10px 0', borderTop: '1px solid #f8f8f8' }}>
                                        <Row gutter={8} align="middle">
                                            <Col span={12}><Input size="middle" value={f.label} style={{ borderRadius: 8 }} onChange={e => updateFinish(idx, 'label', e.target.value)} /></Col>
                                            <Col span={10}><InputNumber size="middle" addonBefore="Rp" value={f.price} min={0} style={{ width: '100%', borderRadius: 8 }} onChange={v => updateFinish(idx, 'price', v || 0)} /></Col>
                                            <Col span={2} style={{ textAlign: 'center' }}><Text style={{ fontSize: 10, color: '#ccc' }}>/pcs</Text></Col>
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
                                        <div style={{ padding: '32px', background: 'linear-gradient(135deg, #4361ee, #3f37c9)', color: '#fff' }}>
                                            <Text style={{ fontSize: 11, fontWeight: 700, opacity: 0.8, letterSpacing: '1px' }}>TOTAL HARGA PRODUKSI</Text>
                                            <div style={{ fontSize: 36, fontWeight: 800, marginTop: 4 }}>{fmt(result.total_price)}</div>
                                            <div style={{ marginTop: 8, fontSize: 13, background: 'rgba(255,255,255,0.15)', display: 'inline-block', padding: '4px 12px', borderRadius: 8 }}>
                                                {fmt(result.unit_price)} <span style={{ opacity: 0.7 }}>/ lembar</span>
                                            </div>
                                        </div>
                                        <div style={{ padding: '32px' }}>
                                              <Row gutter={[16, 24]} style={{ marginBottom: 24 }}>
                                                {[
                                                    { label: 'Total Pesanan', value: `${watchBox} Box`, icon: <IdcardOutlined /> },
                                                    { label: 'Estimasi Berat', value: result.weight_kg ? `${result.weight_kg} kg` : '-', icon: null },
                                                ].map((item, i) => (
                                                    <Col span={12} key={i}>
                                                        <Text style={{ fontSize: 10, color: '#aaa', display: 'block', fontWeight: 700, marginBottom: 2 }}>{item.label.toUpperCase()}</Text>
                                                        <Text strong style={{ fontSize: 14, color: '#333' }}>{item.value}</Text>
                                                    </Col>
                                                ))}
                                             </Row>

                                             {(result as any).pricing != null && (
                                                <div style={{ borderTop: '1px dashed #eee', paddingTop: 20, marginBottom: 20 }}>
                                                    <Text strong style={{ fontSize: 11, color: '#aaa', display: 'block', marginBottom: 12 }}>RINCIAN BIAYA PER LEMBAR</Text>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><Text style={{ fontSize: 12, color: '#64748b' }}>Cetak Dasar</Text><Text strong style={{ fontSize: 12 }}>{fmt((result as any).pricing.base_price_per_unit)}</Text></div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><Text style={{ fontSize: 12, color: '#64748b' }}>Finishing / Laminasi</Text><Text strong style={{ fontSize: 12 }}>{fmt((result as any).pricing.finishing_cost_per_unit)}</Text></div>
                                                    </div>
                                                </div>
                                             )}
                                             
                                             <div style={{ marginTop: 32, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                {result.estimated_days && <Tag color="blue" style={{ borderRadius: 8, padding: '4px 12px', fontWeight: 600 }}>± {result.estimated_days} HARI KERJA</Tag>}
                                                {(result.discount_percent ?? 0) > 0 && <Tag color="green" style={{ borderRadius: 8, padding: '4px 12px', fontWeight: 600 }}>DISCOUNT {result.discount_percent}%</Tag>}
                                             </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <div className="premium-card" style={{ borderRadius: 28, background: '#fff', overflow: 'hidden', border: 'none' }}>
                                        <div style={{ padding: '28px 32px', background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)' }}>
                                            <Text style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '1px' }}>PRATINJAU PESANAN</Text>
                                            <div style={{ fontSize: 28, fontWeight: 800, color: '#cbd5e1', marginTop: 4 }}>Menunggu Kalkulasi</div>
                                        </div>
                                        <div style={{ padding: '28px 32px' }}>
                                            <Row gutter={[16, 20]}>
                                                {[
                                                    { label: 'Total Lembar', value: `${totalSheets.toLocaleString()} lbr` },
                                                    { label: 'Jumlah Box', value: `${watchBox} box` },
                                                    { label: 'Biaya Finishing', value: finishingSurcharge > 0 ? fmt(finishingSurcharge) : 'Tidak ada' },
                                                ].map((item, i) => (
                                                    <Col span={12} key={i}>
                                                        <Text style={{ fontSize: 10, color: '#94a3b8', display: 'block', fontWeight: 700, letterSpacing: '0.5px' }}>{item.label.toUpperCase()}</Text>
                                                        <Text strong style={{ fontSize: 14, color: '#334155' }}>{item.value}</Text>
                                                    </Col>
                                                ))}
                                            </Row>
                                            <div style={{ marginTop: 24, padding: '12px 16px', background: '#fffbeb', borderRadius: 12, border: '1px solid #fef3c7' }}>
                                                <Text style={{ fontSize: 11, color: '#92400e' }}>💡 Klik <b>"HITUNG HARGA SEKARANG"</b> untuk mendapatkan harga resmi dari server.</Text>
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

export default KartuNamaCalculatorPage;
