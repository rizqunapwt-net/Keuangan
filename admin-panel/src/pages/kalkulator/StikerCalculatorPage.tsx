import React, { useMemo, useState, useCallback } from 'react';
import { Typography, Row, Col, Form, InputNumber, Select, Button, Tag, Space, Collapse, Input, message, Popconfirm } from 'antd';
import { ScissorOutlined, ArrowLeftOutlined, SettingOutlined, PlusOutlined, DeleteOutlined, UndoOutlined, CalculatorOutlined, LayoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api';
import { useCalcSettings } from './useCalcSettings';
import PageHeader from '../../components/PageHeader';

const { Text } = Typography;
const { Option } = Select;

interface CalcResult {
    unit_price: number; total_price: number; weight_kg?: number; estimated_days?: string;
}

interface StikerProduct { name: string; price: number }
interface StikerSettings {
    products: StikerProduct[];
    sheetW: number; sheetH: number;
    cutMethods: Array<{ value: string; label: string }>;
}

const DEFAULT_SETTINGS: StikerSettings = {
    products: [
        { name: 'Stiker Chromo (Kertas)', price: 15000 },
        { name: 'Stiker Vinyl (Tahan Air)', price: 35000 },
        { name: 'Stiker Transparan', price: 40000 },
    ],
    sheetW: 31, sheetH: 47,
    cutMethods: [
        { value: 'die_cut', label: 'Die Cut (Potong Bentuk)' },
        { value: 'kiss_cut', label: 'Kiss Cut (Stiker Sheet)' },
        { value: 'manual', label: 'Manual / Gunting' },
    ],
};

const StikerCalculatorPage: React.FC = () => {
    const [form] = Form.useForm();
    const [result, setResult] = useState<CalcResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedIdx, setSelectedIdx] = useState(0);
    const navigate = useNavigate();
    const [settings, setSettings, resetSettings] = useCalcSettings<StikerSettings>('stiker', DEFAULT_SETTINGS);
    const prod = settings.products[selectedIdx] || settings.products[0];
    const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

    const stikerW = Form.useWatch('stiker_w', form) || 5;
    const stikerH = Form.useWatch('stiker_h', form) || 5;
    const sheetQty = Form.useWatch('sheet_qty', form) || 10;

    const layout = useMemo(() => {
        const cols = Math.floor(settings.sheetW / stikerW);
        const rows = Math.floor(settings.sheetH / stikerH);
        return { cols, rows, perSheet: cols * rows, total: cols * rows * sheetQty };
    }, [stikerW, stikerH, sheetQty, settings.sheetW, settings.sheetH]);

    const livePrice = layout.total > 0 ? sheetQty * prod.price : 0;

    const calculate = useCallback(async () => {
        setLoading(true);
        try {
            const v = form.getFieldsValue();
            const materialKeys = ['chromo', 'vinyl', 'transparent'];
            const res = await api.post('/percetakan/calculator/stiker', {
                width_cm: v.stiker_w,
                height_cm: v.stiker_h,
                sheet_count: sheetQty,
                material: materialKeys[selectedIdx] || 'chromo',
                cut_type: v.cut_type,
            });
            if (res.data?.success) setResult(res.data.data);
        } catch (err: any) {
            setResult(null);
            message.error(err?.response?.data?.message || err?.response?.data?.error?.message || 'Gagal menghitung');
        }
        finally { setLoading(false); }
    }, [form, selectedIdx, sheetQty]);

    const updateProduct = (idx: number, field: string, value: any) => {
        const updated = { ...settings }; (updated.products[idx] as any)[field] = value; setSettings(updated);
    };
    const addProduct = () => { setSettings({ ...settings, products: [...settings.products, { name: 'Baru', price: 20000 }] }); };
    const removeProduct = (idx: number) => {
        if (settings.products.length <= 1) return message.warning('Minimal 1');
        const updated = { ...settings, products: settings.products.filter((_, i) => i !== idx) };
        setSettings(updated);
        if (selectedIdx >= updated.products.length) setSelectedIdx(0);
    };
    const handleReset = () => { resetSettings(); setSelectedIdx(0); message.success('Reset'); };

    const gridCells = useMemo(() => {
        const cells = [];
        const palette = ['#e8efff', '#fef3c7', '#d1fae5', '#fee2e2', '#f3e8ff', '#fce7f3', '#dbeafe', '#e0e7ff'];
        for (let r = 0; r < Math.min(layout.rows, 12); r++) {
            for (let c = 0; c < Math.min(layout.cols, 10); c++) {
                cells.push({ r, c, bg: palette[(r * layout.cols + c) % palette.length] });
            }
        }
        return cells;
    }, [layout.rows, layout.cols]);

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={{ fontFamily: "'Poppins', sans-serif" }}>
            <PageHeader
                title="Stiker & Label"
                description={`Kalkulasi layout otomatis per lembar ${settings.sheetW}×${settings.sheetH}cm untuk efisiensi bahan.`}
                breadcrumb={[{ label: 'KALKULATOR' }, { label: 'STIKER' }]}
                extra={<Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/kalkulator')}>Kembali</Button>}
            />

            <Row gutter={[32, 32]}>
                <Col xs={24} lg={15}>
                    <div className="premium-card" style={{ borderRadius: 28, background: '#fff', padding: '32px', marginBottom: 24, border: 'none' }}>
                        <div style={{ marginBottom: 24 }}>
                             <Select size="large" value={selectedIdx} onChange={v => { setSelectedIdx(v); setResult(null); }} style={{ width: '100%', borderRadius: 14 }}>
                                {settings.products.map((p, i) => <Option key={i} value={i}>{p.name} — {fmt(p.price)}/lbr</Option>)}
                            </Select>
                        </div>

                        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 20 }} className="hide-scrollbar">
                            <Button size="small" shape="round" onClick={() => { 
                                setSelectedIdx(0);
                                form.setFieldsValue({ stiker_w: 5, stiker_h: 5, sheet_qty: 10, cut_type: 'die_cut' });
                            }} style={{ fontSize: 11, fontWeight: 600 }}>🏷️ Presets: Chromo 5cm Diecut</Button>
                            <Button size="small" shape="round" onClick={() => { 
                                setSelectedIdx(1);
                                form.setFieldsValue({ stiker_w: 3, stiker_h: 3, sheet_qty: 20, cut_type: 'kiss_cut' });
                            }} style={{ fontSize: 11, fontWeight: 600 }}>💧 Presets: Vinyl 3cm Kisscut</Button>
                        </div>
                        
                        <Form form={form} layout="vertical" initialValues={{ stiker_w: 5, stiker_h: 5, sheet_qty: 10, cut_type: 'die_cut' }} requiredMark={false}>
                            <Row gutter={16}>
                                <Col span={6}>
                                    <Form.Item name="stiker_w" label={<Text strong style={{ fontSize: 13 }}>Lebar (cm)</Text>}>
                                        <InputNumber min={1} max={settings.sheetW} style={{ width: '100%', borderRadius: 12 }} size="large" />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item name="stiker_h" label={<Text strong style={{ fontSize: 13 }}>Tinggi (cm)</Text>}>
                                        <InputNumber min={1} max={settings.sheetH} style={{ width: '100%', borderRadius: 12 }} size="large" />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item name="sheet_qty" label={<Text strong style={{ fontSize: 13 }}>Jml Lembar</Text>}>
                                        <InputNumber min={1} max={1000} style={{ width: '100%', borderRadius: 12 }} size="large" />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item name="cut_type" label={<Text strong style={{ fontSize: 13 }}>Metode Potong</Text>}>
                                        <Select size="large" style={{ borderRadius: 12 }}>{settings.cutMethods.map(c => <Option key={c.value} value={c.value}>{c.label}</Option>)}</Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <div style={{ background: '#f0fdf4', borderRadius: 20, padding: '24px', marginBottom: 24, border: '1px solid #dcfce7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: 16 }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <Text style={{ fontSize: 11, color: '#15803d', fontWeight: 700, letterSpacing: '0.5px' }}>ISI PER LEMBAR</Text>
                                        <div style={{ fontSize: 24, fontWeight: 800, color: '#166534' }}>{layout.perSheet} <span style={{ fontSize: 13, fontWeight: 400 }}>pcs</span></div>
                                    </div>
                                    <div style={{ width: 1, background: '#bbf7d0', height: 40, marginTop: 4 }}></div>
                                    <div style={{ textAlign: 'center' }}>
                                        <Text style={{ fontSize: 11, color: '#15803d', fontWeight: 700, letterSpacing: '0.5px' }}>TOTAL STIKER</Text>
                                        <div style={{ fontSize: 24, fontWeight: 800, color: '#166534' }}>{layout.total.toLocaleString()} <span style={{ fontSize: 13, fontWeight: 400 }}>pcs</span></div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <Text style={{ fontSize: 11, color: '#15803d', fontWeight: 700, letterSpacing: '0.5px' }}>ESTIMASI LOKAL</Text>
                                    <div style={{ fontSize: 24, fontWeight: 800, color: livePrice > 0 ? '#0fb9b1' : '#ccc' }}>{livePrice > 0 ? fmt(livePrice) : '—'}</div>
                                </div>
                            </div>

                            <Button type="primary" onClick={calculate} loading={loading} block size="large" icon={<CalculatorOutlined />}
                                style={{ borderRadius: 14, height: 52, fontWeight: 700, background: '#0fb9b1', border: 'none', boxShadow: '0 8px 20px rgba(15, 185, 177, 0.25)' }}>
                                HITUNG HARGA SEKARANG
                            </Button>
                        </Form>
                    </div>

                    <div className="premium-card" style={{ borderRadius: 24, background: '#fff', padding: '32px', border: 'none', textAlign: 'center', marginBottom: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, justifyContent: 'center' }}>
                            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#f0f3ff', color: '#4361ee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}><LayoutOutlined /></div>
                            <Text strong style={{ fontSize: 14, color: '#333' }}>Visual Layout Lembar {settings.sheetW}×{settings.sheetH}cm</Text>
                        </div>
                        <div style={{
                            display: 'inline-grid',
                            gridTemplateColumns: `repeat(${Math.min(layout.cols, 10)}, 1fr)`,
                            gap: 4, padding: 16,
                            border: `2px dashed #eee`, borderRadius: 12,
                            maxWidth: '100%',
                            background: '#fafafa'
                        }}>
                            {gridCells.map((cell, i) => (
                                <div key={i} style={{
                                    width: Math.max(20, Math.min(40, 320 / Math.min(layout.cols, 10))),
                                    height: Math.max(16, Math.min(32, 240 / Math.min(layout.rows, 12))),
                                    background: cell.bg, borderRadius: 4,
                                    border: `1px solid rgba(0,0,0,0.05)`,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                }} />
                            ))}
                        </div>
                        <div style={{ marginTop: 24, display: 'flex', gap: 8, justifyContent: 'center' }}>
                            <Tag bordered={false} style={{ background: '#f1f5f9', color: '#64748b', fontSize: 11, borderRadius: 6, padding: '4px 10px', fontWeight: 600 }}>{stikerW} × {stikerH} cm</Tag>
                            <Tag bordered={false} style={{ background: '#f1f5f9', color: '#64748b', fontSize: 11, borderRadius: 6, padding: '4px 10px', fontWeight: 600 }}>{layout.cols} KOLOM × {layout.rows} BARIS</Tag>
                        </div>
                    </div>

                    <Collapse ghost items={[{
                        key: 'settings',
                        label: <Space style={{ cursor: 'pointer', color: '#aaa', fontWeight: 600, fontSize: 12 }}><SettingOutlined /> Konfigurasi Bahan & Dimensi</Space>,
                        children: (
                            <div className="premium-card" style={{ borderRadius: 20, background: '#fff', border: 'none', padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' }}>
                                    <Text style={{ fontSize: 12, color: '#aaa' }}>Atur ukuran lembar kerja dan daftar harga bahan.</Text>
                                    <Space>
                                        <Button size="small" type="dashed" icon={<PlusOutlined />} onClick={addProduct}>Tambah Bahan</Button>
                                        <Popconfirm title="Reset?" onConfirm={handleReset}><Button size="small" danger type="text" icon={<UndoOutlined />}>Reset</Button></Popconfirm>
                                    </Space>
                                </div>
                                <Row gutter={12} style={{ marginBottom: 24 }}>
                                    <Col span={12}><Text strong style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>LEBAR LEMBAR (CM)</Text><InputNumber size="middle" value={settings.sheetW} min={10} style={{ width: '100%', borderRadius: 8 }} onChange={v => setSettings({ ...settings, sheetW: v || 31 })} /></Col>
                                    <Col span={12}><Text strong style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>TINGGI LEMBAR (CM)</Text><InputNumber size="middle" value={settings.sheetH} min={10} style={{ width: '100%', borderRadius: 8 }} onChange={v => setSettings({ ...settings, sheetH: v || 47 })} /></Col>
                                </Row>
                                {settings.products.map((p, idx) => (
                                    <div key={idx} style={{ padding: '12px 0', borderTop: '1px solid #f8f8f8' }}>
                                        <Row gutter={8} align="middle">
                                            <Col span={12}><Input size="middle" value={p.name} style={{ borderRadius: 8 }} onChange={e => updateProduct(idx, 'name', e.target.value)} /></Col>
                                            <Col span={10}><InputNumber size="middle" addonBefore="Rp" value={p.price} min={0} style={{ width: '100%', borderRadius: 8 }} onChange={v => updateProduct(idx, 'price', v || 0)}
                                                formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')} parser={v => Number(v!.replace(/\./g, ''))} /></Col>
                                            <Col span={2} style={{ textAlign: 'center' }}><Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeProduct(idx)} /></Col>
                                        </Row>
                                    </div>
                                ))}
                            </div>
                        )
                    }]} />
                </Col>

                <Col xs={24} lg={9}>
                    <div style={{ position: 'sticky', top: 100 }}>
                        <AnimatePresence mode="wait">
                            {result ? (
                                <motion.div key="r" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                                    <div className="premium-card" style={{ borderRadius: 28, background: '#fff', overflow: 'hidden', border: 'none' }}>
                                        <div style={{ padding: '32px', background: 'linear-gradient(135deg, #0fb9b1, #26de81)', color: '#fff' }}>
                                            <Text style={{ fontSize: 11, fontWeight: 700, opacity: 0.8, letterSpacing: '1px' }}>TOTAL HARGA PESANAN</Text>
                                            <div style={{ fontSize: 36, fontWeight: 800, marginTop: 4 }}>{fmt(result.total_price)}</div>
                                            <div style={{ marginTop: 8, fontSize: 13, background: 'rgba(255,255,255,0.15)', display: 'inline-block', padding: '4px 12px', borderRadius: 8 }}>
                                                {fmt(result.unit_price)} <span style={{ opacity: 0.7 }}>/ lbr</span>
                                            </div>
                                        </div>
                                        <div style={{ padding: '32px' }}>
                                              <Row gutter={[16, 24]} style={{ marginBottom: 24 }}>
                                                {[
                                                    { label: 'Total Output', value: `${layout.total.toLocaleString()} Stiker`, icon: <ScissorOutlined /> },
                                                    { label: 'Jumlah Lembar', value: `${sheetQty} lbr`, icon: <LayoutOutlined /> },
                                                    { label: 'Estimasi Berat', value: result.weight_kg ? `${result.weight_kg} kg` : '-', icon: null },
                                                ].map((item, i) => (
                                                    <Col span={item.label === 'Estimasi Berat' ? 24 : 12} key={i}>
                                                        <Text style={{ fontSize: 10, color: '#aaa', display: 'block', fontWeight: 700, marginBottom: 2 }}>{item.label.toUpperCase()}</Text>
                                                        <Text strong style={{ fontSize: 14, color: '#333' }}>{item.value}</Text>
                                                    </Col>
                                                ))}
                                             </Row>

                                             {(result as any).pricing != null && (
                                                <div style={{ borderTop: '1px dashed #eee', paddingTop: 20, marginBottom: 20 }}>
                                                    <Text strong style={{ fontSize: 11, color: '#aaa', display: 'block', marginBottom: 12 }}>RINCIAN BIAYA PER LEMBAR</Text>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><Text style={{ fontSize: 12, color: '#64748b' }}>Bahan Stiker</Text><Text strong style={{ fontSize: 12 }}>{fmt((result as any).pricing.base_price_per_unit)}</Text></div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><Text style={{ fontSize: 12, color: '#64748b' }}>Biaya Potong</Text><Text strong style={{ fontSize: 12 }}>{fmt((result as any).pricing.finishing_cost_per_unit)}</Text></div>
                                                    </div>
                                                </div>
                                             )}
                                             
                                             {result.estimated_days && (
                                                <div style={{ marginTop: 24 }}>
                                                    <Tag color="green" style={{ borderRadius: 8, padding: '4px 12px', fontWeight: 600 }}>± {result.estimated_days} HARI KERJA</Tag>
                                                </div>
                                             )}
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
                                            <Text style={{ fontSize: 12, color: '#64748b', lineHeight: 1.8 }}>
                                                Atur ukuran stiker, jumlah lembar, dan metode potong. Tekan <b>"HITUNG HARGA SEKARANG"</b> untuk melihat layout otomatis dan harga produksi.
                                            </Text>
                                            <div style={{ marginTop: 20, padding: '12px 16px', background: '#f0fdf4', borderRadius: 12, border: '1px solid #dcfce7' }}>
                                                <Text style={{ fontSize: 11, color: '#166534' }}>💡 Layout otomatis menghitung jumlah stiker per lembar 31×47cm.</Text>
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

export default StikerCalculatorPage;
