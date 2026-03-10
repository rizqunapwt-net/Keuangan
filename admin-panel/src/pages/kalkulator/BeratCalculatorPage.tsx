import React, { useMemo } from 'react';
import { Typography, Row, Col, Form, InputNumber, Select, Tabs, Collapse, Input, message, Popconfirm, Space, Button } from 'antd';
import { ArrowLeftOutlined, SettingOutlined, PlusOutlined, DeleteOutlined, UndoOutlined, InfoCircleOutlined, BookOutlined, FileTextOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCalcSettings } from './useCalcSettings';
import PageHeader from '../../components/PageHeader';

const { Text } = Typography;
const { Option } = Select;

interface PaperSize { key: string; w: number; h: number; label: string }
interface BeratSettings { sizes: PaperSize[]; gsmOptions: number[]; isiGsmOptions: number[]; coverGsmOptions: number[] }

const DEFAULT_SETTINGS: BeratSettings = {
    sizes: [
        { key: 'A3+', w: 31, h: 47, label: 'A3+ (31×47cm)' }, { key: 'A3', w: 29.7, h: 42, label: 'A3 (29.7×42cm)' },
        { key: 'A4', w: 21, h: 29.7, label: 'A4 (21×29.7cm)' }, { key: 'A5', w: 14.8, h: 21, label: 'A5 (14.8×21cm)' },
        { key: 'A6', w: 10.5, h: 14.8, label: 'A6 (10.5×14.8cm)' }, { key: 'DL', w: 9.9, h: 21, label: 'DL (9.9×21cm)' },
    ],
    gsmOptions: [70, 80, 100, 120, 150, 190, 210, 230, 260, 310, 350],
    isiGsmOptions: [70, 80, 100, 120, 150],
    coverGsmOptions: [210, 230, 260, 310, 350],
};

const SheetWeight: React.FC<{ settings: BeratSettings }> = ({ settings }) => {
    const [form] = Form.useForm();
    const gsm = Form.useWatch('gsm', form) || 150;
    const sizeKey = Form.useWatch('size', form) || settings.sizes[2]?.key || 'A4';
    const qty = Form.useWatch('qty', form) || 100;
    const sizeMap = useMemo(() => { const m: Record<string, PaperSize> = {}; settings.sizes.forEach(s => { m[s.key] = s; }); return m; }, [settings.sizes]);
    
    const result = useMemo(() => {
        const s = sizeMap[sizeKey]; if (!s) return null;
        const areaM2 = (s.w / 100) * (s.h / 100); const perSheet = (gsm * areaM2) / 1000; const total = perSheet * qty;
        return { perSheet: Math.round(perSheet * 10000) / 10000, total: Math.round(total * 100) / 100, areaM2: Math.round(areaM2 * 10000) / 10000 };
    }, [gsm, sizeKey, qty, sizeMap]);

    return (
        <div style={{ padding: '24px 0' }}>
            <Form form={form} layout="vertical" initialValues={{ gsm: 150, size: settings.sizes[2]?.key || 'A4', qty: 100 }} requiredMark={false}>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="size" label={<Text strong style={{ fontSize: 13 }}>Ukuran Kertas</Text>}>
                            <Select size="large" style={{ borderRadius: 12 }}>{settings.sizes.map(s => <Option key={s.key} value={s.key}>{s.label}</Option>)}</Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="gsm" label={<Text strong style={{ fontSize: 13 }}>Gramatur (GSM)</Text>}>
                            <Select size="large" style={{ borderRadius: 12 }}>{settings.gsmOptions.map(g => <Option key={g} value={g}>{g} gsm</Option>)}</Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="qty" label={<Text strong style={{ fontSize: 13 }}>Jumlah Lembar</Text>}>
                            <InputNumber min={1} max={100000} style={{ width: '100%', borderRadius: 12 }} size="large" />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>

            <AnimatePresence>
                {result && (
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
                        <div style={{ background: '#f8fafc', borderRadius: 24, padding: '32px', border: '1px solid #f1f5f9', marginTop: 12 }}>
                            <Row gutter={[24, 24]}>
                                <Col span={8}>
                                    <div style={{ textAlign: 'center' }}>
                                        <Text style={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>PER LEMBAR</Text>
                                        <div style={{ fontSize: 24, fontWeight: 800, color: '#334155' }}>{(result.perSheet * 1000).toFixed(1)} <span style={{ fontSize: 14 }}>g</span></div>
                                    </div>
                                </Col>
                                <Col span={8}>
                                    <div style={{ textAlign: 'center', borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
                                        <Text style={{ fontSize: 11, color: '#0fb9b1', fontWeight: 700, letterSpacing: '0.5px' }}>TOTAL BERAT</Text>
                                        <div style={{ fontSize: 32, fontWeight: 800, color: '#0fb9b1' }}>{result.total} <span style={{ fontSize: 16 }}>kg</span></div>
                                    </div>
                                </Col>
                                <Col span={8}>
                                    <div style={{ textAlign: 'center' }}>
                                        <Text style={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>LUAS AREA</Text>
                                        <div style={{ fontSize: 24, fontWeight: 800, color: '#334155' }}>{result.areaM2} <span style={{ fontSize: 14 }}>m²</span></div>
                                    </div>
                                </Col>
                            </Row>
                            <div style={{ marginTop: 24, padding: '12px 16px', background: '#fff', borderRadius: 12, border: '1px solid #eef2f6', display: 'flex', alignItems: 'center', gap: 10 }}>
                                <InfoCircleOutlined style={{ color: '#0fb9b1' }} />
                                <Text style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>Rumus: Gramatur ({gsm}g) × Luas ({result.areaM2}m²) × Qty ({qty}) ÷ 1000</Text>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const BookWeight: React.FC<{ settings: BeratSettings }> = ({ settings }) => {
    const [form] = Form.useForm();
    const pages = Form.useWatch('pages', form) || 100;
    const sizeKey = Form.useWatch('size', form) || 'A5';
    const isiGsm = Form.useWatch('isi_gsm', form) || 70;
    const coverGsm = Form.useWatch('cover_gsm', form) || 260;
    const qty = Form.useWatch('qty', form) || 50;
    const sizeMap = useMemo(() => { const m: Record<string, PaperSize> = {}; settings.sizes.forEach(s => { m[s.key] = s; }); return m; }, [settings.sizes]);
    
    const result = useMemo(() => {
        const s = sizeMap[sizeKey]; if (!s) return null;
        const areaM2 = (s.w / 100) * (s.h / 100); const coverW = (coverGsm * areaM2 * 2) / 1000;
        const isiW = (isiGsm * areaM2 * (pages / 2)) / 1000; const perBook = coverW + isiW + 0.008;
        return { coverW: Math.round(coverW * 1000), isiW: Math.round(isiW * 1000), perBook: Math.round(perBook * 1000) / 1000, total: Math.round(perBook * qty * 100) / 100 };
    }, [pages, sizeKey, isiGsm, coverGsm, qty, sizeMap]);

    return (
        <div style={{ padding: '24px 0' }}>
            <Form form={form} layout="vertical" initialValues={{ pages: 100, size: 'A5', isi_gsm: 70, cover_gsm: 260, qty: 50 }} requiredMark={false}>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="size" label={<Text strong style={{ fontSize: 13 }}>Ukuran Buku</Text>}>
                            <Select size="large" style={{ borderRadius: 12 }}>{settings.sizes.filter(s => ['A4', 'A5', 'A6', 'DL'].includes(s.key)).map(s => <Option key={s.key} value={s.key}>{s.label}</Option>)}</Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="pages" label={<Text strong style={{ fontSize: 13 }}>Halaman Isi</Text>}>
                            <InputNumber min={8} max={500} step={2} style={{ width: '100%', borderRadius: 12 }} size="large" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="qty" label={<Text strong style={{ fontSize: 13 }}>Jumlah Pesanan</Text>}>
                            <InputNumber min={1} max={10000} style={{ width: '100%', borderRadius: 12 }} size="large" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="isi_gsm" label={<Text strong style={{ fontSize: 13 }}>Bahan Isi (GSM)</Text>}>
                            <Select size="large" style={{ borderRadius: 12 }}>{settings.isiGsmOptions.map(g => <Option key={g} value={g}>{g} gsm</Option>)}</Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="cover_gsm" label={<Text strong style={{ fontSize: 13 }}>Bahan Cover (GSM)</Text>}>
                            <Select size="large" style={{ borderRadius: 12 }}>{settings.coverGsmOptions.map(g => <Option key={g} value={g}>{g} gsm</Option>)}</Select>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>

            <AnimatePresence>
                {result && (
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
                         <div style={{ background: '#f8fafc', borderRadius: 24, padding: '32px', border: '1px solid #f1f5f9', marginTop: 12 }}>
                            <Row gutter={[24, 24]} align="middle">
                                <Col span={6}>
                                    <div style={{ textAlign: 'center' }}>
                                        <Text style={{ fontSize: 10, color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>ISI ({pages/2} LBR)</Text>
                                        <div style={{ fontSize: 20, fontWeight: 800, color: '#334155' }}>{result.isiW}g</div>
                                    </div>
                                </Col>
                                <Col span={6}>
                                    <div style={{ textAlign: 'center', borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
                                        <Text style={{ fontSize: 10, color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>COVER</Text>
                                        <div style={{ fontSize: 20, fontWeight: 800, color: '#334155' }}>{result.coverW}g</div>
                                    </div>
                                </Col>
                                <Col span={6}>
                                    <div style={{ textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>
                                        <Text style={{ fontSize: 10, color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>PER BUKU</Text>
                                        <div style={{ fontSize: 20, fontWeight: 800, color: '#ff9f43' }}>{(result.perBook * 1000).toFixed(0)}g</div>
                                    </div>
                                </Col>
                                <Col span={6}>
                                    <div style={{ textAlign: 'center' }}>
                                        <Text style={{ fontSize: 11, color: '#0fb9b1', fontWeight: 700, letterSpacing: '0.5px' }}>TOTAL BERAT</Text>
                                        <div style={{ fontSize: 32, fontWeight: 800, color: '#0fb9b1' }}>{result.total} <span style={{ fontSize: 16 }}>kg</span></div>
                                    </div>
                                </Col>
                            </Row>
                            <div style={{ marginTop: 24, padding: '12px 16px', background: '#fff', borderRadius: 12, border: '1px solid #eef2f6', display: 'flex', justifyContent: 'center' }}>
                                <Text style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{qty} buku × {result.perBook}kg = {result.total}kg (Estimasi)</Text>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const BeratCalculatorPage: React.FC = () => {
    const navigate = useNavigate();
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    const defaultTab = path.includes('berat-buku') ? 'book' : 'sheet';
    const [settings, setSettings, resetSettings] = useCalcSettings<BeratSettings>('berat', DEFAULT_SETTINGS);

    const updateSize = (idx: number, field: string, value: any) => { const u = { ...settings, sizes: [...settings.sizes] }; (u.sizes[idx] as any)[field] = value; setSettings(u); };
    const addSize = () => { setSettings({ ...settings, sizes: [...settings.sizes, { key: 'NEW', w: 20, h: 30, label: 'Custom' }] }); };
    const removeSize = (idx: number) => { if (settings.sizes.length <= 1) return; setSettings({ ...settings, sizes: settings.sizes.filter((_, i) => i !== idx) }); };
    const updateGsm = (field: 'gsmOptions' | 'isiGsmOptions' | 'coverGsmOptions', str: string) => { setSettings({ ...settings, [field]: str.split(',').map(s => Number(s.trim())).filter(n => n > 0) }); };
    const handleReset = () => { resetSettings(); message.success('Reset'); };

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={{ fontFamily: "'Poppins', sans-serif" }}>
            <PageHeader
                title="Berat Cetakan"
                description="Estimasi akurat berat lembaran atau buku untuk perhitungan ongkos kirim logistik."
                breadcrumb={[{ label: 'KALKULATOR' }, { label: 'BERAT' }]}
                extra={<Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/kalkulator')}>Kembali</Button>}
            />

            <div className="premium-card" style={{ borderRadius: 28, background: '#fff', padding: '12px 32px', marginBottom: 24, border: 'none' }}>
                <Tabs 
                    defaultActiveKey={defaultTab} 
                    className="premium-tabs"
                    items={[
                        { key: 'sheet', label: <Space><FileTextOutlined /> Berat Lembaran</Space>, children: <SheetWeight settings={settings} /> },
                        { key: 'book', label: <Space><BookOutlined /> Berat Buku</Space>, children: <BookWeight settings={settings} /> },
                    ]} 
                />
            </div>

            <Collapse ghost items={[{
                key: 'settings',
                label: <Space style={{ cursor: 'pointer', color: '#aaa', fontWeight: 600, fontSize: 12 }}><SettingOutlined /> Konfigurasi Ukuran & Standar GSM</Space>,
                children: (
                    <div className="premium-card" style={{ borderRadius: 20, background: '#fff', border: 'none', padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' }}>
                            <Text style={{ fontSize: 12, color: '#aaa' }}>Atur daftar ukuran kertas standar dan pilihan gramatur.</Text>
                            <Space>
                                <Button size="small" type="dashed" icon={<PlusOutlined />} onClick={addSize}>Tambah Ukuran</Button>
                                <Popconfirm title="Reset?" onConfirm={handleReset}><Button size="small" danger type="text" icon={<UndoOutlined />}>Reset</Button></Popconfirm>
                            </Space>
                        </div>
                        {settings.sizes.map((s, idx) => (
                            <div key={idx} style={{ padding: '12px 0', borderTop: '1px solid #f8f8f8' }}>
                                <Row gutter={8} align="middle">
                                    <Col span={3}><Input size="middle" value={s.key} style={{ borderRadius: 8, fontWeight: 700 }} onChange={e => updateSize(idx, 'key', e.target.value)} /></Col>
                                    <Col span={10}><Input size="middle" value={s.label} style={{ borderRadius: 8 }} onChange={e => updateSize(idx, 'label', e.target.value)} /></Col>
                                    <Col span={4}><InputNumber size="middle" value={s.w} min={1} step={0.1} style={{ width: '100%', borderRadius: 8 }} onChange={v => updateSize(idx, 'w', v || 10)} addonAfter="cm" /></Col>
                                    <Col span={4}><InputNumber size="middle" value={s.h} min={1} step={0.1} style={{ width: '100%', borderRadius: 8 }} onChange={v => updateSize(idx, 'h', v || 10)} addonAfter="cm" /></Col>
                                    <Col span={3} style={{ textAlign: 'right' }}><Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeSize(idx)} /></Col>
                                </Row>
                            </div>
                        ))}
                        <div style={{ marginTop: 24, padding: '20px', background: '#f8fafc', borderRadius: 16 }}>
                            <Row gutter={24}>
                                <Col span={8}>
                                    <Text strong style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 8 }}>PILIHAN GSM LEMBARAN</Text>
                                    <Input size="middle" value={settings.gsmOptions.join(', ')} style={{ borderRadius: 8 }} onChange={e => updateGsm('gsmOptions', e.target.value)} />
                                </Col>
                                <Col span={8}>
                                    <Text strong style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 8 }}>GSM ISI BUKU</Text>
                                    <Input size="middle" value={settings.isiGsmOptions.join(', ')} style={{ borderRadius: 8 }} onChange={e => updateGsm('isiGsmOptions', e.target.value)} />
                                </Col>
                                <Col span={8}>
                                    <Text strong style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 8 }}>GSM COVER BUKU</Text>
                                    <Input size="middle" value={settings.coverGsmOptions.join(', ')} style={{ borderRadius: 8 }} onChange={e => updateGsm('coverGsmOptions', e.target.value)} />
                                </Col>
                            </Row>
                        </div>
                    </div>
                ),
            }]} />
        </motion.div>
    );
};

export default BeratCalculatorPage;
