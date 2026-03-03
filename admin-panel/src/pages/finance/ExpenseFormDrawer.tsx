import React, { useEffect } from 'react';
import { Drawer, Form, Input, InputNumber, Button, Select, DatePicker, message, Space } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import api from '../../api';

interface ExpenseFormDrawerProps {
    open: boolean;
    onClose: () => void;
}

const ExpenseFormDrawer: React.FC<ExpenseFormDrawerProps> = ({ open, onClose }) => {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    // Fetch master data needed for the form
    const { data: accounts = [] } = useQuery({
        queryKey: ['accountsForExpense'],
        queryFn: async () => {
            const res = await api.get('/finance/accounts');
            return res.data?.data || [];
        },
        enabled: open
    });

    const { data: contacts = [] } = useQuery({
        queryKey: ['contactsForExpense'],
        queryFn: async () => {
            const res = await api.get('/finance/contacts');
            return res.data?.data || [];
        },
        enabled: open
    });

    // Handle form reset when opening
    useEffect(() => {
        if (open) {
            form.resetFields();
            form.setFieldsValue({
                transDate: dayjs(),
                refNumber: `EXP-${dayjs().format('YYYYMMDDHHmmss')}`,
            });
        }
    }, [open, form]);

    const submitMutation = useMutation({
        mutationFn: async (values: any) => {
            const payload = {
                ...values,
                transDate: values.transDate.format('YYYY-MM-DD'),
            };
            return await api.post('/finance/expenses', payload);
        },
        onSuccess: () => {
            message.success('Biaya berhasil dicatat!');
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            onClose();
        },
        onError: (err: any) => {
            message.error(err.response?.data?.message || 'Gagal menyimpan biaya');
        }
    });

    return (
        <Drawer
            title="Catat Biaya Baru"
            width={480}
            onClose={onClose}
            open={open}
            extra={
                <Space>
                    <Button onClick={onClose}>Batal</Button>
                    <Button type="primary" loading={submitMutation.isPending} onClick={() => form.submit()}>
                        Simpan
                    </Button>
                </Space>
            }
        >
            <Form form={form} layout="vertical" onFinish={(values) => submitMutation.mutate(values)}>
                <Form.Item name="transDate" label="Tanggal Transaksi" rules={[{ required: true, message: 'Harap isi tanggal' }]}>
                    <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>

                <Form.Item name="refNumber" label="Nomor Referensi" rules={[{ required: true }]}>
                    <Input placeholder="Contoh: EXP-001" disabled />
                </Form.Item>

                <Form.Item name="payFromAccountId" label="Bayar Dari (Sumber Kas/Bank)" rules={[{ required: true, message: 'Harap pilih sumber dana' }]}>
                    <Select
                        showSearch
                        optionFilterProp="children"
                        placeholder="Pilih Akun Kas/Bank"
                        options={accounts.filter((a: any) => ['Kas', 'Bank'].includes(a.type)).map((a: any) => ({
                            value: a.id,
                            label: `${a.code} - ${a.name}`
                        }))}
                    />
                </Form.Item>

                <Form.Item name="accountId" label="Kategori Biaya" rules={[{ required: true, message: 'Harap pilih kategori biaya' }]}>
                    <Select
                        showSearch
                        optionFilterProp="children"
                        placeholder="Contoh: Biaya Listrik, Iklan, dll"
                        options={accounts.map((a: any) => ({
                            value: a.id,
                            label: `${a.code} - ${a.name}`
                        }))}
                    />
                </Form.Item>

                <Form.Item name="contactId" label="Penerima / Vendor (Opsional)">
                    <Select
                        allowClear
                        showSearch
                        optionFilterProp="children"
                        placeholder="Pilih kontak/vendor jika ada"
                        options={contacts.map((c: any) => ({
                            value: c.id,
                            label: c.name
                        }))}
                    />
                </Form.Item>

                <Form.Item name="amount" label="Nominal (Rp)" rules={[{ required: true, message: 'Harap isi nominal' }]}>
                    <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        formatter={(value: any) => `${value || ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                        placeholder="0"
                        size="large"
                    />
                </Form.Item>

                <Form.Item name="description" label="Deskripsi / Keterangan">
                    <Input.TextArea rows={3} placeholder="Tambahkan keterangan biaya..." />
                </Form.Item>
            </Form>
        </Drawer>
    );
};

export default ExpenseFormDrawer;
