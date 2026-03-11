import React, { useEffect, useState } from 'react';
import { Drawer, Form, Input, Button, Select, DatePicker, message, Space, InputNumber, Typography, Divider, Row, Col, Popconfirm } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    PlusOutlined,
    DeleteOutlined,
    UserOutlined,
    CalendarOutlined,
    FileTextOutlined,
    ClockCircleOutlined,
    ShoppingCartOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../api';

const { Title, Text } = Typography;

interface InvoiceItem {
    nama_produk: string;
    jumlah: number;
    satuan: string;
    harga: number;
    diskon: number;
}

interface InvoiceFormDrawerProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    editData?: any;
}

const emptyItem = (): InvoiceItem => ({
    nama_produk: '',
    jumlah: 1,
    satuan: 'unit',
    harga: 0,
    diskon: 0,
});

const InvoiceFormDrawer: React.FC<InvoiceFormDrawerProps> = ({ open, onClose, onSuccess, editData }) => {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const [items, setItems] = useState<InvoiceItem[]>([emptyItem()]);
    const isEdit = !!editData;

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
            if (isEdit) {
                form.setFieldsValue({
                    client_name: editData.contact?.name || editData.contactName || editData.client_name || '',
                    transDate: editData.date ? dayjs(editData.date) : dayjs(),
                    description: editData.description || '',
                });
                if (editData.items && editData.items.length > 0) {
                    setItems(editData.items.map((i: any) => ({
                        nama_produk: i.nama_produk || '',
                        jumlah: Number(i.jumlah) || 1,
                        satuan: i.satuan || 'unit',
                        harga: Number(i.harga) || 0,
                        diskon: Number(i.diskon) || 0,
                    })));
                } else {
                    setItems([{
                        nama_produk: editData.description || 'Penjualan / Jasa',
                        jumlah: 1,
                        satuan: 'unit',
                        harga: Number(editData.total_amount || editData.total || 0),
                        diskon: 0,
                    }]);
                }
            } else {
                form.resetFields();
                form.setFieldsValue({
                    transDate: dayjs(),
                });
                setItems([emptyItem()]);
            }
        }
    }, [open, editData, form, isEdit]);

    const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
        setItems(prev => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    const addItem = () => setItems(prev => [...prev, emptyItem()]);

    const removeItem = (index: number) => {
        if (items.length <= 1) return;
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const grandTotal = items.reduce((s, i) => s + (i.harga * i.jumlah - i.diskon), 0);

    const submitMutation = useMutation({
        mutationFn: async (values: any) => {
            const payload = {
                client_name: values.client_name,
                contactId: values.contactId || undefined,
                transDate: values.transDate.format('YYYY-MM-DD'),
                dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : undefined,
                description: values.description || '',
                items: items.map(i => ({
                    nama_produk: i.nama_produk,
                    jumlah: i.jumlah,
                    satuan: i.satuan,
                    harga: i.harga,
                    diskon: i.diskon || 0,
                })),
            };
            if (isEdit) {
                return await api.put(`/finance/invoices/${editData.id}`, payload);
            }
            return await api.post('/finance/invoices', payload);
        },
        onSuccess: () => {
            message.success(isEdit ? 'Invoice berhasil diperbarui!' : 'Invoice berhasil dibuat!');
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            if (onSuccess) onSuccess();
            onClose();
        },
        onError: (err: any) => {
            message.error(err.response?.data?.message || 'Gagal menyimpan invoice');
        }
    });

    const handleSubmit = (values: any) => {
        const hasEmpty = items.some(i => !i.nama_produk || i.harga <= 0);
        if (hasEmpty) {
            message.warning('Lengkapi nama produk dan harga untuk semua item.');
            return;
        }
        submitMutation.mutate(values);
    };

    const inputStyle = { borderRadius: 8, background: '#fcfcfc' };

    return (
        <Drawer
            title={
                <div style={{ padding: '8px 0' }}>
                    <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
                        {isEdit ? 'Edit Invoice' : 'Buat Invoice Baru'}
                    </Title>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                        {isEdit ? 'Perbarui detail & item invoice' : 'Input detail pesanan pelanggan'}
                    </Text>
                </div>
            }
            width={640}
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
                        {isEdit ? 'Simpan Perubahan' : 'Simpan Invoice'}
                    </Button>
                </Space>
            }
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark={false}
                style={{ paddingBottom: 40 }}
            >
                {/* ── Customer & Date Section ── */}
                <div style={{ background: '#f8fafc', padding: 20, borderRadius: 16, marginBottom: 24 }}>
                    <Form.Item
                        name="client_name"
                        label={<Text strong><UserOutlined /> Nama Pelanggan</Text>}
                        rules={[{ required: true, message: 'Masukkan nama pelanggan' }]}
                    >
                        <Select
                            showSearch
                            allowClear
                            mode={undefined}
                            placeholder="Ketik atau pilih pelanggan..."
                            size="large"
                            style={{ width: '100%' }}
                            optionFilterProp="children"
                            options={contacts.map((c: any) => ({
                                value: c.name,
                                label: c.name,
                            }))}
                            // Allow free-text entry
                            filterOption={(input, option) =>
                                String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            onSearch={() => {}}
                            // If user types something not in the dropdown, let them use it
                            dropdownRender={(menu) => (
                                <>
                                    {menu}
                                    <div style={{ padding: '4px 8px', color: '#aaa', fontSize: 11, borderTop: '1px solid #f0f0f0' }}>
                                        Ketik nama baru jika belum terdaftar
                                    </div>
                                </>
                            )}
                        />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="transDate" label={<Text strong><CalendarOutlined /> Tgl. Order</Text>} rules={[{ required: true }]}>
                                <DatePicker format="DD/MM/YYYY" style={{ width: '100%', ...inputStyle }} size="large" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="dueDate" label={<Text strong><ClockCircleOutlined /> Jatuh Tempo</Text>}>
                                <DatePicker format="DD/MM/YYYY" style={{ width: '100%', ...inputStyle }} size="large" />
                            </Form.Item>
                        </Col>
                    </Row>
                </div>

                {/* ── Items Section ── */}
                <Divider orientationMargin={0} style={{ marginTop: 0 }}>
                    <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
                        <ShoppingCartOutlined /> Detail Pesanan ({items.length} item)
                    </Text>
                </Divider>

                {items.map((item, idx) => (
                    <div
                        key={idx}
                        style={{
                            background: '#fafbfc',
                            border: '1px solid #f0f0f0',
                            borderRadius: 14,
                            padding: '16px 16px 8px',
                            marginBottom: 12,
                            position: 'relative',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <Text strong style={{ fontSize: 12, color: '#888' }}>Item #{idx + 1}</Text>
                            {items.length > 1 && (
                                <Popconfirm title="Hapus item ini?" onConfirm={() => removeItem(idx)} okText="Ya" cancelText="Batal">
                                    <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                                </Popconfirm>
                            )}
                        </div>

                        <Input
                            placeholder="Nama produk / jasa..."
                            value={item.nama_produk}
                            onChange={e => updateItem(idx, 'nama_produk', e.target.value)}
                            style={{ ...inputStyle, marginBottom: 10, height: 40, fontWeight: 600 }}
                        />

                        <Row gutter={8}>
                            <Col span={5}>
                                <Text style={{ fontSize: 11, color: '#999' }}>Jumlah</Text>
                                <InputNumber
                                    min={1}
                                    value={item.jumlah}
                                    onChange={v => updateItem(idx, 'jumlah', v || 1)}
                                    style={{ width: '100%', ...inputStyle }}
                                />
                            </Col>
                            <Col span={5}>
                                <Text style={{ fontSize: 11, color: '#999' }}>Satuan</Text>
                                <Select
                                    value={item.satuan}
                                    onChange={v => updateItem(idx, 'satuan', v)}
                                    style={{ width: '100%' }}
                                    options={[
                                        { value: 'unit', label: 'unit' },
                                        { value: 'eks', label: 'eks' },
                                        { value: 'pcs', label: 'pcs' },
                                        { value: 'paket', label: 'paket' },
                                        { value: 'pkt', label: 'pkt' },
                                        { value: 'rim', label: 'rim' },
                                        { value: 'lembar', label: 'lembar' },
                                        { value: 'meter', label: 'meter' },
                                        { value: 'kg', label: 'kg' },
                                    ]}
                                />
                            </Col>
                            <Col span={7}>
                                <Text style={{ fontSize: 11, color: '#999' }}>Harga @</Text>
                                <InputNumber
                                    min={0}
                                    value={item.harga}
                                    onChange={v => updateItem(idx, 'harga', v || 0)}
                                    style={{ width: '100%', ...inputStyle }}
                                    formatter={v => `${v || ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={v => Number(v!.replace(/,/g, ''))}
                                />
                            </Col>
                            <Col span={7}>
                                <Text style={{ fontSize: 11, color: '#999' }}>Diskon</Text>
                                <InputNumber
                                    min={0}
                                    value={item.diskon}
                                    onChange={v => updateItem(idx, 'diskon', v || 0)}
                                    style={{ width: '100%', ...inputStyle }}
                                    formatter={v => `${v || ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={v => Number(v!.replace(/,/g, ''))}
                                />
                            </Col>
                        </Row>
                        <div style={{ textAlign: 'right', marginTop: 6, fontSize: 13, fontWeight: 700, color: '#0fb9b1' }}>
                            Sub: Rp {((item.harga * item.jumlah) - item.diskon).toLocaleString('id-ID')}
                        </div>
                    </div>
                ))}

                <Button
                    type="dashed"
                    block
                    icon={<PlusOutlined />}
                    onClick={addItem}
                    style={{ borderRadius: 12, height: 44, fontWeight: 700, marginBottom: 20 }}
                >
                    Tambah Item
                </Button>

                {/* ── Grand Total ── */}
                <div style={{
                    background: 'linear-gradient(135deg, #0fb9b1, #20bf6b)',
                    borderRadius: 16,
                    padding: '16px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 20,
                }}>
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>GRAND TOTAL</Text>
                    <Text style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>
                        Rp {grandTotal.toLocaleString('id-ID')}
                    </Text>
                </div>

                <Form.Item name="description" label={<Text strong><FileTextOutlined /> Catatan (opsional)</Text>}>
                    <Input.TextArea
                        rows={2}
                        placeholder="Catatan internal..."
                        style={{ borderRadius: 12 }}
                    />
                </Form.Item>
            </Form>
        </Drawer>
    );
};

export default InvoiceFormDrawer;
