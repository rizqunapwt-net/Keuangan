import React, { useEffect, useState } from 'react';
import { Card, Form, Input, DatePicker, Button, Select, InputNumber, Space, Table, message } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

interface Account {
    id: number;
    code: string;
    name: string;
    category: { name: string };
}

interface JournalItem {
    accountId: number;
    debit: number;
    credit: number;
}

const AddJournalEntryPage: React.FC = () => {
    const [form] = Form.useForm();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/finance/accounts').then(res => setAccounts(res.data)).catch(() => { });
    }, []);

    const handleSubmit = async (values: Record<string, unknown>) => {
        const items = (values.items as JournalItem[]) || [];
        const totalDebit = items.reduce((s: number, i: JournalItem) => s + (i.debit || 0), 0);
        const totalCredit = items.reduce((s: number, i: JournalItem) => s + (i.credit || 0), 0);

        if (totalDebit !== totalCredit) {
            message.error(`Total Debit (${totalDebit.toLocaleString()}) harus sama dengan Total Kredit (${totalCredit.toLocaleString()})`);
            return;
        }

        if (items.length < 2) {
            message.error('Minimal 2 baris jurnal diperlukan');
            return;
        }

        setLoading(true);
        try {
            await api.post('/finance/journals', {
                transDate: (values.transDate as { toISOString: () => string }).toISOString(),
                memo: values.memo,
                items: items.map((i: JournalItem) => ({
                    accountId: i.accountId,
                    debit: i.debit || 0,
                    credit: i.credit || 0,
                })),
            });
            message.success('Jurnal berhasil dibuat');
            navigate('/accounts/journals');
        } catch {
            message.error('Gagal membuat jurnal');
        } finally {
            setLoading(false);
        }
    };

    const items: JournalItem[] = Form.useWatch('items', form) || [];
    const totalDebit = items.reduce((s: number, i: JournalItem) => s + (i?.debit || 0), 0);
    const totalCredit = items.reduce((s: number, i: JournalItem) => s + (i?.credit || 0), 0);
    const isBalanced = totalDebit === totalCredit && totalDebit > 0;

    return (
        <Card title="Buat Jurnal Umum">
            <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ items: [{ debit: 0, credit: 0 }, { debit: 0, credit: 0 }] }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Form.Item name="transDate" label="Tanggal Transaksi" rules={[{ required: true }]}>
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="memo" label="Memo / Keterangan">
                        <Input placeholder="Catatan untuk jurnal ini" />
                    </Form.Item>
                </div>

                <h3 style={{ marginBottom: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }}>Baris Jurnal</h3>

                <Form.List name="items">
                    {(fields, { add, remove }) => (
                        <>
                            <Table
                                dataSource={fields}
                                columns={[
                                    {
                                        title: 'Akun', key: 'accountId', width: '40%',
                                        render: (_, field) => (
                                            <Form.Item name={[field.name, 'accountId']} rules={[{ required: true, message: 'Pilih akun' }]} style={{ marginBottom: 0 }}>
                                                <Select
                                                    showSearch
                                                    placeholder="Pilih akun"
                                                    optionFilterProp="children"
                                                    filterOption={(input, option) =>
                                                        (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                                                    }
                                                >
                                                    {accounts.map(a => (
                                                        <Select.Option key={a.id} value={a.id}>{a.code} — {a.name}</Select.Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        ),
                                    },
                                    {
                                        title: 'Debit', key: 'debit', width: '25%',
                                        render: (_, field) => (
                                            <Form.Item name={[field.name, 'debit']} style={{ marginBottom: 0 }}>
                                                <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                                            </Form.Item>
                                        ),
                                    },
                                    {
                                        title: 'Kredit', key: 'credit', width: '25%',
                                        render: (_, field) => (
                                            <Form.Item name={[field.name, 'credit']} style={{ marginBottom: 0 }}>
                                                <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                                            </Form.Item>
                                        ),
                                    },
                                    {
                                        title: '', key: 'action', width: '10%',
                                        render: (_, field) => fields.length > 2 && (
                                            <MinusCircleOutlined onClick={() => remove(field.name)} style={{ color: 'red' }} />
                                        ),
                                    },
                                ]}
                                rowKey="key"
                                pagination={false}
                                size="small"
                                footer={() => (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                        <span>Total</span>
                                        <Space size={48}>
                                            <span style={{ color: isBalanced ? 'green' : 'red' }}>
                                                Debit: Rp {totalDebit.toLocaleString('id-ID')}
                                            </span>
                                            <span style={{ color: isBalanced ? 'green' : 'red' }}>
                                                Kredit: Rp {totalCredit.toLocaleString('id-ID')}
                                            </span>
                                        </Space>
                                    </div>
                                )}
                            />
                            <Button type="dashed" onClick={() => add({ debit: 0, credit: 0 })} icon={<PlusOutlined />} style={{ width: '100%', marginTop: 12 }}>
                                Tambah Baris
                            </Button>
                        </>
                    )}
                </Form.List>

                <div style={{ marginTop: 24, textAlign: 'right' }}>
                    <Space>
                        <Button onClick={() => navigate('/accounts/journals')}>Batal</Button>
                        <Button type="primary" htmlType="submit" loading={loading} disabled={!isBalanced}>
                            Simpan Jurnal
                        </Button>
                    </Space>
                </div>
            </Form>
        </Card>
    );
};

export default AddJournalEntryPage;
