import React, { useEffect, useState } from 'react';
import { Table, Card, Button, Space, Tag, DatePicker, message, Tooltip } from 'antd';
import { PlusOutlined, StopOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import api from '../../api';

const { RangePicker } = DatePicker;

interface JournalEntry {
    id: number;
    refNumber: string;
    transDate: string;
    memo: string;
    sourceType: string;
    isReversed: boolean;
    items: {
        id: number;
        debit: number;
        credit: number;
        account: { code: string; name: string };
    }[];
}

const JournalEntriesPage: React.FC = () => {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<[string, string] | null>(null);
    const navigate = useNavigate();

    const fetchData = async () => {
        setLoading(true);
        try {
            const params: Record<string, string> = {};
            if (dateRange) {
                params.startDate = dateRange[0];
                params.endDate = dateRange[1];
            }
            const res = await api.get('/finance/journals', { params });
            setEntries(res.data);
        } catch {
            message.error('Gagal memuat jurnal');
        } finally {
            setLoading(false);
        }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchData(); }, [dateRange]);

    const handleReverse = async (id: number) => {
        try {
            await api.put(`/finance/journals/${id}/reverse`);
            message.success('Jurnal berhasil di-reverse');
            fetchData();
        } catch {
            message.error('Gagal reverse jurnal');
        }
    };

    const columns = [
        { title: 'No. Ref', dataIndex: 'refNumber', key: 'refNumber', width: 180 },
        {
            title: 'Tanggal', dataIndex: 'transDate', key: 'transDate', width: 120,
            render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
        },
        { title: 'Memo', dataIndex: 'memo', key: 'memo', ellipsis: true },
        {
            title: 'Sumber', dataIndex: 'sourceType', key: 'sourceType', width: 120,
            render: (v: string) => (
                <Tag color={v === 'manual' ? 'blue' : v === 'invoice' ? 'green' : 'orange'}>
                    {v || 'system'}
                </Tag>
            ),
        },
        {
            title: 'Debit', key: 'debit', width: 150,
            render: (_: unknown, r: JournalEntry) => {
                const total = r.items.reduce((s, i) => s + Number(i.debit), 0);
                return `Rp ${total.toLocaleString('id-ID')}`;
            },
        },
        {
            title: 'Kredit', key: 'credit', width: 150,
            render: (_: unknown, r: JournalEntry) => {
                const total = r.items.reduce((s, i) => s + Number(i.credit), 0);
                return `Rp ${total.toLocaleString('id-ID')}`;
            },
        },
        {
            title: 'Status', key: 'status', width: 100,
            render: (_: unknown, r: JournalEntry) => r.isReversed
                ? <Tag color="red">Reversed</Tag>
                : <Tag color="green">Active</Tag>,
        },
        {
            title: 'Aksi', key: 'action', width: 100,
            render: (_: unknown, r: JournalEntry) => (
                <Space>
                    {!r.isReversed && r.sourceType === 'manual' && (
                        <Tooltip title="Reverse">
                            <Button size="small" danger icon={<StopOutlined />} onClick={() => handleReverse(r.id)} />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <Card
            title="Jurnal Umum"
            extra={
                <Space>
                    <RangePicker
                        onChange={(dates) => {
                            if (dates && dates[0] && dates[1]) {
                                setDateRange([dates[0].toISOString(), dates[1].toISOString()]);
                            } else {
                                setDateRange(null);
                            }
                        }}
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/accounts/journals/add')}>
                        Buat Jurnal
                    </Button>
                </Space>
            }
        >
            <Table
                dataSource={entries}
                columns={columns}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 20 }}
                expandable={{
                    expandedRowRender: (record) => (
                        <Table
                            dataSource={record.items}
                            columns={[
                                { title: 'Akun', render: (_: unknown, r: JournalEntry['items'][number]) => `${r.account.code} — ${r.account.name}` },
                                { title: 'Debit', dataIndex: 'debit', render: (v: number) => Number(v) > 0 ? `Rp ${Number(v).toLocaleString('id-ID')}` : '-' },
                                { title: 'Kredit', dataIndex: 'credit', render: (v: number) => Number(v) > 0 ? `Rp ${Number(v).toLocaleString('id-ID')}` : '-' },
                            ]}
                            rowKey="id"
                            pagination={false}
                            size="small"
                        />
                    ),
                }}
            />
        </Card>
    );
};

export default JournalEntriesPage;
