import React, { useState } from 'react';
import { Card, Typography, Row, Col, Button, Space, Breadcrumb, message, Modal, Form, Input, Select, InputNumber, Popconfirm, Tag, Empty, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, BankOutlined, WalletOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import api from '../../api';

const { Title, Text } = Typography;

interface BankAccount {
    id: number;
    bank_name: string;
    branch_name: string;
    account_number: string;
    account_holder: string;
    account_type: string;
    currency: string;
    balance: number;
    opening_balance: number;
    status: string;
    notes?: string;
}

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    savings: { label: 'Tabungan', color: '#1890ff', bg: '#e6f7ff' },
    checking: { label: 'Giro', color: '#722ed1', bg: '#f9f0ff' },
    cash: { label: 'Kas', color: '#52c41a', bg: '#f6ffed' },
    deposit: { label: 'Deposito', color: '#fa8c16', bg: '#fff7e6' },
};

const BanksPage: React.FC = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingBank, setEditingBank] = useState<BankAccount | null>(null);
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    const { data: accountsData = [], isLoading } = useQuery({
        queryKey: ['bank-accounts'],
        queryFn: async () => {
            const res = await api.get('/finance/banks');
            const payload = res.data?.data;
            if (Array.isArray(payload)) return payload;
            return payload?.data ?? [];
        },
    });

    const { data: coaAccounts = [] } = useQuery({
        queryKey: ['coa-for-banks'],
        queryFn: async () => {
            const res = await api.get('/finance/accounts');
            return res.data?.data ?? [];
        },
    });

    const saveMutation = useMutation({
        mutationFn: async (values: any) => {
            const payload = {
                ...values,
                opening_date: values.opening_date?.format('YYYY-MM-DD'),
            };
            if (editingBank) {
                return api.put(`/finance/banks/${editingBank.id}`, payload);
            }
            return api.post('/finance/banks', payload);
        },
        onSuccess: () => {
            message.success(editingBank ? 'Akun berhasil diperbarui' : 'Akun berhasil ditambahkan');
            queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
            setModalOpen(false);
            setEditingBank(null);
            form.resetFields();
        },
        onError: (err: any) => {
            const errMsg = err.response?.data?.message || 'Gagal menyimpan';
            const errors = err.response?.data?.errors;
            if (errors) {
                const firstErr = Object.values(errors).flat()[0];
                message.error(String(firstErr));
            } else {
                message.error(errMsg);
            }
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => api.delete(`/finance/banks/${id}`),
        onSuccess: () => {
            message.success('Akun berhasil dihapus');
            queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
        },
        onError: (err: any) => message.error(err.response?.data?.message || 'Gagal menghapus'),
    });

    const openCreate = () => {
        setEditingBank(null);
        form.resetFields();
        form.setFieldsValue({
            account_type: 'savings',
            currency: 'IDR',
            opening_balance: 0,
            opening_date: dayjs(),
        });
        setModalOpen(true);
    };

    const openEdit = (account: BankAccount) => {
        setEditingBank(account);
        form.setFieldsValue({
            bank_name: account.bank_name,
            branch_name: account.branch_name,
            account_number: account.account_number,
            account_holder: account.account_holder,
            account_type: account.account_type,
            currency: account.currency,
            opening_balance: account.opening_balance,
            notes: account.notes,
        });
        setModalOpen(true);
    };

    const accounts: BankAccount[] = accountsData;

    const grouped = Object.entries(TYPE_CONFIG)
        .map(([type, config]) => ({
            type,
            ...config,
            accounts: accounts.filter((a) => a.account_type === type),
        }))
        .filter((g) => g.accounts.length > 0);

    const totalBalance = accounts.reduce((s, a) => s + Number(a.balance), 0);

    return (
        <div>
            <Breadcrumb className="mb-4" items={[{ title: 'KEUANGAN' }, { title: 'KAS & BANK' }]} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <Title level={4} style={{ margin: 0, fontWeight: 700 }}>Kas & Bank</Title>
                    <Text type="secondary">Kelola akun kas, rekening bank, dan saldo perusahaan.</Text>
                </div>
                <Button type="primary" icon={<PlusOutlined />} size="large" onClick={openCreate}
                    style={{ borderRadius: 12, height: 44, padding: '0 24px' }}>
                    Tambah Akun
                </Button>
            </div>

            {/* Total Saldo */}
            <Card bordered={false} style={{ borderRadius: 14, marginBottom: 24, background: 'linear-gradient(135deg, #0fb9b1, #20bf6b)', color: '#fff' }} bodyStyle={{ padding: 24 }}>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, textTransform: 'uppercase', fontWeight: 700 }}>TOTAL SALDO SEMUA AKUN</Text>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#fff' }}>
                    Rp {totalBalance.toLocaleString('id-ID')}
                </div>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{accounts.length} akun terdaftar</Text>
            </Card>

            {/* Account Groups */}
            {grouped.length === 0 && !isLoading && (
                <Card bordered={false} style={{ borderRadius: 14, textAlign: 'center', padding: 40 }}>
                    <Empty description="Belum ada akun kas/bank. Klik 'Tambah Akun' untuk mulai." />
                </Card>
            )}

            {grouped.map((group) => (
                <div key={group.type} style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        {group.type === 'cash' ? <WalletOutlined style={{ color: group.color }} /> : <BankOutlined style={{ color: group.color }} />}
                        <Text strong style={{ fontSize: 15, color: group.color }}>{group.label}</Text>
                        <Tag color={group.color}>{group.accounts.length}</Tag>
                    </div>
                    <Row gutter={[16, 16]}>
                        {group.accounts.map((account) => (
                            <Col key={account.id} xs={24} sm={12} md={8}>
                                <Card bordered={false} style={{ borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                                    bodyStyle={{ padding: 20 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <Text strong style={{ fontSize: 15 }}>{account.bank_name}</Text>
                                            <div><Text type="secondary" style={{ fontSize: 12 }}>{account.branch_name}</Text></div>
                                            {account.account_number && (
                                                <div><Text type="secondary" style={{ fontSize: 12 }}>No. Rek: {account.account_number}</Text></div>
                                            )}
                                            <div><Text type="secondary" style={{ fontSize: 11 }}>a.n. {account.account_holder}</Text></div>
                                        </div>
                                        <Space size={4}>
                                            <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEdit(account)} />
                                            <Popconfirm title="Hapus akun ini?" description="Data saldo akan terhapus."
                                                onConfirm={() => deleteMutation.mutate(account.id)} okText="Hapus" cancelText="Batal" okButtonProps={{ danger: true }}>
                                                <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                                            </Popconfirm>
                                        </Space>
                                    </div>
                                    <div style={{ marginTop: 16, padding: '12px 16px', background: group.bg, borderRadius: 10 }}>
                                        <Text type="secondary" style={{ fontSize: 11 }}>SALDO</Text>
                                        <div style={{ fontSize: 22, fontWeight: 700, color: group.color }}>
                                            Rp {Number(account.balance).toLocaleString('id-ID')}
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            ))}

            {/* Create/Edit Modal */}
            <Modal
                title={editingBank ? 'Edit Akun Bank' : 'Tambah Akun Baru'}
                open={modalOpen}
                onCancel={() => { setModalOpen(false); setEditingBank(null); }}
                onOk={() => form.submit()}
                confirmLoading={saveMutation.isPending}
                okText={editingBank ? 'Simpan' : 'Tambah Akun'}
                cancelText="Batal"
                width={520}
            >
                <Form form={form} layout="vertical" onFinish={(v) => saveMutation.mutate(v)} requiredMark={false} style={{ marginTop: 16 }}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="bank_name" label="Nama Bank / Kas" rules={[{ required: true, message: 'Wajib diisi' }]}>
                                <Input placeholder="BCA, Mandiri, Kas Toko" size="large" style={{ borderRadius: 10 }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="branch_name" label="Cabang" rules={[{ required: true, message: 'Wajib diisi' }]}>
                                <Input placeholder="KCP Jakarta, Pusat" size="large" style={{ borderRadius: 10 }} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="account_number" label="Nomor Rekening" rules={[{ required: true, message: 'Wajib diisi' }]}>
                                <Input placeholder="1234567890" size="large" style={{ borderRadius: 10 }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="account_holder" label="Atas Nama" rules={[{ required: true, message: 'Wajib diisi' }]}>
                                <Input placeholder="PT Rizquna" size="large" style={{ borderRadius: 10 }} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="account_type" label="Tipe Akun" rules={[{ required: true }]}>
                                <Select size="large" options={Object.entries(TYPE_CONFIG).map(([v, c]) => ({ value: v, label: c.label }))} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="currency" label="Mata Uang" rules={[{ required: true }]}>
                                <Select size="large" options={[{ value: 'IDR', label: 'IDR' }, { value: 'USD', label: 'USD' }]} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="opening_date" label="Tgl. Buka" rules={[{ required: true }]}>
                                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} size="large" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="opening_balance" label="Saldo Awal" rules={[{ required: true }]}>
                        <InputNumber style={{ width: '100%', borderRadius: 10 }} size="large" min={0}
                            formatter={(v: any) => `${v || ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(v) => v!.replace(/,/g, '')}
                            prefix={<Text strong style={{ color: '#0fb9b1' }}>Rp</Text>} />
                    </Form.Item>
                    <Form.Item name="account_id" label="Akun COA Terkait" rules={[{ required: true, message: 'Pilih akun COA' }]}>
                        <Select size="large" showSearch optionFilterProp="children" placeholder="Pilih akun..."
                            options={coaAccounts.map((a: any) => ({ value: a.id, label: `${a.code} - ${a.name}` }))} />
                    </Form.Item>
                    <Form.Item name="notes" label="Catatan (Opsional)">
                        <Input.TextArea rows={2} placeholder="Catatan internal..." style={{ borderRadius: 10 }} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default BanksPage;
