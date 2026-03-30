import React, { useState, useCallback } from 'react';
import { Typography, Row, Col, Form, InputNumber, Select, Button, Tag, Space, Collapse, Input, message, Popconfirm } from 'antd';
import { ArrowLeftOutlined, SettingOutlined, UndoOutlined, CalculatorOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api';
import { useCalcSettings } from './useCalcSettings';
import PageHeader from '../../components/PageHeader';

const { Text } = Typography;
const { Option } = Select;

interface CalcResult {
    unit_price: number; total_price: number; discount_percent?: number;
    weight_kg?: number; print_method?: string; estimated_days?: string;
    spine_width_mm?: number; page_count?: number;
}

interface BukuSettings {
    products: Array<{ id: number; name: string; sizes: string[]; papers: string[]; bindings: string[]; minP: number; maxP: number }>;
    sizeLabels: Record<string, string>;
    bindLabels: Record<string, string>;
}

const DEFAULT_SETTINGS: BukuSettings = {
    products: [
        { id: 9, name: 'Buku Softcover', sizes: ['A4', 'A5', 'A6', 'DL'], papers: ['HVS 70gsm', 'HVS 80gsm', 'Artpaper 100gsm'], bindings: ['perfect', 'saddle_stitch'], minP: 50, maxP: 500 },
        { id: 10, name: 'Buku Hardcover', sizes: ['A4', 'A5'], papers: ['HVS 70gsm', 'HVS 80gsm', 'Artpaper 100gsm'], bindings: ['perfect'], minP: 50, maxP: 500 },
        { id: 11, name: 'Booklet / Majalah', sizes: ['A4', 'A5'], papers: ['Artpaper 100gsm', 'Artpaper 150gsm'], bindings: ['saddle_stitch'], minP: 8, maxP: 42 },
    ],
    sizeLabels: { A4: 'A4 (21×29.7cm)', A5: 'A5 (14.8×21cm)', A6: 'A6 (10.5×14.8cm)', DL: 'DL (9.9×21cm)' },
    bindLabels: { perfect: 'Perfect Binding (Lem Panas)', saddle_stitch: 'Saddle Stitch (Staples Tengah)' },
};

const BukuCalculatorPage: React.FC = () => {
    const [form] = Form.useForm();
    const [result, setResult] = useState<CalcResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedIdx, setSelectedIdx] = useState<number>(0);
    const navigate = useNavigate();
    const [settings, setSettings, resetSettings] = useCalcSettings<BukuSettings>('buku', DEFAULT_SETTINGS);
    const prod = settings.products[selectedIdx] || settings.products[0];
    
    const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

    const calculate = useCallback(async () => {
        setLoading(true);
        try {
            const v = form.getFieldsValue();
            const coverType = prod.id === 10 ? 'hardcover' : prod.id === 11 ? 'booklet' : 'softcover';
            const res = await api.post('/percetakan/calculator/buku', {
                quantity: v.quantity || 25,
                pages: v.page_count,
                size: v.paper_size,
                cover_type: coverType,
                paper_type: v.paper_type,
                color_mode: v.color_mode,
                binding_type: v.binding_type,
                lamination: v.lamination,
            });
            if (res.data?.success) setResult(res.data.data);
        } catch (err: any) {
            setResult(null);
            const msg = err?.response?.data?.message || err?.response?.data?.error?.message || 'Gagal menghitung harga';
            message.error(msg);
        }
        finally { setLoading(false); }
    }, [form, prod]);

    const updateProd = (idx: number, field: string, value: any) => {
        const updated = { ...settings }; (updated.products[idx] as any)[field] = value; setSettings(updated);
    };
    const updateList = (pIdx: number, field: 'sizes' | 'papers' | 'bindings', str: string) => {
        const updated = { ...settings }; updated.products[pIdx][field] = str.split(',').map(s => s.trim()).filter(Boolean); setSettings(updated);
    };
    const handleReset = () => { resetSettings(); setSelectedIdx(0); message.success('Pengaturan direset!'); };

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={{ fontFamily: "'Poppins', sans-serif" }}>
            <PageHeader
                title="Kalkulator Buku"
                description="Estimasi harga cetak buku softcover, hardcover, dan booklet secara otomatis."
                breadcrumb={[{ label: 'KALKULATOR' }, { label: 'BUKU' }]}
                extra={<Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/kalkulator')}>Kembali</Button>}
            />

            <Row gutter={[32, 32]}>
                <Col xs={24} lg={14}>
                    <div className="premium-card" style={{ borderRadius: 28, background: '#fff', padding: '32px', marginBottom: 24, border: 'none' }}>
                        <div style={{ marginBottom: 24 }}>
                            <Text strong style={{ fontSize: 11, color: '#aaa', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>JENIS PRODUK</Text>
                            <Select size="large" value={selectedIdx} onChange={v => { setSelectedIdx(v); setResult(null); }} style={{ width: '100%', borderRadius: 14 }}>
                                {settings.products.map((p, i) => <Option key={i} value={i}>{p.name}</Option>)}
                            </Select>
                        </div>

                        <Form form={form} layout="vertical" initialValues={{ quantity: 50, paper_size: 'A5', paper_type: prod.papers[0], page_count: 100, color_mode: 'bw', binding_type: prod.bindings[0], lamination: 'matte' }} requiredMark={false}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="paper_size" label={<Text strong style={{ fontSize: 13 }}>Ukuran Buku</Text>}>
                                        <Select size="large" style={{ borderRadius: 12 }}>{prod.sizes.map(s => <Option key={s} value={s}>{settings.sizeLabels[s] || s}</Option>)}</Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="page_count" label={<Text strong style={{ fontSize: 13 }}>Jumlah Halaman</Text>}>
                                        <InputNumber min={prod.minP} max={prod.maxP} step={2} style={{ width: '100%', borderRadius: 12 }} size="large" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item name="color_mode" label={<Text strong style={{ fontSize: 13 }}>Variasi Isi</Text>}>
                                        <Select size="large" style={{ borderRadius: 12 }}><Option value="fullcolor">Warna</Option><Option value="bw">Hitam Putih</Option></Select>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item name="paper_type" label={<Text strong style={{ fontSize: 13 }}>Jenis Kertas</Text>}>
                                        <Select size="large" style={{ borderRadius: 12 }}>{prod.papers.map(p => <Option key={p} value={p}>{p}</Option>)}</Select>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item name="lamination" label={<Text strong style={{ fontSize: 13 }}>Laminasi Cover</Text>}>
                                        <Select size="large" style={{ borderRadius: 12 }}><Option value="glossy">Glossy</Option><Option value="matte">Doff/Matte</Option></Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="binding_type" label={<Text strong style={{ fontSize: 13 }}>Teknik Jilid</Text>}>
                                         <Select size="large" style={{ borderRadius: 12 }}>{prod.bindings.map(b => <Option key={b} value={b}>{settings.bindLabels[b] || b}</Option>)}</Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="quantity" label={<Text strong style={{ fontSize: 13 }}>Total Eksemplar</Text>}>
                                        <InputNumber min={1} max={10000} style={{ width: '100%', borderRadius: 12 }} size="large" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Button type="primary" onClick={calculate} loading={loading} block size="large"
                                icon={<CalculatorOutlined />}
                                style={{ borderRadius: 14, height: 52, fontWeight: 700, marginTop: 8, background: '#0fb9b1', border: 'none', boxShadow: '0 8px 20px rgba(15, 185, 177, 0.25)' }}>
                                HITUNG HARGA SEKARANG
                            </Button>
                        </Form>
                    </div>

                    <Collapse ghost items={[{
                        key: 'settings',
                        label: <Space style={{ cursor: 'pointer', color: '#aaa', fontWeight: 600, fontSize: 12 }}><SettingOutlined /> Opsi Konfigurasi Harga</Space>,
                        children: (
                            <div className="premium-card" style={{ borderRadius: 20, background: '#fff', border: 'none', padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' }}>
                                    <Text style={{ fontSize: 12, color: '#aaa' }}>Atur parameter default untuk kalkulator buku ini.</Text>
                                    <Popconfirm title="Reset semua pengaturan?" onConfirm={handleReset}><Button size="small" danger type="text" icon={<UndoOutlined />}>Reset</Button></Popconfirm>
                                </div>
                                {settings.products.map((p, pIdx) => (
                                    <div key={p.id} style={{ padding: '16px 0', borderTop: '1px solid #f8f8f8' }}>
                                        <Text strong style={{ fontSize: 13, color: '#333', display: 'block', marginBottom: 12 }}>{p.name.toUpperCase()}</Text>
                                        <Row gutter={12}>
                                            <Col span={10}><Input size="middle" value={p.name} onChange={e => updateProd(pIdx, 'name', e.target.value)} style={{ borderRadius: 8 }} /></Col>
                                            <Col span={7}><InputNumber size="middle" addonBefore="Min" value={p.minP} style={{ width: '100%', borderRadius: 8 }} onChange={v => updateProd(pIdx, 'minP', v)} /></Col>
                                            <Col span={7}><InputNumber size="middle" addonBefore="Max" value={p.maxP} style={{ width: '100%', borderRadius: 8 }} onChange={v => updateProd(pIdx, 'maxP', v)} /></Col>
                                        </Row>
                                        <div style={{ marginTop: 12 }}>
                                             <Text style={{ fontSize: 11, display: 'block', color: '#aaa', marginBottom: 4 }}>KOMPONEN (PISAH DENGAN KOMA)</Text>
                                             <Input size="middle" value={p.papers.join(', ')} onChange={e => updateList(pIdx, 'papers', e.target.value)} style={{ borderRadius: 8 }} />
                                        </div>
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
                                            <Text style={{ fontSize: 11, fontWeight: 700, opacity: 0.8, letterSpacing: '1px' }}>ESTIMASI TOTAL HARGA</Text>
                                            <div style={{ fontSize: 36, fontWeight: 800, marginTop: 4 }}>{fmt(result.total_price)}</div>
                                            <div style={{ marginTop: 8, fontSize: 13, background: 'rgba(255,255,255,0.15)', display: 'inline-block', padding: '4px 12px', borderRadius: 8 }}>
                                                {fmt(result.unit_price)} <span style={{ opacity: 0.7 }}>/ eksemplar</span>
                                            </div>
                                        </div>
                                        <div style={{ padding: '32px' }}>
                                             <Row gutter={[16, 16]}>
                                                {[
                                                    { label: 'Berat/Buku', value: `${result.weight_kg} kg`, icon: <InfoCircleOutlined /> },
                                                    { label: 'Lebar Punggung', value: `${result.spine_width_mm} mm`, icon: <InfoCircleOutlined /> },
                                                    { label: 'Metode Cetak', value: result.print_method, icon: <CalculatorOutlined /> },
                                                ].map((item, i) => (
                                                    <Col span={12} key={i}>
                                                        <Text style={{ fontSize: 11, color: '#aaa', display: 'block', marginBottom: 2 }}>{item.label.toUpperCase()}</Text>
                                                        <Text strong style={{ fontSize: 14, color: '#333' }}>{item.value || '-'}</Text>
                                                    </Col>
                                                ))}
                                             </Row>
                                             
                                             <div style={{ marginTop: 32, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                {(result.discount_percent ?? 0) > 0 && <Tag color="green" style={{ borderRadius: 8, padding: '4px 12px', fontWeight: 700 }}>DISKON {result.discount_percent}%</Tag>}
                                                {result.estimated_days && <Tag style={{ borderRadius: 8, padding: '4px 12px', fontWeight: 700 }}>PENGERJAAN {result.estimated_days} HARI</Tag>}
                                             </div>
                                        </div>
                                    </div>

                                    {result.spine_width_mm != null && (
                                        <div className="premium-card" style={{ borderRadius: 24, background: '#fff', padding: '24px', textAlign: 'center', marginTop: 24, border: 'none' }}>
                                            <Text strong style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 20 }}>VISUalisasi lebar punggung (SPINE)</Text>
                                            <div style={{ display: 'inline-flex', alignItems: 'stretch', borderRadius: 12, overflow: 'hidden', height: 120, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                                                <div style={{ width: 40, background: '#f0f0f0', borderRight: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ fontSize: 9, writingMode: 'vertical-lr', fontWeight: 700, color: '#bbb' }}>DEPAN</Text>
                                                </div>
                                                <div style={{ width: Math.max(result.spine_width_mm * 2.5, 24), background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'width 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                                                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: 800, writingMode: 'vertical-lr', letterSpacing: '1px' }}>{result.spine_width_mm} MM</Text>
                                                </div>
                                                <div style={{ width: 40, background: '#f0f0f0', borderLeft: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ fontSize: 9, writingMode: 'vertical-lr', fontWeight: 700, color: '#bbb' }}>BELAKANG</Text>
                                                </div>
                                            </div>
                                        </div>
                                    )}
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
                                                Pilih jenis buku, ukuran, jumlah halaman, dan metode jilid. Tekan <b>"HITUNG HARGA SEKARANG"</b> untuk estimasi harga per eksemplar.
                                            </Text>
                                            <div style={{ marginTop: 20, padding: '12px 16px', background: '#f0fdf4', borderRadius: 12, border: '1px solid #dcfce7' }}>
                                                <Text style={{ fontSize: 11, color: '#166534' }}>💡 Harga termasuk cetak cover full color + laminasi.</Text>
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

export default BukuCalculatorPage;
