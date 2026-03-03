import React, { useEffect } from 'react';
import { Drawer, Form, Input, InputNumber, Button, DatePicker, message, Space, Select } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import api from '../../api';

interface DebtFormDrawerProps {
    open: boolean;
    onClose: () => void;
    type: 'payable' | 'receivable';
    initialValues?: any;
}

const DebtFormDrawer: React.FC<DebtFormDrawerProps> = ({ open, onClose, type, initialValues }) => {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const isEdit = !!initialValues;

    const { data: banks = [] } = useQuery({
        queryKey: ['banksForDebt'],
        queryFn: async () => {
            const res = await api.get('/finance/banks');
            return res.data?.data?.data || res.data?.data || [];
        },
        enabled: open && !isEdit
    });

    useEffect(() => {
        if (open) {
            if (isEdit) {
                form.setFieldsValue({
                    ...initialValues,
                    date: dayjs(initialValues.date),
                    due_date: initialValues.due_date ? dayjs(initialValues.due_date) : null,
                });
            } else {
                form.resetFields();
                form.setFieldsValue({
                    date: dayjs(),
                });
            }
        }
    }, [open, form, initialValues, isEdit]);

    const submitMutation = useMutation({
        mutationFn: async (values: any) => {
            const payload = {
                ...values,
                type,
                date: values.date.format('YYYY-MM-DD'),
                due_date: values.due_date ? values.due_date.format('YYYY-MM-DD') : null,
            };

            if (isEdit) {
                return await api.put(`/finance/debts/${initialValues.id}`, payload);
            }
            return await api.post('/finance/debts', payload);
        },
        onSuccess: () => {
            message.success(`${type === 'payable' ? 'Utang' : 'Piutang'} berhasil disimpan!`);
            queryClient.invalidateQueries({ queryKey: ['debts'] });
            queryClient.invalidateQueries({ queryKey: ['cash-transactions'] }); // Invalidate ledger
            queryClient.invalidateQueries({ queryKey: ['banks'] }); // Update bank balance
            onClose();
        },
        onError: (err: any) => {
            message.error(err.response?.data?.message || 'Gagal menyimpan data');
        }
    });

    const title = isEdit
        ? `Edit ${type === 'payable' ? 'Utang' : 'Piutang'}`
        : `Tambah ${type === 'payable' ? 'Utang' : 'Piutang'} Baru`;

    return (
        <Drawer
            title={title}
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
                <Form.Item name="date" label="Tanggal" rules={[{ required: true, message: 'Harap isi tanggal' }]}>
                    <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>

                <Form.Item name="client_name" label={type === 'payable' ? 'Kreditur (Pemberi Pinjaman)' : 'Debitur (Penerima Pinjaman)'} rules={[{ required: true, message: 'Harap isi nama klien' }]}>
                    <Input placeholder="Nama lengkap..." />
                </Form.Item>

                <Form.Item name="client_phone" label="Nomor Telepon (Opsional)">
                    <Input placeholder="08xxxx" />
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

                {!isEdit && (
                    <Form.Item name="bank_id" label="Masuk/Keluar Melalui (Opsional)" help="Pilih jika uang sudah diterima/diberikan tunai/bank">
                        <Select
                            placeholder="Pilih Akun Kas/Bank"
                            allowClear
                            options={banks.map((b: any) => ({
                                value: b.id,
                                label: `${b.name} (${b.account_number || 'Cash'})`
                            }))}
                        />
                    </Form.Item>
                )}

                <Form.Item name="due_date" label="Tenggat Waktu (Opsional)">
                    <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Jatuh tempo..." />
                </Form.Item>

                <Form.Item name="description" label="Deskripsi / Keterangan">
                    <Input.TextArea rows={3} placeholder="Tambahkan keterangan..." />
                </Form.Item>
            </Form>
        </Drawer>
    );
};

export default DebtFormDrawer;
