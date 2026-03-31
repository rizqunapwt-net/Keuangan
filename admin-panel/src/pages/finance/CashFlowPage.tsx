import React, { useEffect, useState } from 'react';
import { Card, Typography, Space, DatePicker, Row, Col, message, Button, Spin } from 'antd';
import { ExportOutlined, FileExcelOutlined, RiseOutlined, FallOutlined, SwapOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import api from '../../api';
import PageHeader from '../../components/PageHeader';
import { motion } from 'framer-motion';
import { fmtRp } from '../../utils/formatters';

interface CashFlowData {
    netCashFlow: number;
    totalIn?: number;
    totalOut?: number;
}

const { Text } = Typography;
const { RangePicker } = DatePicker;

const CashFlowPage: React.FC = () => {
    const [data, setData] = useState<CashFlowData | null>(null);
    const [dates, setDates] = useState<[Dayjs, Dayjs]>([dayjs().startOf('month'), dayjs()]);
    const [loading, setLoading] = useState(false);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const response = await api.get('/finance/reports/cash-flow', {
                params: {
                    start_date: dates[0].format('YYYY-MM-DD'),
                    end_date: dates[1].format('YYYY-MM-DD'),
                }
            });
            setData(response.data?.data || response.data);
        } catch {
            message.error('Gagal mengambil laporan Arus Kas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dates]);

    const handleExport = (type: 'excel' | 'pdf') => {
        const params = new URLSearchParams({
            start_date: dates[0].format('YYYY-MM-DD'),
            end_date: dates[1].format('YYYY-MM-DD')
        });
        window.open(`${import.meta.env.VITE_API_URL}/finance/reports/cash-flow/${type}?${params.toString()}`, '_blank');
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            style={{ fontFamily: "'Poppins', sans-serif" }}
        >
            <PageHeader
                title="Laporan Arus Kas"
                description="Pantau pergerakan uang tunai masuk dan keluar dalam periode tertentu."
                breadcrumb={[{ label: 'LAPORAN' }, { label: 'ARUS KAS' }]}
                extra={
                    <Space size={12}>
                        <RangePicker
                            value={dates}
                            onChange={(val) => val && setDates(val as [Dayjs, Dayjs])}
                            style={{ borderRadius: 12, height: 40 }}
                        />
                        <Button
                            icon={<FileExcelOutlined />}
                            onClick={() => handleExport('excel')}
                            style={{ borderRadius: 10, height: 40, fontWeight: 600, color: '#10b981', borderColor: '#10b981' }}
                        >
                            Excel
                        </Button>
                        <Button
                            type="primary"
                            icon={<ExportOutlined />}
                            onClick={() => handleExport('pdf')}
                            style={{ borderRadius: 12, height: 40, fontWeight: 700 }}
                        >
                            PDF
                        </Button>
                    </Space>
                }
            />

            {loading ? (
                <div style={{ padding: 100, textAlign: 'center' }}><Spin size="large" tip="Menghitung Arus Kas..." /></div>
            ) : (
                <>
                    <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
                        <Col span={24}>
                            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                                <Card 
                                    className="premium-card" 
                                    style={{ 
                                        borderRadius: 24, 
                                        background: (data?.netCashFlow ?? 0) >= 0 
                                            ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' 
                                            : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                        color: '#fff',
                                        boxShadow: '0 8px 30px rgba(59, 130, 246, 0.15)'
                                    }} 
                                    bodyStyle={{ padding: '32px 40px' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                NET CASH FLOW (ARUS KAS BERSIH)
                                            </Text>
                                            <div style={{ fontSize: 42, fontWeight: 800, color: '#fff', margin: '4px 0', letterSpacing: '-1px' }}>
                                                {fmtRp(data?.netCashFlow || 0)}
                                            </div>
                                            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 500 }}>
                                                Periode: {dates[0].format('DD MMM')} — {dates[1].format('DD MMM YYYY')}
                                            </Text>
                                        </div>
                                        <div style={{ fontSize: 64, color: 'rgba(255,255,255,0.2)' }}>
                                            <SwapOutlined />
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        </Col>
                    </Row>

                    <Row gutter={[24, 24]}>
                        <Col xs={24} md={12}>
                            <Card className="premium-card" style={{ borderRadius: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                                        <RiseOutlined />
                                    </div>
                                    <div>
                                        <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>KAS MASUK</Text>
                                        <div style={{ fontSize: 22, fontWeight: 800, color: '#333' }}>{fmtRp(data?.totalIn || 0)}</div>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} md={12}>
                            <Card className="premium-card" style={{ borderRadius: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                                        <FallOutlined />
                                    </div>
                                    <div>
                                        <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>KAS KELUAR</Text>
                                        <div style={{ fontSize: 22, fontWeight: 800, color: '#333' }}>{fmtRp(data?.totalOut || 0)}</div>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </>
            )}
        </motion.div>
    );
};

export default CashFlowPage;
