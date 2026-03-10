import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Row, Col, Card, Tag } from 'antd';
import {
    PrinterOutlined, BookOutlined, ScissorOutlined,
    IdcardOutlined, FileTextOutlined,
    ColumnWidthOutlined, DashboardOutlined,
    ArrowRightOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import PageHeader from '../../components/PageHeader';

const { Title, Text } = Typography;

interface CalcItem {
    key: string;
    title: string;
    desc: string;
    icon: React.ReactNode;
    path: string;
    badge?: string;
    meta: string;
    color: string;
    gradient: string;
}

const PRICE_ITEMS: CalcItem[] = [
    {
        key: 'spanduk', title: 'Banner & Spanduk', meta: 'Harga per m²',
        desc: 'Vinyl, Backdrop, Roll-Up, X-Banner presisi.',
        icon: <PrinterOutlined />, path: '/kalkulator/spanduk', 
        color: '#0fb9b1', gradient: 'linear-gradient(135deg, #0fb9b1 0%, #20bf6b 100%)'
    },
    {
        key: 'brosur', title: 'Flyer & Brosur', meta: 'Volume Pricing',
        desc: 'A3, A4, A5 — diskon volume & finishing.',
        icon: <FileTextOutlined />, path: '/kalkulator/brosur', 
        color: '#ff9f43', gradient: 'linear-gradient(135deg, #ff9f43 0%, #ffbe76 100%)'
    },
    {
        key: 'buku', title: 'Cetak Buku', meta: 'Per Eksemplar',
        desc: 'Softcover, Hardcover, Majalah & Booklet.',
        icon: <BookOutlined />, path: '/kalkulator/buku', 
        color: '#4361ee', gradient: 'linear-gradient(135deg, #4361ee 0%, #4cc9f0 100%)'
    },
    {
        key: 'kartu-nama', title: 'Kartu Nama', meta: 'Per Box',
        desc: 'Artcarton 260gsm — Hotprint & Rounded.',
        icon: <IdcardOutlined />, path: '/kalkulator/kartu-nama', 
        color: '#ff4d4f', gradient: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)'
    },
    {
        key: 'stiker', title: 'Stiker & Label', meta: 'Auto Layout',
        desc: 'Chromo, Vinyl — Die Cut & Kiss Cut.',
        icon: <ScissorOutlined />, path: '/kalkulator/stiker', 
        color: '#9c27b0', gradient: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)'
    },
];

const TOOL_ITEMS: CalcItem[] = [
    {
        key: 'berat-lembaran', title: 'Berat Lembaran', meta: 'Utilitas',
        desc: 'Estimasi berat cetakan untuk ongkir.',
        icon: <DashboardOutlined />, path: '/kalkulator/berat', 
        color: '#64748b', gradient: 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)', badge: 'TOOL',
    },
    {
        key: 'spine-buku', title: 'Spine Punggung', meta: 'Utilitas',
        desc: 'Lebar punggung buku untuk desain cover.',
        icon: <ColumnWidthOutlined />, path: '/kalkulator/spine', 
        color: '#334155', gradient: 'linear-gradient(135deg, #334155 0%, #475569 100%)', badge: 'TOOL',
    },
];

const CalcCard: React.FC<{ item: CalcItem; index: number; onNavigate: (path: string) => void }> = ({ item, index, onNavigate }) => (
    <motion.div
        whileHover={{ y: -8, transition: { duration: 0.3, ease: 'easeOut' } }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.5 }}
        style={{ height: '100%' }}
    >
        <Card
            className="premium-card clickable-card"
            style={{ 
                borderRadius: 28, 
                cursor: 'pointer', 
                height: '100%', 
                border: 'none',
                overflow: 'hidden',
                background: '#fff'
            }}
            bodyStyle={{ padding: '32px' }}
            onClick={() => onNavigate(item.path)}
        >
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                        <div style={{ 
                            width: 60, height: 60, borderRadius: 20, 
                            background: item.gradient, color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 28,
                            boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                        }}>
                            {item.icon}
                        </div>
                        {item.badge && (
                            <Tag bordered={false} style={{ background: '#f1f5f9', color: '#64748b', fontSize: 10, fontWeight: 800, borderRadius: 8, padding: '4px 10px' }}>
                                {item.badge}
                            </Tag>
                        )}
                    </div>
                    
                    <Title level={4} style={{ margin: '0 0 8px 0', fontWeight: 800, color: '#1e293b' }}>{item.title}</Title>
                    <Text style={{ fontSize: 13, color: '#64748b', fontWeight: 500, display: 'block', marginBottom: 32, lineHeight: 1.6 }}>
                        {item.desc}
                    </Text>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Text style={{ fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Kategori
                        </Text>
                        <Text strong style={{ fontSize: 13, color: '#334155' }}>
                            {item.meta}
                        </Text>
                    </div>
                    <div style={{ 
                        width: 40, height: 40, borderRadius: 12, border: '1px solid #f1f5f9',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: item.color, transition: 'all 0.3s'
                    }} className="arrow-btn">
                        <ArrowRightOutlined style={{ fontSize: 16 }} />
                    </div>
                </div>
            </div>
        </Card>
    </motion.div>
);

const CalculatorIndexPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={{ fontFamily: "'Poppins', sans-serif" }}>
            <PageHeader
                title="Pusat Kalkulator Cetak"
                description="Optimasi estimasi biaya produksi dengan akurasi tinggi untuk berbagai produk percetakan."
                breadcrumb={[{ label: 'KALKULATOR' }, { label: 'INDEX' }]}
            />

            <div style={{ marginBottom: 56 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                    <Text style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', letterSpacing: '2px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>HARGA PRODUKSI & ESTIMASI</Text>
                    <div style={{ height: 1, background: '#f1f5f9', flex: 1 }} />
                </div>
                
                <Row gutter={[32, 32]}>
                    {PRICE_ITEMS.map((item, i) => (
                        <Col xs={24} sm={12} lg={8} key={item.key}>
                            <CalcCard item={item} index={i} onNavigate={navigate} />
                        </Col>
                    ))}
                </Row>
            </div>

            <div style={{ marginBottom: 64 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                    <Text style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', letterSpacing: '2px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>ALAT BANTU (TOOLS)</Text>
                    <div style={{ height: 1, background: '#f1f5f9', flex: 1 }} />
                </div>

                <Row gutter={[32, 32]}>
                    {TOOL_ITEMS.map((item, i) => (
                        <Col xs={24} sm={12} lg={8} key={item.key}>
                            <CalcCard item={item} index={i + 5} onNavigate={navigate} />
                        </Col>
                    ))}
                </Row>
            </div>
        </motion.div>
    );
};

export default CalculatorIndexPage;
