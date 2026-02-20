import React from 'react';
import { Form, Input, InputNumber, DatePicker, Button, Card, Select, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';

const AddExpensePage: React.FC = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const { data: contacts = [] } = useQuery({
        queryKey: ['contacts'],
        queryFn: async () => {
            const res = await api.get('/finance/contacts');
            return res.data?.data || res.data || [];
        },
    });
    const { data: banks = [] } = useQuery({
        queryKey: ['banks'],
        queryFn: async () => {
            const res = await api.get('/finance/banks');
            return res.data?.data || res.data || [];
        },
    });

    const vendors = contacts.filter((c: Record<string, unknown>) => c.type === 'vendor');

    const onFinish = async (values: Record<string, unknown>) => {
        try {
            const transDate = values.transDate as { format: (f: string) => string };
            await api.post('/finance/expenses', {
                contactId: values.contactId,
                accountId: values.accountId,
                payFromAccountId: values.payFromAccountId,
                refNumber: values.refNumber,
                transDate: transDate.format('YYYY-MM-DD'),
                amount: values.amount,
                description: values.description,
            });
            message.success('Biaya berhasil dicatat!');
            navigate('/expenses');
        } catch (error: unknown) {
            const e = error as { response?: { data?: { message?: string } } };
            message.error(e.response?.data?.message || 'Gagal mencatat biaya');
        }
    };

    return (
        <div>
            <h1>Catat Biaya Baru</h1>
            <Card>
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <Form.Item name="contactId" label="Supplier (Opsional)">
                            <Select allowClear placeholder="Pilih Supplier" options={vendors.map((v: Record<string, unknown>) => ({ value: v.id, label: v.name }))} />
                        </Form.Item>
                        <Form.Item name="refNumber" label="No. Referensi" rules={[{ required: true }]}>
                            <Input placeholder="EXP-001" />
                        </Form.Item>
                        <Form.Item name="transDate" label="Tanggal" rules={[{ required: true }]}>
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item name="amount" label="Jumlah" rules={[{ required: true }]}>
                            <InputNumber style={{ width: '100%' }} min={0} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')} placeholder="0" />
                        </Form.Item>
                        <Form.Item name="payFromAccountId" label="Bayar Dari (Kas/Bank)" rules={[{ required: true }]}>
                            <Select placeholder="Pilih Akun Kas/Bank" options={banks.map((b: Record<string, unknown>) => ({ value: b.id, label: `${b.code} - ${b.name}` }))} />
                        </Form.Item>
                        <Form.Item name="accountId" label="Akun Biaya (Kategori 5)" rules={[{ required: true }]}>
                            <InputNumber style={{ width: '100%' }} placeholder="Account ID biaya" min={1} />
                        </Form.Item>
                    </div>
                    <Form.Item name="description" label="Deskripsi">
                        <Input.TextArea rows={3} placeholder="Keterangan biaya" />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" size="large">
                        Simpan Biaya
                    </Button>
                </Form>
            </Card>
        </div>
    );
};

export default AddExpensePage;
