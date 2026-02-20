import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, message } from 'antd';
import api from '../../api';

interface SalesInvoice {
    id: number;
    refNumber: string;
    total: number;
    paidAmount: number;
    status: string;
    contact?: { name: string };
    [key: string]: unknown;
}

const SalesOverviewPage: React.FC = () => {
    const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/finance/invoices', { params: { type: 'sales' } })
            .then(res => {
                setInvoices(res.data);
                setLoading(false);
            })
            .catch(() => {
                message.error('Gagal memuat data');
                setLoading(false);
            });
    }, []);

    const totalSales = invoices.reduce((sum, inv) => sum + Number(inv.total), 0);
    const totalPaid = invoices.reduce((sum, inv) => sum + Number(inv.paidAmount), 0);
    const totalUnpaid = totalSales - totalPaid;
    const paidCount = invoices.filter(i => i.status === 'paid').length;

    const topCustomers = Object.entries(
        invoices.reduce((acc: Record<string, number>, inv) => {
            const name = inv.contact?.name || 'Unknown';
            acc[name] = (acc[name] || 0) + Number(inv.total);
            return acc;
        }, {})
    ).sort(([, a], [, b]) => (b as number) - (a as number)).slice(0, 5);

    return (
        <div>
            <h2 style={{ marginBottom: 24 }}>Overview Penjualan</h2>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic title="Total Penjualan" value={totalSales} prefix="Rp" precision={0}
                            formatter={(v) => Number(v).toLocaleString('id-ID')} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic title="Total Dibayar" value={totalPaid} prefix="Rp" precision={0}
                            valueStyle={{ color: '#3f8600' }}
                            formatter={(v) => Number(v).toLocaleString('id-ID')} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic title="Belum Dibayar" value={totalUnpaid} prefix="Rp" precision={0}
                            valueStyle={{ color: '#cf1322' }}
                            formatter={(v) => Number(v).toLocaleString('id-ID')} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic title="Tagihan Lunas" value={paidCount} suffix={`/ ${invoices.length}`} />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={12}>
                    <Card title="Tagihan Terbaru">
                        <Table
                            dataSource={invoices.slice(0, 10)}
                            columns={[
                                { title: 'No. Ref', dataIndex: 'refNumber', key: 'refNumber' },
                                { title: 'Pelanggan', render: (_, r) => r.contact?.name },
                                { title: 'Total', dataIndex: 'total', render: (v: number) => `Rp ${Number(v).toLocaleString('id-ID')}` },
                                {
                                    title: 'Status', dataIndex: 'status',
                                    render: (v: string) => <Tag color={v === 'paid' ? 'green' : v === 'partial' ? 'orange' : 'red'}>{v}</Tag>
                                },
                            ]}
                            rowKey="id"
                            size="small"
                            pagination={false}
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Top 5 Pelanggan">
                        <Table
                            dataSource={topCustomers.map(([name, total], i) => ({ key: i, name, total }))}
                            columns={[
                                { title: '#', render: (_, __, i) => i + 1, width: 50 },
                                { title: 'Pelanggan', dataIndex: 'name' },
                                { title: 'Total', dataIndex: 'total', render: (v: number) => `Rp ${Number(v).toLocaleString('id-ID')}` },
                            ]}
                            rowKey="key"
                            size="small"
                            pagination={false}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default SalesOverviewPage;
