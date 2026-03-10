import React, { useMemo } from 'react';
import { Typography, Row, Col, Form, InputNumber, Select, Tag, Button, Collapse, Input, message, Popconfirm, Space } from 'antd';
import { ArrowLeftOutlined, SettingOutlined, PlusOutlined, DeleteOutlined, UndoOutlined, InfoCircleOutlined, BookOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCalcSettings } from './useCalcSettings';
import PageHeader from '../../components/PageHeader';

const { Text } = Typography;
const { Option } = Select;

interface PaperThickness { gsm: number; factor: number; label: string }
interface BindingOption { value: string; label: string; glue: number }
interface SpineSettings { papers: PaperThickness[]; coverPapers: PaperThickness[]; bindings: BindingOption[] }

const DEFAULT_SETTINGS: SpineSettings = {
    papers: [
        { gsm: 70, factor: 0.05, label: 'HVS 70gsm' }, { gsm: 80, factor: 0.10, label: 'HVS 80gsm' },
        { gsm: 100, factor: 0.08, label: 'Artpaper 100gsm' }, { gsm: 120, factor: 0.10, label: 'Artpaper 120gsm' },
        { gsm: 150, factor: 0.12, label: 'Artpaper 150gsm' },
    ],
    coverPapers: [
        { gsm: 210, factor: 0.18, label: 'Artcarton 210gsm' }, { gsm: 230, factor: 0.20, label: 'Artcarton 230gsm' },
        { gsm: 260, factor: 0.25, label: 'Artcarton 260gsm' }, { gsm: 310, factor: 0.28, label: 'Ivory 310gsm' },
        { gsm: 350, factor: 0.30, label: 'Board 350gsm' },
    ],
    bindings: [
        { value: 'perfect', label: 'Perfect Binding (Lem Panas)', glue: 1.0 },
        { value: 'saddle_stitch', label: 'Saddle Stitch (Staples)', glue: 0 },
        { value: 'wire_o', label: 'Wire-O (Spiral)', glue: 0 },
    ],
};

const SpineCalculatorPage: React.FC = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [settings, setSettings, resetSettings] = useCalcSettings<SpineSettings>('spine', DEFAULT_SETTINGS);

    const pages = Form.useWatch('pages', form) || 100;
    const gsmVal = Form.useWatch('gsm', form) || settings.papers[0]?.gsm || 70;
    const coverGsmVal = Form.useWatch('cover_gsm', form) || settings.coverPapers[2]?.gsm || 260;
    const binding = Form.useWatch('binding', form) || 'perfect';

    const paperMap = useMemo(() => {
        const m: Record<number, PaperThickness> = {};
        [...settings.papers, ...settings.coverPapers].forEach(p => { m[p.gsm] = p; });
        return m;
    }, [settings.papers, settings.coverPapers]);

    const result = useMemo(() => {
        const leaves = pages / 2;
        const innerThick = paperMap[gsmVal]?.factor || 0.05;
        const coverThick = paperMap[coverGsmVal]?.factor || 0.25;
        const innerSpine = leaves * innerThick;
        const coverSpine = 2 * coverThick;
        const bindInfo = settings.bindings.find(b => b.value === binding);
        const glue = bindInfo?.glue || 0;
        const total = innerSpine + coverSpine + glue;
        return { innerSpine: Math.round(innerSpine * 10) / 10, coverSpine: Math.round(coverSpine * 10) / 10, glue, total: Math.round(total * 10) / 10 };
    }, [pages, gsmVal, coverGsmVal, binding, paperMap, settings.bindings]);

    const updatePaper = (list: 'papers' | 'coverPapers', idx: number, field: string, value: any) => {
        const updated = { ...settings }; (updated[list][idx] as any)[field] = value; setSettings(updated);
    };
    const addPaper = (list: 'papers' | 'coverPapers') => {
        const updated = { ...settings }; updated[list] = [...updated[list], { gsm: 100, factor: 0.1, label: 'Baru' }]; setSettings(updated);
    };
    const removePaper = (list: 'papers' | 'coverPapers', idx: number) => {
        if (settings[list].length <= 1) return;
        const updated = { ...settings }; updated[list] = updated[list].filter((_, i) => i !== idx); setSettings(updated);
    };
    const handleReset = () => { resetSettings(); message.success('Reset'); };

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={{ fontFamily: "'Poppins', sans-serif" }}>
            <PageHeader
                title="Spine / Punggung Buku"
                description="Hitung lebar spine dengan presisi berdasarkan jenis kertas dan metode jilid."
                breadcrumb={[{ label: 'KALKULATOR' }, { label: 'SPINE' }]}
                extra={<Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/kalkulator')}>Kembali</Button>}
            />

            <Row gutter={[32, 32]}>
                <Col xs={24} lg={15}>
                    <div className="premium-card" style={{ borderRadius: 28, background: '#fff', padding: '32px', marginBottom: 24, border: 'none' }}>
                        <Form form={form} layout="vertical" initialValues={{ pages: 100, gsm: settings.papers[0]?.gsm || 70, cover_gsm: settings.coverPapers[2]?.gsm || 260, binding: 'perfect' }} requiredMark={false}>
                            <div style={{ marginBottom: 24 }}>
                                <Text strong style={{ fontSize: 11, color: '#aaa', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>SPESIFIKASI BUKU</Text>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item name="pages" label={<Text strong style={{ fontSize: 13 }}>Jumlah Halaman</Text>}>
                                            <InputNumber min={8} max={1000} step={2} style={{ width: '100%', borderRadius: 12 }} size="large" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name="binding" label={<Text strong style={{ fontSize: 13 }}>Jenis Jilid</Text>}>
                                            <Select size="large" style={{ borderRadius: 12 }}>{settings.bindings.map(b => <Option key={b.value} value={b.value}>{b.label}</Option>)}</Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </div>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="gsm" label={<Text strong style={{ fontSize: 13 }}>Kertas Isi</Text>}>
                                        <Select size="large" style={{ borderRadius: 12 }}>{settings.papers.map(p => <Option key={p.gsm} value={p.gsm}>{p.label}</Option>)}</Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="cover_gsm" label={<Text strong style={{ fontSize: 13 }}>Kertas Cover</Text>}>
                                        <Select size="large" style={{ borderRadius: 12 }}>{settings.coverPapers.map(p => <Option key={p.gsm} value={p.gsm}>{p.label}</Option>)}</Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <div style={{ background: '#f8fafc', borderRadius: 20, padding: '24px', border: '1px solid #f1f5f9', marginTop: 12 }}>
                                <Row gutter={16}>
                                    <Col span={8}>
                                        <Text style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: 4 }}>ISI ({pages/2} LBR)</Text>
                                        <div style={{ fontSize: 16, fontWeight: 700, color: '#334155' }}>{result.innerSpine} <span style={{ fontSize: 12, fontWeight: 400 }}>mm</span></div>
                                    </Col>
                                    <Col span={8}>
                                        <Text style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: 4 }}>COVER (2 SISI)</Text>
                                        <div style={{ fontSize: 16, fontWeight: 700, color: '#334155' }}>{result.coverSpine} <span style={{ fontSize: 12, fontWeight: 400 }}>mm</span></div>
                                    </Col>
                                    <Col span={8}>
                                        <Text style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: 4 }}>LEM JILID</Text>
                                        <div style={{ fontSize: 16, fontWeight: 700, color: '#334155' }}>{result.glue} <span style={{ fontSize: 12, fontWeight: 400 }}>mm</span></div>
                                    </Col>
                                </Row>
                            </div>
                        </Form>
                    </div>

                    <Collapse ghost items={[{
                        key: 'settings',
                        label: <Space style={{ cursor: 'pointer', color: '#aaa', fontWeight: 600, fontSize: 12 }}><SettingOutlined /> Konfigurasi Ketebalan Kertas (Faktor mm)</Space>,
                        children: (
                            <div className="premium-card" style={{ borderRadius: 20, background: '#fff', border: 'none', padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' }}>
                                    <Text style={{ fontSize: 12, color: '#aaa' }}>Atur faktor ketebalan per lembar kertas untuk hasil lebih presisi.</Text>
                                    <Popconfirm title="Reset?" onConfirm={handleReset}><Button size="small" danger type="text" icon={<UndoOutlined />}>Reset</Button></Popconfirm>
                                </div>
                                <div style={{ marginBottom: 24 }}>
                                    <Text strong style={{ fontSize: 11, display: 'block', marginBottom: 12, color: '#64748b' }}>DAFTAR KERTAS ISI</Text>
                                    {settings.papers.map((p, idx) => (
                                        <div key={idx} style={{ padding: '8px 0', borderTop: '1px solid #f8f8f8' }}>
                                            <Row gutter={8} align="middle">
                                                <Col span={10}><Input size="middle" value={p.label} style={{ borderRadius: 8 }} onChange={e => updatePaper('papers', idx, 'label', e.target.value)} /></Col>
                                                <Col span={6}><InputNumber size="middle" value={p.gsm} min={30} style={{ width: '100%', borderRadius: 8 }} onChange={v => updatePaper('papers', idx, 'gsm', v || 70)} addonAfter="gsm" /></Col>
                                                <Col span={6}><InputNumber size="middle" value={p.factor} min={0.01} step={0.01} style={{ width: '100%', borderRadius: 8 }} onChange={v => updatePaper('papers', idx, 'factor', v || 0.05)} addonAfter="mm" /></Col>
                                                <Col span={2} style={{ textAlign: 'right' }}><Button type="text" danger icon={<DeleteOutlined />} onClick={() => removePaper('papers', idx)} /></Col>
                                            </Row>
                                        </div>
                                    ))}
                                    <Button size="middle" type="dashed" icon={<PlusOutlined />} onClick={() => addPaper('papers')} block style={{ marginTop: 12, borderRadius: 10 }}>Tambah Kertas</Button>
                                </div>
                                
                                <div>
                                    <Text strong style={{ fontSize: 11, display: 'block', marginBottom: 12, color: '#64748b' }}>DAFTAR KERTAS COVER</Text>
                                    {settings.coverPapers.map((p, idx) => (
                                        <div key={idx} style={{ padding: '8px 0', borderTop: '1px solid #f8f8f8' }}>
                                            <Row gutter={8} align="middle">
                                                <Col span={10}><Input size="middle" value={p.label} style={{ borderRadius: 8 }} onChange={e => updatePaper('coverPapers', idx, 'label', e.target.value)} /></Col>
                                                <Col span={6}><InputNumber size="middle" value={p.gsm} min={30} style={{ width: '100%', borderRadius: 8 }} onChange={v => updatePaper('coverPapers', idx, 'gsm', v || 70)} addonAfter="gsm" /></Col>
                                                <Col span={6}><InputNumber size="middle" value={p.factor} min={0.01} step={0.01} style={{ width: '100%', borderRadius: 8 }} onChange={v => updatePaper('coverPapers', idx, 'factor', v || 0.05)} addonAfter="mm" /></Col>
                                                <Col span={2} style={{ textAlign: 'right' }}><Button type="text" danger icon={<DeleteOutlined />} onClick={() => removePaper('coverPapers', idx)} /></Col>
                                            </Row>
                                        </div>
                                    ))}
                                    <Button size="middle" type="dashed" icon={<PlusOutlined />} onClick={() => addPaper('coverPapers')} block style={{ marginTop: 12, borderRadius: 10 }}>Tambah Cover</Button>
                                </div>
                            </div>
                        )
                    }]} />
                </Col>

                <Col xs={24} lg={9}>
                    <div style={{ position: 'sticky', top: 100 }}>
                        <div className="premium-card" style={{ borderRadius: 28, background: '#fff', overflow: 'hidden', border: 'none' }}>
                            <div style={{ padding: '32px', background: 'linear-gradient(135deg, #4361ee, #4cc9f0)', color: '#fff', textAlign: 'center' }}>
                                <Text style={{ fontSize: 11, fontWeight: 700, opacity: 0.8, letterSpacing: '1px' }}>LEBAR SPINE ESTIMASI</Text>
                                <div style={{ fontSize: 44, fontWeight: 800, marginTop: 4 }}>{result.total} <span style={{ fontSize: 20 }}>mm</span></div>
                            </div>
                            <div style={{ padding: '32px', textAlign: 'center' }}>
                                <Text strong style={{ fontSize: 13, color: '#334155', display: 'block', marginBottom: 24 }}>Pratinjau Visual Punggung</Text>
                                <div style={{ display: 'inline-flex', alignItems: 'stretch', border: `3px solid #f1f5f9`, borderRadius: 12, overflow: 'hidden', height: 160, boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
                                    <div style={{ width: 60, background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ color: '#94a3b8', fontSize: 10, writingMode: 'vertical-lr', transform: 'rotate(180deg)', fontWeight: 700 }}>COVER DEPAN</Text>
                                    </div>
                                    <div style={{ width: Math.max(result.total * 4, 30), background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'width 0.4s ease-in-out' }}>
                                        <Text style={{ color: '#fff', fontSize: 14, fontWeight: 800, writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}>{result.total} mm</Text>
                                    </div>
                                    <div style={{ width: 60, background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ color: '#94a3b8', fontSize: 10, writingMode: 'vertical-lr', transform: 'rotate(180deg)', fontWeight: 700 }}>COVER BELAKANG</Text>
                                    </div>
                                </div>
                                <div style={{ marginTop: 32, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                                    <Tag bordered={false} icon={<BookOutlined />} style={{ background: '#f8fafc', padding: '4px 12px', borderRadius: 8, fontWeight: 600 }}>{pages} HAL</Tag>
                                    <Tag bordered={false} icon={<InfoCircleOutlined />} style={{ background: '#f8fafc', padding: '4px 12px', borderRadius: 8, fontWeight: 600 }}>{binding === 'perfect' ? 'LEM PANAS' : binding.toUpperCase()}</Tag>
                                </div>
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>
        </motion.div>
    );
};

export default SpineCalculatorPage;
