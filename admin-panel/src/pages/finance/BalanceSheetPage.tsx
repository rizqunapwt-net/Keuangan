import React, { useState } from 'react';
import { Card, DatePicker, Table, Tag, Typography, Row, Col, Statistic, Divider, Spin } from 'antd';
import { BarChartOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import dayjs from 'dayjs';

const { Title } = Typography;

const BalanceSheetPage: React.FC = () => {
    const [asOfDate, setAsOfDate] = useState(dayjs());

    const { data, isLoading } = useQuery({
        queryKey: ['balance-sheet', asOfDate.format('YYYY-MM-DD')],
        queryFn: async () => {
            const res = await api.get('/reports/balance-sheet', { params: { asOfDate: asOfDate.format('YYYY-MM-DD') } });
            return res.data;
        },
    });

    const accountColumns = [
        { title: 'Kode', dataIndex: 'accountCode', key: 'code', width: 120 },
        { title: 'Nama Akun', dataIndex: 'accountName', key: 'name' },
        { title: 'Saldo', dataIndex: 'amount', key: 'amount', render: (v: number) => `Rp ${Number(v).toLocaleString('id-ID')}`, align: 'right' as const },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ margin: 0 }}><BarChartOutlined /> Neraca (Balance Sheet)</h1>
                <DatePicker value={asOfDate} onChange={(d) => d && setAsOfDate(d)} format="DD/MM/YYYY" />
            </div>

            {isLoading ? <Spin size="large" /> : data && (
                <>
                    <div style={{ marginBottom: 16, textAlign: 'center' }}>
                        {data.isBalanced ?
                            <Tag icon={<CheckCircleOutlined />} color="success" style={{ fontSize: 14, padding: '4px 16px' }}>BALANCE ✓ (Aset = Liabilitas + Ekuitas)</Tag> :
                            <Tag icon={<WarningOutlined />} color="error" style={{ fontSize: 14, padding: '4px 16px' }}>TIDAK BALANCE — Periksa jurnal entry</Tag>
                        }
                    </div>

                    <Row gutter={24}>
                        <Col span={12}>
                            <Card title={<Title level={4} style={{ margin: 0, color: '#1890ff' }}>Aset</Title>} bordered>
                                <Table columns={accountColumns} dataSource={data.assets} rowKey="accountId" pagination={false} size="small" />
                                <Divider />
                                <Statistic title="Total Aset" value={data.totalAssets} precision={0} prefix="Rp" valueStyle={{ color: '#1890ff', fontWeight: 'bold' }} />
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card title={<Title level={4} style={{ margin: 0, color: '#f5222d' }}>Liabilitas</Title>} bordered style={{ marginBottom: 16 }}>
                                <Table columns={accountColumns} dataSource={data.liabilities} rowKey="accountId" pagination={false} size="small" />
                                <Divider />
                                <Statistic title="Total Liabilitas" value={data.totalLiabilities} precision={0} prefix="Rp" valueStyle={{ color: '#f5222d' }} />
                            </Card>
                            <Card title={<Title level={4} style={{ margin: 0, color: '#52c41a' }}>Ekuitas</Title>} bordered>
                                <Table columns={accountColumns} dataSource={data.equity} rowKey="accountId" pagination={false} size="small" />
                                <Divider />
                                <Statistic title="Total Ekuitas" value={data.totalEquity} precision={0} prefix="Rp" valueStyle={{ color: '#52c41a' }} />
                            </Card>
                        </Col>
                    </Row>
                </>
            )}
        </div>
    );
};

export default BalanceSheetPage;
