import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Input, Card, Typography, message } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import api from '../../api';

const { Title } = Typography;

interface Author {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    bio?: string;
    books_count?: number;
}

const PenulisPage: React.FC = () => {
    const [data, setData] = useState<Author[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/authors');
            const list = res.data.data || res.data || [];
            setData(Array.isArray(list) ? list : []);
        } catch {
            message.info('API Penulis belum tersedia — menunggu integrasi backend');
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const columns = [
        { title: 'Nama', dataIndex: 'name', key: 'name', sorter: (a: Author, b: Author) => a.name.localeCompare(b.name) },
        { title: 'Email', dataIndex: 'email', key: 'email', render: (v: string) => v || '-' },
        { title: 'Telepon', dataIndex: 'phone', key: 'phone', render: (v: string) => v || '-' },
        { title: 'Alamat', dataIndex: 'address', key: 'address', ellipsis: true, render: (v: string) => v || '-' },
        { title: 'Jumlah Buku', dataIndex: 'books_count', key: 'books_count', render: (v: number) => v ?? '-' },
    ];

    const filtered = data.filter(a => a.name?.toLowerCase().includes(search.toLowerCase()));

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0 }}>Manajemen Penulis</Title>
                <Space>
                    <Input placeholder="Cari penulis..." prefix={<SearchOutlined />} value={search} onChange={e => setSearch(e.target.value)} style={{ width: 250 }} />
                    <Button icon={<ReloadOutlined />} onClick={fetchData}>Refresh</Button>
                </Space>
            </div>
            <Card>
                <Table columns={columns} dataSource={filtered} rowKey="id" loading={loading} pagination={{ pageSize: 15, showSizeChanger: true }} />
            </Card>
        </div>
    );
};

export default PenulisPage;
