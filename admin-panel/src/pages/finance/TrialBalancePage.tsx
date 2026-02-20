import React, { useState } from 'react';
import { Card, DatePicker, Table, Spin, Tag } from 'antd';
import { CalculatorOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import dayjs from 'dayjs';

const TrialBalancePage: React.FC = () => {
    const [asOfDate, setAsOfDate] = useState(dayjs());

    const { data, isLoading } = useQuery({
        queryKey: ['trial-balance', asOfDate.format('YYYY-MM-DD')],
        queryFn: async () => {
            const res = await api.get('/reports/trial-balance', { params: { asOfDate: asOfDate.format('YYYY-MM-DD') } });
            return res.data;
        },
    });

    const columns = [
        { title: 'Kode Akun', dataIndex: 'accountCode', key: 'code', width: 120 },
        { title: 'Nama Akun', dataIndex: 'accountName', key: 'name' },
        { title: 'Kategori', dataIndex: 'categoryName', key: 'cat', width: 120 },
        { title: 'Debit', dataIndex: 'debit', key: 'debit', render: (v: number) => v > 0 ? `Rp ${Number(v).toLocaleString('id-ID')}` : '-', align: 'right' as const },
        { title: 'Kredit', dataIndex: 'credit', key: 'credit', render: (v: number) => v > 0 ? `Rp ${Number(v).toLocaleString('id-ID')}` : '-', align: 'right' as const },
    ];

    const isBalanced = data ? Math.abs(data.totalDebit - data.totalCredit) < 0.01 : false;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ margin: 0 }}><CalculatorOutlined /> Neraca Saldo (Trial Balance)</h1>
                <DatePicker value={asOfDate} onChange={(d) => d && setAsOfDate(d)} format="DD/MM/YYYY" />
            </div>

            {isLoading ? <Spin size="large" /> : data && (
                <Card>
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                        {isBalanced ?
                            <Tag icon={<CheckCircleOutlined />} color="success" style={{ fontSize: 14, padding: '4px 16px' }}>BALANCE ✓</Tag> :
                            <Tag icon={<WarningOutlined />} color="error" style={{ fontSize: 14, padding: '4px 16px' }}>TIDAK BALANCE</Tag>
                        }
                    </div>
                    <Table columns={columns} dataSource={data.items} rowKey="accountId" pagination={false} size="small"
                        summary={() => (
                            <Table.Summary fixed>
                                <Table.Summary.Row style={{ fontWeight: 'bold', background: '#fafafa' }}>
                                    <Table.Summary.Cell index={0} colSpan={3}>Total</Table.Summary.Cell>
                                    <Table.Summary.Cell index={1} align="right">Rp {Number(data.totalDebit).toLocaleString('id-ID')}</Table.Summary.Cell>
                                    <Table.Summary.Cell index={2} align="right">Rp {Number(data.totalCredit).toLocaleString('id-ID')}</Table.Summary.Cell>
                                </Table.Summary.Row>
                            </Table.Summary>
                        )}
                    />
                </Card>
            )}
        </div>
    );
};

export default TrialBalancePage;
