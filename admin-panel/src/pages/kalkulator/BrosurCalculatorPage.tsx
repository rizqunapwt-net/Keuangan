import React, { useState, useCallback } from 'react';
import { Typography, Row, Col, Form, InputNumber, Select, Button, Tag, Space, Table, Collapse, Input, message, Popconfirm } from 'antd';
import { ArrowLeftOutlined, SettingOutlined, PlusOutlined, DeleteOutlined, UndoOutlined, CalculatorOutlined, InfoCircleOutlined, PercentageOutlined } from '@ant-design/icons';
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
    finishing_fees?: number;
}

interface BrosurSettings {
    products: Array<{ id: number; name: string; papers: string[]; folds: string[]; min: number; basePrice: number }>;
    tiers: Record<number, Array<{ range: string; disc: string; method: string }>>;
}

const DEFAULT_SETTINGS: BrosurSettings = {
    products: [
        { id: 6, name: 'Brosur A4', papers: ['HVS 70gsm', 'HVS 100gsm', 'Artpaper 150gsm', 'Artpaper 260gsm'], folds: ['none', 'fold_2', 'fold_3'], min: 100, basePrice: 2500 },
        { id: 7, name: 'Brosur A3', papers: ['HVS 70gsm', 'Artpaper 150gsm', 'Artpaper 260gsm'], folds: ['none', 'fold_2', 'fold_3', 'fold_4', 'fold_6'], min: 50, basePrice: 5000 },
        { id: 8, name: 'Flyer A5', papers: ['HVS 80gsm', 'Artpaper 150gsm', 'Artpaper 260gsm'], folds: ['none', 'fold_2'], min: 100, basePrice: 1500 },
    ],
    tiers: {
        6: [
            { range: '100–499', disc: '0%', method: 'Digital' },
            { range: '500–999', disc: '10%', method: 'Digital' },
            { range: '1.000–1.999', disc: '15%', method: 'Offset' },
            { range: '2.000–3.999', disc: '20%', method: 'Offset' },
            { range: '4.000+', disc: '25%', method: 'Offset' },
        ],
        7: [
            { range: '50–249', disc: '0%', method: 'Digital' },
            { range: '250–499', disc: '10%', method: 'Digital' },
            { range: '500–999', disc: '15%', method: 'Offset' },
            { range: '1.000+', disc: '20%', method: 'Offset' },
        ],
        8: [
            { range: '100–499', disc: '0%', method: 'Digital' },
            { range: '500–999', disc: '10%', method: 'Digital' },
            { range: '1.000+', disc: '15%', method: 'Offset' },
        ],
    },
};

const FOLD_LABELS: Record<string, string> = {
    none: 'Tanpa Lipat', fold_2: 'Lipat 2', fold_3: 'Lipat 3 (Tri-Fold)',
    fold_4: 'Lipat 4', fold_6: 'Lipat 6 (Accordion)',
};

const BrosurCalculatorPage: React.FC = () => {
    const [form] = Form.useForm();
    const [result, setResult] = useState<CalcResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedIdx, setSelectedIdx] = useState<number>(0);
    const navigate = useNavigate();

    const [settings, setSettings, resetSettings] = useCalcSettings<BrosurSettings>('brosur', DEFAULT_SETTINGS);
    const prod = settings.products[selectedIdx] || settings.products[0];
    const tiers = settings.tiers[prod.id] || [];
    const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

    const calculate = useCallback(async () => {
        setLoading(true);
        try {
            const v = form.getFieldsValue();
            const size = prod.id === 7 ? 'A3' : prod.id === 8 ? 'A5' : 'A4';
            const res = await api.post('/percetakan/calculator/brosur', {
                quantity: v.quantity || prod.min,
                size,
                paper_type: v.paper_type,
                print_sides: v.print_sides,
                lamination: v.lamination,
                fold_type: v.fold_type,
            });
            if (res.data?.success) setResult(res.data.data);
        } catch (err: any) {
            setResult(null);
            message.error(err?.response?.data?.message || err?.response?.data?.error?.message || 'Gagal menghitung');
        }
        finally { setLoading(false); }
    }, [form, prod]);

    const updateProd = (idx: number, field: string, value: any) => {
        const updated = { ...settings };
        (updated.products[idx] as any)[field] = value;
        setSettings(updated);
    };
    const updatePapers = (pIdx: number, str: string) => {
        const updated = { ...settings };
        updated.products[pIdx].papers = str.split(',').map(s => s.trim()).filter(Boolean);
        setSettings(updated);
    };
    const updateTier = (prodId: number, tIdx: number, field: string, value: string) => {
        const updated = { ...settings };
        if (!updated.tiers[prodId]) updated.tiers[prodId] = [];
        (updated.tiers[prodId][tIdx] as any)[field] = value;
        setSettings(updated);
    };
    const addTier = (prodId: number) => {
        const updated = { ...settings };
        if (!updated.tiers[prodId]) updated.tiers[prodId] = [];
        updated.tiers[prodId].push({ range: '___–___', disc: '0%', method: 'Digital' });
        setSettings(updated);
    };
    const removeTier = (prodId: number, tIdx: number) => {
        const updated = { ...settings };
        updated.tiers[prodId] = updated.tiers[prodId].filter((_, i) => i !== tIdx);
        setSettings(updated);
    };
    const handleReset = () => { resetSettings(); setSelectedIdx(0); message.success('Reset ke default'); };

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={{ fontFamily: "'Poppins', sans-serif" }}>
            <PageHeader
                title="Flyer & Brosur"
                description="Hitung estimasi cetak brosur dengan skema harga grosir (volume discount) otomatis."
                breadcrumb={[{ label: 'KALKULATOR' }, { label: 'BROSUR' }]}
                extra={<Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/kalkulator')}>Kembali</Button>}
            />

            <Row gutter={[32, 32]}>
                <Col xs={24} lg={15}>
                    <div className="premium-card" style={{ borderRadius: 28, background: '#fff', padding: '32px', marginBottom: 24, border: 'none' }}>
                         <div style={{ marginBottom: 24 }}>
                             <Select size="large" value={selectedIdx} onChange={v => { setSelectedIdx(v); setResult(null); }} style={{ width: '100%', borderRadius: 14 }}>
                                {settings.products.map((p, i) => <Option key={i} value={i}>{p.name} — Mulai {fmt(p.basePrice)}/pcs</Option>)}
                            </Select>
                        </div>

                        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 20 }} className="hide-scrollbar">
                            <Button size="small" shape="round" onClick={() => { 
                                setSelectedIdx(0);
                                form.setFieldsValue({ paper_type: 'Artpaper 150gsm', print_sides: '2_sides', lamination: 'none', fold_type: 'none', quantity: 500 });
                            }} style={{ fontSize: 11, fontWeight: 600 }}>📄 Presets: Brosur A4 Standard</Button>
                            <Button size="small" shape="round" onClick={() => { 
                                setSelectedIdx(2);
                                form.setFieldsValue({ paper_type: 'HVS 80gsm', print_sides: '1_side', lamination: 'none', fold_type: 'none', quantity: 1000 });
                            }} style={{ fontSize: 11, fontWeight: 600 }}>✉️ Presets: Flyer A5 Promosi</Button>
                        </div>

                        <Form form={form} layout="vertical" initialValues={{ quantity: prod.min, paper_type: prod.papers[2] || prod.papers[0], print_sides: '2_sides', lamination: 'none', fold_type: 'none' }} requiredMark={false}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="paper_type" label={<Text strong style={{ fontSize: 13 }}>Bahan Kertas</Text>}>
                                        <Select size="large" style={{ borderRadius: 12 }}>{prod.papers.map(p => <Option key={p} value={p}>{p}</Option>)}</Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="print_sides" label={<Text strong style={{ fontSize: 13 }}>Sisi Cetak</Text>}>
                                        <Select size="large" style={{ borderRadius: 12 }}><Option value="1_side">1 Sisi (Hanya Depan)</Option><Option value="2_sides">2 Sisi (Bolak-Balik)</Option></Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item name="lamination" label={<Text strong style={{ fontSize: 13 }}>Laminasi</Text>}>
                                        <Select size="large" style={{ borderRadius: 12 }}><Option value="none">Tanpa</Option><Option value="matte">Matte/Doff</Option><Option value="glossy">Glossy</Option></Select>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item name="fold_type" label={<Text strong style={{ fontSize: 13 }}>Finishing Lipat</Text>}>
                                        <Select size="large" style={{ borderRadius: 12 }}>{prod.folds.map(f => <Option key={f} value={f}>{FOLD_LABELS[f] || f}</Option>)}</Select>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item name="quantity" label={<Text strong style={{ fontSize: 13 }}>Qnty (pcs)</Text>}>
                                        <InputNumber min={prod.min} max={100000} style={{ width: '100%', borderRadius: 12 }} size="large" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Button type="primary" onClick={calculate} loading={loading} block size="large" icon={<CalculatorOutlined />}
                                style={{ borderRadius: 14, height: 52, fontWeight: 700, marginTop: 12, background: '#0fb9b1', border: 'none', boxShadow: '0 8px 20px rgba(15, 185, 177, 0.25)' }}>
                                HITUNG HARGA SEKARANG
                            </Button>
                        </Form>
                    </div>

                    <div className="premium-card" style={{ borderRadius: 24, background: '#fff', padding: '24px', border: 'none', marginBottom: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fff7ed', color: '#ff9f43', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}><PercentageOutlined /></div>
                            <Text strong style={{ fontSize: 14, color: '#333' }}>Skema Tier Diskon Volume — {prod.name}</Text>
                        </div>
                        <Table 
                            dataSource={tiers.map((t, i) => ({ ...t, price: fmt(prod.basePrice), key: i }))} 
                            pagination={false} 
                            size="small"
                            rowClassName="premium-inactive-row"
                            columns={[
                                { title: <Text style={{ fontSize: 11, color: '#aaa', fontWeight: 800 }}>JUMLAH (PCS)</Text>, dataIndex: 'range', width: 140, render: v => <Text strong style={{ fontSize: 13 }}>{v}</Text> },
                                { title: <Text style={{ fontSize: 11, color: '#aaa', fontWeight: 800 }}>DISCOUNT</Text>, dataIndex: 'disc', render: (v: string) => <Tag bordered={false} color={v === '0%' ? 'default' : 'green'} style={{ fontWeight: 800, borderRadius: 6 }}>{v}</Tag> },
                                { title: <Text style={{ fontSize: 11, color: '#aaa', fontWeight: 800 }}>PRODUKSI</Text>, dataIndex: 'method', render: (v: string) => <Tag bordered={false} color={v === 'Offset' ? 'orange' : 'blue'} style={{ fontSize: 11, borderRadius: 6, fontWeight: 700 }}>{v.toUpperCase()}</Tag> },
                            ]} 
                        />
                    </div>

                    <Collapse ghost items={[{
                        key: 'settings',
                        label: <Space style={{ cursor: 'pointer', color: '#aaa', fontWeight: 600, fontSize: 12 }}><SettingOutlined /> Opsi Konfigurasi Produk</Space>,
                        children: (
                            <div className="premium-card" style={{ borderRadius: 20, background: '#fff', border: 'none', padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' }}>
                                    <Text style={{ fontSize: 12, color: '#aaa' }}>Atur base price dan tier diskon brosur.</Text>
                                    <Popconfirm title="Reset?" onConfirm={handleReset}><Button size="small" danger type="text" icon={<UndoOutlined />}>Reset</Button></Popconfirm>
                                </div>
                                {settings.products.map((p, pIdx) => (
                                    <div key={p.id} style={{ padding: '16px 0', borderTop: '1px solid #f8f8f8' }}>
                                        <Row gutter={12} align="middle">
                                            <Col span={10}><Input size="middle" value={p.name} onChange={e => updateProd(pIdx, 'name', e.target.value)} style={{ borderRadius: 8 }} /></Col>
                                            <Col span={7}><InputNumber size="middle" addonBefore="Rp" value={p.basePrice} style={{ width: '100%', borderRadius: 8 }} onChange={v => updateProd(pIdx, 'basePrice', v || 0)} /></Col>
                                            <Col span={7}><InputNumber size="middle" addonBefore="Min" value={p.min} style={{ width: '100%', borderRadius: 8 }} onChange={v => updateProd(pIdx, 'min', v || 1)} /></Col>
                                        </Row>
                                        <div style={{ marginTop: 8 }}>
                                            <Text style={{ fontSize: 11, color: '#aaa', display: 'block', marginBottom: 4 }}>PILIHAN KERTAS (PISAH DENGAN KOMA)</Text>
                                            <Input size="small" value={p.papers.join(', ')} onChange={e => updatePapers(pIdx, e.target.value)} style={{ borderRadius: 6 }} placeholder="HVS 70gsm, Artpaper 150gsm, ..." />
                                        </div>
                                        <div style={{ marginTop: 12 }}>
                                            <Text style={{ fontSize: 11, color: '#aaa', display: 'block', marginBottom: 6 }}>TIER DISKON & METODE</Text>
                                            {(settings.tiers[p.id] || []).map((t, tIdx) => (
                                                <Row key={tIdx} gutter={8} style={{ marginBottom: 6 }}>
                                                    <Col span={10}><Input size="small" value={t.range} style={{ borderRadius: 6 }} onChange={e => updateTier(p.id, tIdx, 'range', e.target.value)} /></Col>
                                                    <Col span={4}><Input size="small" value={t.disc} style={{ borderRadius: 6 }} onChange={e => updateTier(p.id, tIdx, 'disc', e.target.value)} /></Col>
                                                    <Col span={7}>
                                                        <Select size="small" value={t.method} style={{ width: '100%', borderRadius: 6 }} onChange={v => updateTier(p.id, tIdx, 'method', v)}>
                                                            <Option value="Digital">Digital</Option><Option value="Offset">Offset</Option>
                                                        </Select>
                                                    </Col>
                                                    <Col span={3}><Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => removeTier(p.id, tIdx)} /></Col>
                                                </Row>
                                            ))}
                                            <Button size="small" type="dashed" icon={<PlusOutlined />} onClick={() => addTier(p.id)} style={{ marginTop: 4, borderRadius: 6 }}>Tambah Tier</Button>
                                        </div>
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
                                        <div style={{ padding: '32px', background: 'linear-gradient(135deg, #ff9f43, #f0932b)', color: '#fff' }}>
                                            <Text style={{ fontSize: 11, fontWeight: 700, opacity: 0.8, letterSpacing: '1px' }}>TOTAL HARGA PESANAN</Text>
                                            <div style={{ fontSize: 36, fontWeight: 800, marginTop: 4 }}>{fmt(result.total_price)}</div>
                                            <div style={{ marginTop: 8, fontSize: 13, background: 'rgba(255,255,255,0.15)', display: 'inline-block', padding: '4px 12px', borderRadius: 8 }}>
                                                {fmt(result.unit_price)} <span style={{ opacity: 0.7 }}>/ pcs</span>
                                            </div>
                                        </div>
                                        <div style={{ padding: '32px' }}>
                                              <Row gutter={[16, 24]} style={{ marginBottom: 24 }}>
                                                {[
                                                    { label: 'Estimasi Berat', value: `${result.weight_kg} kg`, icon: <InfoCircleOutlined /> },
                                                    { label: 'Metode Cetak', value: result.print_method, icon: <CalculatorOutlined /> },
                                                ].map((item, i) => (
                                                    <Col span={12} key={i}>
                                                        <Text style={{ fontSize: 10, color: '#aaa', display: 'block', fontWeight: 700, marginBottom: 2 }}>{item.label.toUpperCase()}</Text>
                                                        <Text strong style={{ fontSize: 14, color: '#333' }}>{item.value || '-'}</Text>
                                                    </Col>
                                                ))}
                                             </Row>

                                             {(result as any).pricing != null && (
                                                <div style={{ borderTop: '1px dashed #eee', paddingTop: 20, marginBottom: 20 }}>
                                                    <Text strong style={{ fontSize: 11, color: '#aaa', display: 'block', marginBottom: 12 }}>RINCIAN BIAYA SATUAN</Text>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><Text style={{ fontSize: 12, color: '#64748b' }}>Cetak Dasar</Text><Text strong style={{ fontSize: 12 }}>{fmt((result as any).pricing.base_price_per_unit)}</Text></div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><Text style={{ fontSize: 12, color: '#64748b' }}>Finishing / Lipat</Text><Text strong style={{ fontSize: 12 }}>{fmt((result as any).pricing.finishing_cost_per_unit)}</Text></div>
                                                    </div>
                                                </div>
                                             )}
                                             
                                             <div style={{ marginTop: 32, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                {(result.discount_percent ?? 0) > 0 && <Tag color="green" style={{ borderRadius: 8, padding: '4px 12px', fontWeight: 700 }}>PROMO DISKON {result.discount_percent}%</Tag>}
                                                {result.estimated_days && <Tag color="orange" style={{ borderRadius: 8, padding: '4px 12px', fontWeight: 700 }}>± {result.estimated_days} HARI KERJA</Tag>}
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
                                            <Text style={{ fontSize: 12, color: '#64748b', lineHeight: 1.8 }}>
                                                Pilih jenis kertas, sisi cetak, laminasi, dan jumlah produksi. Lalu tekan <b>"HITUNG HARGA SEKARANG"</b> untuk melihat estimasi harga beserta diskon volume.
                                            </Text>
                                            <div style={{ marginTop: 20, padding: '12px 16px', background: '#f0fdf4', borderRadius: 12, border: '1px solid #dcfce7' }}>
                                                <Text style={{ fontSize: 11, color: '#166534' }}>💡 Semakin banyak jumlah pesanan, semakin besar diskon yang didapatkan!</Text>
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

export default BrosurCalculatorPage;
