import React, { useState } from 'react';
import { Card, DatePicker, Table, Spin, Tag, Typography, Space } from 'antd';
import { WarningOutlined, BankOutlined, SafetyCertificateOutlined, FallOutlined, RiseOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import dayjs from 'dayjs';
import PageHeader from '../../components/PageHeader';
import { motion } from 'framer-motion';
import { fmtRp } from '../../utils/formatters';

const { Text } = Typography;

const BalanceSheetPage: React.FC = () => {
    const [asOfDate, setAsOfDate] = useState(dayjs());

    const { data, isLoading } = useQuery({
        queryKey: ['balance-sheet', asOfDate.format('YYYY-MM-DD')],
        queryFn: async () => {
            const res = await api.get('/finance/reports/balance-sheet', { params: { asOfDate: asOfDate.format('YYYY-MM-DD') } });
            return res.data?.data || res.data;
        },
    });

    const categories = [
        { title: 'Aset', key: 'assets', color: '#3b82f6', icon: <RiseOutlined /> },
        { title: 'Liabilitas (Kewajiban)', key: 'liabilities', color: '#ef4444', icon: <FallOutlined /> },
        { title: 'Ekuitas (Modal)', key: 'equity', color: '#10b981', icon: <BankOutlined /> },
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            style={{ fontFamily: "'Poppins', sans-serif" }}
        >
            <PageHeader
                title="Laporan Neraca"
                description="Gambaran posisi keuangan perusahaan pada tanggal tertentu."
                breadcrumb={[{ label: 'LAPORAN' }, { label: 'NERACA' }]}
                extra={
                    <Space size={12}>
                        <DatePicker 
                            value={asOfDate} 
                            onChange={(d) => d && setAsOfDate(d)} 
                            format="DD/MM/YYYY" 
                            style={{ borderRadius: 12, height: 40 }}
                        />
                        <Card className="premium-card" style={{ borderRadius: 10, padding: '2px 16px', background: '#f8fafc', border: '1px solid #e2e8f0' }} bodyStyle={{ padding: 4 }}>
                            <Space size={4}>
                                <SafetyCertificateOutlined style={{ color: '#10b981' }} />
                                <Text strong style={{ fontSize: 11, color: '#64748b' }}>SISTEM BALANCE</Text>
                            </Space>
                        </Card>
                    </Space>
                }
            />

            {isLoading ? (
                <div style={{ padding: 100, textAlign: 'center' }}><Spin size="large" tip="Menghitung Saldo Neraca..." /></div>
            ) : data && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                   {categories.map(cat => (
                        <Card 
                            key={cat.key}
                            className="premium-card" 
                            style={{ borderRadius: 24 }} 
                            bodyStyle={{ padding: 0 }}
                        >
                            <div style={{ padding: '24px 32px', borderBottom: '1px solid #f8f8f8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${cat.color}15`, color: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                                        {cat.icon}
                                    </div>
                                    <div>
                                        <Text strong style={{ fontSize: 16, color: '#333' }}>{cat.title}</Text>
                                        <Text type="secondary" style={{ fontSize: 11, display: 'block', textTransform: 'uppercase' }}>TOTAL SALDO AKUN {cat.title}</Text>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <Text type="secondary" style={{ fontSize: 10, fontWeight: 700 }}>SUBTOTAL</Text>
                                    <div style={{ fontSize: 24, fontWeight: 800, color: '#333' }}>{fmtRp(data[cat.key]?.total || 0)}</div>
                                </div>
                            </div>
                            <Table 
                                dataSource={data[cat.key]?.items || []} 
                                pagination={false} 
                                rowKey="accountId"
                                size="middle"
                                columns={[
                                    { title: 'KODE', dataIndex: 'accountCode', key: 'code', render: (v) => <Tag bordered={false} style={{ fontSize: 10, fontWeight: 700 }}>{v}</Tag> },
                                    { title: 'NAMA AKUN', dataIndex: 'accountName', key: 'name', render: (v) => <Text style={{ fontSize: 13, color: '#475569' }}>{v}</Text> },
                                    { title: 'SALDO', dataIndex: 'balance', key: 'bal', align: 'right' as const, render: (v) => <Text strong style={{ fontSize: 13, color: '#333' }}>{fmtRp(v)}</Text> }
                                ]}
                            />
                        </Card>
                   ))}

                    <div style={{ display: 'flex', gap: 24 }}>
                        <Card className="premium-card" style={{ flex: 1, borderRadius: 24, background: '#f8fafc' }} bodyStyle={{ padding: '32px' }}>
                            <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>TOTAL ASET</Text>
                            <div style={{ fontSize: 32, fontWeight: 800, color: '#3b82f6' }}>{fmtRp(data.assets?.total || 0)}</div>
                        </Card>
                        <Card className="premium-card" style={{ flex: 1, borderRadius: 24, background: '#fcfcfc' }} bodyStyle={{ padding: '32px' }}>
                            <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>TOTAL KEWAJIBAN + MODAL</Text>
                            <div style={{ fontSize: 32, fontWeight: 800, color: '#10b981' }}>{fmtRp(Number(data.liabilities?.total || 0) + Number(data.equity?.total || 0))}</div>
                        </Card>
                    </div>

                    {Math.abs(Number(data.assets?.total || 0) - (Number(data.liabilities?.total || 0) + Number(data.equity?.total || 0))) > 0.01 && (
                        <Card style={{ borderRadius: 16, background: '#fef2f2', border: '1px solid #fee2e2' }}>
                            <Space>
                                <WarningOutlined style={{ color: '#ef4444' }} />
                                <Text style={{ color: '#991b1b', fontSize: 13 }}>Perhatian: Neraca tidak seimbang. Mohon periksa kembali transaksi akun ekuitas dan liabilitas Anda.</Text>
                            </Space>
                        </Card>
                    )}
                </div>
            )}
        </motion.div>
    );
};

export default BalanceSheetPage;
