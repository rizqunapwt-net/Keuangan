import React, { useEffect } from 'react';
import { Drawer, Form, Input, InputNumber, Button, DatePicker, message, Space, Typography, Select } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import api from '../../api';

const { Text } = Typography;

interface DebtPaymentDrawerProps {
    open: boolean;
    onClose: () => void;
    debt: any;
}

const DebtPaymentDrawer: React.FC<DebtPaymentDrawerProps> = ({ open, onClose, debt }) => {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    const { data: banks = [] } = useQuery({
        queryKey: ['banksForDebtPayment'],
        queryFn: async () => {
            const res = await api.get('/finance/banks');
            return res.data?.data?.data || res.data?.data || [];
        },
        enabled: open
    });

    useEffect(() => {
        if (open) {
            form.resetFields();
            form.setFieldsValue({
                date: dayjs(),
                amount: Number(debt?.amount || 0) - Number(debt?.paid_amount || 0),
            });
        }
    }, [open, form, debt]);

    const submitMutation = useMutation({
        mutationFn: async (values: any) => {
            const payload = {
                ...values,
                date: values.date.format('YYYY-MM-DD'),
            };
            return await api.post(`/finance/debts/${debt.id}/payments`, payload);
        },
        onSuccess: () => {
            message.success('Pembayaran berhasil dicatat!');
            queryClient.invalidateQueries({ queryKey: ['debts'] });
            queryClient.invalidateQueries({ queryKey: ['banks'] }); // Update bank balance
            queryClient.invalidateQueries({ queryKey: ['cash-transactions'] }); // Invalidate ledger
            onClose();
        },
        onError: (err: any) => {
            message.error(err.response?.data?.message || 'Gagal menyimpan pembayaran');
        }
    });

    return (
        <Drawer
            title={`Bayar ${debt?.type === 'payable' ? 'Utang' : 'Piutang'}`}
            width={400}
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
            {debt && (
                <div style={{ marginBottom: 24, padding: 16, background: '#f8fafc', borderRadius: 8 }}>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Klien:</div>
                    <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>{debt.client_name}</div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text type="secondary">Total Tagihan:</Text>
                        <Text strong>Rp {Number(debt.amount).toLocaleString('id-ID')}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text type="secondary">Sisa:</Text>
                        <Text strong type="danger">Rp {(Number(debt.amount) - Number(debt.paid_amount)).toLocaleString('id-ID')}</Text>
                    </div>
                </div>
            )}

            <Form form={form} layout="vertical" onFinish={(values) => submitMutation.mutate(values)}>
                <Form.Item name="date" label="Tanggal Pembayaran" rules={[{ required: true }]}>
                    <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>

                <Form.Item
                    name="amount"
                    label="Nominal Pembayaran (Rp)"
                    rules={[
                        { required: true, message: 'Harap isi nominal' },
                        { type: 'number', min: 0.01, message: 'Minimal Rp 1' }
                    ]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        formatter={(value: any) => `${value || ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                        placeholder="0"
                        size="large"
                    />
                </Form.Item>

                <Form.Item name="bank_id" label="Bayar Melalui" rules={[{ required: true, message: 'Harap pilih akun kas/bank' }]}>
                    <Select
                        placeholder="Pilih Akun Kas/Bank"
                        options={banks.map((b: any) => ({
                            value: b.id,
                            label: `${b.name} (${b.account_number || 'Cash'})`
                        }))}
                    />
                </Form.Item>

                <Form.Item name="note" label="Catatan / Referensi">
                    <Input.TextArea rows={2} placeholder="Contoh: Pembayaran cicilan ke-1" />
                </Form.Item>
            </Form>
        </Drawer>
    );
};

export default DebtPaymentDrawer;
