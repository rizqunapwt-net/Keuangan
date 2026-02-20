import React, { useEffect, useState } from 'react';
import { Table, Card, Tag, Button, Space, Input, message, Modal, Form, Select, InputNumber } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../../api';

interface AccountCategory {
    id: number;
    code: string;
    name: string;
}

interface Account {
    id: number;
    code: string;
    name: string;
    categoryId: number;
    category: AccountCategory;
    openingBalance: number;
    isArchived: boolean;
}

const categoryColors: Record<string, string> = {
    '1': 'blue',    // Aset
    '2': 'orange',  // Kewajiban
    '3': 'green',   // Modal
    '4': 'cyan',    // Pendapatan
    '5': 'red',     // Beban
    '6': 'volcano', // Beban Lain
};

const ChartOfAccountsPage: React.FC = () => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [categories, setCategories] = useState<AccountCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [form] = Form.useForm();

    const fetchData = async () => {
        setLoading(true);
        try {
            const [accRes, catRes] = await Promise.all([
                api.get('/finance/accounts'),
                api.get('/finance/accounts/categories'),
            ]);
            setAccounts(accRes.data);
            setCategories(catRes.data);
        } catch {
            message.error('Gagal memuat data akun');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const filtered = accounts.filter(a =>
        a.name.toLowerCase().includes(searchText.toLowerCase()) ||
        a.code.includes(searchText)
    );

    const grouped = categories.map(cat => ({
        ...cat,
        accounts: filtered.filter(a => a.categoryId === cat.id),
    })).filter(g => g.accounts.length > 0);

    const handleCreate = async (values: Record<string, unknown>) => {
        try {
            await api.post('/finance/accounts', values);
            message.success('Akun berhasil ditambahkan');
            setModalVisible(false);
            form.resetFields();
            fetchData();
        } catch {
            message.error('Gagal menambah akun');
        }
    };

    const columns = [
        { title: 'Kode', dataIndex: 'code', key: 'code', width: 120 },
        { title: 'Nama Akun', dataIndex: 'name', key: 'name' },
        {
            title: 'Kategori', key: 'category', width: 180,
            render: (_: unknown, r: Account) => (
                <Tag color={categoryColors[r.category.code] || 'default'}>{r.category.name}</Tag>
            ),
        },
        {
            title: 'Saldo Awal', dataIndex: 'openingBalance', key: 'openingBalance', width: 180,
            render: (v: number) => `Rp ${Number(v).toLocaleString('id-ID')}`,
        },
        {
            title: 'Status', key: 'status', width: 100,
            render: (_: unknown, r: Account) => r.isArchived
                ? <Tag color="default">Arsip</Tag>
                : <Tag color="green">Aktif</Tag>,
        },
    ];

    return (
        <div>
            <Card
                title="Daftar Akun (Chart of Accounts)"
                extra={
                    <Space>
                        <Input
                            placeholder="Cari akun..."
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            style={{ width: 250 }}
                        />
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
                            Tambah Akun
                        </Button>
                    </Space>
                }
            >
                {grouped.map(group => (
                    <div key={group.id} style={{ marginBottom: 24 }}>
                        <h3 style={{ borderBottom: '2px solid #f0f0f0', paddingBottom: 8 }}>
                            <Tag color={categoryColors[group.code] || 'default'}>{group.code}</Tag>
                            {group.name}
                        </h3>
                        <Table
                            dataSource={group.accounts}
                            columns={columns}
                            rowKey="id"
                            pagination={false}
                            size="small"
                            loading={loading}
                        />
                    </div>
                ))}
            </Card>

            <Modal
                title="Tambah Akun Baru"
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={() => form.submit()}
            >
                <Form form={form} layout="vertical" onFinish={handleCreate}>
                    <Form.Item name="code" label="Kode Akun" rules={[{ required: true }]}>
                        <Input placeholder="e.g. 1-10001" />
                    </Form.Item>
                    <Form.Item name="name" label="Nama Akun" rules={[{ required: true }]}>
                        <Input placeholder="e.g. Kas Besar" />
                    </Form.Item>
                    <Form.Item name="categoryId" label="Kategori" rules={[{ required: true }]}>
                        <Select placeholder="Pilih kategori">
                            {categories.map(c => (
                                <Select.Option key={c.id} value={c.id}>{c.code} — {c.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="openingBalance" label="Saldo Awal">
                        <InputNumber style={{ width: '100%' }} placeholder="0" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ChartOfAccountsPage;
