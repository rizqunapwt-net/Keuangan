import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Input, message, Modal, Form, Select, Card } from 'antd';
import { PlusOutlined, SearchOutlined, ReloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../api';



interface Employee {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    category: string;
    position?: string;
    department?: string;
    status?: string;
    join_date?: string;
}

const KaryawanPage: React.FC = () => {
    const [data, setData] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState<number | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/employees');
            const list = res.data.data || res.data || [];
            setData(Array.isArray(list) ? list : []);
        } catch {
            message.error('Gagal memuat data karyawan');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSave = async (values: Record<string, unknown>) => {
        try {
            if (editingId) {
                await api.patch(`/employees/${editingId}`, values);
                message.success('Karyawan berhasil diupdate');
            } else {
                await api.post('/employees', values);
                message.success('Karyawan berhasil ditambah');
            }
            setModalOpen(false);
            form.resetFields();
            setEditingId(null);
            fetchData();
        } catch {
            message.error('Gagal menyimpan data karyawan');
        }
    };

    const handleDelete = async (id: number) => {
        Modal.confirm({
            title: 'Hapus Karyawan?',
            content: 'Data karyawan akan dihapus secara permanen.',
            onOk: async () => {
                try {
                    await api.delete(`/employees/${id}`);
                    message.success('Karyawan berhasil dihapus');
                    fetchData();
                } catch {
                    message.error('Gagal menghapus karyawan');
                }
            },
        });
    };

    const columns = [
        { title: 'Nama', dataIndex: 'name', key: 'name', sorter: (a: Employee, b: Employee) => a.name.localeCompare(b.name) },
        { title: 'Kategori', dataIndex: 'category', key: 'category', render: (v: string) => <Tag color={v === 'TETAP' ? 'blue' : 'orange'}>{v}</Tag> },
        { title: 'Jabatan', dataIndex: 'position', key: 'position', render: (v: string) => v || '-' },
        { title: 'Departemen', dataIndex: 'department', key: 'department', render: (v: string) => v || '-' },
        { title: 'No. HP', dataIndex: 'phone', key: 'phone', render: (v: string) => v || '-' },
        {
            title: 'Aksi', key: 'action', width: 120,
            render: (_: unknown, record: Employee) => (
                <Space>
                    <Button size="small" icon={<EditOutlined />} onClick={() => { setEditingId(record.id); form.setFieldsValue(record); setModalOpen(true); }} />
                    <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
                </Space>
            ),
        },
    ];

    const filtered = data.filter(e => e.name?.toLowerCase().includes(search.toLowerCase()));

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Manajemen Karyawan</h3>
                <Space>
                    <Input placeholder="Cari karyawan..." prefix={<SearchOutlined />} value={search} onChange={e => setSearch(e.target.value)} style={{ width: 250 }} />
                    <Button icon={<ReloadOutlined />} onClick={fetchData}>Refresh</Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingId(null); form.resetFields(); setModalOpen(true); }}>Tambah Karyawan</Button>
                </Space>
            </div>
            <Card>
                <Table columns={columns} dataSource={filtered} rowKey="id" loading={loading} pagination={{ pageSize: 15, showSizeChanger: true }} />
            </Card>

            <Modal title={editingId ? 'Edit Karyawan' : 'Tambah Karyawan'} open={modalOpen} onCancel={() => { setModalOpen(false); setEditingId(null); }} onOk={() => form.submit()} okText="Simpan">
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item name="name" label="Nama Lengkap" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="category" label="Kategori" rules={[{ required: true }]}>
                        <Select options={[{ value: 'TETAP', label: 'Tetap' }, { value: 'KONTRAK', label: 'Kontrak' }, { value: 'MAGANG', label: 'Magang' }]} />
                    </Form.Item>
                    <Form.Item name="position" label="Jabatan"><Input /></Form.Item>
                    <Form.Item name="department" label="Departemen"><Input /></Form.Item>
                    <Form.Item name="phone" label="No. HP"><Input /></Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default KaryawanPage;
