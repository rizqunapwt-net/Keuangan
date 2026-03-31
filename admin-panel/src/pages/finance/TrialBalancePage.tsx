import React, { useState } from 'react';
import { Card, DatePicker, Table, Spin, Tag, Typography, Space } from 'antd';
import { WarningOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import dayjs from 'dayjs';
import { fmtRp } from '../../utils/formatters';
import PageHeader from '../../components/PageHeader';
import { motion } from 'framer-motion';

const { Text } = Typography;

const TrialBalancePage: React.FC = () => {
    const [asOfDate, setAsOfDate] = useState(dayjs());

    const { data, isLoading } = useQuery({
        queryKey: ['trial-balance', asOfDate.format('YYYY-MM-DD')],
        queryFn: async () => {
            const res = await api.get('/finance/reports/trial-balance', { params: { asOfDate: asOfDate.format('YYYY-MM-DD') } });
            return res.data?.data || res.data;
        },
    });

    const columns = [
        { 
            title: 'KODE AKUN', 
            dataIndex: 'accountCode', 
            key: 'code', 
            width: 120,
            render: (v: string) => <Tag bordered={false} style={{ fontSize: 10, fontWeight: 700, borderRadius: 4 }}>{v}</Tag>
        },
        { 
            title: 'NAMA AKUN', 
            dataIndex: 'accountName', 
            key: 'name', 
            render: (v: string) => <Text style={{ fontSize: 13, color: '#333' }}>{v}</Text>
        },
        { 
            title: 'KATEGORI', 
            dataIndex: 'categoryName', 
            key: 'cat', 
            width: 140,
            render: (v: string) => <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase' }}>{v || '-'}</Text>
        },
        { 
            title: 'DEBIT', 
            dataIndex: 'debit', 
            key: 'debit', 
            render: (v: number) => v > 0 ? <Text strong style={{ fontSize: 13, color: '#333' }}>{fmtRp(v)}</Text> : '-', 
            align: 'right' as const 
        },
        { 
            title: 'KREDIT', 
            dataIndex: 'credit', 
            key: 'credit', 
            render: (v: number) => v > 0 ? <Text strong style={{ fontSize: 13, color: '#333' }}>{fmtRp(v)}</Text> : '-', 
            align: 'right' as const 
        },
    ];

    const isBalanced = data ? Math.abs(Number(data.totalDebit) - Number(data.totalCredit)) < 0.01 : false;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            style={{ fontFamily: "'Poppins', sans-serif" }}
        >
            <PageHeader
                title="Neraca Saldo"
                description="Daftar saldo dari seluruh akun buku besar untuk memastikan keseimbangan Debit dan Kredit."
                breadcrumb={[{ label: 'LAPORAN' }, { label: 'NERACA SALDO' }]}
                extra={
                    <DatePicker 
                        value={asOfDate} 
                        onChange={(d) => d && setAsOfDate(d)} 
                        format="DD/MM/YYYY" 
                        style={{ borderRadius: 12, height: 40 }}
                    />
                }
            />

            {isLoading ? (
                <div style={{ padding: 100, textAlign: 'center' }}><Spin size="large" tip="Memeriksa Saldo Akun..." /></div>
            ) : data && (
                <Card className="premium-card" style={{ borderRadius: 24 }} bodyStyle={{ padding: 0 }}>
                    <div style={{ padding: '24px 32px', borderBottom: '1px solid #f8f8f8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Space align="center" size={12}>
                            <div style={{ 
                                width: 40, height: 40, borderRadius: 10, 
                                background: isBalanced ? '#10b98115' : '#ef444415', 
                                color: isBalanced ? '#10b981' : '#ef4444',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
                            }}>
                                {isBalanced ? <SafetyCertificateOutlined /> : <WarningOutlined />}
                            </div>
                            <div>
                                <Text strong style={{ fontSize: 13, display: 'block' }}>{isBalanced ? 'Audit Selesai: Seimbang' : 'Ditemukan Ketidakseimbangan'}</Text>
                                <Text type="secondary" style={{ fontSize: 11 }}>{isBalanced ? 'Seluruh transaksi tercatat secara akurat.' : 'Mohon periksa jurnal entry yang tidak lengkap.'}</Text>
                            </div>
                        </Space>
                        <Tag bordered={false} color={isBalanced ? 'success' : 'error'} style={{ borderRadius: 6, fontWeight: 700, padding: '4px 12px' }}>
                            {isBalanced ? 'BALANCED' : 'UNBALANCED'}
                        </Tag>
                    </div>

                    <Table 
                        columns={columns} 
                        dataSource={data.items} 
                        rowKey="accountId" 
                        pagination={false} 
                        size="middle"
                        summary={() => (
                            <Table.Summary fixed>
                                <Table.Summary.Row style={{ fontWeight: 'bold', background: '#f8fafc' }}>
                                    <Table.Summary.Cell index={0} colSpan={3}>
                                        <Text strong style={{ fontSize: 14, paddingLeft: 8 }}>TOTAL KESELURUHAN</Text>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={1} align="right">
                                        <Text strong style={{ fontSize: 14 }}>{fmtRp(data.totalDebit)}</Text>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={2} align="right">
                                        <Text strong style={{ fontSize: 14 }}>{fmtRp(data.totalCredit)}</Text>
                                    </Table.Summary.Cell>
                                </Table.Summary.Row>
                            </Table.Summary>
                        )}
                    />
                </Card>
            )}
        </motion.div>
    );
};

export default TrialBalancePage;
