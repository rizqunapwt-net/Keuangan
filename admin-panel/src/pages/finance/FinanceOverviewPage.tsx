import React from 'react';
import { Row, Col, Card, Typography, Statistic } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
    AuditOutlined,
    DollarOutlined,
    ShoppingOutlined,
    FileSearchOutlined,
    BankOutlined,
    ContactsOutlined,
    PieChartOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';

const { Title, Text } = Typography;

const FinanceOverviewPage: React.FC = () => {
    const navigate = useNavigate();

    // Optionally fetch summary stats
    const { data: summary } = useQuery({
        queryKey: ['financeSummary'],
        queryFn: async () => {
            try {
                const res = await api.get('/finance/summary');
                return res.data?.data;
            } catch (e) {
                return null;
            }
        },
        // Don't fail if the endpoint doesn't exist yet
        retry: 0,
    });

    const modules = [
        { title: 'Invoices', desc: 'Kelola tagihan pelanggan', icon: <AuditOutlined />, path: '/finance/invoices', color: '#0ea5e9', bg: '#e0f2fe' },
        { title: 'Biaya', desc: 'Catat pengeluaran operasional', icon: <DollarOutlined />, path: '/finance/expenses', color: '#ef4444', bg: '#fee2e2' },
        { title: 'Pembelian', desc: 'Faktur pembelian barang', icon: <ShoppingOutlined />, path: '/finance/purchases', color: '#10b981', bg: '#d1fae5' },
        { title: 'Jurnal Umum', desc: 'Pencatatan akuntansi manual', icon: <FileSearchOutlined />, path: '/finance/journals', color: '#8b5cf6', bg: '#ede9fe' },
        { title: 'Chart of Accounts', desc: 'Master akun akuntansi', icon: <AuditOutlined />, path: '/finance/accounts', color: '#f59e0b', bg: '#fef3c7' },
        { title: 'Kas & Bank', desc: 'Rekening penerimaan/pengeluaran', icon: <BankOutlined />, path: '/finance/banks', color: '#3b82f6', bg: '#dbeafe' },
        { title: 'Kontak', desc: 'Data pelanggan & vendor', icon: <ContactsOutlined />, path: '/finance/contacts', color: '#6366f1', bg: '#e0e7ff' },
        { title: 'Laporan', desc: 'Laba/Rugi, Neraca & Arus Kas', icon: <PieChartOutlined />, path: '/finance/reports', color: '#ec4899', bg: '#fce7f3' },
    ];

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px' }}>
            <div style={{ marginBottom: 32, textAlign: 'center' }}>
                <Title level={2} style={{ margin: 0, color: '#0f172a', fontWeight: 800 }}>Pusat Keuangan</Title>
                <Text style={{ fontSize: 16, color: '#64748b' }}>Kelola seluruh aktivitas akuntansi dan finansial di satu tempat terpusat</Text>
            </div>

            {summary && (
                <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
                    <Col xs={24} md={8}>
                        <Card bordered={false} style={{ borderRadius: 20, background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff' }}>
                            <Statistic
                                title={<span style={{ color: '#d1fae5' }}>Total Penerimaan Bulan Ini</span>}
                                value={summary.monthlyIncome || 0}
                                precision={0}
                                prefix="Rp"
                                valueStyle={{ color: '#fff', fontWeight: 'bold' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} md={8}>
                        <Card bordered={false} style={{ borderRadius: 20, background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff' }}>
                            <Statistic
                                title={<span style={{ color: '#fee2e2' }}>Total Pengeluaran Bulan Ini</span>}
                                value={summary.monthlyExpense || 0}
                                precision={0}
                                prefix="Rp"
                                valueStyle={{ color: '#fff', fontWeight: 'bold' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} md={8}>
                        <Card bordered={false} style={{ borderRadius: 20, background: 'linear-gradient(135deg, #0ea5e9, #2563eb)', color: '#fff' }}>
                            <Statistic
                                title={<span style={{ color: '#e0f2fe' }}>Laba/Rugi Bersih</span>}
                                value={(summary.monthlyIncome || 0) - (summary.monthlyExpense || 0)}
                                precision={0}
                                prefix="Rp"
                                valueStyle={{ color: '#fff', fontWeight: 'bold' }}
                            />
                        </Card>
                    </Col>
                </Row>
            )}

            <Row gutter={[24, 24]}>
                {modules.map((mod, index) => (
                    <Col xs={24} sm={12} lg={6} key={index}>
                        <Card
                            hoverable
                            onClick={() => navigate(mod.path)}
                            style={{ borderRadius: 20, height: '100%', border: '1px solid #e2e8f0', transition: 'all 0.3s' }}
                            bodyStyle={{ padding: 24, display: 'flex', flexDirection: 'column', height: '100%' }}
                            className="finance-module-card"
                        >
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: 16,
                                    background: mod.bg, color: mod.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 24, marginRight: 16
                                }}>
                                    {mod.icon}
                                </div>
                                <Title level={4} style={{ margin: 0, fontSize: 18 }}>{mod.title}</Title>
                            </div>
                            <Text style={{ color: '#64748b', flex: 1 }}>{mod.desc}</Text>
                        </Card>
                    </Col>
                ))}
            </Row>

            <style>{`
                .finance-module-card:hover {
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
                    transform: translateY(-4px);
                    border-color: #cbd5e1 !important;
                }
            `}</style>
        </div>
    );
};

export default FinanceOverviewPage;
