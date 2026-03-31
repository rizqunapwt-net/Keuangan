import React, { useState } from 'react';
import { Card, DatePicker, Table, Select, Spin, Row, Col, Typography, Empty, Button, message } from 'antd';
import { BookOutlined, AuditOutlined, RiseOutlined, FallOutlined, WalletOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import dayjs from 'dayjs';
import { fmtRp } from '../../utils/formatters';
import PageHeader from '../../components/PageHeader';
import { motion } from 'framer-motion';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const GeneralLedgerPage: React.FC = () => {
    const [accountId, setAccountId] = useState<number | null>(null);
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs().startOf('year'), dayjs()]);

    const { data: banksData = [] } = useQuery({
        queryKey: ['banks'],
        queryFn: async () => {
            const res = await api.get('/finance/banks');
            return res.data?.data || res.data || [];
        },
    });

    const { data, isLoading } = useQuery({
        queryKey: ['general-ledger', accountId, dateRange[0].format('YYYY-MM-DD'), dateRange[1].format('YYYY-MM-DD')],
        queryFn: async () => {
            if (!accountId) return null;
            const res = await api.get(`/reports/general-ledger/${accountId}`, {
                params: {
                    startDate: dateRange[0].format('YYYY-MM-DD'),
                    endDate: dateRange[1].format('YYYY-MM-DD'),
                },
            });
            return res.data?.data || res.data;
        },
        enabled: !!accountId,
    });

    const columns = [
        { 
            title: 'TANGGAL', 
            dataIndex: 'date', 
            key: 'date', 
            render: (v: string) => <Text style={{ fontSize: 12, color: '#64748b' }}>{dayjs(v).format('DD/MM/YYYY')}</Text>, 
            width: 110 
        },
        { 
            title: 'NO. REF', 
            dataIndex: 'refNumber', 
            key: 'ref', 
            width: 140,
            render: (v: string) => <Text strong style={{ fontSize: 13, color: '#333' }}>{v || '-'}</Text>
        },
        { 
            title: 'KETERANGAN', 
            dataIndex: 'memo', 
            key: 'memo', 
            ellipsis: true,
            render: (v: string) => <Text style={{ fontSize: 13, color: '#475569' }}>{v || '-'}</Text>
        },
        { 
            title: 'KONTAK', 
            dataIndex: 'contact', 
            key: 'contact', 
            width: 140,
            render: (v: string) => <Text style={{ fontSize: 12, color: '#64748b' }}>{v || '-'}</Text>
        },
        { 
            title: 'DEBIT', 
            dataIndex: 'debit', 
            key: 'debit', 
            render: (v: number) => v > 0 ? <Text strong style={{ fontSize: 13, color: '#10b981' }}>{fmtRp(v)}</Text> : '-', 
            align: 'right' as const 
        },
        { 
            title: 'KREDIT', 
            dataIndex: 'credit', 
            key: 'credit', 
            render: (v: number) => v > 0 ? <Text strong style={{ fontSize: 13, color: '#ef4444' }}>{fmtRp(v)}</Text> : '-', 
            align: 'right' as const 
        },
        { 
            title: 'SALDO', 
            dataIndex: 'balance', 
            key: 'balance', 
            render: (v: number) => <Text strong style={{ fontSize: 13, color: '#333' }}>{fmtRp(v)}</Text>, 
            align: 'right' as const 
        },
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            style={{ fontFamily: "'Poppins', sans-serif" }}
        >
            <PageHeader
                title="Buku Besar"
                description="Tinjauan mendalam pergerakan saldo untuk setiap akun keuangan."
                breadcrumb={[{ label: 'LAPORAN' }, { label: 'BUKU BESAR' }]}
            />

            <Card className="premium-card" style={{ borderRadius: 20, marginBottom: 32 }} bodyStyle={{ padding: '24px 32px' }}>
                <Row gutter={24} align="middle">
                    <Col xs={24} md={10}>
                        <Text strong style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>PILIH AKUN KEUANGAN</Text>
                        <Select
                            placeholder="Pilih Akun Buku Besar..."
                            style={{ width: '100%', height: 44 }}
                            className="premium-select"
                            options={banksData.map((b: any) => ({ value: b.id, label: `${b.bank_name || b.name} (${b.account_number || 'KAS'})` }))}
                            onChange={(v: number) => setAccountId(v)}
                            showSearch
                            optionFilterProp="label"
                        />
                    </Col>
                    <Col xs={24} md={10}>
                        <Text strong style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>PERIODE WAKTU</Text>
                        <RangePicker 
                            value={dateRange} 
                            onChange={(d) => d && setDateRange(d as [dayjs.Dayjs, dayjs.Dayjs])} 
                            format="DD/MM/YYYY" 
                            style={{ width: '100%', height: 44, borderRadius: 12 }}
                        />
                    </Col>
                    <Col xs={24} md={4}>
                        <Button 
                            block 
                            type="primary" 
                            icon={<AuditOutlined />} 
                            style={{ height: 44, borderRadius: 12, marginTop: 22, fontWeight: 700 }}
                            onClick={() => accountId ? null : message.warning('Pilih akun terlebih dahulu')}
                        >
                            TULIS LAPORAN
                        </Button>
                    </Col>
                </Row>
            </Card>

            {!accountId ? (
                <Card className="premium-card" style={{ borderRadius: 24, padding: '60px 0', textAlign: 'center' }}>
                    <Empty 
                        image={<BookOutlined style={{ fontSize: 64, color: '#f1f5f9' }} />} 
                        description={<Text type="secondary">Silakan pilih akun buku besar dan periode untuk melihat data transaksi.</Text>} 
                    />
                </Card>
            ) : isLoading ? (
                <div style={{ padding: 100, textAlign: 'center' }}><Spin size="large" tip="Menyusun Jurnal Akun..." /></div>
            ) : data && (
                <Card className="premium-card" style={{ borderRadius: 24 }} bodyStyle={{ padding: 0 }}>
                    <div style={{ padding: '32px', borderBottom: '1px solid #f8f8f8' }}>
                        <Row gutter={24}>
                            <Col span={8}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f8fafc', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                                        <WalletOutlined />
                                    </div>
                                    <div>
                                        <Text type="secondary" style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>AKUN TERPILIH</Text>
                                        <div style={{ fontSize: 15, fontWeight: 800, color: '#333' }}>{data.account.name}</div>
                                    </div>
                                </div>
                            </Col>
                            <Col span={8}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f8fafc', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                                        <FallOutlined />
                                    </div>
                                    <div>
                                        <Text type="secondary" style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>SALDO AWAL</Text>
                                        <div style={{ fontSize: 18, fontWeight: 800, color: '#333' }}>{fmtRp(data.openingBalance)}</div>
                                    </div>
                                </div>
                            </Col>
                            <Col span={8}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f0fdf4', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                                        <RiseOutlined />
                                    </div>
                                    <div>
                                        <Text type="secondary" style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>SALDO AKHIR</Text>
                                        <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>{fmtRp(data.closingBalance)}</div>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>

                    <Table columns={columns} dataSource={data.items} rowKey={(_, i) => String(i)} pagination={false} size="middle" />
                </Card>
            )}
        </motion.div>
    );
};

export default GeneralLedgerPage;
