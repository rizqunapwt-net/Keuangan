import React, { useEffect } from 'react';
import { Drawer, Form, Input, InputNumber, Button, Select, DatePicker, message, Space, Radio } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import api from '../../api';

interface CashTransactionDrawerProps {
    open: boolean;
    onClose: () => void;
}

const CashTransactionDrawer: React.FC<CashTransactionDrawerProps> = ({ open, onClose }) => {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    const { data: banks = [] } = useQuery({
        queryKey: ['banksForTransaction'],
        queryFn: async () => {
            const res = await api.get('/finance/banks');
            // Backend outputs: { success: true, data: { data: [...] } }
            return res.data?.data?.data || res.data?.data || [];
        },
        enabled: open
    });

    useEffect(() => {
        if (open) {
            form.resetFields();
            form.setFieldsValue({
                date: dayjs(),
                type: 'income',
            });
        }
    }, [open, form]);

    const submitMutation = useMutation({
        mutationFn: async (values: any) => {
            const payload = {
                ...values,
                date: values.date.format('YYYY-MM-DD'),
            };
            return await api.post('/finance/cash-transactions', payload);
        },
        onSuccess: () => {
            message.success('Transaksi kas berhasil dicatat!');
            queryClient.invalidateQueries({ queryKey: ['cash-transactions'] });
            queryClient.invalidateQueries({ queryKey: ['cash-summary'] });
            queryClient.invalidateQueries({ queryKey: ['banks'] });
            onClose();
        },
        onError: (err: any) => {
            message.error(err.response?.data?.message || 'Gagal menyimpan transaksi');
        }
    });

    return (
        <Drawer
            title="Catat Pemasukan / Pengeluaran"
            width={450}
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
                <Form.Item name="type" label="Jenis Transaksi" rules={[{ required: true }]}>
                    <Radio.Group optionType="button" buttonStyle="solid" style={{ width: '100%' }}>
                        <Radio.Button value="income" style={{ width: '50%', textAlign: 'center', backgroundColor: '#52c41a', color: 'white' }}>Pemasukan</Radio.Button>
                        <Radio.Button value="expense" style={{ width: '50%', textAlign: 'center', backgroundColor: '#ff4d4f', color: 'white' }}>Pengeluaran</Radio.Button>
                    </Radio.Group>
                </Form.Item>

                <Form.Item name="date" label="Tanggal" rules={[{ required: true, message: 'Harap isi tanggal' }]}>
                    <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>

                <Form.Item name="bank_id" label="Kas / Bank" rules={[{ required: true, message: 'Harap pilih akun kas/bank' }]}>
                    <Select
                        placeholder="Pilih sumber dana/tujuan"
                        options={banks.map((b: any) => ({
                            value: b.id,
                            label: `${b.name} (${b.account_number || 'Cash'})`
                        }))}
                    />
                </Form.Item>

                <Form.Item name="category" label="Kategori (Opsional)">
                    <Input placeholder="Contoh: Penjualan, Biaya Makan, dsb." />
                </Form.Item>

                <Form.Item name="amount" label="Nominal (Rp)" rules={[{ required: true, message: 'Harap isi nominal' }]}>
                    <InputNumber
                        style={{ width: '100%' }}
                        min={0.01}
                        formatter={(value: any) => `${value || ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                        placeholder="0"
                        size="large"
                    />
                </Form.Item>

                <Form.Item name="description" label="Deskripsi / Keterangan">
                    <Input.TextArea rows={3} placeholder="Tambahkan keterangan transaksi..." />
                </Form.Item>
            </Form>
        </Drawer>
    );
};

export default CashTransactionDrawer;
