import React, { useState, useEffect } from 'react';
import { Card, Typography, Space, DatePicker, Row, Col, Table, message, Button } from 'antd';
import { ExportOutlined, FileExcelOutlined, LoadingOutlined, RiseOutlined, FallOutlined, WalletOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import api from '../../api';
import PageHeader from '../../components/PageHeader';
import { motion } from 'framer-motion';
import { fmtRp } from '../../utils/formatters';

interface ProfitLossData {
    totalRevenue: number;
    totalExpense: number;
    netProfit: number;
}

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const ProfitLossPage: React.FC = () => {
    const [data, setData] = useState<ProfitLossData | null>(null);
    const [dates, setDates] = useState<[Dayjs, Dayjs]>([dayjs().startOf('month'), dayjs()]);
    const [exportingExcel, setExportingExcel] = useState(false);
    const [exportingPdf, setExportingPdf] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const response = await api.get('/finance/reports/profit-loss', {
                params: {
                    start_date: dates[0].format('YYYY-MM-DD'),
                    end_date: dates[1].format('YYYY-MM-DD'),
                }
            });
            setData(response.data);
        } catch {
            message.error('Gagal mengambil laporan Laba Rugi');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (type: 'excel' | 'pdf') => {
        const setLoadingState = type === 'excel' ? setExportingExcel : setExportingPdf;
        setLoadingState(true);
        try {
            const response = await api.get(`/finance/reports/profit-loss/${type}`, {
                params: {
                    start_date: dates[0].format('YYYY-MM-DD'),
                    end_date: dates[1].format('YYYY-MM-DD'),
                },
                responseType: 'blob',
            });
            const ext = type === 'excel' ? 'xlsx' : 'pdf';
            const mimeType = type === 'excel'
                ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                : 'application/pdf';
            const blob = new Blob([response.data], { type: mimeType });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `laba-rugi-${dates[0].format('YYYY-MM-DD')}_${dates[1].format('YYYY-MM-DD')}.${ext}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            message.success(`Berhasil mengunduh laporan ${type.toUpperCase()}`);
        } catch {
            message.error(`Gagal mengunduh laporan ${type.toUpperCase()}`);
        } finally {
            setLoadingState(false);
        }
    };

    useEffect(() => {
        fetchReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dates]);

    const reportItems = [
        { key: '1', title: 'Pendapatan Penjualan', amount: data?.totalRevenue || 0, type: 'revenue', icon: <RiseOutlined style={{ color: '#10b981' }} /> },
        { key: '2', title: 'Beban Operasional', amount: data?.totalExpense || 0, type: 'expense', icon: <FallOutlined style={{ color: '#ef4444' }} /> },
    ];

    const stats = [
        { 
            title: 'TOTAL PENDAPATAN', 
            value: data?.totalRevenue || 0, 
            icon: <RiseOutlined />, 
            color: '#10b981', 
            bg: 'rgba(16, 185, 129, 0.1)' 
        },
        { 
            title: 'TOTAL BEBAN', 
            value: data?.totalExpense || 0, 
            icon: <FallOutlined />, 
            color: '#ef4444', 
            bg: 'rgba(239, 68, 68, 0.1)' 
        },
        { 
            title: 'LABA BERSIH', 
            value: data?.netProfit || 0, 
            icon: <WalletOutlined />, 
            color: '#3b82f6', 
            bg: 'rgba(59, 130, 246, 0.1)' 
        },
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            style={{ fontFamily: "'Poppins', sans-serif" }}
        >
            <PageHeader
                title="Laporan Laba Rugi"
                description="Analisis performa keuangan Rizquna berdasarkan pendapatan dan beban."
                breadcrumb={[{ label: 'LAPORAN' }, { label: 'LABA RUGI' }]}
                extra={
                    <Space size={12}>
                        <RangePicker
                            value={dates}
                            onChange={(val) => val && setDates(val as [Dayjs, Dayjs])}
                            style={{ borderRadius: 12, height: 40 }}
                        />
                        <Button
                            icon={exportingExcel ? <LoadingOutlined /> : <FileExcelOutlined />}
                            onClick={() => handleExport('excel')}
                            loading={exportingExcel}
                            style={{ borderRadius: 10, height: 40, fontWeight: 600, color: '#10b981', borderColor: '#10b981' }}
                        >
                            Excel
                        </Button>
                        <Button
                            type="primary"
                            icon={exportingPdf ? <LoadingOutlined /> : <ExportOutlined />}
                            onClick={() => handleExport('pdf')}
                            loading={exportingPdf}
                            style={{ borderRadius: 12, height: 40, fontWeight: 700 }}
                        >
                            PDF
                        </Button>
                    </Space>
                }
            />

            <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
                {stats.map((stat, i) => (
                    <Col xs={24} sm={8} key={i}>
                        <Card className="premium-card" style={{ borderRadius: 20 }} bodyStyle={{ padding: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ 
                                    width: 48, height: 48, borderRadius: 14, 
                                    background: stat.bg, color: stat.color, 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 20
                                }}>
                                    {stat.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 10, fontWeight: 700, color: '#aaa', letterSpacing: '0.8px', display: 'block', textTransform: 'uppercase' }}>
                                        {stat.title}
                                    </Text>
                                    <Title level={4} style={{ margin: 0, fontWeight: 800, color: '#333', marginTop: 2 }}>
                                        {fmtRp(stat.value)}
                                    </Title>
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Card className="premium-card" style={{ borderRadius: 24 }} bodyStyle={{ padding: 0 }} title={
                <div style={{ padding: '16px 24px' }}>
                    <Text strong style={{ fontSize: 16, color: '#333' }}>Rincian Laba Rugi</Text>
                    <div style={{ fontSize: 12, color: '#aaa', fontWeight: 500 }}>Periode: {dates[0].format('DD MMM')} - {dates[1].format('DD MMM YYYY')}</div>
                </div>
            }>
                <Table
                    pagination={false}
                    loading={loading}
                    columns={[
                        { 
                            title: 'KETERANGAN', 
                            dataIndex: 'title', 
                            key: 'title',
                            render: (text, record) => (
                                <Space size={12}>
                                    {record.icon}
                                    <Text strong style={{ color: '#475569' }}>{text}</Text>
                                </Space>
                            )
                        },
                        {
                            title: 'TOTAL NOMINAL',
                            dataIndex: 'amount',
                            key: 'amount',
                            align: 'right' as const,
                            render: (val) => <Text strong style={{ fontSize: 14 }}>{fmtRp(val)}</Text>
                        }
                    ]}
                    dataSource={reportItems}
                    summary={() => (
                        <Table.Summary fixed>
                            <Table.Summary.Row style={{ background: '#f8fafc' }}>
                                <Table.Summary.Cell index={0}>
                                    <Text strong style={{ fontSize: 15, paddingLeft: 38 }}>LABA BERSIH</Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={1} align="right">
                                    <Text strong style={{ 
                                        fontSize: 18, 
                                        color: (data?.netProfit || 0) >= 0 ? '#10b981' : '#ef4444' 
                                    }}>
                                        {fmtRp(data?.netProfit || 0)}
                                    </Text>
                                </Table.Summary.Cell>
                            </Table.Summary.Row>
                        </Table.Summary>
                    )}
                />
            </Card>
        </motion.div>
    );
};

export default ProfitLossPage;
