import React, { useState } from 'react';
import { Card, Typography, Row, Col, Button, Space, message, Modal, Form, Input, Select, InputNumber, Popconfirm, Tag, Empty, DatePicker, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, BankOutlined, WalletOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import api from '../../api';
import { fmtRp } from '../../utils/formatters';
import PageHeader from '../../components/PageHeader';
import { motion } from 'framer-motion';

const { Text } = Typography;

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
    savings: { label: 'Tabungan', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.08)' },
    checking: { label: 'Giro', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.08)' },
    cash: { label: 'Kas Toko', color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)' },
    deposit: { label: 'Deposito', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)' },
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
        <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            style={{ fontFamily: "'Poppins', sans-serif" }}
        >
            <PageHeader
                title="Kas & Bank"
                description="Kelola akun kas, rekening bank, dan saldo perusahaan Rizquna."
                breadcrumb={[{ label: 'KEUANGAN' }, { label: 'KAS & BANK' }]}
                extra={
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        size="large" 
                        onClick={openCreate}
                        style={{ borderRadius: 12, height: 44, fontWeight: 700, boxShadow: '0 4px 12px rgba(15, 185, 177, 0.2)' }}
                    >
                        Tambah Akun
                    </Button>
                }
            />

            {/* Total Balance Hero Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                style={{ marginBottom: 32 }}
            >
                <Card 
                    bordered={false} 
                    style={{ 
                        borderRadius: 24, 
                        background: 'linear-gradient(135deg, #0fb9b1 0%, #20bf6b 100%)', 
                        color: '#fff',
                        boxShadow: '0 8px 30px rgba(15, 185, 177, 0.15)',
                        position: 'relative',
                        overflow: 'hidden'
                    }} 
                    bodyStyle={{ padding: '32px 40px' }}
                >
                    <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1, fontSize: 160, color: '#fff' }}>
                        <BankOutlined />
                    </div>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                            TOTAL SALDO AKTIF
                        </Text>
                        <div style={{ fontSize: 38, fontWeight: 800, color: '#fff', margin: '4px 0', letterSpacing: '-1px' }}>
                            {fmtRp(totalBalance)}
                        </div>
                        <Space split={<span style={{ opacity: 0.5 }}>•</span>} style={{ marginTop: 8 }}>
                            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 500 }}>{accounts.length} Akun Terdaftar</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 500 }}>Update: {dayjs().format('DD MMM, HH:mm')}</Text>
                        </Space>
                    </div>
                </Card>
            </motion.div>

            {/* Account Groups */}
            {isLoading ? (
                <Card className="premium-card" style={{ borderRadius: 14 }}>
                    <Empty description="Memuat data akun..." />
                </Card>
            ) : grouped.length === 0 ? (
                <Card className="premium-card" style={{ borderRadius: 14, textAlign: 'center', padding: 40 }}>
                    <Empty description="Belum ada akun kas/bank. Klik 'Tambah Akun' untuk mulai." />
                </Card>
            ) : (
                grouped.map((group, gIdx) => (
                    <div key={group.type} style={{ marginBottom: 32 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingLeft: 4 }}>
                            <div style={{ 
                                width: 28, 
                                height: 28, 
                                borderRadius: 8, 
                                background: group.bg, 
                                color: group.color, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                fontSize: 14
                            }}>
                                {group.type === 'cash' ? <WalletOutlined /> : <BankOutlined />}
                            </div>
                            <Text strong style={{ fontSize: 16, color: '#333', letterSpacing: '-0.3px' }}>{group.label}</Text>
                            <Tag bordered={false} style={{ background: group.bg, color: group.color, fontWeight: 700, borderRadius: 6, margin: 0 }}>
                                {group.accounts.length}
                            </Tag>
                        </div>
                        <Row gutter={[20, 20]}>
                            {group.accounts.map((account, aIdx) => (
                                <Col key={account.id} xs={24} sm={12} md={8}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 + (gIdx * 0.1) + (aIdx * 0.05) }}
                                    >
                                        <Card 
                                            className="premium-card"
                                            bodyStyle={{ padding: '24px' }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                                                    <Text strong style={{ fontSize: 15, color: '#333', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {account.bank_name}
                                                    </Text>
                                                    <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 2 }}>{account.branch_name}</Text>
                                                </div>
                                                <Space size={2}>
                                                    <Tooltip title="Edit">
                                                        <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEdit(account)} style={{ color: '#aaa', borderRadius: 8 }} />
                                                    </Tooltip>
                                                    <Popconfirm 
                                                        title="Hapus akun?" 
                                                        onConfirm={() => deleteMutation.mutate(account.id)} 
                                                        okText="Hapus" 
                                                        cancelText="Batal" 
                                                        okButtonProps={{ danger: true }}
                                                    >
                                                        <Button type="text" size="small" danger icon={<DeleteOutlined />} style={{ borderRadius: 8 }} />
                                                    </Popconfirm>
                                                </Space>
                                            </div>
                                            
                                            <div style={{ marginTop: 20 }}>
                                                {account.account_number && (
                                                    <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 10, border: '1px dashed #e2e8f0', marginBottom: 14 }}>
                                                        <Text type="secondary" style={{ fontSize: 10, display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>No. Rekening</Text>
                                                        <Text strong style={{ fontSize: 13, color: '#475569', letterSpacing: '0.5px' }}>{account.account_number}</Text>
                                                        <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>a.n. {account.account_holder}</div>
                                                    </div>
                                                )}
                                                
                                                <div style={{ padding: '0 4px' }}>
                                                    <Text type="secondary" style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#ccc', letterSpacing: '0.8px' }}>SALDO AKTIF</Text>
                                                    <div style={{ fontSize: 24, fontWeight: 800, color: group.color, letterSpacing: '-0.5px' }}>
                                                        {fmtRp(account.balance)}
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                </Col>
                            ))}
                        </Row>
                    </div>
                ))
            )}

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
                bodyStyle={{ paddingTop: 12 }}
                style={{ top: 60 }}
            >
                <Form form={form} layout="vertical" onFinish={(v) => saveMutation.mutate(v)} requiredMark={false}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="bank_name" label="Nama Bank / Kas" rules={[{ required: true, message: 'Wajib diisi' }]}>
                                <Input placeholder="BCA, Mandiri, Kas Toko" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="branch_name" label="Cabang" rules={[{ required: true, message: 'Wajib diisi' }]}>
                                <Input placeholder="KCP Jakarta, Pusat" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="account_number" label="Nomor Rekening" rules={[{ required: true, message: 'Wajib diisi' }]}>
                                <Input placeholder="1234567890" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="account_holder" label="Atas Nama" rules={[{ required: true, message: 'Wajib diisi' }]}>
                                <Input placeholder="PT Rizquna" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="account_type" label="Tipe Akun" rules={[{ required: true }]}>
                                <Select options={Object.entries(TYPE_CONFIG).map(([v, c]) => ({ value: v, label: c.label }))} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="currency" label="Mata Uang" rules={[{ required: true }]}>
                                <Select options={[{ value: 'IDR', label: 'IDR' }, { value: 'USD', label: 'USD' }]} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="opening_date" label="Tgl. Buka" rules={[{ required: true }]}>
                                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="opening_balance" label="Saldo Awal" rules={[{ required: true }]}>
                        <InputNumber 
                            style={{ width: '100%' }} 
                            min={0}
                            formatter={(v: any) => `${v || ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(v) => v!.replace(/,/g, '')}
                            prefix={<Text strong style={{ color: '#0fb9b1' }}>Rp</Text>} 
                        />
                    </Form.Item>
                    <Form.Item name="account_id" label="Akun COA Terkait" rules={[{ required: true, message: 'Pilih akun COA' }]}>
                        <Select showSearch optionFilterProp="children" placeholder="Pilih akun..."
                            options={coaAccounts.map((a: any) => ({ value: a.id, label: `${a.code} - ${a.name}` }))} />
                    </Form.Item>
                    <Form.Item name="notes" label="Catatan (Opsional)" style={{ marginBottom: 0 }}>
                        <Input.TextArea rows={2} placeholder="Catatan internal..." />
                    </Form.Item>
                </Form>
            </Modal>
        </motion.div>
    );
};

export default BanksPage;
