import React, { useEffect } from 'react';
import { Drawer, Form, Input, Button, Select, DatePicker, message, Space, InputNumber, Typography, Divider, Row, Col } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    InfoCircleOutlined,
    UserOutlined,
    CalendarOutlined,
    DollarOutlined,
    FileTextOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../api';

const { Title, Text } = Typography;

interface InvoiceFormDrawerProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const InvoiceFormDrawer: React.FC<InvoiceFormDrawerProps> = ({ open, onClose, onSuccess }) => {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    const { data: contacts = [] } = useQuery({
        queryKey: ['contactsForInvoice'],
        queryFn: async () => {
            const res = await api.get('/finance/contacts');
            return res.data?.data || [];
        },
        enabled: open
    });

    useEffect(() => {
        if (open) {
            form.resetFields();
            form.setFieldsValue({
                transDate: dayjs(),
                dueDate: dayjs().add(30, 'day'),
                refNumber: `INV-${dayjs().format('YYYYMMDDHHmmss')}`,
            });
        }
    }, [open, form]);

    const submitMutation = useMutation({
        mutationFn: async (values: any) => {
            const payload = {
                ...values,
                type: 'sales',
                transDate: values.transDate.format('YYYY-MM-DD'),
                dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : undefined,
                items: [
                    {
                        description: values.description || 'Penjualan / Jasa',
                        quantity: 1,
                        price: values.amount,
                    }
                ]
            };
            return await api.post('/finance/invoices', payload);
        },
        onSuccess: () => {
            message.success('Invoice berhasil dibuat!');
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            if (onSuccess) onSuccess();
            onClose();
        },
        onError: (err: any) => {
            message.error(err.response?.data?.message || 'Gagal membuat invoice');
        }
    });

    return (
        <Drawer
            title={
                <div style={{ padding: '8px 0' }}>
                    <Title level={4} style={{ margin: 0, fontWeight: 700 }}>Buat Invoice Baru</Title>
                    <Text type="secondary" style={{ fontSize: 13 }}>Input detail penagihan pelanggan Anda</Text>
                </div>
            }
            width={520}
            onClose={onClose}
            open={open}
            className="premium-drawer"
            extra={
                <Space>
                    <Button onClick={onClose} style={{ borderRadius: 10 }}>Batal</Button>
                    <Button 
                        type="primary" 
                        size="large"
                        loading={submitMutation.isPending} 
                        onClick={() => form.submit()}
                        style={{ borderRadius: 10, padding: '0 32px' }}
                    >
                        Simpan Invoice
                    </Button>
                </Space>
            }
            footer={
                <div style={{ padding: '16px 24px', background: '#f8fafc', borderRadius: '0 0 16px 16px' }}>
                    <Space>
                        <InfoCircleOutlined style={{ color: '#0fb9b1' }} />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            Invoice akan otomatis tercatat sebagai piutang di Buku Besar.
                        </Text>
                    </Space>
                </div>
            }
        >
            <Form 
                form={form} 
                layout="vertical" 
                onFinish={(values) => submitMutation.mutate(values)}
                requiredMark={false}
                style={{ paddingBottom: 40 }}
            >
                <div style={{ background: '#f8fafc', padding: 20, borderRadius: 16, marginBottom: 24 }}>
                    <Form.Item name="refNumber" label={<Text strong><FileTextOutlined /> Nomor Invoice</Text>} rules={[{ required: true }]}>
                        <Input disabled style={{ borderRadius: 8, background: '#fff', color: '#1e293b', fontWeight: 700 }} />
                    </Form.Item>

                    <Form.Item name="contactId" label={<Text strong><UserOutlined /> Pilih Pelanggan</Text>} rules={[{ required: true, message: 'Harap pilih pelanggan' }]}>
                        <Select
                            showSearch
                            optionFilterProp="children"
                            placeholder="Cari nama pelanggan..."
                            size="large"
                            style={{ width: '100%' }}
                            options={contacts.map((c: any) => ({
                                value: c.id,
                                label: c.name
                            }))}
                        />
                    </Form.Item>
                </div>

                <Divider orientationMargin={0} style={{ marginTop: 0 }}>
                    <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Detail Waktu & Nominal</Text>
                </Divider>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="transDate" label={<Text strong><CalendarOutlined /> Tgl. Invoice</Text>} rules={[{ required: true }]}>
                            <DatePicker format="DD/MM/YYYY" style={{ width: '100%', borderRadius: 10 }} size="large" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="dueDate" label={<Text strong><ClockCircleOutlined /> Jatuh Tempo</Text>}>
                            <DatePicker format="DD/MM/YYYY" style={{ width: '100%', borderRadius: 10 }} size="large" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item 
                    name="amount" 
                    label={<Text strong><DollarOutlined /> Total Tagihan (IDR)</Text>} 
                    rules={[{ required: true, message: 'Harap isi nominal' }]}
                >
                    <InputNumber
                        style={{ width: '100%', borderRadius: 12 }}
                        min={0}
                        formatter={(value: any) => `${value || ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                        placeholder="0"
                        size="large"
                        prefix={<Text strong style={{ color: '#0fb9b1', marginRight: 8 }}>Rp</Text>}
                    />
                </Form.Item>

                <Form.Item name="description" label={<Text strong><FileTextOutlined /> Deskripsi / Catatan Internal</Text>}>
                    <Input.TextArea 
                        rows={4} 
                        placeholder="Masukkan detail pesanan atau catatan penagihan..." 
                        style={{ borderRadius: 12 }}
                    />
                </Form.Item>
            </Form>
        </Drawer>
    );
};

export default InvoiceFormDrawer;
