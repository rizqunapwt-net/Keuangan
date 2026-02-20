import React, { useState } from 'react';
import { Card, DatePicker, Table, Select, Spin, Statistic, Divider, Row, Col } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const GeneralLedgerPage: React.FC = () => {
    const [accountId, setAccountId] = useState<number | null>(null);
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs().startOf('year'), dayjs()]);

    const { data: banks = [] } = useQuery({
        queryKey: ['banks'],
        queryFn: async () => (await api.get('/finance/banks')).data,
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
            return res.data;
        },
        enabled: !!accountId,
    });

    const columns = [
        { title: 'Tanggal', dataIndex: 'date', key: 'date', render: (v: string) => dayjs(v).format('DD/MM/YYYY'), width: 110 },
        { title: 'No. Ref', dataIndex: 'refNumber', key: 'ref', width: 120 },
        { title: 'Keterangan', dataIndex: 'memo', key: 'memo', ellipsis: true },
        { title: 'Kontak', dataIndex: 'contact', key: 'contact', render: (v: string) => v || '-', width: 120 },
        { title: 'Debit', dataIndex: 'debit', key: 'debit', render: (v: number) => v > 0 ? `Rp ${v.toLocaleString('id-ID')}` : '-', align: 'right' as const },
        { title: 'Kredit', dataIndex: 'credit', key: 'credit', render: (v: number) => v > 0 ? `Rp ${v.toLocaleString('id-ID')}` : '-', align: 'right' as const },
        { title: 'Saldo', dataIndex: 'balance', key: 'balance', render: (v: number) => `Rp ${v.toLocaleString('id-ID')}`, align: 'right' as const },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ margin: 0 }}><BookOutlined /> Buku Besar (General Ledger)</h1>
            </div>
            <Card style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <Select
                        placeholder="Pilih Akun"
                        style={{ width: 300 }}
                        options={banks.map((b: { id: number; code: string; name: string }) => ({ value: b.id, label: `${b.code} - ${b.name}` }))}
                        onChange={(v: number) => setAccountId(v)}
                    />
                    <RangePicker value={dateRange} onChange={(d) => d && setDateRange(d as [dayjs.Dayjs, dayjs.Dayjs])} format="DD/MM/YYYY" />
                </div>
            </Card>

            {isLoading ? <Spin size="large" /> : data && (
                <Card>
                    <Row gutter={24} style={{ marginBottom: 16 }}>
                        <Col span={8}><Statistic title="Akun" value={`${data.account.code} - ${data.account.name}`} /></Col>
                        <Col span={8}><Statistic title="Saldo Awal" value={data.openingBalance} precision={0} prefix="Rp" /></Col>
                        <Col span={8}><Statistic title="Saldo Akhir" value={data.closingBalance} precision={0} prefix="Rp" valueStyle={{ fontWeight: 'bold' }} /></Col>
                    </Row>
                    <Divider />
                    <Table columns={columns} dataSource={data.items} rowKey={(_, i) => String(i)} pagination={false} size="small" />
                </Card>
            )}
        </div>
    );
};

export default GeneralLedgerPage;
