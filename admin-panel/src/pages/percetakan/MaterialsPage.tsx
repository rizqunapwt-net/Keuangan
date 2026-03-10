import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Typography, Card, Tag, Input, message, Progress, Tooltip, Modal, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import {
    PlusOutlined, SearchOutlined, DeleteOutlined, EditOutlined,
    HistoryOutlined, MoreOutlined
} from '@ant-design/icons';
import api from '../../api';
import MaterialFormDrawer from './MaterialFormDrawer';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import PageHeader from '../../components/PageHeader';

const { Title, Text } = Typography;

interface Material {
    id: number;
    code: string;
    name: string;
    category: string;
    unit: string;
    current_stock: number;
    min_stock: number;
    unit_cost: number;
}

const MaterialsPage: React.FC = () => {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    
    // Log Modal State
    const [logModalOpen, setLogModalOpen] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);

    const fetchMaterials = async () => {
        setLoading(true);
        try {
            const res = await api.get('/percetakan/materials', { params: { search } });
            const payload = res.data?.data?.data || res.data?.data || [];
            setMaterials(Array.isArray(payload) ? payload : []);
        } catch {
            message.error('Gagal mengambil data material.');
        } finally {
            setLoading(false);
        }
    };

    const fetchLogs = async (id: number) => {
        setLogsLoading(true);
        try {
            const res = await api.get(`/percetakan/materials/${id}/logs`);
            setLogs(res.data?.data?.data || []);
        } catch {
            message.error('Gagal mengambil log stok.');
        } finally {
            setLogsLoading(false);
        }
    };

    useEffect(() => {
        fetchMaterials();
    }, [search]);

    const handleShowLogs = (material: Material) => {
        setSelectedMaterial(material);
        setLogModalOpen(true);
        fetchLogs(material.id);
    };

    const columns = [
        {
            title: 'BAHAN BAKU',
            key: 'name',
            render: (_: any, record: Material) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Text strong style={{ color: '#333', fontSize: 13 }}>{record.name}</Text>
                    <Text style={{ fontSize: 10, color: '#aaa', fontWeight: 700, letterSpacing: '0.3px' }}>{record.code}</Text>
                </div>
            ),
        },
        {
            title: 'KETERSEDIAAN STOK',
            key: 'stock',
            width: 250,
            render: (_: any, record: Material) => {
                const current = Number(record.current_stock);
                const min = Number(record.min_stock);
                const isLow = current <= min;
                const percent = Math.min(100, (current / (min * 5 || 1)) * 100);
                
                return (
                    <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                             <Text strong style={{ color: isLow ? '#ef4444' : '#333', fontSize: 12 }}>
                                {current.toLocaleString()} {record.unit}
                            </Text>
                            {isLow && <Tag color="error" bordered={false} style={{ fontSize: 9, fontWeight: 700, borderRadius: 6 }}>TIPIS</Tag>}
                        </div>
                        <Progress 
                            percent={percent} 
                            showInfo={false} 
                            size="small" 
                            strokeColor={isLow ? '#ef4444' : '#10b981'} 
                            trailColor="#f5f5f5"
                            strokeWidth={6}
                        />
                    </div>
                );
            }
        },
        {
            title: '',
            key: 'action',
            width: 100,
            align: 'right' as const,
            render: (_: any, record: Material) => {
                const menuItems: MenuProps['items'] = [
                    {
                        key: 'logs',
                        label: 'Riwayat Stok',
                        icon: <HistoryOutlined />,
                        onClick: () => handleShowLogs(record)
                    },
                    {
                        key: 'edit',
                        label: 'Edit Data',
                        icon: <EditOutlined />,
                        onClick: () => { setEditId(record.id); setDrawerOpen(true); }
                    },
                    { type: 'divider' },
                    {
                        key: 'delete',
                        label: 'Hapus Bahan',
                        icon: <DeleteOutlined />,
                        danger: true,
                    }
                ];

                return (
                    <Space>
                         <Tooltip title="Riwayat">
                            <Button type="text" icon={<HistoryOutlined />} size="small" style={{ color: '#aaa' }} onClick={() => handleShowLogs(record)} />
                        </Tooltip>
                        <Dropdown 
                            menu={{ 
                                items: menuItems,
                                onClick: (e) => {
                                    if(e.key === 'delete') {
                                        Modal.confirm({
                                            title: 'Hapus bahan baku?',
                                            content: 'Data yang sudah dihapus tidak bisa dikembalikan.',
                                            okText: 'Ya, Hapus',
                                            cancelText: 'Batal',
                                            okButtonProps: { danger: true, style: { borderRadius: 10 } },
                                            cancelButtonProps: { style: { borderRadius: 10 } },
                                            onOk: async () => {
                                                try {
                                                    await api.delete(`/percetakan/materials/${record.id}`);
                                                    message.success('Bahan berhasil dihapus.');
                                                    fetchMaterials();
                                                } catch {
                                                    message.error('Gagal menghapus bahan.');
                                                }
                                            }
                                        });
                                    }
                                }
                            }} 
                            trigger={['click']}
                        >
                            <Button type="text" icon={<MoreOutlined />} style={{ color: '#aaa' }} />
                        </Dropdown>
                    </Space>
                );
            },
        },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={{ fontFamily: "'Poppins', sans-serif" }}>
            <PageHeader 
                title="Stok Bahan Baku"
                description="Pantau inventori kertas, tinta, dan material cetak secara efisien."
                breadcrumb={[{ label: 'PERCETAKAN' }, { label: 'INVENTORI' }]}
                extra={
                    <Button 
                        type="primary" 
                        size="large" 
                        icon={<PlusOutlined />} 
                        onClick={() => setDrawerOpen(true)}
                        style={{ borderRadius: 14, height: 44, fontWeight: 700, boxShadow: '0 8px 16px rgba(15, 185, 177, 0.25)' }}
                    >
                        Tambah Bahan
                    </Button>
                }
            />

            <Card className="premium-card" bodyStyle={{ padding: 0 }} style={{ borderRadius: 20 }}>
                <div style={{ padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f8f8f8', flexWrap: 'wrap', gap: 16 }}>
                    <Title level={5} style={{ margin: 0, fontWeight: 700, color: '#333' }}>DAFTAR INVENTORI</Title>
                    <Input 
                        prefix={<SearchOutlined style={{ color: '#ccc' }} />} 
                        placeholder="Cari material..." 
                        style={{ width: 300, borderRadius: 12, height: 40, background: '#fcfcfc', border: '1px solid #eee' }} 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                    />
                </div>
                <div style={{ padding: '0 8px' }}>
                    <Table 
                        columns={columns} 
                        dataSource={materials} 
                        rowKey="id" 
                        loading={loading} 
                        scroll={{ x: 600 }} 
                        pagination={{ 
                            pageSize: 10, 
                            showSizeChanger: true,
                            position: ['bottomRight'],
                            style: { margin: '24px 16px' }
                        }}
                    />
                </div>
            </Card>

            <MaterialFormDrawer open={drawerOpen} editId={editId} onClose={() => { setDrawerOpen(false); setEditId(null); }} onSuccess={fetchMaterials} />

            {/* LOG MODAL */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#0fb9b110', color: '#0fb9b1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HistoryOutlined />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 16 }}>Riwayat Stok: {selectedMaterial?.name}</span>
                    </div>
                }
                open={logModalOpen}
                onCancel={() => setLogModalOpen(false)}
                footer={null}
                width={850}
                style={{ top: 40 }}
                bodyStyle={{ padding: '24px' }}
                closeIcon={<div style={{ width: 32, height: 32, borderRadius: 8, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>✕</div>}
            >
                <Table
                    dataSource={logs}
                    rowKey="id"
                    loading={logsLoading}
                    size="middle"
                    pagination={{ pageSize: 8 }}
                    columns={[
                        { 
                            title: 'WAKTU', 
                            dataIndex: 'created_at', 
                            width: 160,
                            render: (v) => <Text style={{ fontSize: 12, fontWeight: 500, color: '#666' }}>{dayjs(v).format('DD MMM, HH:mm')}</Text> 
                        },
                        { 
                            title: 'AKTIVITAS', 
                            dataIndex: 'type', 
                            width: 120,
                            render: (v) => {
                                const isOut = v === 'out';
                                return (
                                    <Tag bordered={false} style={{ 
                                        backgroundColor: isOut ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                        color: isOut ? '#ef4444' : '#10b981',
                                        fontWeight: 700,
                                        borderRadius: 6,
                                        fontSize: 10
                                    }}>
                                        {isOut ? 'STOK KELUAR' : 'STOK MASUK'}
                                    </Tag>
                                );
                            }
                        },
                        { 
                            title: 'JUMLAH', 
                            dataIndex: 'amount', 
                            align: 'right',
                            render: (v, rec) => (
                                <Text strong style={{ color: rec.type === 'out' ? '#ef4444' : '#10b981', fontSize: 13 }}>
                                    {rec.type === 'out' ? '-' : '+'}{Number(v).toLocaleString()}
                                </Text>
                            )
                        },
                        { title: 'SISA STOK', dataIndex: 'balance_after', align: 'right', render: (v) => <Text strong style={{ color: '#333' }}>{Number(v).toLocaleString()}</Text> },
                        { title: 'CATATAN', dataIndex: 'note', render: (v) => <Text style={{ fontSize: 12, color: '#666' }}>{v}</Text> },
                        { title: 'PETUGAS', dataIndex: 'user_name', render: (v) => <Tag bordered={false} style={{ fontSize: 10, fontWeight: 600 }}>{v}</Tag> },
                    ]}
                />
            </Modal>
        </motion.div>
    );
};

export default MaterialsPage;
