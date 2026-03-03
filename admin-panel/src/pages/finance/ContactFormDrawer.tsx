import React, { useEffect } from 'react';
import { Drawer, Form, Input, Button, Select, message, Space } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';

interface ContactFormDrawerProps {
    open: boolean;
    onClose: () => void;
}

const ContactFormDrawer: React.FC<ContactFormDrawerProps> = ({ open, onClose }) => {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (open) {
            form.resetFields();
            form.setFieldsValue({
                type: 'customer',
            });
        }
    }, [open, form]);

    const submitMutation = useMutation({
        mutationFn: async (values: any) => {
            return await api.post('/finance/contacts', values);
        },
        onSuccess: () => {
            message.success('Kontak berhasil dibuat!');
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
            form.resetFields();
            onClose();
        },
        onError: (err: any) => {
            message.error(err.response?.data?.message || 'Gagal membuat kontak');
        }
    });

    return (
        <Drawer
            title="Tambah Kontak"
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
            <Form form={form} layout="vertical" onFinish={(values) => submitMutation.mutate(values)}>
                <Form.Item name="type" label="Tipe Kontak" rules={[{ required: true }]}>
                    <Select
                        options={[
                            { value: 'customer', label: 'Pelanggan' },
                            { value: 'vendor', label: 'Vendor' },
                            { value: 'employee', label: 'Pegawai' },
                            { value: 'investor', label: 'Investor' },
                            { value: 'other', label: 'Lainnya' },
                        ]}
                    />
                </Form.Item>

                <Form.Item name="name" label="Nama Lengkap" rules={[{ required: true, message: 'Harap isi nama kontak' }]}>
                    <Input placeholder="Contoh: Budi Santoso" />
                </Form.Item>

                <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Format email tidak valid' }]}>
                    <Input placeholder="contoh@email.com" />
                </Form.Item>

                <Form.Item name="phone" label="Nomor Telepon">
                    <Input placeholder="Contoh: 081234567890" />
                </Form.Item>

                <Form.Item name="address" label="Alamat">
                    <Input.TextArea rows={3} placeholder="Alamat lengkap..." />
                </Form.Item>
            </Form>
        </Drawer>
    );
};

export default ContactFormDrawer;
